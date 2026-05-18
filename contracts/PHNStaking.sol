// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract PHNStaking is AccessControl {
    bytes32 public constant REWARD_ADMIN_ROLE = keccak256("REWARD_ADMIN_ROLE");
    IERC20 public immutable phn;
    mapping(address=>uint256) public staked;
    mapping(address=>uint256) public rewards;
    uint256 public totalStaked;
    constructor(address admin,address phn_){phn=IERC20(phn_);_grantRole(DEFAULT_ADMIN_ROLE,admin);_grantRole(REWARD_ADMIN_ROLE,admin);}
    function stake(uint256 amount) external {require(amount>0,"amount=0");require(phn.transferFrom(msg.sender,address(this),amount),"in");staked[msg.sender]+=amount;totalStaked+=amount;}
    function unstake(uint256 amount) external {require(staked[msg.sender]>=amount,"stake");staked[msg.sender]-=amount;totalStaked-=amount;require(phn.transfer(msg.sender,amount),"out");}
    function addReward(address user,uint256 amount) external onlyRole(REWARD_ADMIN_ROLE){rewards[user]+=amount;}
    function claim() external {uint256 amount=rewards[msg.sender];require(amount>0,"none");rewards[msg.sender]=0;require(phn.transfer(msg.sender,amount),"reward");}
}
