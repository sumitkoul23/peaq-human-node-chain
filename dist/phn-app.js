(function () {
  "use strict";

  const PHN = {
    token: "0x83e2A4aB24A61d138f12569c497C3E5f2BF8694B",
    presale: "0x334D6748a105Aa857890375a811bf51a0182a757",
    staking: "0x2926c13A0f82b0462f686bbd6c67Fe78a444589A",
    owner: "0x7fb31d8b2b5cbed4d6e02768664a299d303ea4c2",
    chainIdHex: "0xd0a",
    chainId: 3338,
    chainName: "peaq Mainnet",
    rpcUrls: ["https://quicknode1.peaq.xyz"],
    explorer: "https://peaq.subscan.io/",
    symbol: "PEAQ"
  };

  const PHN_LOGO = "assets/phn-logo-minimal.svg";
  const BRAND_STACK = '<span class="phn-brand-stack" aria-label="Peaq Human Node"><span>Peaq</span><span>Human</span><span>Node</span></span>';

  let installPrompt = null;

  function short(addr) {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function setStatus(target, text, tone) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
    el.classList.remove("ok", "warn", "error");
    if (tone) el.classList.add(tone);
  }

  function detectProvider(kind) {
    const eth = window.ethereum;
    if (!eth) return null;
    const providers = eth.providers || [eth];
    if (kind === "binance") {
      return providers.find((p) => p.isBinance || p.isBinanceWallet) || eth;
    }
    if (kind === "metamask") {
      return providers.find((p) => p.isMetaMask) || eth;
    }
    return eth;
  }

  async function requestPeaq(provider) {
    const current = await provider.request({ method: "eth_chainId" }).catch(() => null);
    if (current && current.toLowerCase() === PHN.chainIdHex) return;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: PHN.chainIdHex }]
      });
    } catch (err) {
      if (err && err.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: PHN.chainIdHex,
            chainName: PHN.chainName,
            nativeCurrency: { name: "PEAQ", symbol: "PEAQ", decimals: 18 },
            rpcUrls: PHN.rpcUrls,
            blockExplorerUrls: [PHN.explorer]
          }]
        });
      } else {
        throw err;
      }
    }
  }

  async function connectPhnWallet(kind, statusSelector) {
    const status = statusSelector || "[data-wallet-status]";
    const provider = detectProvider(kind || "any");
    if (!provider) {
      setStatus(status, "No injected wallet found. Install MetaMask, Binance Wallet, or use the PWA as a companion app.", "warn");
      return null;
    }
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      await requestPeaq(provider);
      const account = accounts[0];
      document.querySelectorAll("[data-wallet-address]").forEach((el) => {
        el.textContent = short(account);
        el.title = account;
      });
      document.querySelectorAll("[data-wallet-full]").forEach((el) => { el.textContent = account; });
      setStatus(status, `Connected ${short(account)} on peaq Mainnet.`, "ok");
      return { provider, account };
    } catch (err) {
      setStatus(status, err && err.message ? err.message : "Wallet connection was rejected.", "error");
      return null;
    }
  }

  async function addPeaqNetwork(statusSelector) {
    const provider = detectProvider("any");
    if (!provider) {
      setStatus(statusSelector || "[data-wallet-status]", "No wallet provider detected.", "warn");
      return;
    }
    try {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: PHN.chainIdHex,
          chainName: PHN.chainName,
          nativeCurrency: { name: "PEAQ", symbol: "PEAQ", decimals: 18 },
          rpcUrls: PHN.rpcUrls,
          blockExplorerUrls: [PHN.explorer]
        }]
      });
      setStatus(statusSelector || "[data-wallet-status]", "peaq Mainnet added to wallet.", "ok");
    } catch (err) {
      setStatus(statusSelector || "[data-wallet-status]", err.message || "Could not add peaq Mainnet.", "error");
    }
  }

  async function addPhnToken(statusSelector) {
    const provider = detectProvider("any");
    if (!provider) {
      setStatus(statusSelector || "[data-wallet-status]", "No wallet provider detected.", "warn");
      return;
    }
    try {
      await requestPeaq(provider);
      await provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: PHN.token,
            symbol: "PHN",
            decimals: 18,
            image: `${location.origin}/assets/phn-logo-minimal-192.png`
          }
        }
      });
      setStatus(statusSelector || "[data-wallet-status]", "PHN token request sent to wallet.", "ok");
    } catch (err) {
      setStatus(statusSelector || "[data-wallet-status]", err.message || "Could not add PHN token.", "error");
    }
  }

  async function copyText(text, statusSelector) {
    try {
      await navigator.clipboard.writeText(text);
      if (statusSelector) setStatus(statusSelector, "Copied to clipboard.", "ok");
    } catch (_) {
      if (statusSelector) setStatus(statusSelector, "Copy failed. Select the text manually.", "warn");
    }
  }

  function toggleMenu() {
    const drawer = document.querySelector(".phn-mobile-drawer");
    if (drawer) drawer.classList.toggle("open");
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }

  async function installPhnApp(statusSelector) {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice.catch(() => null);
      installPrompt = null;
      if (choice && choice.outcome === "accepted") {
        setStatus(statusSelector || "[data-install-status]", "Install accepted. PHN Beacon is being added to this device.", "ok");
      } else {
        setStatus(statusSelector || "[data-install-status]", "Install was dismissed. You can install later from the browser menu.", "warn");
      }
      return;
    }
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const message = isIos
      ? "On iPhone or iPad, tap Share, then Add to Home Screen."
      : "Use your browser install button or menu item: Install app / Add to home screen.";
    setStatus(statusSelector || "[data-install-status]", message, "warn");
  }

  function generateNodeCommands() {
    const wallet = (document.querySelector("#nodeWallet") || {}).value || "0xYourWallet";
    const did = (document.querySelector("#nodeDid") || {}).value || "did:peaq:your-machine";
    const platform = (document.querySelector("#nodePlatform") || {}).value || "windows";
    const setup = platform === "linux"
      ? "sudo apt update\nsudo apt install -y git nodejs npm\nnpm install"
      : "npm install";
    const commands = `${setup}
npm run phn-node -- init
npm run phn-node -- set-operator ${wallet}
npm run phn-node -- set-did ${did}
npm run phn-node -- doctor
npm run phn-node -- registration-payload`;
    const out = document.querySelector("#nodeCommands");
    if (out) out.textContent = commands;
    setStatus("#nodeStatus", "Node command pack generated. Copy it into the PHN project terminal.", "ok");
  }

  function emailSignupDemo(event) {
    if (event) event.preventDefault();
    setStatus("#authStatus", "Email/password needs a hosted auth backend before launch. Wallet sign-in is ready now; email auth is staged for Supabase or Firebase free tier.", "warn");
  }

  function installQuickHub() {
    if (document.querySelector(".phn-topbar") || document.querySelector(".phn-quick-hub")) return;
    const style = document.createElement("style");
    style.textContent = `
      .phn-quick-hub{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;padding:10px;border:1px solid rgba(0,229,255,.2);border-radius:8px;background:rgba(3,5,8,.88);backdrop-filter:blur(18px);box-shadow:0 18px 60px rgba(0,0,0,.35)}
      .phn-quick-hub a,.phn-quick-hub button{border:1px solid rgba(0,229,255,.18);background:rgba(0,229,255,.08);color:#e8f0fe;border-radius:6px;padding:8px 10px;font:700 11px Inter,Segoe UI,sans-serif;text-transform:uppercase;letter-spacing:.06em;text-decoration:none;cursor:pointer}
      .phn-quick-hub a.primary{background:#00e5ff;color:#030508;border-color:#00e5ff}
      @media(max-width:720px){.phn-quick-hub{left:8px;right:8px;bottom:8px;max-height:38vh;overflow:auto}.phn-quick-hub a,.phn-quick-hub button{font-size:10px;padding:7px 8px}}
    `;
    document.head.appendChild(style);
    const hub = document.createElement("div");
    hub.className = "phn-quick-hub";
    hub.innerHTML = `
      <a href="index.html">Home</a>
      <a class="primary" href="buy.html">Buy</a>
      <a href="staking.html">Stake</a>
      <a href="activate-node.html">Run Node</a>
      <a href="wallet.html">Wallet</a>
      <a href="download.html">Download</a>
      <a href="vesting.html">Vesting</a>
      <a href="roadmap.html">Roadmap</a>
      <a href="achievements.html">Achievements</a>
      <a href="support.html">Support</a>
      <button type="button" onclick="connectPhnWallet()">Connect</button>
    `;
    document.body.appendChild(hub);
  }

  function normalizeLegacyShell() {
    document.querySelectorAll(".phn-brand, .nav-logo").forEach((brand) => {
      brand.innerHTML = `<img class="phn-legacy-logo-img" src="${PHN_LOGO}" alt="PHN">${BRAND_STACK}`;
      brand.setAttribute("aria-label", "Peaq Human Node");
    });

    if (document.querySelector("#phn-legacy-consistency")) return;
    const style = document.createElement("style");
    style.id = "phn-legacy-consistency";
    style.textContent = `
      .nav-logo,.phn-brand{min-width:0!important;gap:10px!important;letter-spacing:0!important;align-items:center!important}
      .nav-logo .logo-dot{display:none!important}
      .phn-legacy-logo-img,.phn-brand img{width:44px!important;height:44px!important;border-radius:10px!important;object-fit:cover;box-shadow:0 0 18px rgba(0,229,255,.18);flex:0 0 auto}
      .phn-brand-stack{height:44px!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:0!important;line-height:.88!important;font-family:var(--font-display,Inter,sans-serif)!important;font-weight:800!important;font-size:13px!important;letter-spacing:0!important;text-transform:none!important}
      .phn-brand-stack span{display:block!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;letter-spacing:0!important}
      .btn-primary,.btn-secondary,.nav-cta,.btn-connect,.btn-buy,.btn-stake,.connect-btn,.btn-send,.contact-btn,.btn-submit,.copy-btn,.max-btn,.slip-btn,.cur-tab,button,a.exchange-card{min-width:0}
      .btn-primary,.btn-secondary,.nav-cta,.btn-connect,.btn-buy,.btn-stake,.connect-btn,.btn-send,.contact-btn,.btn-submit{border-radius:8px!important;letter-spacing:0!important;text-align:center;line-height:1.2;white-space:normal}
      .exchange-card,.feature-card,.step,.trust-item,.contact-card,.doc-card,.quick-card,.balance-card,.wallet-card,.tier-card{border-radius:8px!important}
      @media(max-width:900px){
        body{overflow-x:hidden!important}
        nav{padding:12px 14px!important;gap:10px!important;min-height:66px}
        .nav-logo{font-size:12px!important;max-width:52vw}
        .phn-legacy-logo-img,.phn-brand img{width:38px!important;height:38px!important;border-radius:9px!important}
        .phn-brand-stack{height:38px!important;font-size:11px!important;line-height:.9!important}
        .nav-cta{padding:9px 11px!important;font-size:11px!important;max-width:38vw}
        .hero,.page,.wallet-page,.staking-page,.exchange-page,.support-page{padding-left:16px!important;padding-right:16px!important}
        h1{font-size:clamp(36px,11vw,48px)!important;line-height:1.02!important;letter-spacing:0!important;overflow-wrap:anywhere}
        h2{font-size:clamp(26px,8vw,38px)!important;line-height:1.08!important;letter-spacing:0!important}
        h3{line-height:1.16!important}
        p,li,.hero-desc,.section-desc,.page-desc{font-size:15px!important;line-height:1.65!important;overflow-wrap:anywhere}
        .hero-actions,.cta-actions,.form-actions{display:grid!important;grid-template-columns:1fr!important;gap:10px!important;align-items:stretch!important}
        .hero-actions a,.hero-actions button,.cta-actions a,.cta-actions button,.btn-primary,.btn-secondary,.btn-connect,.btn-buy,.btn-stake,.connect-btn,.btn-send,.btn-submit{width:100%!important;justify-content:center!important;padding:13px 14px!important}
        .hero-stats,.stats-bar,.wallet-grid,.balance-grid,.trust-grid,.quick-grid,.contact-grid,.docs-grid,.exchange-cards,.features-grid,.steps{grid-template-columns:1fr!important;display:grid!important;gap:14px!important}
        .stat-item,.stat-card,.exchange-card,.feature-card,.step,.trust-item,.quick-card,.contact-card,.doc-card,.wallet-card,.balance-card,.tier-card{width:100%!important}
        .section-inner,.listing-inner,.footer-inner,.footer-bottom{padding-left:16px!important;padding-right:16px!important;width:100%!important}
        .phn-quick-hub{left:8px;right:8px;bottom:8px;justify-content:flex-start;max-height:34vh;overflow:auto}
      }
      @media(max-width:430px){
        .nav-logo{max-width:46vw}
        .nav-cta{max-width:42vw}
        .ticker-item{padding:0 18px!important;font-size:10px!important}
        .phn-quick-hub a,.phn-quick-hub button{font-size:10px;padding:7px 8px}
      }
      @media(max-width:900px){
        .ticker{overflow:hidden!important;max-width:100vw!important;contain:paint!important}
        .ticker-track{animation:none!important;transform:none!important;width:100%!important;max-width:100%!important;overflow:hidden!important}
        .ticker-item{display:none!important}
        .ticker-item:nth-child(1),.ticker-item:nth-child(2),.ticker-item:nth-child(3){display:inline-flex!important}
        .main-wrap{display:block!important;width:100%!important;max-width:100vw!important;padding-left:16px!important;padding-right:16px!important;overflow:hidden!important}
        .left-col,.buy-widget,.info-card,.burn-meter,.raise-stats{width:100%!important;max-width:100%!important;min-width:0!important}
        .raise-stats,.fee-info-grid{grid-template-columns:1fr!important}
        .epoch-row,.burn-header,.widget-head,.pool-header{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;text-align:left!important}
        .live-price{align-items:flex-start!important}
        .pool-stats{display:grid!important;grid-template-columns:1fr!important;gap:12px!important}
        .pool-stat,.pool-stat .v,.pool-stat .l{width:100%!important;text-align:left!important}
        .form-card{width:100%!important;max-width:calc(100vw - 36px)!important;min-width:0!important;overflow:hidden!important}
        .reveal[style*="grid-template-columns"]{grid-template-columns:1fr!important;padding:20px!important;gap:18px!important;overflow:hidden!important}
        .reveal[style*="grid-template-columns"] > div{min-width:0!important;width:100%!important}
        .reveal[style*="grid-template-columns"] [style*="display:flex"]{display:grid!important;grid-template-columns:1fr!important;gap:10px!important}
        .reveal[style*="grid-template-columns"] [style*="margin-left:auto"]{margin-left:0!important;width:max-content!important}
        .contract-row{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;align-items:start!important}
        .contract-val{display:grid!important;grid-template-columns:1fr!important;width:100%!important;max-width:100%!important;overflow-wrap:anywhere!important}
        .contract-val .copy-btn{width:max-content!important}
        .hero-orb,.hero-orb-2{display:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function applyLightMinimalTheme() {
    if (document.querySelector("#phn-light-minimal-theme")) return;
    const style = document.createElement("style");
    style.id = "phn-light-minimal-theme";
    style.textContent = `
      :root{
        --black:#f7fbff!important;
        --deep:#eef5fb!important;
        --card:#ffffff!important;
        --border:#d9e7f2!important;
        --text:#0b1f33!important;
        --muted:#60758a!important;
        --cyan:#008fb3!important;
        --cyan-dim:#006f8d!important;
        --green:#00a978!important;
        --amber:#c88700!important;
        --pink:#d94f96!important;
        --purple:#6b5bd6!important;
        --red:#d63d54!important;
      }
      html,body{background:#f7fbff!important;color:#0b1f33!important}
      body::before,.grid-bg,.hero-orb,.hero-orb-2{opacity:0!important;display:none!important}
      nav,.phn-topbar{
        background:rgba(247,251,255,.86)!important;
        border-bottom:1px solid #d9e7f2!important;
        box-shadow:0 10px 34px rgba(20,45,70,.06)!important;
        backdrop-filter:blur(18px)!important;
      }
      .nav-logo,.phn-brand{color:#0b1f33!important;letter-spacing:0!important}
      .nav-logo span,.phn-brand span{color:#0b1f33!important}
      .phn-legacy-logo-img,.phn-brand img,.nav-logo img{
        background:#fff!important;
        border:1px solid #d9e7f2!important;
        box-shadow:0 8px 22px rgba(0,143,179,.10)!important;
      }
      .nav-links a,.phn-links a,.footer-links a,.phn-footer a{color:#60758a!important}
      .nav-links a:hover,.phn-links a:hover,.footer-links a:hover,.phn-footer a:hover{color:#008fb3!important}
      .nav-cta,.btn-primary,.phn-btn.primary,.btn-connect,.btn-buy,.btn-stake,.connect-btn,.btn-send,.btn-submit{
        background:#0b1f33!important;
        color:#fff!important;
        border:1px solid #0b1f33!important;
        border-radius:8px!important;
        box-shadow:0 12px 28px rgba(11,31,51,.14)!important;
      }
      .btn-secondary,.phn-btn,.phn-btn.ghost,.copy-btn,.max-btn,.slip-btn,.cur-tab,.contact-btn-secondary{
        background:#fff!important;
        color:#0b1f33!important;
        border:1px solid #d9e7f2!important;
        border-radius:8px!important;
        box-shadow:none!important;
      }
      .btn-primary:hover,.btn-secondary:hover,.phn-btn:hover,.nav-cta:hover{
        transform:translateY(-1px)!important;
        box-shadow:0 16px 34px rgba(0,143,179,.12)!important;
      }
      .hero,.phn-hero,.page,.staking-page,.wallet-page,.exchange-page,.support-page{
        background:#f7fbff!important;
      }
      .hero-badge,.phn-kicker,.presale-badge,.phn-tag,.exchange-tag,.badge{
        background:#eef9fc!important;
        color:#008fb3!important;
        border-color:#c7edf5!important;
        border-radius:999px!important;
      }
      .h1-accent,.section-label,.phn-label,.price-val,.live-price,.up{color:#008fb3!important}
      .h1-line2,.hero-desc,.section-desc,.page-desc,.phn-lead,p,li{color:#60758a}
      h1,h2,h3,.phn-title,.stat-value,.phn-stat,.raise-val,.val,.v,.contract-val{color:#0b1f33!important;letter-spacing:0!important}
      .ticker,.listing,.tokenomics,.exchange,.how,.features,.cta-section,footer,.phn-footer{
        background:#f7fbff!important;
        border-color:#d9e7f2!important;
      }
      .step,.feat-card,.contract-box,.exchange-card,.phn-card,.phn-panel,.buy-widget,.info-card,.burn-meter,.form-card,.pool-card,.tier-card,.stat-card,.wallet-card,.balance-card,.quick-card,.contact-card,.doc-card,.trust-item,.raise-block,.fee-box,.input-wrap,.send-card{
        background:#fff!important;
        border:1px solid #d9e7f2!important;
        border-radius:10px!important;
        box-shadow:0 16px 42px rgba(20,45,70,.07)!important;
      }
      input,select,textarea,.phn-input,.phn-select{
        background:#fff!important;
        color:#0b1f33!important;
        border:1px solid #cbddeb!important;
        border-radius:8px!important;
      }
      code,.phn-code,.phn-code-block{
        color:#006f8d!important;
        background:#f1f7fb!important;
        border-color:#d9e7f2!important;
      }
      .progress-bar,.pool-bar,.burn-bar{background:linear-gradient(90deg,#008fb3,#00a978)!important}
      .phn-quick-hub{
        background:rgba(255,255,255,.92)!important;
        border-color:#d9e7f2!important;
        box-shadow:0 18px 50px rgba(20,45,70,.14)!important;
      }
      .phn-quick-hub a,.phn-quick-hub button{
        background:#fff!important;
        color:#0b1f33!important;
        border-color:#d9e7f2!important;
      }
      .phn-quick-hub a.primary{background:#0b1f33!important;color:#fff!important;border-color:#0b1f33!important}
    `;
    document.head.appendChild(style);
  }

  window.PHN_CONFIG = PHN;
  window.connectPhnWallet = connectPhnWallet;
  window.addPeaqNetwork = addPeaqNetwork;
  window.addPhnToken = addPhnToken;
  window.copyPhnText = copyText;
  window.installPhnApp = installPhnApp;
  window.generateNodeCommands = generateNodeCommands;
  window.emailSignupDemo = emailSignupDemo;
  window.togglePhnMenu = toggleMenu;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    document.querySelectorAll("[data-install-ready]").forEach((el) => { el.textContent = "Ready to install"; });
  });

  document.addEventListener("DOMContentLoaded", () => {
    registerServiceWorker();
    normalizeLegacyShell();
    applyLightMinimalTheme();
    installQuickHub();
    document.querySelectorAll("[data-copy]").forEach((el) => {
      el.addEventListener("click", () => copyText(el.getAttribute("data-copy"), el.getAttribute("data-status")));
    });
    if (document.querySelector("#nodeCommands")) generateNodeCommands();
  });
})();
