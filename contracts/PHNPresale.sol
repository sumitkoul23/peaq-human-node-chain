// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PHNPresale
 * @notice Epoch-based presale for PHN token. Buy with native token (PEAQ/BNB) or USDC.
 *
 * Epoch pricing:
 *   Epoch 1 → $0.02 USD per PHN  (launch presale)
 *   Epoch 2 → $0.05 USD per PHN  (next round)
 *   Epoch N → admin-configurable
 *
 * Fee structure (applied on every purchase):
 *   2.00% total fee on PHN dispensed
 *   ├── 0.25% → burned via ERC20Burnable.burn()  (deflationary)
 *   └── 1.75% → treasury wallet
 *   User receives: 98% of calculated PHN amount
 *
 * Chain deployment order:
 *   Phase 1 → peaq Mainnet (Chain 3338) — PEAQ + USDC
 *   Phase 2 → BSC Mainnet  (Chain 56)   — BNB  + USDC
 *   Phase 3 → Ethereum, others via bridges
 *
 * Price feed: admin-set nativeTokenPerUSD (e.g. if PEAQ=$0.10, set 10*1e18).
 *             USDC is always treated as 1 USD = 1 USDC (6 decimals).
 */
interface IBurnable {
    function burn(uint256 amount) external;
}

contract PHNPresale is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant SALE_ADMIN_ROLE = keccak256("SALE_ADMIN_ROLE");

    // ── Tokens ────────────────────────────────────────────────────────────────
    IERC20   public immutable phn;       // PHN token (ERC20Burnable)
    IERC20   public usdc;                // USDC on this chain (admin-settable)
    address  public treasury;

    // ── Fee constants ─────────────────────────────────────────────────────────
    uint256 public constant FEE_BPS         = 200;   // 2.00% total fee
    uint256 public constant BURN_BPS        = 25;    // 0.25% burned
    uint256 public constant TREASURY_BPS    = 175;   // 1.75% to treasury
    uint256 public constant BPS_DENOM       = 10_000;

    // ── Epoch config ──────────────────────────────────────────────────────────
    struct Epoch {
        uint256 priceUsdMicro;   // price in micro-USD (1e6 = $1.00, so $0.02 = 20000)
        uint256 cap;             // max PHN sold in this epoch (in 1e18)
        uint256 sold;            // PHN sold so far (in 1e18)
        bool    active;
    }

    Epoch[]  public epochs;
    uint256  public currentEpoch;          // index into epochs[]

    // ── Native token price feed ───────────────────────────────────────────────
    // nativePerUsd: how many wei of the native token = $1 USD
    // Example: PEAQ = $0.10  →  nativePerUsd = 10 * 1e18
    // Example: BNB  = $600   →  nativePerUsd = 1e18 / 600 ≈ 1.67e15
    uint256  public nativePerUsd;          // set by admin, keep fresh

    // ── Stats ─────────────────────────────────────────────────────────────────
    uint256 public totalPhnSold;
    uint256 public totalPhnBurned;
    uint256 public totalUsdRaisedMicro;    // in micro-USD (1e6)

    mapping(address => uint256) public userPhnBought;

    // ── Events ────────────────────────────────────────────────────────────────
    event Purchase(
        address indexed buyer,
        address indexed payToken,   // address(0) = native
        uint256         payAmount,
        uint256         phnReceived,
        uint256         phnBurned,
        uint256         phnToTreasury,
        uint256         epochIndex
    );
    event EpochAdvanced(uint256 oldEpoch, uint256 newEpoch, uint256 newPriceUsdMicro);
    event EpochAdded(uint256 index, uint256 priceUsdMicro, uint256 cap);
    event NativePriceUpdated(uint256 nativePerUsd);
    event TreasuryUpdated(address newTreasury);
    event UsdcUpdated(address newUsdc);

    // ── Constructor ───────────────────────────────────────────────────────────
    constructor(
        address admin,
        address phn_,
        address usdc_,
        address treasury_,
        uint256 nativePerUsd_
    ) {
        require(admin     != address(0), "admin=0");
        require(phn_      != address(0), "phn=0");
        require(treasury_ != address(0), "treasury=0");

        phn          = IERC20(phn_);
        usdc         = IERC20(usdc_);
        treasury     = treasury_;
        nativePerUsd = nativePerUsd_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(SALE_ADMIN_ROLE, admin);

        // Pre-load default epochs
        // Epoch 0: $0.02 — presale launch
        epochs.push(Epoch({ priceUsdMicro: 20_000, cap: 5_000_000 ether, sold: 0, active: true }));
        // Epoch 1: $0.05 — next round
        epochs.push(Epoch({ priceUsdMicro: 50_000, cap: 5_000_000 ether, sold: 0, active: false }));
        // Epoch 2: $0.10 — growth round
        epochs.push(Epoch({ priceUsdMicro: 100_000, cap: 5_000_000 ether, sold: 0, active: false }));
        // Epoch 3: $0.20 — pre-DEX round
        epochs.push(Epoch({ priceUsdMicro: 200_000, cap: 5_000_000 ether, sold: 0, active: false }));
    }

    // ── Buy with native token (PEAQ / BNB / ETH) ──────────────────────────────
    receive() external payable { _buyNative(msg.sender); }

    function buyWithNative() external payable nonReentrant whenNotPaused {
        _buyNative(msg.sender);
    }

    function _buyNative(address buyer) internal {
        require(msg.value > 0, "send native token");
        require(nativePerUsd > 0, "price not set");

        // Convert native amount to USD micro
        // nativePerUsd = native_wei per $1
        // usdMicro = (native_wei / nativePerUsd) * 1e6
        uint256 usdMicro = (msg.value * 1_000_000) / nativePerUsd;
        uint256 phnRaw   = _calcPhn(usdMicro);

        _executePurchase(buyer, address(0), msg.value, phnRaw, usdMicro);

        // Forward native to treasury
        (bool ok,) = treasury.call{value: msg.value}("");
        require(ok, "treasury transfer failed");
    }

    // ── Buy with USDC ─────────────────────────────────────────────────────────
    function buyWithUsdc(uint256 usdcAmount) external nonReentrant whenNotPaused {
        require(usdcAmount > 0, "amount=0");
        require(address(usdc) != address(0), "USDC not configured");

        // USDC has 6 decimals: 1 USDC = 1e6 = 1 USD = 1_000_000 usdMicro
        uint256 usdMicro = usdcAmount; // 1 USDC unit = 1 micro-USD
        uint256 phnRaw   = _calcPhn(usdMicro);

        usdc.safeTransferFrom(msg.sender, treasury, usdcAmount);
        _executePurchase(msg.sender, address(usdc), usdcAmount, phnRaw, usdMicro);
    }

    // ── Core purchase logic ───────────────────────────────────────────────────
    function _calcPhn(uint256 usdMicro) internal view returns (uint256) {
        Epoch storage e = epochs[currentEpoch];
        require(e.active, "no active epoch");
        // phn = (usdMicro / priceUsdMicro) * 1e18
        // = usdMicro * 1e18 / priceUsdMicro
        return (usdMicro * 1e18) / e.priceUsdMicro;
    }

    function _executePurchase(
        address buyer,
        address payToken,
        uint256 payAmount,
        uint256 phnRaw,
        uint256 usdMicro
    ) internal {
        require(phnRaw > 0, "too small");

        Epoch storage e = epochs[currentEpoch];
        require(e.sold + phnRaw <= e.cap, "epoch cap reached");

        // ── Fee split ─────────────────────────────────────────────────────────
        // burnAmt  = phnRaw * 0.25%
        // feeAmt   = phnRaw * 1.75%
        // userAmt  = phnRaw * 98%
        uint256 burnAmt     = (phnRaw * BURN_BPS)     / BPS_DENOM;
        uint256 feeAmt      = (phnRaw * TREASURY_BPS) / BPS_DENOM;
        uint256 userAmt     = phnRaw - burnAmt - feeAmt; // = 98% of phnRaw

        // Verify presale contract has enough PHN
        uint256 needed = userAmt + burnAmt + feeAmt; // = phnRaw
        require(phn.balanceOf(address(this)) >= needed, "insufficient presale inventory");

        // Update epoch and totals
        e.sold             += phnRaw;
        totalPhnSold       += userAmt;
        totalPhnBurned     += burnAmt;
        totalUsdRaisedMicro += usdMicro;
        userPhnBought[buyer] += userAmt;

        // Transfer user's PHN
        phn.safeTransfer(buyer, userAmt);

        // Transfer treasury fee
        if (feeAmt > 0) phn.safeTransfer(treasury, feeAmt);

        // Burn (uses ERC20Burnable.burn — permanently removes from supply)
        if (burnAmt > 0) IBurnable(address(phn)).burn(burnAmt);

        emit Purchase(buyer, payToken, payAmount, userAmt, burnAmt, feeAmt, currentEpoch);

        // Auto-advance epoch if cap hit
        if (e.sold >= e.cap) _tryAdvanceEpoch();
    }

    function _tryAdvanceEpoch() internal {
        uint256 next = currentEpoch + 1;
        if (next < epochs.length) {
            epochs[next].active = true;
            emit EpochAdvanced(currentEpoch, next, epochs[next].priceUsdMicro);
            currentEpoch = next;
        }
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    function advanceEpoch() external onlyRole(SALE_ADMIN_ROLE) {
        _tryAdvanceEpoch();
    }

    function addEpoch(uint256 priceUsdMicro, uint256 cap) external onlyRole(SALE_ADMIN_ROLE) {
        require(priceUsdMicro > 0, "price=0");
        require(cap > 0, "cap=0");
        epochs.push(Epoch({ priceUsdMicro: priceUsdMicro, cap: cap, sold: 0, active: false }));
        emit EpochAdded(epochs.length - 1, priceUsdMicro, cap);
    }

    function updateEpochPrice(uint256 epochIdx, uint256 priceUsdMicro) external onlyRole(SALE_ADMIN_ROLE) {
        require(epochIdx < epochs.length, "bad epoch");
        require(epochs[epochIdx].sold == 0, "epoch already has sales");
        epochs[epochIdx].priceUsdMicro = priceUsdMicro;
    }

    function setNativePerUsd(uint256 rate) external onlyRole(SALE_ADMIN_ROLE) {
        require(rate > 0, "rate=0");
        nativePerUsd = rate;
        emit NativePriceUpdated(rate);
    }

    function setTreasury(address treasury_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(treasury_ != address(0), "treasury=0");
        treasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }

    function setUsdc(address usdc_) external onlyRole(SALE_ADMIN_ROLE) {
        usdc = IERC20(usdc_);
        emit UsdcUpdated(usdc_);
    }

    function withdrawUnsoldPhn(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        phn.safeTransfer(to, amount);
    }

    function pause()   external onlyRole(SALE_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(SALE_ADMIN_ROLE) { _unpause(); }

    // ── Views ─────────────────────────────────────────────────────────────────

    function epochCount() external view returns (uint256) { return epochs.length; }

    function currentPriceUsdMicro() external view returns (uint256) {
        return epochs[currentEpoch].priceUsdMicro;
    }

    function currentEpochSold() external view returns (uint256) {
        return epochs[currentEpoch].sold;
    }

    function currentEpochCap() external view returns (uint256) {
        return epochs[currentEpoch].cap;
    }

    function currentEpochRemaining() external view returns (uint256) {
        Epoch storage e = epochs[currentEpoch];
        return e.cap > e.sold ? e.cap - e.sold : 0;
    }

    /// @notice Preview: how much PHN for a given native token amount
    function previewNative(uint256 nativeAmount) external view returns (
        uint256 phnToUser,
        uint256 phnBurned,
        uint256 phnToTreasury,
        uint256 pricePer1Phn
    ) {
        uint256 usdMicro = (nativeAmount * 1_000_000) / nativePerUsd;
        uint256 phnRaw   = _calcPhn(usdMicro);
        phnBurned      = (phnRaw * BURN_BPS)     / BPS_DENOM;
        phnToTreasury  = (phnRaw * TREASURY_BPS) / BPS_DENOM;
        phnToUser      = phnRaw - phnBurned - phnToTreasury;
        pricePer1Phn   = epochs[currentEpoch].priceUsdMicro;
    }

    /// @notice Preview: how much PHN for a given USDC amount
    function previewUsdc(uint256 usdcAmount) external view returns (
        uint256 phnToUser,
        uint256 phnBurned,
        uint256 phnToTreasury
    ) {
        uint256 phnRaw   = _calcPhn(usdcAmount);
        phnBurned      = (phnRaw * BURN_BPS)     / BPS_DENOM;
        phnToTreasury  = (phnRaw * TREASURY_BPS) / BPS_DENOM;
        phnToUser      = phnRaw - phnBurned - phnToTreasury;
    }

    /// @notice All epoch data for the UI
    function allEpochs() external view returns (Epoch[] memory) {
        return epochs;
    }

    function inventoryRemaining() external view returns (uint256) {
        return phn.balanceOf(address(this));
    }
}
