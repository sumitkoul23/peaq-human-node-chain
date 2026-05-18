# Cross-chain roadmap

## Final launch topology
- **BSC mainnet:** canonical mint chain for PHN
- **peaq mainnet:** zero-initial-mint OFT peer for machine-economy-native use
- **LayerZero V2:** cross-chain transport preserving one global supply

## Deployment order
1. Deploy BSC PHNOFT with initial allocations
2. Deploy peaq PHNOFT with no initial supply
3. Wire the BSC <-> peaq pathway
4. Verify peers and transfer a tiny test amount
5. Deploy peaq-native registry/reward infrastructure

## Why this shape
Cross-chain tokens are distributed systems, not duplicated ERC-20s. Separate full-supply deployments on BSC and peaq would create two independent economies. PHN instead uses one canonical mint plus burn/mint movement across OFT peers.
