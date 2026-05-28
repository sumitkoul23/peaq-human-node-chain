require("dotenv").config();
const fs = require("fs");
const hre = require("hardhat");

const PHN_TOKEN_PEAQ = process.env.PHN_TOKEN_PEAQ || "0x83e2A4aB24A61d138f12569c497C3E5f2BF8694B";
const OWNER_WALLET = process.env.OWNER_WALLET;
const TREASURY_WALLET = process.env.TREASURY_WALLET || process.env.ECOSYSTEM_TREASURY || process.env.OWNER_WALLET;
const USDC_PEAQ = process.env.USDC_PEAQ || hre.ethers.ZeroAddress;

// CoinGecko observed PEAQ ~= $0.02991 on 2026-05-28.
// nativePerUsd = 1 / 0.02991 = 33.4336 PEAQ per USD.
const NATIVE_PER_USD = process.env.PEAQ_NATIVE_PER_USD || "33.433634";

async function main() {
  if (!OWNER_WALLET) throw new Error("Set OWNER_WALLET in .env");
  if (!TREASURY_WALLET) throw new Error("Set TREASURY_WALLET or ECOSYSTEM_TREASURY in .env");

  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();
  const nativePerUsd = hre.ethers.parseEther(NATIVE_PER_USD);

  console.log("\n==========================================");
  console.log("   PHN PEAQ RUNTIME DEPLOYMENT");
  console.log("==========================================");
  console.log("Network          :", hre.network.name, Number(network.chainId));
  console.log("Deployer         :", deployer.address);
  console.log("Admin owner      :", OWNER_WALLET);
  console.log("Treasury         :", TREASURY_WALLET);
  console.log("PHN token        :", PHN_TOKEN_PEAQ);
  console.log("USDC             :", USDC_PEAQ);
  console.log("nativePerUsd     :", nativePerUsd.toString(), `(${NATIVE_PER_USD} native / USD)`);
  console.log("Native balance   :", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

  const phn = await hre.ethers.getContractAt("IERC20", PHN_TOKEN_PEAQ);
  console.log("Deployer PHN     :", hre.ethers.formatEther(await phn.balanceOf(deployer.address)));
  console.log("Owner PHN        :", hre.ethers.formatEther(await phn.balanceOf(OWNER_WALLET)));

  console.log("\n[1/2] Deploying PHNStaking...");
  const PHNStaking = await hre.ethers.getContractFactory("PHNStaking");
  const staking = await PHNStaking.deploy(OWNER_WALLET, PHN_TOKEN_PEAQ);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("PHNStaking       :", stakingAddress);

  console.log("\n[2/2] Deploying PHNPresale...");
  const PHNPresale = await hre.ethers.getContractFactory("PHNPresale");
  const presale = await PHNPresale.deploy(
    OWNER_WALLET,
    PHN_TOKEN_PEAQ,
    USDC_PEAQ,
    TREASURY_WALLET,
    nativePerUsd
  );
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  console.log("PHNPresale       :", presaleAddress);

  const record = {
    network: hre.network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    adminOwner: OWNER_WALLET,
    treasury: TREASURY_WALLET,
    contracts: {
      PHNToken: PHN_TOKEN_PEAQ,
      PHNStaking: stakingAddress,
      PHNPresale: presaleAddress
    },
    presale: {
      nativePerUsd: nativePerUsd.toString(),
      nativePerUsdHuman: NATIVE_PER_USD,
      epoch1: "$0.02",
      epoch2: "$0.05",
      fee: "2% total: 0.25% burn + 1.75% treasury"
    },
    fundingRequired: {
      stakingRewardPool: "Transfer/approve/fund 10,000,000 PHN from owner wallet to PHNStaking",
      presaleInventory: "Transfer enough PHN inventory from owner wallet to PHNPresale before enabling public sales"
    }
  };

  fs.writeFileSync("peaq-runtime-deployment.json", JSON.stringify(record, null, 2));
  console.log("\nDeployment record saved to peaq-runtime-deployment.json");
  console.log("\nNEXT:");
  console.log(`  Update dist/staking.html STAKING_CA = ${stakingAddress}`);
  console.log(`  Update dist/buy.html PRESALE_CA = ${presaleAddress}`);
  console.log(`  Fund staking: owner approves ${stakingAddress}, then fundRewardPool(10000000e18)`);
  console.log(`  Fund presale: owner transfers PHN inventory to ${presaleAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
