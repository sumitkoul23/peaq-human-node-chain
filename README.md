# Peaq Human Node Chain (PHN)

A BSC-plus-peaq cryptocurrency system for identity-gated compute nodes.

## Core design
- Fixed global supply target: **100,000,000 PHN**
- Founder allocation: **50,000,000 PHN (50%)** through a dedicated vesting wallet
- Node onboarding requires all three:
  1. hashed PC identity
  2. hashed human-attestation identity
  3. peaq machine DID string
- Reward payouts only go to currently active registered operators
- Privileged controls route through a timelock instead of direct hot-wallet authority

## Multi-chain shape
- `omnichain/` is the LayerZero OFT workspace for PHN across **BSC mainnet** and **peaq mainnet**
- BSC is the canonical mint chain
- peaq receives zero initial mint and participates in the same global supply through burn/mint bridging
- This avoids accidentally creating 200M PHN across two chains

## System contracts
- `PeaqHumanNodeToken.sol` — original single-chain reference implementation
- `NodeIdentityRegistry.sol` — attested node registry
- `NodeRewardVault.sol` — reward distribution gate
- `NodeEarningsManager.sol` — heartbeat-based reward accrual for verified nodes
- `FounderVestingWallet.sol` — founder vesting schedule
- `LaunchTimelock.sol` — delayed privileged execution
- `omnichain/contracts/PHNOFT.sol` — production omnichain token path

## Deployment shape
1. Configure `omnichain/.env`
2. Deploy `PHNOFT` to BSC mainnet with the full initial mint
3. Deploy `PHNOFT` to peaq mainnet with zero initial mint
4. Wire peers with LayerZero
5. Deploy node identity / reward infrastructure on peaq mainnet

## Verified-node earning loop
1. A trusted attester registers a node in `NodeIdentityRegistry`
2. The node operator calls `heartbeat()` on `NodeEarningsManager`
3. Each valid heartbeat accrues PHN at the configured policy rate
4. The operator calls `claim()` to receive earned PHN from `NodeRewardVault`

## Docs
- `docs/ARCHITECTURE.md`
- `docs/TOKENOMICS.md`
- `docs/CROSSCHAIN.md`
- `docs/OFT_IMPLEMENTATION_SPEC.md`
- `docs/LAUNCH_CHECKLIST.md`
- `docs/LIQUIDITY_AND_LISTING_PLAN.md`
- `docs/TOKEN_METADATA_SUBMISSION.md`
- `omnichain/README-PHN.md`
- `dashboard/index.html`
- `site/index.html`

## CLI
```bash
npm run phn-node -- init
npm run phn-node -- doctor
```
