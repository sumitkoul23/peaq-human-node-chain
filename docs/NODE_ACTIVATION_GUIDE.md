# PHN node activation guide

## Before you begin
You need:
1. a PHN-compatible wallet address
2. a peaq machine DID
3. the PHN Node CLI or PHN Beacon mobile app

## Windows
```powershell
git clone <repo-url>
cd peaq-human-node-chain
npm install
npm run phn-node -- init
npm run phn-node -- set-operator 0xYourWallet
npm run phn-node -- set-did did:peaq:your-machine
npm run phn-node -- doctor
npm run phn-node -- registration-payload
```

## macOS
```bash
git clone <repo-url>
cd peaq-human-node-chain
npm install
npm run phn-node -- init
npm run phn-node -- set-operator 0xYourWallet
npm run phn-node -- set-did did:peaq:your-machine
npm run phn-node -- doctor
npm run phn-node -- registration-payload
```

## Linux / Ubuntu
```bash
sudo apt update
sudo apt install -y git nodejs npm
git clone <repo-url>
cd peaq-human-node-chain
npm install
npm run phn-node -- init
npm run phn-node -- set-operator 0xYourWallet
npm run phn-node -- set-did did:peaq:your-machine
npm run phn-node -- doctor
npm run phn-node -- registration-payload
```

## Mobile app
1. Install PHN Beacon.
2. Connect wallet.
3. Verify the device.
4. Attach the peaq machine DID.
5. Start node mode.
6. Keep heartbeat service active.
7. Claim rewards after they accrue.

## Registration flow
1. Generate local identity
2. Attach operator wallet
3. Attach machine DID
4. Produce registration payload
5. Submit to an authorized attester
6. Once approved, start heartbeats

## After activation
- monitor uptime
- keep the device online
- claim rewards
- maintain wallet security
- update node software regularly
