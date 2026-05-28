const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const outDir = path.join(root, "reports", "agents");
const viewports = [
  { name: "mobile-small", width: 360, height: 740 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 }
];

const requiredPages = [
  "index.html",
  "buy.html",
  "staking.html",
  "exchange.html",
  "wallet.html",
  "activate-node.html",
  "download.html",
  "vesting.html",
  "roadmap.html",
  "achievements.html",
  "support.html",
  "verify.html"
];

const informationalPages = new Set([
  "dashboard/index.html",
  "dex.html",
  "offline.html"
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function localTarget(file, ref) {
  let clean = ref.split("#")[0].split("?")[0];
  if (!clean || clean.startsWith("http") || clean.startsWith("mailto:") || clean.startsWith("data:") || clean.startsWith("javascript:")) return null;
  if (clean.startsWith("/")) clean = clean.slice(1);
  return path.resolve(path.dirname(file), clean);
}

function auditHtml(file) {
  const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const rel = path.relative(dist, file).replaceAll("\\", "/");
  const findings = [];
  const isInfo = informationalPages.has(rel);

  if (!/<meta\s+name=["']viewport["']/i.test(text)) findings.push("Missing viewport meta.");
  if (!isInfo && !/manifest\.webmanifest/i.test(text)) findings.push("Missing PWA manifest link.");
  if (!isInfo && !/phn-app\.js/i.test(text)) findings.push("Missing shared PHN app runtime.");
  if (!isInfo && !/(phn-brand|nav-logo)[\s\S]{0,180}<img/i.test(text) && !/nav-logo/i.test(text)) findings.push("No visible PHN logo or nav brand found.");
  if (/[^\x09\x0A\x0D\x20-\x7E]/.test(text)) findings.push("Non-ASCII or mojibake text found.");

  for (const match of text.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const target = localTarget(file, match[1]);
    if (target && target.startsWith(dist) && !fs.existsSync(target)) {
      findings.push(`Broken local reference: ${match[1]}`);
    }
  }

  return { page: rel, findings };
}

function auditCssRuntime() {
  const app = path.join(dist, "phn-app.js");
  const css = path.join(dist, "phn.css");
  const findings = [];
  const appText = fs.existsSync(app) ? fs.readFileSync(app, "utf8") : "";
  const cssText = fs.existsSync(css) ? fs.readFileSync(css, "utf8") : "";

  for (const vp of viewports) {
    if (vp.width <= 430 && !appText.includes("@media(max-width:430px)") && !cssText.includes("max-width: 640px")) {
      findings.push(`No mobile override for ${vp.name}.`);
    }
  }
  if (!appText.includes("normalizeLegacyShell")) findings.push("Legacy shell normalizer is missing.");
  if (!appText.includes("phn-legacy-logo-img")) findings.push("Legacy logo injection is missing.");
  if (!appText.includes("overflow:hidden!important")) findings.push("No overflow guard found in shared runtime.");

  return findings;
}

function writeReport(results, cssFindings) {
  fs.mkdirSync(outDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const json = { generatedAt, viewports, results, cssFindings };
  fs.writeFileSync(path.join(outDir, "ui-guardian-report.json"), JSON.stringify(json, null, 2));

  const lines = [
    "# PHN UI Guardian Report",
    "",
    `Generated: ${generatedAt}`,
    "",
    "## Viewports Covered",
    ...viewports.map((v) => `- ${v.name}: ${v.width}x${v.height}`),
    "",
    "## Findings"
  ];

  for (const result of results) {
    if (!result.findings.length) {
      lines.push(`- OK: ${result.page}`);
    } else {
      lines.push(`- REVIEW: ${result.page}`);
      for (const finding of result.findings) lines.push(`  - ${finding}`);
    }
  }

  if (cssFindings.length) {
    lines.push("", "## Shared Runtime Findings", ...cssFindings.map((f) => `- ${f}`));
  }

  fs.writeFileSync(path.join(outDir, "ui-guardian-report.md"), `${lines.join("\n")}\n`);
}

function main() {
  if (!fs.existsSync(dist)) throw new Error("dist folder not found.");
  const files = walk(dist).filter((f) => f.endsWith(".html"));
  const results = files.map(auditHtml);
  for (const page of requiredPages) {
    if (!fs.existsSync(path.join(dist, page))) {
      results.push({ page, findings: ["Required page is missing."] });
    }
  }
  const cssFindings = auditCssRuntime();
  writeReport(results, cssFindings);

  const issueCount = results.reduce((n, r) => n + r.findings.length, 0) + cssFindings.length;
  console.log(`UI Guardian complete: ${issueCount} issue(s). Report: reports/agents/ui-guardian-report.md`);
  if (issueCount) process.exitCode = 1;
}

main();
