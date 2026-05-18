// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";

contract PHNOFT is OFT {
    uint256 public constant MAX_SUPPLY = 100_000_000 ether;
    uint256 public constant FOUNDER_ALLOCATION = 50_000_000 ether;
    uint256 public constant ECOSYSTEM_ALLOCATION = 20_000_000 ether;
    uint256 public constant NODE_REWARD_ALLOCATION = 20_000_000 ether;
    uint256 public constant LIQUIDITY_ALLOCATION = 10_000_000 ether;

    bool public immutable canonicalMint;

    constructor(
        address _lzEndpoint,
        address _delegate,
        bool _canonicalMint,
        address founderWallet,
        address ecosystemTreasury,
        address nodeRewardVault,
        address liquidityVault
    ) OFT("Peaq Human Node", "PHN", _lzEndpoint, _delegate) Ownable(_delegate) {
        canonicalMint = _canonicalMint;
        if (_canonicalMint) {
            require(founderWallet != address(0), "founder=0");
            require(ecosystemTreasury != address(0), "ecosystem=0");
            require(nodeRewardVault != address(0), "rewards=0");
            require(liquidityVault != address(0), "liquidity=0");
            _mint(founderWallet, FOUNDER_ALLOCATION);
            _mint(ecosystemTreasury, ECOSYSTEM_ALLOCATION);
            _mint(nodeRewardVault, NODE_REWARD_ALLOCATION);
            _mint(liquidityVault, LIQUIDITY_ALLOCATION);
            require(totalSupply() == MAX_SUPPLY, "bad supply");
        }
    }
}
