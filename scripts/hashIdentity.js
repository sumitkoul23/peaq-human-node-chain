const { ethers } = require("ethers");

function main() {
  const [, , pcIdentity, humanIdentity] = process.argv;
  if (!pcIdentity || !humanIdentity) {
    console.error("Usage: node scripts/hashIdentity.js <pc-identity> <human-identity>");
    process.exit(1);
  }
  console.log(JSON.stringify({
    pcIdentityHash: ethers.id(pcIdentity),
    peaqHumanIdHash: ethers.id(humanIdentity)
  }, null, 2));
}

main();
