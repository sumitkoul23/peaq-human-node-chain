const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "reports", "agents");

const platforms = [
  { name: "Subscan peaq token info", status: "ready-now", url: "https://github.com/subscan-explorer/chain-asset/issues/new?template=submit-token.yml", ownerAction: "Submit prepared token metadata and PHN logo." },
  { name: "DePINscan", status: "ready-now", url: "https://depinscan.io/", ownerAction: "Create developer project, add PHN socials and contract." },
  { name: "CoinSniper", status: "ready-now", url: "https://coinsniper.net/submit", ownerAction: "Submit presale/listing form manually after account login." },
  { name: "DappBay", status: "ready-now", url: "https://dappbay.bnbchain.org/submit", ownerAction: "Submit dapp profile for BNB ecosystem visibility." },
  { name: "GeckoTerminal", status: "after-liquidity", url: "https://www.geckoterminal.com/", ownerAction: "Update token info after PHN pair exists." },
  { name: "DexScreener", status: "after-liquidity", url: "https://dexscreener.com/", ownerAction: "Update profile after pair auto-indexes." },
  { name: "CoinGecko", status: "after-liquidity", url: "https://www.coingecko.com/en/coins/new", ownerAction: "Apply after exchange pair and social proof exist." },
  { name: "CoinMarketCap", status: "after-liquidity", url: "https://coinmarketcap.com/request/", ownerAction: "Apply after liquidity, volume and social account proof." }
];

function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const lines = [
    "# PHN Marketing and Listing Agent",
    "",
    `Generated: ${generatedAt}`,
    "",
    "## Immediate Launch Actions",
    "- Publish/verify the production PHN domain.",
    "- Submit Subscan token metadata.",
    "- Create official social accounts manually and link them from the website.",
    "- Post launch thread and pinned Telegram announcement.",
    "- Submit DePINscan, CoinSniper and DappBay.",
    "",
    "## Platform Queue"
  ];
  for (const p of platforms) {
    lines.push(`- ${p.status.toUpperCase()}: ${p.name}`);
    lines.push(`  - URL: ${p.url}`);
    lines.push(`  - Action: ${p.ownerAction}`);
  }
  lines.push("", "## Daily Organic Content Loop");
  lines.push("- 1 technical post: node, peaq, staking, burn, vesting or wallet education.");
  lines.push("- 1 proof post: contracts, funding, screenshot, listing progress or roadmap delivery.");
  lines.push("- 1 community post: poll, AMA question, scam warning or operator onboarding.");
  lines.push("- Update reports/agents after each submission.");

  fs.writeFileSync(path.join(outDir, "marketing-listing-agent.md"), `${lines.join("\n")}\n`);
  fs.writeFileSync(path.join(outDir, "marketing-listing-agent.json"), JSON.stringify({ generatedAt, platforms }, null, 2));
  console.log("Marketing Listing Agent complete. Report: reports/agents/marketing-listing-agent.md");
}

main();
