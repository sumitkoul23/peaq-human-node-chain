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

  function installSideBreadcrumbPanel() {
    if (document.body.classList.contains("buy-page") || document.querySelector(".phn-side-nav-panel")) return;
    const items = [
      ["index.html", "Home"],
      ["buy.html", "Buy"],
      ["staking.html", "Stake"],
      ["burn.html", "Burn"],
      ["activate-node.html", "Run Node"],
      ["wallet.html", "Wallet"],
      ["vesting.html", "Vesting"],
      ["whitepaper.html", "Whitepaper"],
      ["roadmap.html", "Roadmap"],
      ["support.html", "Support"]
    ];
    const currentFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const current = items.find(([href]) => href.toLowerCase() === currentFile) || ["index.html", document.title.split("|")[0].trim() || "PHN"];
    const style = document.createElement("style");
    style.textContent = `
      .phn-side-nav-panel{
        position:sticky;
        top:74px;
        z-index:55;
        width:min(1180px,calc(100% - 32px));
        margin:10px auto 0;
        display:grid;
        grid-template-columns:auto minmax(0,1fr) auto;
        align-items:center;
        gap:12px;
        padding:10px;
        border:1px solid #d9e7f2;
        border-radius:10px;
        background:rgba(255,255,255,.94);
        backdrop-filter:blur(18px);
        box-shadow:0 18px 50px rgba(20,45,70,.10);
      }
      .phn-breadcrumb{
        display:inline-flex;
        align-items:center;
        gap:7px;
        min-width:max-content;
        color:#60758a;
        font:700 11px Inter,Segoe UI,sans-serif;
      }
      .phn-breadcrumb a{color:#008fb3;text-decoration:none}
      .phn-breadcrumb strong{color:#0b1f33;font-weight:850}
      .phn-side-nav-panel nav{
        display:flex;
        align-items:center;
        gap:6px;
        min-width:0;
        overflow:auto;
        scrollbar-width:none;
      }
      .phn-side-nav-panel nav::-webkit-scrollbar{display:none}
      .phn-side-nav-panel a,.phn-side-nav-panel button{
        border:1px solid #d9e7f2;
        background:#fff;
        color:#0b1f33;
        border-radius:8px;
        padding:8px 10px;
        font:800 11px Inter,Segoe UI,sans-serif;
        letter-spacing:0;
        text-decoration:none;
        cursor:pointer;
        white-space:nowrap;
      }
      .phn-side-nav-panel a.active{background:#0b1f33;color:#fff;border-color:#0b1f33}
      .phn-side-nav-panel button{color:#008fb3}
      @media(min-width:1500px){
        .phn-side-nav-panel{
          position:fixed;
          top:96px;
          left:18px;
          width:210px;
          display:block;
          margin:0;
          padding:14px;
        }
        .phn-breadcrumb{display:flex;margin-bottom:12px;flex-wrap:wrap;line-height:1.45}
        .phn-side-nav-panel nav{display:grid;gap:7px;overflow:visible}
        .phn-side-nav-panel a,.phn-side-nav-panel button{width:100%;justify-content:flex-start;text-align:left}
        .phn-side-nav-panel button{text-align:center}
      }
      @media(max-width:720px){
        .phn-side-nav-panel{
          top:66px;
          width:min(100% - 20px,1180px);
          grid-template-columns:1fr;
          gap:8px;
          padding:9px;
        }
        .phn-breadcrumb{font-size:10px}
        .phn-side-nav-panel a,.phn-side-nav-panel button{font-size:10px;padding:7px 9px}
      }
    `;
    document.head.appendChild(style);
    const panel = document.createElement("aside");
    panel.className = "phn-side-nav-panel";
    panel.setAttribute("aria-label", "Breadcrumb and page navigation");
    panel.innerHTML = `
      <div class="phn-breadcrumb"><a href="index.html">PHN</a><span>/</span><strong>${current[1]}</strong></div>
      <nav>
        ${items.map(([href, label]) => `<a href="${href}" class="${href.toLowerCase() === currentFile ? "active" : ""}">${label}</a>`).join("")}
      </nav>
      <button type="button" onclick="connectPhnWallet()">Connect</button>
    `;
    const anchor = document.querySelector(".phn-topbar, .staking-nav, .burn-nav, .buy-nav, body > nav, header");
    if (anchor && anchor.parentNode) anchor.insertAdjacentElement("afterend", panel);
    else document.body.prepend(panel);
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
        --black:#f4f8fb!important;
        --deep:#edf4f8!important;
        --card:#ffffff!important;
        --border:#d5e4ec!important;
        --text:#0c1e2d!important;
        --muted:#66798a!important;
        --cyan:#0097b8!important;
        --cyan-dim:#006f8d!important;
        --green:#00a67a!important;
        --amber:#b97800!important;
        --pink:#c94a8b!important;
        --purple:#6254cf!important;
        --red:#c93c4f!important;
      }
      html,body{
        background:#f4f8fb!important;
        color:#0c1e2d!important;
        font-family:Inter,"Segoe UI",system-ui,sans-serif!important;
        font-style:normal!important;
      }
      body:not(.home-page)::before{
        content:""!important;
        position:fixed!important;
        inset:0!important;
        pointer-events:none!important;
        z-index:-1!important;
        opacity:.38!important;
        display:block!important;
        background-image:linear-gradient(rgba(12,30,45,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(12,30,45,.035) 1px,transparent 1px)!important;
        background-size:44px 44px!important;
        mask-image:linear-gradient(180deg,#000 0%,transparent 62%)!important;
      }
      body{
        background:
          radial-gradient(circle at 12% -6%,rgba(0,151,184,.13),transparent 30rem),
          radial-gradient(circle at 88% 4%,rgba(0,166,122,.10),transparent 28rem),
          linear-gradient(180deg,#fbfdff 0%,#f4f8fb 48%,#fff 100%)!important;
      }
      .grid-bg,.hero-orb,.hero-orb-2{opacity:0!important;display:none!important}
      nav,.phn-topbar{
        background:rgba(251,253,255,.88)!important;
        border-bottom:1px solid #d5e4ec!important;
        box-shadow:0 12px 34px rgba(20,45,70,.07)!important;
        backdrop-filter:blur(18px)!important;
      }
      .phn-links,.nav-links,.top-links,.buy-links{
        gap:6px!important;
      }
      .nav-logo,.phn-brand{color:#0c1e2d!important;letter-spacing:0!important;font-family:Inter,"Segoe UI",system-ui,sans-serif!important;font-style:normal!important}
      .nav-logo span,.phn-brand span{color:#0c1e2d!important}
      .phn-brand-stack,.phn-brand-stack span{font-family:Inter,"Segoe UI",system-ui,sans-serif!important;font-style:normal!important;letter-spacing:0!important;transform:none!important}
      .phn-legacy-logo-img,.phn-brand img,.nav-logo img{
        background:#fff!important;
        border:1px solid #d5e4ec!important;
        box-shadow:0 10px 24px rgba(0,151,184,.13)!important;
      }
      .nav-links a,.phn-links a,.top-links a,.buy-links a,.footer-links a,.phn-footer a{color:#66798a!important}
      .nav-links a:hover,.phn-links a:hover,.top-links a:hover,.buy-links a:hover,.footer-links a:hover,.phn-footer a:hover{color:#0097b8!important}
      .nav-cta,.btn-primary,.phn-btn.primary,.btn-connect,.btn-buy,.btn-stake,.connect-btn,.btn-send,.btn-submit,.btn.primary,.buy-btn.primary{
        background:#0c1e2d!important;
        color:#fff!important;
        border:1px solid #0c1e2d!important;
        border-radius:8px!important;
        box-shadow:0 14px 32px rgba(12,30,45,.18)!important;
        min-height:42px!important;
      }
      .btn-secondary,.phn-btn,.phn-btn.ghost,.copy-btn,.max-btn,.slip-btn,.cur-tab,.contact-btn-secondary,.btn,.buy-btn,.mini-btn{
        background:#fff!important;
        color:#0c1e2d!important;
        border:1px solid #d5e4ec!important;
        border-radius:8px!important;
        box-shadow:none!important;
        min-height:40px!important;
      }
      .btn-primary,.btn-secondary,.nav-cta,.btn-connect,.btn-buy,.btn-stake,.connect-btn,.btn-send,.btn-submit,.copy-btn,.max-btn,.slip-btn,.cur-tab,.btn,.buy-btn,button,input,select,textarea{
        font-family:Inter,"Segoe UI",system-ui,sans-serif!important;
        font-style:normal!important;
        letter-spacing:0!important;
        transform:none;
      }
      .btn-primary:hover,.btn-secondary:hover,.phn-btn:hover,.nav-cta:hover,.btn:hover,.buy-btn:hover{
        transform:translateY(-1px)!important;
        box-shadow:0 16px 34px rgba(0,151,184,.12)!important;
      }
      .hero,.phn-hero,.page,.staking-page,.wallet-page,.exchange-page,.support-page{
        background:transparent!important;
      }
      .hero-badge,.phn-kicker,.presale-badge,.phn-tag,.exchange-tag,.badge{
        background:#eef9fc!important;
        color:#0097b8!important;
        border-color:#c7edf5!important;
        border-radius:999px!important;
      }
      .h1-accent,.section-label,.phn-label,.price-val,.live-price,.up{color:#0097b8!important}
      .h1-line2,.hero-desc,.section-desc,.page-desc,.phn-lead,p,li{color:#66798a}
      h1,h2,h3,h4,.phn-title,.stat-value,.phn-stat,.raise-val,.val,.v,.contract-val,.tier-apy,.tier-name{
        color:#0c1e2d!important;
        font-family:Inter,"Segoe UI",system-ui,sans-serif!important;
        font-style:normal!important;
        letter-spacing:0!important;
        transform:none!important;
      }
      h1,.phn-title{font-size:clamp(38px,6.2vw,76px)!important;line-height:.98!important}
      .tier-apy span{letter-spacing:0!important;font-style:normal!important}
      .ticker,.listing,.tokenomics,.exchange,.how,.features,.cta-section,footer,.phn-footer{
        background:transparent!important;
        border-color:#d5e4ec!important;
      }
      .step,.feat-card,.contract-box,.exchange-card,.phn-card,.phn-panel,.buy-widget,.info-card,.burn-meter,.form-card,.pool-card,.tier-card,.stat-card,.wallet-card,.balance-card,.quick-card,.contact-card,.doc-card,.trust-item,.raise-block,.fee-box,.input-wrap,.send-card,.launch-card,.panel,.route,.stat,.timeline-card,.wp-card{
        background:rgba(255,255,255,.94)!important;
        border:1px solid #d5e4ec!important;
        border-radius:10px!important;
        box-shadow:0 14px 38px rgba(24,54,78,.08)!important;
        transform:none!important;
      }
      .step:hover,.feat-card:hover,.exchange-card:hover,.phn-card:hover,.tier-card:hover,.quick-card:hover,.route:hover,.timeline-card:hover{
        border-color:#9ed4df!important;
        box-shadow:0 22px 48px rgba(24,54,78,.12)!important;
      }
      input,select,textarea,.phn-input,.phn-select{
        background:#fff!important;
        color:#0c1e2d!important;
        border:1px solid #c9dae5!important;
        border-radius:8px!important;
      }
      code,.phn-code,.phn-code-block{
        color:#006f8d!important;
        background:#f1f7fb!important;
        border-color:#d5e4ec!important;
      }
      .progress-bar,.pool-bar,.burn-bar,.fill,.split-fill{background:linear-gradient(90deg,#0097b8,#00a67a)!important}
      .phn-side-nav-panel{
        background:rgba(255,255,255,.90)!important;
        border-color:#d5e4ec!important;
        box-shadow:0 16px 44px rgba(20,45,70,.12)!important;
      }
      .phn-side-nav-panel a,.phn-side-nav-panel button{
        background:#fff!important;
        color:#0c1e2d!important;
        border-color:#d5e4ec!important;
      }
      .phn-side-nav-panel a.active{background:#0c1e2d!important;color:#fff!important;border-color:#0c1e2d!important}
      @media(max-width:720px){
        h1,.phn-title{font-size:clamp(34px,10.8vw,48px)!important}
        .phn-side-nav-panel nav{scroll-snap-type:x mandatory}
        .phn-side-nav-panel a,.phn-side-nav-panel button{scroll-snap-align:start;white-space:nowrap}
      }
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
    installSideBreadcrumbPanel();
    document.querySelectorAll("[data-copy]").forEach((el) => {
      el.addEventListener("click", () => copyText(el.getAttribute("data-copy"), el.getAttribute("data-status")));
    });
    if (document.querySelector("#nodeCommands")) generateNodeCommands();
  });
})();
