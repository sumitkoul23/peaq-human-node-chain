const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PeaqHumanNode ecosystem", function () {
  async function fixture() {
    const [owner, ecosystem, rewardBucket, liquidity, operator, other] = await ethers.getSigners();
    const latestBlock = await ethers.provider.getBlock("latest");
    const Vesting = await ethers.getContractFactory("FounderVestingWallet");
    const founderVestingWallet = await Vesting.deploy(owner.address, latestBlock.timestamp, 60 * 60 * 24 * 365 * 3);
    const Registry = await ethers.getContractFactory("NodeIdentityRegistry");
    const registry = await Registry.deploy(owner.address, owner.address);
    const Token = await ethers.getContractFactory("PeaqHumanNodeToken");
    const token = await Token.deploy(await founderVestingWallet.getAddress(), ecosystem.address, rewardBucket.address, liquidity.address);
    const Vault = await ethers.getContractFactory("NodeRewardVault");
    const vault = await Vault.deploy(owner.address, await token.getAddress(), await registry.getAddress());
    const Earnings = await ethers.getContractFactory("NodeEarningsManager");
    const earnings = await Earnings.deploy(
      owner.address,
      await registry.getAddress(),
      await vault.getAddress(),
      ethers.parseEther("1"),
      60
    );
    await vault.grantRole(await vault.REWARD_DISTRIBUTOR_ROLE(), await earnings.getAddress());
    return { owner, ecosystem, rewardBucket, liquidity, operator, other, registry, token, vault, earnings, founderVestingWallet };
  }

  it("mints fixed 100M supply with exactly 50M to founder vesting", async function () {
    const { ecosystem, rewardBucket, liquidity, token, founderVestingWallet } = await fixture();
    expect(await token.totalSupply()).to.equal(ethers.parseEther("100000000"));
    expect(await token.balanceOf(await founderVestingWallet.getAddress())).to.equal(ethers.parseEther("50000000"));
    expect(await token.balanceOf(ecosystem.address)).to.equal(ethers.parseEther("20000000"));
    expect(await token.balanceOf(rewardBucket.address)).to.equal(ethers.parseEther("20000000"));
    expect(await token.balanceOf(liquidity.address)).to.equal(ethers.parseEther("10000000"));
  });

  it("registers identity-gated nodes and pays rewards only to eligible operators", async function () {
    const { rewardBucket, operator, other, registry, token, vault } = await fixture();
    const nodeId = ethers.id("node-001");
    await registry.registerNode(nodeId, ethers.id("pc-001"), ethers.id("human-001"), "did:peaq:machine-001", operator.address);
    await token.connect(rewardBucket).transfer(await vault.getAddress(), ethers.parseEther("1000"));
    await vault.payReward(operator.address, ethers.parseEther("25"));
    expect(await token.balanceOf(operator.address)).to.equal(ethers.parseEther("25"));
    await expect(vault.payReward(other.address, 1)).to.be.revertedWith("operator ineligible");
  });

  it("lets the attester disable a node", async function () {
    const { operator, registry } = await fixture();
    const nodeId = ethers.id("node-002");
    await registry.registerNode(nodeId, ethers.id("pc-002"), ethers.id("human-002"), "did:peaq:machine-002", operator.address);
    expect(await registry.isEligibleOperator(operator.address)).to.equal(true);
    await registry.setNodeActive(nodeId, false);
    expect(await registry.isEligibleOperator(operator.address)).to.equal(false);
  });

  it("lets verified nodes heartbeat and claim recurring rewards", async function () {
    const { rewardBucket, operator, registry, token, vault, earnings } = await fixture();
    const nodeId = ethers.id("node-003");
    await registry.registerNode(nodeId, ethers.id("pc-003"), ethers.id("human-003"), "did:peaq:machine-003", operator.address);
    await token.connect(rewardBucket).transfer(await vault.getAddress(), ethers.parseEther("1000"));

    await earnings.connect(operator).heartbeat();
    expect(await earnings.accruedRewards(operator.address)).to.equal(ethers.parseEther("1"));
    await expect(earnings.connect(operator).heartbeat()).to.be.revertedWith("heartbeat too soon");

    await ethers.provider.send("evm_increaseTime", [61]);
    await ethers.provider.send("evm_mine", []);
    await earnings.connect(operator).heartbeat();
    expect(await earnings.accruedRewards(operator.address)).to.equal(ethers.parseEther("2"));

    await earnings.connect(operator).claim();
    expect(await token.balanceOf(operator.address)).to.equal(ethers.parseEther("2"));
  });
});
