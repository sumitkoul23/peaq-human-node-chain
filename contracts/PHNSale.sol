// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract PHNSale is AccessControl {
    bytes32 public constant SALE_ADMIN_ROLE = keccak256("SALE_ADMIN_ROLE");
    IERC20 public immutable phn;
    address public treasury;
    uint256 public publicPricePeaqPerToken;
    uint256 public prelaunchPricePeaqPerToken;
    uint256 public minPurchasePeaq;
    bool public prelaunchActive;
    constructor(address admin,address phn_,address treasury_,uint256 publicPrice_,uint256 prelaunchPrice_,uint256 minPurchase_){
        phn=IERC20(phn_); treasury=treasury_; publicPricePeaqPerToken=publicPrice_; prelaunchPricePeaqPerToken=prelaunchPrice_; minPurchasePeaq=minPurchase_;
        _grantRole(DEFAULT_ADMIN_ROLE,admin); _grantRole(SALE_ADMIN_ROLE,admin);
    }
    receive() external payable { buy(); }
    function buy() public payable {
        require(msg.value>=minPurchasePeaq,"below minimum");
        uint256 price=prelaunchActive?prelaunchPricePeaqPerToken:publicPricePeaqPerToken;
        uint256 amount=(msg.value*1e18)/price;
        require(phn.balanceOf(address(this))>=amount,"sale inventory");
        (bool ok,)=treasury.call{value:msg.value}(""); require(ok,"treasury");
        require(phn.transfer(msg.sender,amount),"phn");
    }
    function setSaleConfig(uint256 a,uint256 b,uint256 c,bool d) external onlyRole(SALE_ADMIN_ROLE){publicPricePeaqPerToken=a;prelaunchPricePeaqPerToken=b;minPurchasePeaq=c;prelaunchActive=d;}
}
