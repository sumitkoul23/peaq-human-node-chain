# Glossary — PHN Project

## Token & Protocol Terms

| Term | Expansion / Meaning |
|------|---------------------|
| PHN | Peaq Human Node — the DePIN token |
| DePIN | Decentralized Physical Infrastructure Network |
| OFT | Omnichain Fungible Token (LayerZero bridge standard) |
| PHNOFT | PHN bridged from BSC to peaq via LayerZero |
| BEP-20 | BSC token standard |
| ERC-20 | Ethereum token standard (also used on peaq EVM) |
| ERC20Burnable | OpenZeppelin extension enabling `burn()` — PHN already has this |
| Heartbeat | Periodic transaction a node sends to NodeEarningsManager to prove liveness and accrue rewards |
| Triple gate | Identity requirement: PC hardware hash + human attestation + peaq DID |
| peaq DID | Decentralized identity on peaq network |

## Presale Terms

| Term | Meaning |
|------|---------|
| Epoch | A presale pricing round with a PHN cap. Auto-advances when cap is hit |
| E1 / Epoch 1 | $0.02 per PHN, 5M PHN cap |
| E2 / Epoch 2 | $0.05 per PHN, 5M PHN cap |
| E3 / Epoch 3 | $0.10 per PHN, 5M PHN cap |
| E4 / Epoch 4 | $0.20 per PHN, 5M PHN cap |
| nativePerUsd | Admin-set rate: how many wei of native token equal $1 USD |
| priceUsdMicro | PHN price stored in micro-USD (1e6 = $1.00, so $0.02 = 20_000) |
| usdMicro | USD amount in micro-USD units |
| PRESALE_CA | Placeholder in buy.html — replace with deployed PHNPresale contract address |

## Staking Terms

| Term | Meaning |
|------|---------|
| FLEX | Staking tier — no lock, 8% APY |
| LOCKED | Staking tier — 90-day lock, 15% APY |
| VAULT | Staking tier — 180-day lock, 25% APY |
| APY BPS | APY in basis points (FLEX=800, LOCKED=1500, VAULT=2500) |
| Reward accrual | Per-second: `amount * apyBps * elapsed / (10_000 * 365 days)` |
| Early penalty | LOCKED: 50% of rewards slashed; VAULT: 100% of rewards slashed |
| STAKING_CA | Placeholder in staking.html — replace with deployed PHNStaking address |

## Smart Contract Patterns

| Term | Meaning |
|------|---------|
| BPS | Basis points. 100 BPS = 1%. 10_000 BPS = 100% |
| SafeERC20 | OpenZeppelin wrapper — prevents bad ERC20 transfers |
| ReentrancyGuard | Prevents re-entrant calls (all state-changing functions) |
| Pausable | Admin can pause/unpause the contract |
| AccessControl | Role-based permissions (DEFAULT_ADMIN_ROLE, SALE_ADMIN_ROLE) |
| IBurnable | Interface to call `burn()` on ERC20Burnable tokens |
| SALE_ADMIN_ROLE | Can update presale price, pause, advance epoch |
| DEFAULT_ADMIN_ROLE | Can update treasury, withdraw unsold PHN |

## Infrastructure Terms

| Term | Meaning |
|------|---------|
| peaq | Layer-1 blockchain for DePIN (Chain ID 3338). Phase 1 target |
| BSC | BNB Smart Chain (Chain ID 56). Phase 2 target. PHN deployed here |
| LayerZero | Cross-chain messaging protocol used for OFT bridge |
| Netlify | Free hosting platform (primary). Config: netlify.toml |
| Fleek | Free IPFS hosting. Config: fleek.json |
| GitHub Pages | Free static hosting via CI/CD. Config: .github/workflows/deploy.yml |
| Hardhat | Ethereum dev framework used for all contract compilation + deployment |
| ethers.js v6 | JavaScript Web3 library used in all frontend pages |
| MetaMask | Browser wallet targeted by staking + presale UI |

## Social / Listing Terms

| Term | Meaning |
|------|---------|
| CoinSniper | Token discovery/listing site. Listing form at C:\ClaudeAgent\social_media\coinsniper_listing_form.txt |
| CMC | CoinMarketCap — listing target (post-launch) |
| CoinGecko | Token price aggregator — listing target (post-launch) |
| PancakeSwap | BSC DEX for PHN/BNB trading pair |
| Mudra | LP lock service (mudra.website) |
| LP | Liquidity Provider tokens (represents share of DEX liquidity pool) |
