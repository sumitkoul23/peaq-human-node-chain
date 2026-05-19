// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PHNStaking
 * @notice Time-locked staking with three APY tiers. Funded from 10M PHN reward pool.
 *
 * Tiers:
 *   FLEX    (0 days lock)  →  8%  APY  — unstake anytime, no penalty
 *   LOCKED  (90 days lock) → 15%  APY  — early exit burns 50% of accrued rewards
 *   VAULT   (180 days lock)→ 25%  APY  — early exit burns 100% of accrued rewards
 *
 * Reward pool: 10,000,000 PHN (must be transferred to this contract before going live).
 * All math is in 1e18 precision. Rewards accrue per second.
 */
contract PHNStaking is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ── Tier config ──────────────────────────────────────────────────────────
    enum Tier { FLEX, LOCKED, VAULT }

    struct TierConfig {
        uint256 lockSeconds;   // minimum lock duration
        uint256 apyBps;        // annual yield in basis points (100 = 1%)
        uint256 earlyPenaltyBps; // penalty on accrued rewards for early exit (10000 = 100%)
    }

    TierConfig[3] public tiers;

    // ── Stake record ─────────────────────────────────────────────────────────
    struct StakeRecord {
        uint256 amount;          // PHN staked
        uint256 startTime;       // when stake began
        uint256 lockUntil;       // earliest penalty-free unstake
        uint256 lastClaimTime;   // last time rewards were claimed / compounded
        Tier    tier;
        bool    active;
    }

    IERC20  public immutable phn;
    uint256 public constant REWARD_POOL_TOTAL = 10_000_000 ether; // 10M PHN
    uint256 public rewardPoolRemaining;
    uint256 public totalStaked;

    // user → stake index → record
    mapping(address => StakeRecord[]) public stakes;
    // user → total pending claimed (lifetime)
    mapping(address => uint256) public lifetimeClaimed;

    // ── Events ────────────────────────────────────────────────────────────────
    event Staked(address indexed user, uint256 indexed stakeId, uint256 amount, Tier tier);
    event Unstaked(address indexed user, uint256 indexed stakeId, uint256 amount, uint256 reward, uint256 penalty);
    event RewardClaimed(address indexed user, uint256 indexed stakeId, uint256 reward);
    event RewardPoolFunded(uint256 amount);
    event TierAPYUpdated(Tier tier, uint256 newApyBps);

    // ── Constructor ───────────────────────────────────────────────────────────
    constructor(address admin, address phn_) {
        phn = IERC20(phn_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);

        // FLEX — 8% APY, no lock, no penalty
        tiers[uint256(Tier.FLEX)]   = TierConfig({ lockSeconds: 0,         apyBps: 800,  earlyPenaltyBps: 0     });
        // LOCKED — 15% APY, 90-day lock, 50% reward penalty on early exit
        tiers[uint256(Tier.LOCKED)] = TierConfig({ lockSeconds: 90 days,   apyBps: 1500, earlyPenaltyBps: 5000  });
        // VAULT — 25% APY, 180-day lock, 100% reward penalty on early exit (rewards forfeited)
        tiers[uint256(Tier.VAULT)]  = TierConfig({ lockSeconds: 180 days,  apyBps: 2500, earlyPenaltyBps: 10000 });
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    /// @notice Fund the reward pool. Must be called after deploying (transfer 10M PHN here first).
    function fundRewardPool(uint256 amount) external onlyRole(ADMIN_ROLE) {
        phn.safeTransferFrom(msg.sender, address(this), amount);
        rewardPoolRemaining += amount;
        emit RewardPoolFunded(amount);
    }

    function updateTierAPY(Tier tier, uint256 newApyBps) external onlyRole(ADMIN_ROLE) {
        require(newApyBps <= 10000, "APY>100%");
        tiers[uint256(tier)].apyBps = newApyBps;
        emit TierAPYUpdated(tier, newApyBps);
    }

    function pause()   external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    // ── Core ──────────────────────────────────────────────────────────────────

    /// @notice Stake PHN into the chosen tier.
    function stake(uint256 amount, Tier tier) external nonReentrant whenNotPaused returns (uint256 stakeId) {
        require(amount > 0, "amount=0");
        phn.safeTransferFrom(msg.sender, address(this), amount);

        TierConfig storage cfg = tiers[uint256(tier)];
        stakeId = stakes[msg.sender].length;

        stakes[msg.sender].push(StakeRecord({
            amount:        amount,
            startTime:     block.timestamp,
            lockUntil:     block.timestamp + cfg.lockSeconds,
            lastClaimTime: block.timestamp,
            tier:          tier,
            active:        true
        }));

        totalStaked += amount;
        emit Staked(msg.sender, stakeId, amount, tier);
    }

    /// @notice Unstake principal + claim rewards. Early exit applies tier penalty.
    function unstake(uint256 stakeId) external nonReentrant whenNotPaused {
        StakeRecord storage s = stakes[msg.sender][stakeId];
        require(s.active, "not active");

        uint256 accrued  = _pendingReward(s);
        uint256 penalty  = 0;
        uint256 paidOut  = accrued;

        if (block.timestamp < s.lockUntil) {
            TierConfig storage cfg = tiers[uint256(s.tier)];
            penalty = accrued * cfg.earlyPenaltyBps / 10_000;
            paidOut = accrued - penalty;
        }

        uint256 principal = s.amount;
        s.active          = false;
        totalStaked      -= principal;

        // Pay principal
        phn.safeTransfer(msg.sender, principal);

        // Pay rewards (after penalty deducted)
        if (paidOut > 0 && rewardPoolRemaining >= paidOut) {
            rewardPoolRemaining      -= paidOut;
            lifetimeClaimed[msg.sender] += paidOut;
            phn.safeTransfer(msg.sender, paidOut);
        }

        emit Unstaked(msg.sender, stakeId, principal, paidOut, penalty);
    }

    /// @notice Claim accrued rewards without unstaking.
    function claimRewards(uint256 stakeId) external nonReentrant whenNotPaused {
        StakeRecord storage s = stakes[msg.sender][stakeId];
        require(s.active, "not active");

        uint256 accrued = _pendingReward(s);
        require(accrued > 0, "nothing to claim");
        require(rewardPoolRemaining >= accrued, "pool empty");

        s.lastClaimTime = block.timestamp;
        rewardPoolRemaining          -= accrued;
        lifetimeClaimed[msg.sender]  += accrued;
        phn.safeTransfer(msg.sender, accrued);

        emit RewardClaimed(msg.sender, stakeId, accrued);
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function pendingReward(address user, uint256 stakeId) external view returns (uint256) {
        StakeRecord storage s = stakes[user][stakeId];
        if (!s.active) return 0;
        return _pendingReward(s);
    }

    function stakeCount(address user) external view returns (uint256) {
        return stakes[user].length;
    }

    function allStakes(address user) external view returns (StakeRecord[] memory) {
        return stakes[user];
    }

    /// @notice Returns pool utilisation stats for the UI.
    function poolStats() external view returns (
        uint256 totalStaked_,
        uint256 rewardPoolRemaining_,
        uint256 rewardPoolUsedPct
    ) {
        totalStaked_          = totalStaked;
        rewardPoolRemaining_  = rewardPoolRemaining;
        rewardPoolUsedPct     = REWARD_POOL_TOTAL > 0
            ? (REWARD_POOL_TOTAL - rewardPoolRemaining) * 100 / REWARD_POOL_TOTAL
            : 0;
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    function _pendingReward(StakeRecord storage s) internal view returns (uint256) {
        uint256 elapsed     = block.timestamp - s.lastClaimTime;
        uint256 apyBps      = tiers[uint256(s.tier)].apyBps;
        // reward = amount * apyBps / 10000 * elapsed / 365days
        return s.amount * apyBps * elapsed / (10_000 * 365 days);
    }
}
