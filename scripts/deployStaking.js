// Deploy PHNStaking contract and fund the 10M PHN reward pool
// Run: npx hardhat run scripts/deployStaking.js --network bsc
//
// Prerequisites:
//   - PHN token must be deployed (set PHN_TOKEN_ADDRESS below)
//   - Deployer wallet must hold 10,000,000 PHN to fund the reward pool
//   - Set env vars: DEPLOYER_PRIVATE_KEY, BSC_RPC_URL

require("dotenv").config();
const hre = require("hardhat");

const PHN_TOKEN_ADDRESS = "0x83e2A4aB24A61d138f12569c497C3E5f2BF8694B";
const REWARD_POOL_AMOUNT = hre.ethers.parseEther("10000000"); // 10M PHN

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Network:", hre.network.name);

  const bal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("BNB balance:", hre.ethers.formatEther(bal));

  // 1. Deploy staking contract
  console.log("\n[1/3] Deploying PHNStaking...");
  const PHNStaking = await hre.ethers.getContractFactory("PHNStaking");
  const staking = await PHNStaking.deploy(deployer.address, PHN_TOKEN_ADDRESS);
  await staking.waitForDeployment();
  const stakingAddr = await staking.getAddress();
  console.log("PHNStaking deployed:", stakingAddr);

  // 2. Approve staking contract to pull reward pool tokens
  console.log("\n[2/3] Approving 10M PHN for reward pool...");
  const phn = await hre.ethers.getContractAt("IERC20", PHN_TOKEN_ADDRESS);
  const approveTx = await phn.approve(stakingAddr, REWARD_POOL_AMOUNT);
  await approveTx.wait();
  console.log("Approval TX:", approveTx.hash);

  // 3. Fund reward pool
  console.log("\n[3/3] Funding staking reward pool with 10M PHN...");
  const fundTx = await staking.fundRewardPool(REWARD_POOL_AMOUNT);
  await fundTx.wait();
  console.log("Fund TX:", fundTx.hash);

  const remaining = await staking.rewardPoolRemaining();
  console.log("Pool funded:", hre.ethers.formatEther(remaining), "PHN");

  console.log("\n✅ PHNStaking deployment complete");
  console.log("   Contract:", stakingAddr);
  console.log("   Reward pool: 10,000,000 PHN");
  console.log("   Tiers: FLEX 8% | LOCKED 15% (90d) | VAULT 25% (180d)");
  console.log("\nNext: Update staking.html with contract address:", stakingAddr);
  console.log("Verify: npx hardhat verify --network bsc", stakingAddr, deployer.address, PHN_TOKEN_ADDRESS);
}

main().catch((e) => { console.error(e); process.exit(1); });
