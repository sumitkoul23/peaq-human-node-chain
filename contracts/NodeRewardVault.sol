// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./PeaqHumanNodeToken.sol";
import "./NodeIdentityRegistry.sol";

contract NodeRewardVault is AccessControl {
    bytes32 public constant REWARD_DISTRIBUTOR_ROLE = keccak256("REWARD_DISTRIBUTOR_ROLE");

    PeaqHumanNodeToken public immutable token;
    NodeIdentityRegistry public immutable registry;

    event RewardPaid(address indexed operator, uint256 amount);

    constructor(address admin, address token_, address registry_) {
        require(admin != address(0), "admin=0");
        token = PeaqHumanNodeToken(token_);
        registry = NodeIdentityRegistry(registry_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REWARD_DISTRIBUTOR_ROLE, admin);
    }

    function payReward(address operator, uint256 amount) external onlyRole(REWARD_DISTRIBUTOR_ROLE) {
        require(registry.isEligibleOperator(operator), "operator ineligible");
        require(token.balanceOf(address(this)) >= amount, "insufficient vault");
        require(token.transfer(operator, amount), "transfer failed");
        emit RewardPaid(operator, amount);
    }
}
