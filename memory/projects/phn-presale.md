# Project: PHN Presale

## Status
**BUILT — Awaiting deployment (needs gas + peaq contract addresses)**

## What it is
On-site token presale. Buyers send PEAQ or USDC directly to PHNPresale.sol and receive PHN at the current epoch price. 2% fee on every purchase: 0.25% burned (deflationary), 1.75% to treasury.

## Epoch Pricing
| Epoch | Price | Cap | Status |
|-------|-------|-----|--------|
| 0 | $0.02 | 5M PHN | Active (launch) |
| 1 | $0.05 | 5M PHN | Next |
| 2 | $0.10 | 5M PHN | Future |
| 3 | $0.20 | 5M PHN | Future |

## Key Files
- `contracts/PHNPresale.sol` — smart contract
- `scripts/deployPresale.js` — deployment script (fill PHN_TOKEN_PEAQ, USDC_PEAQ, TREASURY_WALLET, PEAQ_PRICE_USD)
- `dist/buy.html` — frontend UI

## Deployment Checklist
1. Get PHNOFT address on peaq (after LayerZero bridge setup)
2. Get USDC contract address on peaq
3. Fill `scripts/deployPresale.js` config constants
4. Run: `npx hardhat run scripts/deployPresale.js --network peaq`
5. Copy deployed address → replace `PRESALE_CA` in `dist/buy.html`
6. Fund presale with 5M PHN (script does this automatically)

## Phase Roadmap
- Phase 1: peaq (PEAQ native + USDC)
- Phase 2: BSC (BNB + USDC)
- Phase 3: ETH + BTC (future)
