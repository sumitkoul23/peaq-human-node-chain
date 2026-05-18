# PHN economic layer

- Prelaunch reference price: `0.2 PEAQ / PHN`
- Public reference price: `0.6 PEAQ / PHN`
- Minimum buy: admin-set PEAQ threshold equivalent to `$10` at launch
- Official routed fee: `1%`
- Burn share of fee: `25%`
- Remaining fee share: `75%` to owner treasury
- Fee recipient: `0x7fb31d8b2b5cbed4d6e02768664a299d303ea4c2`

## Modules
- `PHNSale.sol` — sale path for prelaunch and public sale pricing
- `PHNFeeRouter.sol` — 1% routed fee with burn split
- `PHNStaking.sol` — staking and holder-reward foundation

## Liquidity
1. Launch `PHN / PEAQ` on MachineX.
2. Add `PHN / USDT` and `PHN / USDC` when sufficient bridged stablecoin liquidity exists.
3. Add BNB routes only after the BSC expansion path is live.
4. Use the 10M PHN liquidity allocation in tranches, not all at once.

## Wallet and exchange surfaces
- `site/wallet.html` — peaq EVM wallet UI scaffold
- `site/dex.html` — PHN exchange UI scaffold

## Important
The live PHN token contract is already immutable, so these economics must sit around the token rather than mutate its original bytecode.
