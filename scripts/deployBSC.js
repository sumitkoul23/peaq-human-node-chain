// Deploy PeaqHumanNodeToken (PHN) to BSC Mainnet
// Run: npx hardhat run scripts/deployBSC.js --network bsc
//
// Requirements:
//   - DEPLOYER_PRIVATE_KEY in .env (for wallet 0x7fb31d8b...)
//   - At least 0.002 BNB in deployer wallet (est. ~0.0001 BNB needed at 0.05 gwei)
//
// This deploys a fresh 100,000,000 PHN supply on BSC.
// After deployment, add liquidity on PancakeSwap V2.

require("dotenv").config();
const hre = require("hardhat");

// ── Allocation wallets — all pointing to your owner wallet ───────────────────
// Change these if you want separate wallets per allocation
const OWNER_WALLET    = process.env.OWNER_WALLET    || "0x7fb31d8b2b5cbed4d6e02768664a299d303ea4c2";
const ECOSYSTEM       = process.env.ECOSYSTEM_TREASURY || OWNER_WALLET;
const LIQUIDITY_VAULT = process.env.LIQUIDITY_VAULT   || OWNER_WALLET;

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("\n==========================================");
  console.log("   PHN TOKEN — BSC MAINNET DEPLOYMENT");
  console.log("==========================================");
  console.log("Deployer       :", deployer.address);
  console.log("Network        :", network);
  console.log("Owner wallet   :", OWNER_WALLET);
  console.log("Ecosystem      :", ECOSYSTEM);
  console.log("Liquidity vault:", LIQUIDITY_VAULT);

  const bal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("BNB Balance    :", hre.ethers.formatEther(bal));

  if (deployer.address.toLowerCase() !== OWNER_WALLET.toLowerCase()) {
    console.warn("\nWARNING: Deployer != OWNER_WALLET. The OWNER_ALLOCATION (50M PHN) will go to FounderVestingWallet.");
  }

  // ── Step 1: FounderVestingWallet ──────────────────────────────────────────
  console.log("\n[1/4] Deploying FounderVestingWallet (3-year linear vesting)...");
  const founderStart    = Math.floor(Date.now() / 1000);
  const founderDuration = 60 * 60 * 24 * 365 * 3; // 3 years

  const Vesting = await hre.ethers.getContractFactory("FounderVestingWallet");
  const vesting = await Vesting.deploy(OWNER_WALLET, founderStart, founderDuration);
  await vesting.waitForDeployment();
  const vestingAddr = await vesting.getAddress();
  console.log("   FounderVestingWallet:", vestingAddr);

  // ── Step 2: LaunchTimelock ────────────────────────────────────────────────
  console.log("\n[2/4] Deploying LaunchTimelock (48h delay)...");
  const timelockDelay = 60 * 60 * 24 * 2; // 48 hours

  const Timelock = await hre.ethers.getContractFactory("LaunchTimelock");
  const timelock = await Timelock.deploy(timelockDelay, [OWNER_WALLET], [OWNER_WALLET], OWNER_WALLET);
  await timelock.waitForDeployment();
  const timelockAddr = await timelock.getAddress();
  console.log("   LaunchTimelock:", timelockAddr);

  // ── Step 3: NodeIdentityRegistry ─────────────────────────────────────────
  console.log("\n[3/4] Deploying NodeIdentityRegistry...");
  const Registry = await hre.ethers.getContractFactory("NodeIdentityRegistry");
  const registry = await Registry.deploy(timelockAddr, OWNER_WALLET);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("   NodeIdentityRegistry:", registryAddr);

  // ── Step 4: PHN Token + NodeRewardVault ──────────────────────────────────
  console.log("\n[4/4] Deploying PHN Token + NodeRewardVault...");

  // Predict NodeRewardVault address (deployed at nonce+1 after token)
  const currentNonce = await hre.ethers.provider.getTransactionCount(deployer.address);
  const predictedRewardVault = hre.ethers.getCreateAddress({
    from: deployer.address,
    nonce: currentNonce + 1
  });
  console.log("   Predicted NodeRewardVault:", predictedRewardVault);

  const Token = await hre.ethers.getContractFactory("PeaqHumanNodeToken");
  const token = await Token.deploy(
    vestingAddr,          // → OWNER_ALLOCATION (50M) → locked in vesting
    ECOSYSTEM,            // → ECOSYSTEM_ALLOCATION (20M)
    predictedRewardVault, // → NODE_REWARD_ALLOCATION (20M)
    LIQUIDITY_VAULT       // → LIQUIDITY_ALLOCATION (10M)
  );
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("   PHN Token:", tokenAddr);

  const RewardVault = await hre.ethers.getContractFactory("NodeRewardVault");
  const rewardVault = await RewardVault.deploy(timelockAddr, tokenAddr, registryAddr);
  await rewardVault.waitForDeployment();
  const rewardVaultAddr = await rewardVault.getAddress();

  if (rewardVaultAddr.toLowerCase() !== predictedRewardVault.toLowerCase()) {
    console.error("ERROR: RewardVault address mismatch! Check nonce.");
    console.error("Predicted:", predictedRewardVault, "Actual:", rewardVaultAddr);
  } else {
    console.log("   NodeRewardVault:", rewardVaultAddr, "(address verified)");
  }

  // ── Verify balances ───────────────────────────────────────────────────────
  console.log("\n=== TOKEN DISTRIBUTION VERIFICATION ===");
  const fmt = (n) => hre.ethers.formatUnits(n, 18);
  const [bVesting, bEco, bReward, bLiq] = await Promise.all([
    token.balanceOf(vestingAddr),
    token.balanceOf(ECOSYSTEM),
    token.balanceOf(rewardVaultAddr),
    token.balanceOf(LIQUIDITY_VAULT)
  ]);
  const total = bVesting + bEco + bReward + bLiq;
  console.log("FounderVesting  (50M):", fmt(bVesting), "PHN");
  console.log("Ecosystem       (20M):", fmt(bEco),     "PHN");
  console.log("NodeRewardVault (20M):", fmt(bReward),  "PHN");
  console.log("LiquidityVault  (10M):", fmt(bLiq),     "PHN");
  console.log("Total                :", fmt(total),    "PHN / 100,000,000");

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n==========================================");
  console.log("  PHN BSC DEPLOYMENT COMPLETE!");
  console.log("==========================================");
  console.log("PHN Token (BSC)  :", tokenAddr);
  console.log("NodeRewardVault  :", rewardVaultAddr);
  console.log("FounderVesting   :", vestingAddr);
  console.log("LaunchTimelock   :", timelockAddr);
  console.log("NodeIdentityReg  :", registryAddr);
  console.log("==========================================");
  console.log("\nNEXT STEPS:");
  console.log("1. Add PHN_TOKEN_BSC=" + tokenAddr + " to your .env");
  console.log("2. Verify on BscScan:");
  console.log("   npx hardhat verify --network bsc " + tokenAddr + " \\");
  console.log("     " + vestingAddr + " " + ECOSYSTEM + " " + predictedRewardVault + " " + LIQUIDITY_VAULT);
  console.log("3. Add PancakeSwap liquidity: https://pancakeswap.finance/add/BNB/" + tokenAddr);
  console.log("4. Submit to BSCscan token info");
  console.log("==========================================");

  // Write deployment record
  const fs = require("fs");
  const record = {
    network   : "bsc",
    chainId   : 56,
    deployedAt: new Date().toISOString(),
    deployer  : deployer.address,
    contracts : {
      PHNToken        : tokenAddr,
      NodeRewardVault : rewardVaultAddr,
      FounderVesting  : vestingAddr,
      LaunchTimelock  : timelockAddr,
      NodeIdentityReg : registryAddr
    },
    allocations: {
      founderVesting  : fmt(bVesting) + " PHN",
      ecosystem       : fmt(bEco)     + " PHN",
      nodeRewardVault : fmt(bReward)  + " PHN",
      liquidityVault  : fmt(bLiq)     + " PHN"
    }
  };
  fs.writeFileSync("bsc-deployment.json", JSON.stringify(record, null, 2));
  console.log("\nDeployment record saved to: bsc-deployment.json");
}

main().catch((e) => { console.error(e); process.exit(1); });
