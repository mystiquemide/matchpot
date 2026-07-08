# MatchPot

A self-custodial USDT match-night pot for football fans.

MatchPot helps fan groups split watch-party costs, tickets, transport, jerseys, pub tabs, and team dues without chasing bank transfers in group chats.

## Tether Developers Cup fit

- **Track:** WDK
- **Theme:** football / global tournament watch parties
- **Stack:** React, TypeScript, Vite, `@tetherto/wdk`, QR payment requests
- **License:** Apache-2.0

## What it does

1. Create a football match pot.
2. Add a total cost and participants.
3. Split the amount equally in USDT.
4. Generate a USDT payment request QR for each fan.
5. Track paid/unpaid status.
6. Export the settlement story for the demo.

## WDK usage

MatchPot uses Tether WDK as the wallet primitive:

- Generates a local BIP-39 seed with `WDK.getRandomSeedPhrase(12)`.
- Validates the seed with `WDK.isValidSeed()`.
- Initializes a local `WDK` instance in the browser.
- Includes `@tetherto/wdk-wallet-evm` for the wallet-manager layer.
- Provides `npm run wdk:address` to prove EVM wallet manager registration and account address derivation from a local seed.

The current MVP is intentionally safe for judges to run without private keys, RPC secrets, or funded wallets. It generates USDT payment requests and settlement tracking. Live USDT transaction broadcast is the next integration step after choosing the target testnet and funding a test account.

```bash
npm run wdk:address
```

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Demo script, under 90 seconds

Nigeria fans are watching a tournament match together. One person pays for food, drinks, transport, and jerseys. Instead of chasing bank transfers in WhatsApp, they open MatchPot, create a match-night pot, split the total in USDT, and share a payment request QR with each fan. Everyone pays from a self-custodial wallet flow, and the organiser sees a clean settlement board.

## Submission disclosure

This build uses `@tetherto/wdk` for local self-custodial wallet seed generation, validation, and WDK instance initialization. It also includes an EVM wallet-manager proof script with `@tetherto/wdk-wallet-evm`. The payment request flow is designed for USDT/WDK wallet send flows. No cloud AI APIs, custodian wallets, or unrelated sponsor-name decoration are used.
