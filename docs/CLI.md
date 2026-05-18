# PHN Node CLI

## Purpose
Create a local machine identity, generate a PHN human ID record, and prepare the payload required for node registration.

## Commands
```bash
npm run phn-node -- init
npm run phn-node -- identity
npm run phn-node -- set-operator 0xYourWallet
npm run phn-node -- set-did did:peaq:machine-001
npm run phn-node -- registration-payload
npm run phn-node -- doctor
```

## Local state
- `~/.phn/identity.json`

## Important
- `peaqHumanId` here is a PHN project-defined local identity record, not an official peaq standard.
- Final on-chain registration still requires an authorized attester.
