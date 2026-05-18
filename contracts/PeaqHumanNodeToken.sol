// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PeaqHumanNodeToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant REWARD_MANAGER_ROLE = keccak256("REWARD_MANAGER_ROLE");

    uint256 public constant MAX_SUPPLY = 100_000_000 ether;
    uint256 public constant OWNER_ALLOCATION = 50_000_000 ether;
    uint256 public constant ECOSYSTEM_ALLOCATION = 20_000_000 ether;
    uint256 public constant NODE_REWARD_ALLOCATION = 20_000_000 ether;
    uint256 public constant LIQUIDITY_ALLOCATION = 10_000_000 ether;

    address public immutable ecosystemTreasury;
    address public immutable nodeRewardVault;
    address public immutable liquidityVault;

    constructor(
        address owner,
        address ecosystemTreasury_,
        address nodeRewardVault_,
        address liquidityVault_
    ) ERC20("Peaq Human Node", "PHN") {
        require(owner != address(0), "owner=0");
        require(ecosystemTreasury_ != address(0), "ecosystem=0");
        require(nodeRewardVault_ != address(0), "rewards=0");
        require(liquidityVault_ != address(0), "liquidity=0");

        ecosystemTreasury = ecosystemTreasury_;
        nodeRewardVault = nodeRewardVault_;
        liquidityVault = liquidityVault_;

        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(PAUSER_ROLE, owner);
        _grantRole(REWARD_MANAGER_ROLE, owner);

        _mint(owner, OWNER_ALLOCATION);
        _mint(ecosystemTreasury_, ECOSYSTEM_ALLOCATION);
        _mint(nodeRewardVault_, NODE_REWARD_ALLOCATION);
        _mint(liquidityVault_, LIQUIDITY_ALLOCATION);
        require(totalSupply() == MAX_SUPPLY, "bad supply");
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
