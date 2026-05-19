# PHN fundraising sale

## Core rules
- 10 rounds
- Round 1 price: `1 PHN = 0.2 PEAQ`
- Every next round increases by `30%`
- Accepted purchase assets: USDT, USDC, ETH, BTC wrappers, PEAQ across supported networks
- Treasury forwarding: received funds route immediately to treasury
- 15-day sell cooldown for sale participants

## Round prices
| Round | PHN price in PEAQ |
|---|---:|
| 1 | 0.2000 |
| 2 | 0.2600 |
| 3 | 0.3380 |
| 4 | 0.4394 |
| 5 | 0.57122 |
| 6 | 0.742586 |
| 7 | 0.9653618 |
| 8 | 1.25497034 |
| 9 | 1.631461442 |
| 10 | 2.1208998746 |

## UX
- show current round
- show round price
- show live tokens remaining
- show countdown / scarcity banner before next round
- show next-round price preview
- show cooldown status after purchase
- show total purchased by wallet
- show whether buyer is whitelisted for prelaunch
- show referral source
- show sale paused / active status

## Extra features added
- prelaunch whitelist
- admin pause switch
- total purchased accounting
- referral attribution hook
- next-round price view

## Important implementation note
The live PHN base token cannot be changed after deployment. Sale-specific cooldowns are therefore enforced by `PHNSaleVesting.sol`: purchased allocations are escrowed and only become claimable after the 15-day lock.
