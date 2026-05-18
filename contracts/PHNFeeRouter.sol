// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract PHNFeeRouter is AccessControl {
    IERC20 public immutable phn; address public treasury;
    uint256 public constant FEE_BPS=100; uint256 public constant BURN_SHARE_BPS=2500;
    constructor(address admin,address phn_,address treasury_){phn=IERC20(phn_);treasury=treasury_;_grantRole(DEFAULT_ADMIN_ROLE,admin);}
    function processFee(uint256 grossAmount) external returns(uint256){
        uint256 fee=(grossAmount*FEE_BPS)/10000; uint256 burnAmount=(fee*BURN_SHARE_BPS)/10000; uint256 treasuryAmount=fee-burnAmount;
        require(phn.transferFrom(msg.sender,address(this),fee),"fee");
        require(phn.transfer(address(0xdead),burnAmount),"burn");
        require(phn.transfer(treasury,treasuryAmount),"treasury");
        return grossAmount-fee;
    }
}
