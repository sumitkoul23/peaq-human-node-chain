// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PHNSaleVesting.sol";

contract PHNRoundSale is AccessControl {
    bytes32 public constant SALE_ADMIN_ROLE = keccak256("SALE_ADMIN_ROLE");
    uint256 public constant ROUND_COUNT = 10;
    uint256 public constant PRICE_STEP_BPS = 3000;
    uint256 public constant COOLDOWN = 15 days;

    IERC20 public immutable phn;
    PHNSaleVesting public immutable saleVesting;
    address public treasury;
    uint256 public currentRound = 1;
    uint256 public roundAllocation;
    uint256 public soldInRound;
    uint256 public basePricePeaqPerToken;
    bool public paused;
    mapping(address => bool) public acceptedPaymentToken;
    mapping(address => bool) public whitelist;
    mapping(address => uint256) public purchasedAt;
    mapping(address => uint256) public totalPurchased;
    mapping(address => address) public referrerOf;

    event Purchased(address indexed buyer, address indexed paymentToken, uint256 paymentAmount, uint256 phnAmount, uint256 round);
    event RoundAdvanced(uint256 indexed newRound, uint256 newPrice);

    constructor(address admin,address phn_,address vesting_,address treasury_,uint256 basePrice_,uint256 roundAllocation_) {
        phn=IERC20(phn_); saleVesting=PHNSaleVesting(vesting_); treasury=treasury_; basePricePeaqPerToken=basePrice_; roundAllocation=roundAllocation_;
        _grantRole(DEFAULT_ADMIN_ROLE,admin); _grantRole(SALE_ADMIN_ROLE,admin);
    }

    function priceForRound(uint256 round) public view returns (uint256 price) {
        price = basePricePeaqPerToken;
        for(uint256 i=1;i<round;i++){ price = (price * (10_000 + PRICE_STEP_BPS)) / 10_000; }
    }

    function remainingInRound() external view returns (uint256) {
        return roundAllocation - soldInRound;
    }

    function setAcceptedPaymentToken(address token, bool accepted) external onlyRole(SALE_ADMIN_ROLE) {
        acceptedPaymentToken[token]=accepted;
    }

    function setPaused(bool value) external onlyRole(SALE_ADMIN_ROLE) { paused = value; }
    function setWhitelist(address buyer, bool allowed) external onlyRole(SALE_ADMIN_ROLE) { whitelist[buyer] = allowed; }

    function buyWithToken(address paymentToken,uint256 paymentAmount,uint256 normalizedPeaqValue,address referrer) external {
        require(!paused,"paused");
        require(acceptedPaymentToken[paymentToken],"unsupported token");
        if(currentRound == 1) require(whitelist[msg.sender],"not whitelisted");
        uint256 amount = (normalizedPeaqValue * 1e18) / priceForRound(currentRound);
        require(soldInRound + amount <= roundAllocation,"round sold");
        require(phn.balanceOf(address(this)) >= amount,"inventory");
        require(IERC20(paymentToken).transferFrom(msg.sender, treasury, paymentAmount),"payment");
        soldInRound += amount;
        purchasedAt[msg.sender] = block.timestamp;
        totalPurchased[msg.sender] += amount;
        if(referrer != address(0) && referrer != msg.sender && referrerOf[msg.sender] == address(0)) referrerOf[msg.sender] = referrer;
        require(phn.transfer(address(saleVesting), amount),"vesting transfer");
        saleVesting.createAllocation(msg.sender, amount);
        emit Purchased(msg.sender,paymentToken,paymentAmount,amount,currentRound);
        if(soldInRound == roundAllocation && currentRound < ROUND_COUNT){
            currentRound += 1; soldInRound = 0; emit RoundAdvanced(currentRound, priceForRound(currentRound));
        }
    }

    function canSell(address buyer) external view returns (bool) {
        return purchasedAt[buyer] != 0 && block.timestamp >= purchasedAt[buyer] + COOLDOWN;
    }

    function nextRoundPrice() external view returns (uint256) {
        return currentRound < ROUND_COUNT ? priceForRound(currentRound + 1) : priceForRound(currentRound);
    }
}
