const hre = require("hardhat");

async function main() {
  const [registryAddress, nodeId, pcIdentityHash, peaqHumanIdHash, peaqMachineDid, operator] = process.argv.slice(2);
  if (![registryAddress, nodeId, pcIdentityHash, peaqHumanIdHash, peaqMachineDid, operator].every(Boolean)) {
    throw new Error("Usage: npx hardhat run scripts/registerNode.js --network <network> -- <registry> <nodeId> <pcHash> <humanHash> <machineDid> <operator>");
  }
  const registry = await hre.ethers.getContractAt("NodeIdentityRegistry", registryAddress);
  const tx = await registry.registerNode(nodeId, pcIdentityHash, peaqHumanIdHash, peaqMachineDid, operator);
  await tx.wait();
  console.log(`Registered node ${nodeId} for ${operator}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
