# PHN Project Memory — Full Deep Context

_Updated: 2026-05-19 | Status: Pre-launch, accounts pending, all systems ready_

---

## Me
**Skymetric Consulting LLP** — Solo founder launching **Peaq Human Node ($PHN)**, an identity-gated DePIN token on BSC + peaq with zero budget.

---

## The Core: What PHN Is

**Peaq Human Node** = Identity-gated compute reward token.  
- Users run lightweight nodes on their PCs
- Prove humanity (hardware fingerprint + liveness check + peaq DID)
- Earn $PHN for every heartbeat
- Stake earnings at 8-25% APY
- **Key differentiator:** One real human = one node (stops Sybil attacks that kill other DePINs)

---

## Token Details

| Property | Value |
|----------|-------|
| **Symbol** | PHN |
| **BSC Contract** | `0x83e2A4aB24A61d138f12569c497C3E5f2BF8694B` |
| **Standard** | BEP-20 + ERC-20 (burnable, not pausable, not mintable) |
| **Total Supply** | 100M fixed forever |
| **Presale Epochs** | E1=$0.02 (5M), E2=$0.05, E3=$0.10, E4=$0.20 |
| **Presale Fee** | 2% total (0.25% burn + 1.75% treasury) |
| **Burn Mechanism** | Automatic 0.25% burn on every purchase (deflationary) |

---

## Presale (PHNPresale.sol)

| Epoch | Price | Cap | Status |
|-------|-------|-----|--------|
| 1 | $0.02 | 5M PHN | ACTIVE (presale.html) |
| 2 | $0.05 | 5M PHN | Locked until E1 sells |
| 3 | $0.10 | TBD | Locked |
| 4 | $0.20 | TBD | Locked |

**Key:** Admin can manually trigger epoch advance. Fee split: 0.25% burn (deflationary) + 1.75% to treasury wallet.

---

## Staking (PHNStaking.sol)

| Tier | APY | Lock | Min | Max | Status |
|------|-----|------|-----|-----|--------|
| FLEX | 8% | None | 1 | ∞ | ✅ Active |
| LOCKED | 15% | 90d | 1 | ∞ | ✅ Active |
| VAULT | 25% | 180d | 1 | ∞ | ✅ Active |

**Reward Pool:** 10M PHN reserved (per-second accrual, depletes over ~3 years)

---

## Tokenomics Split (100M)

| Allocation | % | Amount | Purpose |
|------------|---|--------|---------|
| Presale/Public | 40% | 40M | Phase 1-3 presales + LP |
| Node Rewards | 30% | 30M | Heartbeat earnings (long-term) |
| Staking Rewards | 10% | 10M | APY pool (3-year lifecycle) |
| Treasury | 12% | 12M | DAO-governed, multi-sig |
| Marketing/Community | 8% | 8M | Growth, partnerships, bounties |

**Team tokens:** 2-year vesting lock (published schedule)

---

## Website Status

**Live:** `https://peaqhumannode.netlify.app` (Netlify)

| Page | Purpose | Status |
|------|---------|--------|
| `/index.html` | Landing page + tokenomics + CTAs | ✅ Live |
| `/buy.html` | Presale UI (MetaMask, PEAQ/USDC) | ✅ Live |
| `/staking.html` | Staking interface (3 tiers) | ✅ Live |
| `/exchange.html` | Custom DEX (PancakeSwap V2 router) | ✅ Live |
| `/verify.html` | Trust dashboard (verification checks) | ✅ Live |
| `/support.html` | Help center + ticket form (Netlify Forms) | ✅ Live |
| `/activate-node.html` | Node activation portal | ⏳ Stub |
| `/vesting.html` | Vesting schedule | ⏳ Stub |

**SEO Ready:** Plausible analytics, sitemap.xml, robots.txt, full meta tags (OG + Twitter Card + JSON-LD)

---

## Smart Contracts

| Contract | Chain | Status | Notes |
|----------|-------|--------|-------|
| **PeaqHumanNodeToken.sol** | BSC | ✅ Deployed | BEP-20, burnable, not pausable |
| **PHNPresale.sol** | peaq | ✅ Ready | Epoch-based, PEAQ + USDC support |
| **PHNStaking.sol** | BSC | ✅ Ready | Per-second accrual, 3 tiers |
| **NodeIdentityRegistry.sol** | peaq | ✅ Deployed | Triple-gate verification |
| **NodeEarningsManager.sol** | peaq | ✅ Deployed | Heartbeat → earnings mapping |

**Key Integration:** PancakeSwap V2 Router (`0x10ED43C718714eb63d5aA57B78B54704E256024E` on BSC)

---

## Social Media (Accounts Pending)

**CRITICAL:** All accounts MUST be created manually (no bots — platforms ban automated account creation)

| Platform | Handle | Status | Priority |
|----------|--------|--------|----------|
| **X/Twitter** | @PeaqHumanNode | ⏳ User creates | P1 (launch day) |
| **Telegram** | t.me/PeaqHumanNode | ⏳ User creates | P1 (launch day) |
| **Discord** | discord.gg/peaqhumannode | ⏳ User creates | P1 (launch day) |
| **YouTube** | @PeaqHumanNode | ⏳ User creates | P2 (week 1) |
| **Instagram** | @peaqhumannode | ⏳ User creates | P2 (week 1) |
| **Medium** | @PeaqHumanNode | ⏳ User creates | P2 (week 2) |

**Content System Ready:**
- `CONTENT_TEMPLATES.md` — 5 reusable templates (tokenomics, node benefits, milestones, security, FAQ)
- `CONTENT_CALENDAR_30DAY.md` — Day-by-day content plan (all platforms)
- `ORGANIC_GROWTH_PLAYBOOK.md` — Platform-specific tactics + daily routines
- `platform_setup/*.md` — Setup guides for all 5 platforms

---

## Listings & Exchanges

**Can Submit NOW (no LP needed):**
1. Subscan (GitHub issue) — ✅ `SUBSCAN_TOKEN_SUBMISSION.md` ready
2. DePINscan (web form) — ✅ Master packet ready
3. CoinSniper (web form) — ✅ Master packet ready
4. CoinPaprika (web form) — ✅ Master packet ready
5. DappBay (web form) — ✅ Master packet ready

**Auto-Index After LP (no action needed):**
- GeckoTerminal, DexScreener, DexTools, PooCoin (fetch from PancakeSwap V2)

**Manual After LP:**
- CoinGecko (requires verification tweet from @PeaqHumanNode)
- CoinMarketCap (form + verification)
- LiveCoinWatch (simple form)

**Master reference:** `C:\ClaudeAgent\outputs\LISTING_MASTER_PACKET.md`

---

## Key File Locations

```
dist/
  ├── index.html (landing + tokenomics donut)
  ├── buy.html (presale UI)
  ├── staking.html (staking interface)
  ├── exchange.html (custom DEX)
  ├── verify.html (trust signals)
  ├── support.html (help center + ticket form)
  ├── sitemap.xml (SEO)
  ├── robots.txt (crawler rules)
  ├── netlify.toml (deployment config)
  └── assets/
      ├── phn-logo.png (1200×1200)
      ├── phn-logo-64.png (64×64)
      ├── peaq_token_PHN.png (128×128, Subscan)
      └── phn-banner.png (1500×500)

contracts/
  ├── PeaqHumanNodeToken.sol
  ├── PHNPresale.sol
  └── PHNStaking.sol

scripts/
  ├── deployStaking.js
  └── deployPresale.js

C:\ClaudeAgent\
  ├── outputs/
  │   ├── SUBSCAN_TOKEN_SUBMISSION.md
  │   ├── LISTING_MASTER_PACKET.md
  │   └── COMPETITIVE_INTELLIGENCE.md
  └── social_media/
      ├── CONTENT_TEMPLATES.md
      ├── CONTENT_CALENDAR_30DAY.md
      ├── ORGANIC_GROWTH_PLAYBOOK.md
      └── platform_setup/
          ├── X_TWITTER_SETUP.md
          ├── TELEGRAM_SETUP.md
          ├── DISCORD_SETUP.md
          ├── YOUTUBE_SETUP.md
          └── INSTAGRAM_SETUP.md

memory/
  ├── glossary.md (terms)
  ├── projects/
  │   ├── phn-presale.md
  │   └── social-media.md
  └── context/
      └── company.md
```

---

## Technical Constraints

- **peaq Chain ID:** 3338 (NOT 1)
- **BSC Chain ID:** 0x38 (hex) / 56 (decimal)
- **No Chainlink on peaq:** Admin sets `nativePerUsd` manually
- **Subscan logo:** <30KB (created 128×128 at 25.4 KB)
- **Chrome extension:** Only peaq.subscan.io accessible
- **Ethers.js:** v6 from CDN
- **LP lock:** 6+ months non-negotiable (Mudra)

---

## Launch Phase Roadmap

**Phase 1 (Week 1): Setup**
- User creates 3 accounts (X, Telegram, Discord)
- Submit 5 pre-LP listings (Subscan, DePINscan, CoinSniper, CoinPaprika, DappBay)
- Deploy to GitHub + Netlify
- Verify contracts on BscScan

**Phase 2 (Week 2): LP Launch**
- Get gas (0.02 BNB) + add PHN/BNB liquidity on PancakeSwap
- Lock LP 6 months
- Flip `presalePhase = false` in exchange.html

**Phase 3 (Week 3+): Auto-Indexing + Growth**
- GeckoTerminal, DexScreener, DexTools, PooCoin auto-list
- Begin 30-day content calendar (daily posts)
- Node signups accelerate
- Collect verification tweets for CoinGecko/CMC

---

## Success Metrics (90-day targets)

| Metric | Week 2 | Week 4 | Week 12 |
|--------|--------|--------|---------|
| Active Nodes | 250 | 2,500 | 25K+ |
| X Followers | 1K | 8K | 50K+ |
| Telegram | 2K | 15K | 100K+ |
| Discord | 1K | 10K | 50K+ |
| Daily Heartbeats | 5M | 50M | 500M+ |
| PHN Burned | 100 | 2,500 | 50K+ |
| Avg Node Earnings | $10/day | $15/day | $20+/day |

---

## Long-Term Ecosystem Vision

**Skymetric Consulting LLP** is building a full ecosystem across 4 layers:

| Phase | Product | Token | Timeline |
|-------|---------|-------|----------|
| 1 | PHN DePIN network | PHN | NOW |
| 2 | Cross-chain expansion | PHN (OFT) | Month 3-6 |
| 3 | Skymetric Chain (own L1) | PHN as gas | Month 6-12 |
| 4 | SKY utility token | SKY | Month 10-15 |
| 5 | Gaming ecosystem | NRC / POH / DPW | Month 9-18 |
| 6 | Governance | SKYGOV (soulbound) | Month 12-18 |
| 7 | Full ecosystem | All tokens + wallet + SNS | Month 18-24 |

### Token Map
- **PHN** — DePIN rewards (node heartbeats + staking). BSC + peaq. NOW.
- **SKY** — Chain utility (gas, gaming, DAO proposals). Skymetric Chain. Month 10.
- **SKYGOV** — Soulbound governance (earned, not bought). Month 12.
- **Game tokens** — In-game only (NRC, POH, DPW). Convert to PHN. Month 9+.

### Skymetric Chain
- EVM-compatible L1
- Consensus: Delegated Proof of Identity (DPoI) — validators must be verified humans
- PHN = native gas token (burns on every tx)
- Launches after 10K active nodes (proven network effect)

### Games
- **NodeRunner** — idle node management game. NRC → PHN. Month 9.
- **Proof of Human** — skill challenges. POH points → PHN seasons. Month 11.
- **DePIN Wars** — guild strategy. Territory = real heartbeat multipliers. Month 13.

### Governance
- SKYGOV earned by: running nodes 90+ days, holding PHN, winning tournaments, contributing
- Controls: chain upgrades, treasury, validators, new games, DEX listings
- Soulbound = cannot be bought. Only earned.

**Full roadmap:** `C:\ClaudeAgent\outputs\ECOSYSTEM_ROADMAP.md`
**Public roadmap page:** `dist/roadmap.html`

### Roadmap Messaging Rule
Publicly phrase Skymetric Chain, SKY, SKYGOV, and games as **future plans / development targets**, not live products or investment guarantees. Current priority remains PHN on peaq: verification, presale, staking, exchange, support, liquidity, and listings.

---

## Core Directives

1. **Organic only** — no paid ads, no bot followers, no paid listings
2. **Transparency first** — publish all metrics, admit unknowns
3. **Community-centric** — celebrate users, not hype
4. **Identity gating non-negotiable** — core differentiator across ALL phases
5. **Real adoption metrics** — node count, burn rate, heartbeats
6. **Manual account creation** — zero bot risk
7. **PHN first** — every future phase depends on PHN's success. Focus here.

---

**Update this file weekly with fresh metrics, deployed URLs, and completed milestones.**
