# Context — Skymetric Consulting LLP / PHN

## The Company
**Skymetric Consulting LLP** — solo founder/builder. Zero budget. Building PHN as a DePIN project on BSC + peaq mainnet.

## The Project
**Peaq Human Node (PHN)** — identity-gated compute reward protocol. Nodes must prove they're human (PC hash + attestation + peaq DID), then send heartbeats to earn PHN.

## Current State (2026-05-19)
- Token live on BSC: `0x83e2A4aB24A61d138f12569c497C3E5f2BF8694B`
- Full website built (5 pages: index, buy, staking, verify, vesting)
- Contracts written but not deployed: PHNStaking, PHNPresale
- Social accounts: not yet created
- Hosting: not yet connected to GitHub

## Tools in Use
- Hardhat (contract development + deployment)
- OpenZeppelin v5 (contract libraries)
- ethers.js v6 (frontend Web3)
- Netlify (hosting — free)
- GitHub Pages (backup hosting — free)
- Fleek IPFS (web3 hosting — free)

## Key Constraint
**Zero budget** — everything must use free tiers. No Chainlink (not available on peaq), no paid oracles, no paid hosting, no paid tools.

## Deployment Targets (in order)
1. peaq Mainnet (Chain 3338) — primary, PHN's home chain
2. BSC Mainnet (Chain 56) — largest audience
3. Ethereum Mainnet — future phase
