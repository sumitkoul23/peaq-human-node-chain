const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const owner = process.env.OWNER_WALLET || deployer.address;
  const ecosystemTreasury = process.env.ECOSYSTEM_TREASURY;
  const liquidityVault = process.env.LIQUIDITY_VAULT;
  const founderVestingStart = Number(process.env.FOUNDER_VESTING_START || Math.floor(Date.now() / 1000));
  const founderVestingDuration = Number(process.env.FOUNDER_VESTING_DURATION || 60 * 60 * 24 * 365 * 3);
  const timelockDelay = Number(process.env.TIMELOCK_DELAY || 60 * 60 * 24 * 2);
  if (!ecosystemTreasury || !liquidityVault) {
    throw new Error("Set ECOSYSTEM_TREASURY and LIQUIDITY_VAULT in .env before deployment");
  }

  console.log(`Deploying with:        ${deployer.address}`);
  console.log(`Founder owner wallet:  ${owner}`);
  console.log(`Ecosystem treasury:    ${ecosystemTreasury}`);
  console.log(`Liquidity vault:       ${liquidityVault}`);

  const Vesting = await hre.ethers.getContractFactory("FounderVestingWallet");
  const founderVestingWallet = await Vesting.deploy(owner, founderVestingStart, founderVestingDuration);
  await founderVestingWallet.waitForDeployment();

  const Timelock = await hre.ethers.getContractFactory("LaunchTimelock");
  const timelock = await Timelock.deploy(timelockDelay, [owner], [owner], owner);
  await timelock.waitForDeployment();

  const Registry = await hre.ethers.getContractFactory("NodeIdentityRegistry");
  const registry = await Registry.deploy(await timelock.getAddress(), owner);
  await registry.waitForDeployment();

  const currentNonce = await hre.ethers.provider.getTransactionCount(deployer.address);
  const predictedRewardVault = hre.ethers.getCreateAddress({ from: deployer.address, nonce: currentNonce + 1 });

  const Token = await hre.ethers.getContractFactory("PeaqHumanNodeToken");
  const token = await Token.deploy(await founderVestingWallet.getAddress(), ecosystemTreasury, predictedRewardVault, liquidityVault);
  await token.waitForDeployment();

  const RewardVault = await hre.ethers.getContractFactory("NodeRewardVault");
  const rewardVault = await RewardVault.deploy(await timelock.getAddress(), await token.getAddress(), await registry.getAddress());
  await rewardVault.waitForDeployment();

  if ((await rewardVault.getAddress()).toLowerCase() !== predictedRewardVault.toLowerCase()) {
    throw new Error("Reward vault address mismatch; abort and inspect deployment nonce flow");
  }

  console.log({
    registry: await registry.getAddress(),
    token: await token.getAddress(),
    rewardVault: await rewardVault.getAddress(),
    founderVestingWallet: await founderVestingWallet.getAddress(),
    timelock: await timelock.getAddress(),
    founderVestingBalance: (await token.balanceOf(await founderVestingWallet.getAddress())).toString(),
    ecosystemBalance: (await token.balanceOf(ecosystemTreasury)).toString(),
    rewardVaultBalance: (await token.balanceOf(await rewardVault.getAddress())).toString(),
    liquidityBalance: (await token.balanceOf(liquidityVault)).toString()
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
