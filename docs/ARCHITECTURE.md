# Architecture

```mermaid
flowchart LR
    A[PC fingerprint hash] --> D[NodeIdentityRegistry]
    B[Human attestation hash] --> D
    C[peaq machine DID] --> D
    D --> E[Eligible node operator]
    E --> L[NodeEarningsManager]
    L --> F[NodeRewardVault]
    F --> G[PHN token rewards]
    J[FounderVestingWallet] --> G
    K[LaunchTimelock] --> D
    K --> F
    G --> H[BSC deployment]
    H --> I[Future LayerZero OFT expansion]
```

## Feature expansion ideas
- node uptime proofs
- proof-of-useful-work receipts
- machine reputation tiers
- operator staking and slashing
- DAO governance for reward curves
- NFT node passports
- service marketplace fees paid in PHN
- emissions schedule from reward vault instead of discretionary rewards
- heartbeat-based rewards for verified nodes
