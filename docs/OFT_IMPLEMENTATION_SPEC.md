# OFT implementation spec

## Goal
Extend PHN from a BSC-native token into a unified omnichain asset without fragmenting total supply.

## Target pattern
Use a LayerZero OFT architecture:
- keep the canonical PHN deployment on BSC
- deploy OFT peers on each added chain
- configure trusted peers in both directions
- use one global accounting model across every connected chain

## Required decisions before coding
1. target chains for phase 1
2. direct OFT vs adapter model
3. bridge fee policy
4. rate limits per chain
5. pause authority and emergency process
6. monitoring and reconciliation cadence

## Acceptance tests before launch
- BSC -> chain B transfer
- chain B -> BSC transfer
- paused bridge rejects transfers
- peer misconfiguration fails safely
- global supply reconciles after round trips
- failure recovery procedure tested on testnet
