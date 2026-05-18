# PHN Omnichain Workspace

This workspace carries the LayerZero OFT deployment path for PHN across peaq mainnet and BSC mainnet.

## Supply model
- peaq mainnet is the canonical mint chain.
- peaq deployment mints the full 100,000,000 PHN allocation.
- BSC mainnet later deploys the same OFT contract with zero initial mint.
- Cross-chain transfers burn on source and mint on destination, preserving one global supply.

## Commands
```bash
npm install
npx hardhat compile
npx hardhat deploy --network peaq-mainnet --tags PHNOFT
npx hardhat deploy --network bsc-mainnet --tags PHNOFT
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
npx hardhat lz:oapp:peers:get --oapp-config layerzero.config.ts
```
