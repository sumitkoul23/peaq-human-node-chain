// Deploy PHNPresale to peaq Mainnet (Phase 1)
// Run: npx hardhat run scripts/deployPresale.js --network peaq
//
// After deploying to peaq, repeat with --network bsc for Phase 2.
//
// PEAQ/USD rate: go to CoinGecko/CoinMarketCap, get current PEAQ price in USD.
//   nativePerUsd = 1e18 / PEAQ_PRICE_USD
//   Example: PEAQ = $0.50 → nativePerUsd = 2n * 10n**18n (2 PEAQ per dollar)
//   Example: PEAQ = $1.00 → nativePerUsd = 1n * 10n**18n
//   Example: PEAQ = $0.10 → nativePerUsd = 10n * 10n**18n

require("dotenv").config();
const hre = require("hardhat");

// ── CONFIG — fill these before deploying ─────────────────────────────────────
const PHN_TOKEN_PEAQ    = ""; // PHNOFT address on peaq (after LayerZero bridge setup)
const USDC_PEAQ         = ""; // USDC contract on peaq network (check peaq docs)
const TREASURY_WALLET   = ""; // Your treasury wallet address
const PEAQ_PRICE_USD    = 0.50; // Current PEAQ price in USD — UPDATE THIS
const PRESALE_INVENTORY = hre.ethers.parseEther("5000000"); // 5M PHN for epoch 1

async function main() {
  if (!PHN_TOKEN_PEAQ || !TREASURY_WALLET) {
    console.error("ERROR: Set PHN_TOKEN_PEAQ and TREASURY_WALLET before deploying.");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:  ", deployer.address);
  console.log("Network:   ", hre.network.name);
  console.log("PEAQ price:", "$" + PEAQ_PRICE_USD);

  const nativePerUsd = hre.ethers.parseEther((1 / PEAQ_PRICE_USD).toFixed(6));
  console.log("nativePerUsd:", nativePerUsd.toString(), "(wei per $1)");

  const bal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:   ", hre.ethers.formatEther(bal), "PEAQ");

  // Deploy
  console.log("\n[1/3] Deploying PHNPresale...");
  const PHNPresale = await hre.ethers.getContractFactory("PHNPresale");
  const presale = await PHNPresale.deploy(
    deployer.address,
    PHN_TOKEN_PEAQ,
    USDC_PEAQ || deployer.address, // placeholder if no USDC yet
    TREASURY_WALLET,
    nativePerUsd
  );
  await presale.waitForDeployment();
  const addr = await presale.getAddress();
  console.log("PHNPresale deployed:", addr);

  // Fund presale inventory
  console.log("\n[2/3] Funding presale with", hre.ethers.formatEther(PRESALE_INVENTORY), "PHN...");
  const phn = await hre.ethers.getContractAt("IERC20", PHN_TOKEN_PEAQ);
  const approveTx = await phn.approve(addr, PRESALE_INVENTORY);
  await approveTx.wait();
  const transferTx = await phn.transfer(addr, PRESALE_INVENTORY);
  await transferTx.wait();
  console.log("Presale funded:", hre.ethers.formatEther(await phn.balanceOf(addr)), "PHN");

  // Verify epoch setup
  console.log("\n[3/3] Epoch configuration:");
  const epochCount = await presale.epochCount();
  for (let i = 0; i < Number(epochCount); i++) {
    const ep = await presale.epochs(i);
    const priceUsd = Number(ep.priceUsdMicro) / 1_000_000;
    console.log(`  Epoch ${i}: $${priceUsd.toFixed(4)} | cap: ${hre.ethers.formatEther(ep.cap)} PHN | active: ${ep.active}`);
  }

  console.log("\n✅ PHNPresale deployment complete on", hre.network.name);
  console.log("   Contract:  ", addr);
  console.log("   Epoch 1:   $0.02 per PHN");
  console.log("   Epoch 2:   $0.05 per PHN");
  console.log("   Fee:       2% total (0.25% burn + 1.75% treasury)");
  console.log("\nNext steps:");
  console.log("  1. Update buy.html with PRESALE_CA =", addr);
  console.log("  2. Update staking.html if needed");
  console.log("  3. Verify: npx hardhat verify --network", hre.network.name, addr, deployer.address, PHN_TOKEN_PEAQ, USDC_PEAQ||deployer.address, TREASURY_WALLET, nativePerUsd.toString());
  console.log("\nPhase 2 (BSC): deploy again with --network bsc, update BNB price");
}

main().catch((e) => { console.error(e); process.exit(1); });
