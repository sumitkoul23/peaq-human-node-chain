const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const src = path.join(root, "dist");
const out = path.join(root, "web3-dist");

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(source, target);
    else fs.copyFileSync(source, target);
  }
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

if (!fs.existsSync(src)) throw new Error("dist folder not found. Build the site first.");
fs.rmSync(out, { recursive: true, force: true });
copyDir(src, out);

for (const file of walk(out)) {
  if (!file.endsWith(".html") && !file.endsWith(".xml") && !file.endsWith(".txt") && !file.endsWith(".json")) continue;
  let text = fs.readFileSync(file, "utf8");

  // Keep the site usable from any IPFS gateway path. Absolute canonical/social URLs are
  // fine for SEO on a custom domain, but the Web3 package should not depend on Netlify.
  text = text.replaceAll("https://peaqhumannode.netlify.app/", "./");
  text = text.replaceAll("https://peaqhumannode.netlify.app", ".");
  text = text.replaceAll("<base href=\"/\">", "");

  fs.writeFileSync(file, text);
}

fs.writeFileSync(path.join(out, ".nojekyll"), "");
fs.writeFileSync(path.join(out, "dweb.json"), JSON.stringify({
  name: "Peaq Human Node",
  short_name: "PHN",
  company: "Skymetric Consulting LLP",
  description: "Identity-gated DePIN token, presale, staking, exchange and liquidity console on peaq.",
  chain: "peaq Mainnet",
  chainId: 3338,
  contracts: {
    PHNToken: "0x83e2A4aB24A61d138f12569c497C3E5f2BF8694B",
    PHNPresale: "0x334D6748a105Aa857890375a811bf51a0182a757",
    PHNStaking: "0x2926c13A0f82b0462f686bbd6c67Fe78a444589A"
  }
}, null, 2));

console.log(`Web3 site prepared at ${out}`);
