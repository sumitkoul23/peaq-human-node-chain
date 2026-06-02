# Google Stitch + Google AI Studio Workflow for PHN

Date: June 3, 2026  
Project: Peaq Human Node  
Company: Skymetric Consulting LLP  

## Purpose

Use Stitch for high-fidelity UI generation and Google AI Studio for turning the UI direction into a working web/mobile app prototype. Production code still lives in this repository.

## Official Tool Roles

Stitch:

- Generate desktop web UI.
- Generate mobile app UI.
- Explore visual variations.
- Export or import design rules through DESIGN.md.
- Create interactive prototypes and screen flows.
- Produce a shareable link for AI Studio handoff.

Google AI Studio:

- Use the Stitch design handoff as app context.
- Generate a working prototype with routes and components.
- Validate frontend flows before production integration.

Production repository:

- `dist/index.html`
- `dist/buy.html`
- `dist/staking.html`
- `dist/burn.html`
- `dist/wallet.html`
- `dist/download.html`
- `dist/phn.css`
- `dist/phn-app.js`

## Workflow

1. Open Stitch:

```text
https://stitch.withgoogle.com
```

2. Start with the desktop prompt:

```text
C:\ClaudeAgent\outputs\PHN_STITCH_PROMPTS.md
```

Use Prompt 1: Desktop Web App / Website.

3. Generate and review:

- Homepage
- Buy page
- Staking page
- Burn page
- Wallet page
- Download page
- Whitepaper page
- Support page

4. Use Prompt 2 for native/mobile app:

- Splash
- Home
- Buy
- Stake
- Burn
- Node
- Wallet
- Support

5. Ask Stitch to export DESIGN.md:

```text
Create a DESIGN.md file from this PHN design system covering colors, typography, spacing, cards, navigation, forms, buttons, mobile breakpoints, icons and accessibility rules.
```

6. Ask Stitch to produce an AI Studio handoff:

```text
Create a Google AI Studio handoff for this PHN web/mobile app. Include page map, component list, data model assumptions, user flows, wallet connection placeholders, presale calculator behavior, staking tier behavior, burn routing explanation and mobile bottom navigation.
```

7. Open Google AI Studio:

```text
https://aistudio.google.com
```

8. Use this AI Studio implementation prompt:

```text
Build a working frontend prototype for Peaq Human Node ($PHN), using the attached/linked Stitch design as the visual reference.

Project:
- Peaq Human Node by Skymetric Consulting LLP
- peaq-first verified-human DePIN protocol
- Presale, staking, burn, vesting, wallet, node activation and download workflows

Required web routes:
- /
- /buy
- /staking
- /burn
- /wallet
- /download
- /vesting
- /verify
- /whitepaper
- /support

Required mobile tabs:
- Home
- Buy
- Stake
- Node
- Wallet

Functional behavior:
- Wallet connect placeholder for MetaMask, Binance Wallet and WalletConnect
- Add peaq Mainnet button
- Add PHN token button
- Presale calculator: $0.02 epoch 1, $0.05 next epoch
- Fee split: 98% buyer, 0.25% burn, 1.75% treasury
- Staking tiers: Flex 8%, Locked 15%, Vault 25%
- Burn protocol explanation
- Node setup command generator
- Support ticket form

Design rules:
- Light futuristic finance console
- White and pale blue surfaces
- Cyan/green accents
- Inter typography
- 8px radius cards/buttons
- 44px minimum mobile tap targets
- No skewed text
- No overlapping content
- Responsive desktop, tablet and mobile layouts

Do not execute wallet transactions. Do not use real private keys. Treat blockchain actions as UI placeholders unless connected to reviewed production contracts.
```

9. Export usable UI output:

- Keep the generated prototype link.
- Export code if available.
- Bring only reviewed code/design decisions back into this repo.

## Approval Gates

No approval needed:

- Prompt generation.
- UI iteration.
- DESIGN.md export.
- AI Studio prototype generation.

Approval needed:

- Publishing a public Google AI Studio link.
- Publishing to Netlify from Stitch/AI Studio.
- Connecting any wallet.
- Deploying contracts.
- Funding presale, staking or liquidity.

## PHN Design Acceptance Checklist

- Logo visible beside stacked Peaq / Human / Node wordmark.
- First viewport shows $0.02, $0.05 next epoch, burn and token address.
- Desktop buy flow looks like a credible finance console.
- Mobile buy flow works with one thumb.
- Staking cards are balanced and readable.
- Burn protocol is a separate page.
- Wallet setup is obvious.
- Download/PWA install route is clear.
- Whitepaper is one click away from homepage and buy page.
- No footer-only navigation dependency.
- No dark generic crypto template look.
