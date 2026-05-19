# PHN Project — Task List
_Last updated: 2026-05-19 | Agent: autonomous mode active_

---

## 🔴 CRITICAL — Blocking launch

> Run script: `C:\ClaudeAgent\GITHUB_PUSH.bat` after creating GitHub repo

- [ ] Create GitHub repo: github.com/new → name: `peaq-human-node` → org: PeaqHumanNode
- [ ] Run `C:\ClaudeAgent\GITHUB_PUSH.bat` to commit + push all files
- [ ] Connect Netlify to GitHub repo → set publish dir to `dist` → deploy
- [ ] Get gas (0.02 BNB) to deploy PHNStaking.sol on BSC
- [ ] Deploy PHNStaking: `npx hardhat run scripts/deployStaking.js --network bsc`
- [ ] Update `STAKING_CA` placeholder in `dist/staking.html` with deployed address
- [ ] Get PHNOFT address on peaq + USDC address on peaq (check peaq docs)
- [ ] Fill in `PHN_TOKEN_PEAQ`, `USDC_PEAQ`, `TREASURY_WALLET` in `scripts/deployPresale.js`
- [ ] Deploy PHNPresale: `npx hardhat run scripts/deployPresale.js --network peaq`
- [ ] Update `PRESALE_CA` placeholder in `dist/buy.html` with deployed address

---

## 🟡 HIGH — Social Media Accounts (Do Before/On Launch Day)

> Setup guides for each platform: `C:\ClaudeAgent\social_media\platform_setup\`
> Content calendar: `C:\ClaudeAgent\social_media\CONTENT_CALENDAR_30DAY.md`
> Growth playbook: `C:\ClaudeAgent\social_media\ORGANIC_GROWTH_PLAYBOOK.md`

### Twitter / X
- [ ] Create account: @PeaqHumanNode — guide: `X_TWITTER_SETUP.md`
- [ ] Upload profile photo (`dist/assets/phn-logo.png`) + header banner
- [ ] Post + pin launch thread (`twitter_launch_thread.txt`)
- [ ] Follow: @peaq_network, @LayerZero_Labs, @BNBChain, @DePINAlliance

### Telegram
- [ ] Create community group: t.me/PeaqHumanNode — guide: `TELEGRAM_SETUP.md`
- [ ] Create announcement channel: t.me/PeaqHumanNodeAnn
- [ ] Post + pin the welcome message (in guide)
- [ ] Post + pin the rules message
- [ ] Add anti-spam bot (@GroupHelpBot or @Rose)

### Discord
- [ ] Create server: "Peaq Human Node | $PHN" — guide: `DISCORD_SETUP.md`
- [ ] Set up all channels + roles (see guide)
- [ ] Add MEE6 + Carl-bot + GitHub webhook
- [ ] Post rules + contract verify messages
- [ ] Submit to Disboard listing (after 10+ members)

### YouTube
- [ ] Create channel: @PeaqHumanNode — guide: `YOUTUBE_SETUP.md`
- [ ] Upload channel art + description + links
- [ ] Record + upload Video 1: "What is Peaq Human Node?"
- [ ] Record + upload Video 2: "How to Buy PHN Presale"
- [ ] Record + upload Video 8: "Contract Verified — Stay Safe"

### Instagram
- [ ] Create Business account: @peaqhumannode — guide: `INSTAGRAM_SETUP.md`
- [ ] Create Linktree (free) with all platform links
- [ ] Post first 9 grid posts (see guide for descriptions)
- [ ] Post Day 1 story: "We're live!"

---

## 🟡 HIGH — Trust & Credibility (Research-Backed — Do Before Big Push)

> Source: Helium, Render Network, Best Wallet, 2026 launch research
> Full analysis: `C:\ClaudeAgent\outputs\LAUNCH_UPGRADE_FROM_RESEARCH.md`

- [ ] Publish PHN Whitepaper v1 — ready at `C:\ClaudeAgent\outputs\PHN_WHITEPAPER_V1.md`
  - Add to website: `dist/whitepaper.html` (embed + download PDF)
  - Required for CoinGecko Tier-2 + CMC listing
- [ ] Submit to Rugdoc.io for free smart contract audit (48h turnaround)
  - URL: https://rugdoc.io/project-kyc-review/
  - Publish result on dist/verify.html
- [ ] Get SourceHat or HashEx audit quote ($300-800) for full audit
- [ ] Populate `dist/about.html` with team info (Skymetric Consulting LLP)
- [ ] Launch Genesis Node Airdrop (first 100 node runners = 1,000 PHN each)
  - Add waitlist form to `dist/activate-node.html`
  - Announce on all social platforms
- [ ] Build `dist/stats.html` — live network metrics dashboard
  - Live node count, PHN burned, epoch progress, staking TVL, heartbeats
- [ ] Apply to peaq Foundation ecosystem program: https://peaq.network/ecosystem
- [ ] Apply to BNB Chain MVB program (grants available): https://www.bnbchain.org/en/bsc-mvb-program
- [ ] Publish LP launch timeline publicly ("LP within 7 days of Epoch 1 sellout")
- [ ] Populate `dist/vesting.html` with full vesting schedule (team, treasury, marketing)

---

## 🟡 HIGH — Other Launch Tasks (Within 48h)

- [ ] Verify PHN contract on BscScan
  - `npx hardhat flatten contracts/PeaqHumanNodeToken.sol > flat_token.sol`
  - Paste at https://bscscan.com/verifyContract?a=0x83e2A4aB24A61d138f12569c497C3E5f2BF8694B
- [ ] Submit CoinSniper listing (use `C:\ClaudeAgent\social_media\coinsniper_listing_form.txt`)
- [ ] Lock LP tokens on Mudra (min 6 months) after adding PHN/BNB pool on PancakeSwap

---

## 🟡 HIGH — SEO & Analytics (Do After GitHub Push)

- [ ] Sign up at https://plausible.io (free plan) — add domain `peaqhumannode.netlify.app`
- [ ] Add site to Google Search Console — submit `sitemap.xml`
- [ ] Add site to Bing Webmaster Tools — submit `sitemap.xml`
- [ ] Set up Google Analytics 4 (free) — add GA tag to all pages
- [ ] Submit to depinscan.io (free DePIN project listing — major discovery channel)
- [ ] Submit to DePIN Alliance directory

---

## 🟡 HIGH — Exchange / Sale Strategy (Post Presale)

- [ ] After LP is live: update `presalePhase = false` in `dist/exchange.html`
- [ ] Set `PRESALE_CA` and update `buy.html` for live presale trading
- [ ] Announce exchange is live on all social platforms
- [ ] Add "PHN Exchange" to PancakeSwap listing info page

---

## 🟢 DONE

- [x] PeaqHumanNodeToken.sol deployed: 0x83e2A4aB24A61d138f12569c497C3E5f2BF8694B (BSC)
- [x] PHNStaking.sol written (3 tiers: FLEX 8%, LOCKED 15%, VAULT 25%)
- [x] PHNPresale.sol written (4 epochs: $0.02 → $0.05 → $0.10 → $0.20)
- [x] dist/index.html — updated tokenomics (40/30/10/12/8), presale CTAs
- [x] dist/buy.html — full presale UI with epoch track, calculator, PEAQ/USDC
- [x] dist/staking.html — full MetaMask staking UI
- [x] dist/verify.html — trust signals dashboard
- [x] netlify.toml configured (security headers, clean URL redirects)
- [x] .github/workflows/deploy.yml — GitHub Actions → GitHub Pages
- [x] fleek.json — IPFS hosting config
- [x] Social media content files written (twitter, telegram, coinsniper, coingecko/CMC, medium)
- [x] LAUNCH_NOW.md — step-by-step go-live guide
- [x] scripts/deployStaking.js written
- [x] scripts/deployPresale.js written
- [x] dist/exchange.html — full custom DEX UI (BNB↔PHN, USDC↔PHN, PancakeSwap router)
- [x] dist/support.html — help center (scam alert, FAQ, ticket form, community links)
- [x] dist/sitemap.xml — XML sitemap for Google/Bing
- [x] dist/robots.txt — crawler directives
- [x] index.html SEO upgrade (full meta tags, OG, Twitter Card, JSON-LD, Plausible analytics)
- [x] netlify.toml — added all page redirects + updated CSP for ethers.js CDN + analytics
- [x] COMPETITIVE_INTELLIGENCE.md — full competitor analysis (Helium, IoTeX, Filecoin, Render)
- [x] ORGANIC_GROWTH_PLAYBOOK.md — platform-by-platform tactics, daily routines
- [x] CONTENT_CALENDAR_30DAY.md — day-by-day content plan all platforms

---

## 📋 BACKLOG — Future phases

### Protocol — Phase 2 (Month 2-3)
- [ ] Phase 2: Deploy PHNPresale on BSC (BNB + USDC support)
- [ ] Phase 3: Deploy PHNPresale on Ethereum
- [ ] LayerZero OFT bridge setup (PHNOFT on peaq)
- [ ] Chainlink price feed integration (once available on peaq)
- [ ] Node operator dashboard
- [ ] Referral / affiliate system for presale

### Content & Listings
- [ ] CMC + CoinGecko submission — Day 16 of content calendar
- [ ] Medium article publish (`C:\ClaudeAgent\social_media\medium_article_draft.md`) — Day 18
- [ ] Twitter Spaces: host first community AMA — Week 3
- [ ] YouTube: all 8 videos from `YOUTUBE_SETUP.md`
- [ ] Instagram: first 9 grid posts + weekly Reels cadence
- [ ] Discord: first Friday AMA voice event

### Social Milestones to Chase
- [ ] 100 Telegram members
- [ ] 500 X followers
- [ ] 100 YouTube subscribers
- [ ] 200 Instagram followers
- [ ] 1,000 PHN burned on-chain
- [ ] Epoch 1 50% sold
- [ ] Listed on CoinGecko
- [ ] Listed on CoinMarketCap

---

## 🚀 LONG-TERM VISION — Skymetric Consulting LLP Ecosystem

> _Full roadmap: `C:\ClaudeAgent\outputs\ECOSYSTEM_ROADMAP.md`_

### Phase 4 — Own Blockchain (Month 6-12)
- [ ] Design Skymetric Chain architecture (EVM-compatible L1 or L2)
- [ ] Consensus mechanism selection (PoA → PoS with identity gating)
- [ ] PHN as native gas token on Skymetric Chain
- [ ] Bridge: BSC ↔ Skymetric Chain (LayerZero or custom)
- [ ] Validator set launch (node operators become validators)
- [ ] Testnet deployment + public testing
- [ ] Mainnet launch
- [ ] EVM compatibility for existing dApps to migrate
- [ ] Block explorer (fork Blockscout)
- [ ] Chain RPC + Chainlist submission

### Phase 5 — Gaming Ecosystem (Month 9-18)
- [ ] Game 1: **NodeRunner** — idle node management game (browser + mobile)
  - Players manage virtual nodes, earn in-game SKY tokens
  - In-game economy bridges to real PHN rewards
  - Identity gating prevents bot farming in-game too
- [ ] Game 2: **Proof of Human** — skill-based trivia/puzzle game
  - Pass challenges to prove humanity, earn PHN
  - Leaderboard + seasonal tournaments
- [ ] Game 3: **DePIN Wars** — strategy game (node networks compete)
  - Guilds of node operators compete for territory
  - Territory = more heartbeat rewards on mainnet
- [ ] NFT integration: node operator badges (soulbound, non-transferable)
- [ ] Game DAO: players vote on game mechanics via governance token
- [ ] Launch on App Store + Google Play (React Native or Unity WebGL)

### Phase 6 — Utility Token (SKY) (Month 10-15)
- [ ] Design SKY token: Skymetric Chain's native utility token
- [ ] SKY tokenomics: gas fees, staking, governance voting power
- [ ] SKY/PHN dual-token economy:
  - PHN = DePIN reward token (node earnings, staking)
  - SKY = chain utility token (gas, governance, gaming)
- [ ] SKY presale (existing PHN holders get priority allocation)
- [ ] SKY staking: validators lock SKY for network security
- [ ] SKY burn: 10% of all gas fees burned permanently
- [ ] SKY use cases: game entry fees, NFT minting, DAO proposals
- [ ] Deploy SKY: `contracts/SkymetricToken.sol`
- [ ] SKY/PHN DEX pair on Skymetric Chain native DEX

### Phase 7 — Governance Token (SKYGOV) (Month 12-18)
- [ ] Design SKYGOV: non-transferable (soulbound) governance credential
- [ ] Earning SKYGOV:
  - Running nodes for 90+ days continuously
  - Holding PHN + SKY above threshold
  - Completing identity verification milestones
  - Community contributions (Discord, GitHub, events)
- [ ] SKYGOV powers:
  - Vote on chain upgrades + parameter changes
  - Vote on treasury spending
  - Propose new validator sets
  - Game mechanic governance
  - New token listings on native DEX
- [ ] On-chain voting contract: `contracts/SkymetricGovernance.sol`
- [ ] Governance portal: `dist/governance.html` (upgrade from stub)
- [ ] DAO treasury: multi-sig → full on-chain governance transition
- [ ] Delegation: SKYGOV holders delegate votes to trusted parties
- [ ] Quorum rules: 10% of SKYGOV supply to pass proposals
- [ ] Timelock: 48h delay on all passed proposals

### Phase 8 — Full Ecosystem (Month 18-24)
- [ ] Skymetric App Store: curated dApps on Skymetric Chain
- [ ] Skymetric Name Service (SNS): human-readable addresses (.sky domains)
- [ ] Cross-game asset portability (NFTs usable across all games)
- [ ] Institutional node program: verified businesses run enterprise nodes
- [ ] Skymetric Accelerator: fund + incubate DePIN projects on our chain
- [ ] DEX aggregator: best price routing across BSC + Ethereum + Skymetric
- [ ] Fiat on-ramp integration (MoonPay / Transak) for SKY + PHN
- [ ] Mobile wallet app: Skymetric Wallet (iOS + Android)

---

## 🗺️ Token Ecosystem Map

```
SKYMETRIC CONSULTING LLP
│
├── PHN (Peaq Human Node Token) — BSC + peaq
│   ├── Node rewards (heartbeats)
│   ├── Staking (FLEX/LOCKED/VAULT)
│   ├── Presale (4 epochs)
│   └── Burns on purchase
│
├── SKY (Skymetric Utility Token) — Skymetric Chain
│   ├── Gas fees
│   ├── Gaming entry fees
│   ├── NFT minting
│   └── Burns on gas
│
├── SKYGOV (Governance Credential) — Skymetric Chain
│   ├── Soulbound (non-transferable)
│   ├── Earned by participation
│   ├── Votes on chain upgrades
│   └── Treasury governance
│
└── GAME TOKENS (in-game only)
    ├── NodeRunner: NRC
    ├── Proof of Human: POH
    └── DePIN Wars: DPW
```
