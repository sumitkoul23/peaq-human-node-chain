// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PHNSaleVesting is AccessControl {
    bytes32 public constant SALE_ROLE = keccak256("SALE_ROLE");
    IERC20 public immutable phn;
    uint256 public constant LOCK_PERIOD = 15 days;

    struct Allocation {
        uint256 amount;
        uint256 unlockAt;
    }

    mapping(address => Allocation[]) public allocations;

    constructor(address admin, address phn_) {
        phn = IERC20(phn_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function grantSaleRole(address sale) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(SALE_ROLE, sale);
    }

    function createAllocation(address buyer, uint256 amount) external onlyRole(SALE_ROLE) {
        allocations[buyer].push(Allocation({
            amount: amount,
            unlockAt: block.timestamp + LOCK_PERIOD
        }));
    }

    function releasable(address buyer) public view returns (uint256 total) {
        Allocation[] memory items = allocations[buyer];
        for (uint256 i = 0; i < items.length; i++) {
            if (items[i].unlockAt <= block.timestamp) total += items[i].amount;
        }
    }

    function claim() external {
        uint256 amount;
        Allocation[] storage items = allocations[msg.sender];
        for (uint256 i = 0; i < items.length; i++) {
            if (items[i].unlockAt <= block.timestamp && items[i].amount > 0) {
                amount += items[i].amount;
                items[i].amount = 0;
            }
        }
        require(amount > 0, "nothing vested");
        require(phn.transfer(msg.sender, amount), "transfer");
    }
}
