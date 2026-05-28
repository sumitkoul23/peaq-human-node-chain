const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "reports", "agents");

const targets = [
  "https://www.peaq.network/",
  "https://depinscan.io/",
  "https://www.helium.com/",
  "https://iotex.io/",
  "https://rendernetwork.com/",
  "https://www.phantom.com/",
  "https://backpack.app/"
];

async function inspect(url) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "PHN-Intelligence-Agent/1.0 (+https://peaqhumannode.netlify.app)" }
    });
    const html = await response.text();
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [null, ""])[1].replace(/\s+/g, " ").trim();
    const description = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || [null, ""])[1].trim();
    const hasOg = /property=["']og:/i.test(html);
    const hasTwitter = /name=["']twitter:/i.test(html);
    const hasCanonical = /rel=["']canonical["']/i.test(html);
    const csp = response.headers.get("content-security-policy") || "";
    const hsts = response.headers.get("strict-transport-security") || "";
    return {
      url,
      ok: response.ok,
      status: response.status,
      ms: Date.now() - started,
      title,
      description,
      signals: { hasOg, hasTwitter, hasCanonical, hasCsp: !!csp, hasHsts: !!hsts }
    };
  } catch (error) {
    return { url, ok: false, error: error.message, ms: Date.now() - started };
  }
}

function recommendations(results) {
  return [
    "Keep PHN homepage product-first: Buy, Stake, Run Node, Wallet, Download.",
    "Use real PHN logo consistently in all nav bars and PWA metadata.",
    "Keep above-the-fold proof points visible: token address, presale, staking pool, peaq Mainnet.",
    "Use short action labels on mobile buttons; avoid emoji-dependent labels.",
    "Publish weekly achievement and listing updates for search freshness.",
    "Do not copy competitor layouts. Extract patterns only: clarity, proof, trust, mobile speed, security warnings."
  ];
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const results = [];
  for (const target of targets) results.push(await inspect(target));

  const json = { generatedAt, targets, results, recommendations: recommendations(results) };
  fs.writeFileSync(path.join(outDir, "intelligence-agent-report.json"), JSON.stringify(json, null, 2));

  const lines = [
    "# PHN Intelligence Agent Report",
    "",
    `Generated: ${generatedAt}`,
    "",
    "## Passive Design/SEO Scan",
    ...results.map((r) => `- ${r.ok ? "OK" : "WARN"} ${r.url} (${r.status || r.error}) - ${r.title || "No title"}`),
    "",
    "## Recommendations",
    ...json.recommendations.map((r) => `- ${r}`)
  ];
  fs.writeFileSync(path.join(outDir, "intelligence-agent-report.md"), `${lines.join("\n")}\n`);
  console.log("Intelligence Agent complete. Report: reports/agents/intelligence-agent-report.md");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
