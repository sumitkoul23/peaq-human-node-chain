// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./NodeIdentityRegistry.sol";
import "./NodeRewardVault.sol";

contract NodeEarningsManager is AccessControl {
    bytes32 public constant POLICY_ADMIN_ROLE = keccak256("POLICY_ADMIN_ROLE");

    NodeIdentityRegistry public immutable registry;
    NodeRewardVault public immutable rewardVault;

    uint256 public rewardPerHeartbeat;
    uint256 public minHeartbeatInterval;

    mapping(address => uint256) public lastHeartbeatAt;
    mapping(address => uint256) public accruedRewards;

    event HeartbeatRecorded(address indexed operator, uint256 rewardAccrued, uint256 timestamp);
    event RewardsClaimed(address indexed operator, uint256 amount);
    event RewardPolicyUpdated(uint256 rewardPerHeartbeat, uint256 minHeartbeatInterval);

    constructor(
        address admin,
        address registry_,
        address rewardVault_,
        uint256 rewardPerHeartbeat_,
        uint256 minHeartbeatInterval_
    ) {
        require(admin != address(0), "admin=0");
        require(registry_ != address(0), "registry=0");
        require(rewardVault_ != address(0), "vault=0");
        require(minHeartbeatInterval_ > 0, "interval=0");

        registry = NodeIdentityRegistry(registry_);
        rewardVault = NodeRewardVault(rewardVault_);
        rewardPerHeartbeat = rewardPerHeartbeat_;
        minHeartbeatInterval = minHeartbeatInterval_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(POLICY_ADMIN_ROLE, admin);
    }

    function heartbeat() external {
        require(registry.isEligibleOperator(msg.sender), "operator ineligible");
        uint256 last = lastHeartbeatAt[msg.sender];
        require(last == 0 || block.timestamp >= last + minHeartbeatInterval, "heartbeat too soon");

        lastHeartbeatAt[msg.sender] = block.timestamp;
        accruedRewards[msg.sender] += rewardPerHeartbeat;

        emit HeartbeatRecorded(msg.sender, rewardPerHeartbeat, block.timestamp);
    }

    function claim() external {
        require(registry.isEligibleOperator(msg.sender), "operator ineligible");
        uint256 amount = accruedRewards[msg.sender];
        require(amount > 0, "nothing accrued");
        accruedRewards[msg.sender] = 0;
        rewardVault.payReward(msg.sender, amount);
        emit RewardsClaimed(msg.sender, amount);
    }

    function setRewardPolicy(uint256 rewardPerHeartbeat_, uint256 minHeartbeatInterval_)
        external
        onlyRole(POLICY_ADMIN_ROLE)
    {
        require(minHeartbeatInterval_ > 0, "interval=0");
        rewardPerHeartbeat = rewardPerHeartbeat_;
        minHeartbeatInterval = minHeartbeatInterval_;
        emit RewardPolicyUpdated(rewardPerHeartbeat_, minHeartbeatInterval_);
    }
}
