# PHN Design System

## Product
Peaq Human Node (PHN) is a DePIN token and node network by Skymetric Consulting LLP. The site should feel like a serious web3 command center: credible, technical, liquid, fast, and trustworthy.

## Audience
- DePIN users who understand nodes, wallets, staking, and token launches.
- Early crypto buyers checking contract safety, tokenomics, vesting, and liquidity.
- Node operators who need clear onboarding and proof that PHN is not a meme-only token.

## Visual Direction
- Use a dark operational interface, not a generic crypto landing page.
- Primary mood: high-trust infrastructure, machine economy, human verification, live network telemetry.
- Avoid: cartoon mascots, meme-token styling, purple-only gradients, beige palettes, excessive glass cards, decorative blobs.
- Use dense but readable dashboard sections with clear data hierarchy.

## Palette
- Base: `#030508`, `#070c14`, `#0c1420`
- Text: `#e8f0fe`
- Muted text: `#6b8299`
- Primary cyan: `#00e5ff`
- Positive green: `#00ff88`
- Warning amber: `#ffb800`
- Risk red: `#ff4444`
- Accent pink for staking pool: `#f472b6`

## Typography
- Display: Syne or a similar geometric display font.
- Monospace: DM Mono or similar for addresses, chain IDs, tx hashes, metrics.
- No negative letter spacing.
- Keep dense product panels smaller and tighter than hero headings.

## Core Screens
1. Homepage command center
   - Hero: "Peaq Human Node"
   - Primary CTA: Buy PHN
   - Secondary CTA: Run a Node
   - Show 100M fixed supply, peaq mainnet, identity-gated rewards.

2. Buy / Presale
   - Epoch pricing track: $0.02, $0.05, $0.10, $0.20.
   - Payment methods: PEAQ and USDC first; BNB/ETH/BTC marked future.
   - Fee breakdown: 2% total, 0.25% burned, 1.75% treasury, 98% user receives.
   - Display net PHN received before wallet action.

3. Staking
   - Three tiers: FLEX 8%, LOCKED 15%, VAULT 25%.
   - Clearly show lock duration, penalties, rewards, and claim action.

4. Exchange
   - PHN branded exchange interface.
   - peaq-first by default.
   - BSC support marked "Phase 2" until deployed.

5. Verify
   - Token safety checklist.
   - peaq contract address: `0x83e2A4aB24A61d138f12569c497C3E5f2BF8694B`.
   - peaqID: `did:peaq:0x1C370Aeb0E4eD20B032d4Dd4f3b9963f2f6a6894`.
   - Explain no admin will DM users for wallet keys or funds.

6. Support
   - Scam alert at top.
   - FAQs for buying, staking, vesting, node activation, and verification.
   - Ticket form design with wallet/tx optional fields.

## Components
- Top nav with Buy PHN, Staking, Exchange, Verify, Support.
- Metric strips for supply, holders, burn, rewards pool, epoch.
- Status pills: Live, Pending, Phase 2, Verified.
- Wallet connect button with clear disconnected/connected states.
- Contract address copy component.
- Risk/safety alert component.

## Interaction Rules
- Primary action must always be Buy PHN during presale.
- Never hide fees; show gross, burn, treasury, and net.
- Any future-chain feature must be marked as future/Phase 2, not live.
- No sensitive key input anywhere.

## Copy Tone
Short, factual, technical, trust-building.
Use "identity-gated DePIN rewards", "verified human node", "peaq mainnet", "fixed 100M supply", "0.25% burn", "staking up to 25% APY".

## Deliverable From Stitch
Generate high-fidelity web UI screens for desktop and mobile:
- Homepage
- Buy / Presale
- Staking
- Exchange
- Verify
- Support

Export clean HTML/CSS or React components with consistent tokens and responsive layouts.
