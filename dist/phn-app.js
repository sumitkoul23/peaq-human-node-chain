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
            image: `${location.origin}/assets/phn-logo-64.png`
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
    if (document.querySelector(".phn-topbar")) return;

    document.querySelectorAll(".nav-logo").forEach((brand) => {
      if (brand.querySelector("img")) return;
      const label = brand.textContent.trim() || "PEAQ HUMAN NODE";
      brand.innerHTML = `<img class="phn-legacy-logo-img" src="assets/phn-logo-64.png" alt="PHN"><span>${label}</span>`;
    });

    if (document.querySelector("#phn-legacy-consistency")) return;
    const style = document.createElement("style");
    style.id = "phn-legacy-consistency";
    style.textContent = `
      .nav-logo{min-width:0!important;gap:10px!important;letter-spacing:0!important}
      .nav-logo .logo-dot{display:none!important}
      .phn-legacy-logo-img{width:34px;height:34px;border-radius:8px;object-fit:cover;box-shadow:0 0 18px rgba(0,229,255,.18);flex:0 0 auto}
      .nav-logo span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .btn-primary,.btn-secondary,.nav-cta,.btn-connect,.btn-buy,.btn-stake,.connect-btn,.btn-send,.contact-btn,.btn-submit,.copy-btn,.max-btn,.slip-btn,.cur-tab,button,a.exchange-card{min-width:0}
      .btn-primary,.btn-secondary,.nav-cta,.btn-connect,.btn-buy,.btn-stake,.connect-btn,.btn-send,.contact-btn,.btn-submit{border-radius:8px!important;letter-spacing:0!important;text-align:center;line-height:1.2;white-space:normal}
      .exchange-card,.feature-card,.step,.trust-item,.contact-card,.doc-card,.quick-card,.balance-card,.wallet-card,.tier-card{border-radius:8px!important}
      @media(max-width:900px){
        body{overflow-x:hidden!important}
        nav{padding:12px 14px!important;gap:10px!important;min-height:66px}
        .nav-logo{font-size:12px!important;max-width:52vw}
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
    installQuickHub();
    document.querySelectorAll("[data-copy]").forEach((el) => {
      el.addEventListener("click", () => copyText(el.getAttribute("data-copy"), el.getAttribute("data-status")));
    });
    if (document.querySelector("#nodeCommands")) generateNodeCommands();
  });
})();
