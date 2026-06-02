# PHN GUI Direction

Date: June 2, 2026  
Owner: Skymetric Consulting LLP  

## Goal

Make Peaq Human Node feel like a credible web3 product console, not a template landing page. The UI should communicate presale momentum, protocol trust, node infrastructure and peaq-first credibility in the first screen.

## Reference Translation

Katana:

- Use system narrative and product mechanics instead of generic hype.
- Show a flywheel: buy, burn, stake, run node, verify.
- Use subtle motion and layered depth, not random decoration.

Aster:

- Keep trading and buy surfaces clear.
- Use strong data blocks, metrics and action hierarchy.
- Make the app feel like a finance console.

BlockDAG:

- Show presale price, next epoch, holders/community style proof and clear buy flow.
- Use conversion-focused cards and high-contrast CTAs.
- Keep tokenomics, roadmap and proof points close to the buy flow.

peaq:

- Keep network credibility clean, technical and infrastructure-oriented.
- Use precise copy: peaq Mainnet, DePIN, DID, machine participation.

Teneo:

- Emphasize node participation and operator workflows.
- Make activation and download flows easy to find.

## Visual System

- Light futuristic base, not dark generic crypto.
- Background: white to pale blue with subtle grid and soft cyan/green network glow.
- Cards: white, thin borders, 8-10px radius, restrained shadows.
- Typography: Inter, no skew, no negative letter spacing.
- Buttons: consistent 42-44px height, short labels, primary dark ink, secondary white.
- Accent colors: cyan for active protocol action, green for live/verified, amber for warnings, red for risk.
- Navigation: top nav plus side/breadcrumb panel. Footer is secondary only.

## Core Page Requirements

Home:

- Command center for all protocol surfaces.
- First viewport must show Buy, Run Node, Verify, price, burn fee and token address.

Buy:

- Must feel like a presale trading desk.
- Show price, next epoch, fee split, burn, treasury and wallet action.

Staking:

- Must feel like a yield dashboard.
- Tier cards should be balanced and readable on mobile.

Burn:

- Must explain the burn mechanism clearly with supply impact.

Vesting:

- Must clearly show founder, ecosystem, staking, node rewards and liquidity distribution.

Wallet:

- Must make peaq network setup and PHN token import obvious.

Download:

- Must position the PWA as PHN Beacon across Android, iOS, iPadOS, Windows and macOS.

Whitepaper:

- Must be reviewer-ready and linked from all important paths.

## Stitch Prompt - Desktop Web App / Website

```text
Design a complete responsive web3 product interface for Peaq Human Node ($PHN), a peaq-first verified-human DePIN protocol by Skymetric Consulting LLP.

The interface should feel like a premium crypto launch console inspired by Katana Network, Aster DEX, BlockDAG presale pages, peaq.xyz and Teneo node infrastructure, but must not copy any of them.

Style:
- Light futuristic finance console
- White and pale blue surfaces
- Subtle cyan/green network glow and thin grid texture
- Crisp cards with 8px radius
- Strong data panels
- Professional Inter typography
- No skewed text, no huge unreadable hero, no clutter

Primary workflows:
- Buy PHN presale
- Stake PHN
- Burn protocol
- Run human node
- Wallet setup
- Vesting
- Whitepaper
- Verification
- Download PHN Beacon app

First viewport:
- PHN logo and stacked wordmark: Peaq / Human / Node
- Presale price $0.02
- Next epoch $0.05
- 2% fee split: 0.25% burn, 1.75% treasury
- Token address
- Buttons: Open Presale, Run Node, Verify Contracts

Create desktop, tablet and mobile layouts. Mobile buttons must be full-width, text must not overlap, and cards should stack cleanly. The site must feel credible enough for Subscan, DePINscan, CoinSniper, CoinPaprika and DappBay reviewers.
```

## Stitch Prompt - Native Mobile App / Mobile Site

```text
Design a native mobile app experience for Peaq Human Node ($PHN), a peaq-first verified-human DePIN protocol by Skymetric Consulting LLP.

The mobile app should feel like a premium crypto companion app inspired by Katana Network, Aster DEX, BlockDAG presale, peaq.xyz and Teneo node infrastructure, without copying any exact layout.

Style:
- Light futuristic app UI
- White and pale blue surfaces
- Thin cyan/green grid or network texture
- Crisp cards with 8px radius
- Bottom tab navigation
- Clear wallet and presale actions
- Inter-style typography
- No skewed text
- No clutter
- Full-width touch buttons

Primary app tabs:
1. Home
2. Buy
3. Stake
4. Node
5. Wallet

Home screen:
- PHN stacked logo wordmark: Peaq / Human / Node
- Status cards: Presale $0.02, Next epoch $0.05, Burn 0.25%, Staking up to 25% APY
- Main actions: Buy PHN, Run Node, Verify Contracts
- Small trust strip: Skymetric Consulting LLP, peaq Mainnet, contract verified pending/listing pending

Buy screen:
- Presale price card
- Enter amount
- Currency tabs: PEAQ, USDC, BNB soon, ETH/BTC future
- Fee breakdown: 98% buyer, 0.25% burn, 1.75% treasury
- Large confirm button

Stake screen:
- Three staking tiers: Flex 8%, Locked 15%, Vault 25%
- Stake amount input
- Reward estimate
- Active stakes list

Node screen:
- Node activation steps
- Wallet binding
- peaq DID status
- Generate node setup command
- Download PHN Beacon app

Wallet screen:
- Connect MetaMask, Binance Wallet, WalletConnect
- Add peaq Mainnet
- Add PHN token
- Show contract address and copy button

Design 8 mobile screens total:
- Splash
- Home
- Buy
- Stake
- Burn
- Node
- Wallet
- Support

Use Android/iOS-friendly spacing, 44px minimum tap targets, safe-area padding, readable 14-18px body text, and single-column layouts. This should be ready to hand to a developer building a PWA/mobile app shell.
```
