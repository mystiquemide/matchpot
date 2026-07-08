# MatchPot memory

## Project identity
- Hackathon: Tether Developers Cup
- Product: MatchPot
- Track: WDK
- Positioning: self-custodial USDT match-night pot for football fans and watch parties.

## Scope
- Minimal MVP: create match pot, split total, generate USDT payment request QR, track paid/unpaid.
- No QVAC. No Pears for first version.
- Must stay football-themed and judge-runnable.

## WDK notes
- Installed package: @tetherto/wdk@1.0.0-beta.14.
- App uses WDK.getRandomSeedPhrase, WDK.isValidSeed, and WDK constructor/dispose for local self-custodial wallet primitive proof.
- Full broadcast adapter is stretch; do not overclaim live on-chain payments until chain wallet manager is registered and tested.

## Commands
- npm install
- npm run build
- npm run dev

## Demo story
Nigeria vs Argentina watch party, $72 cost, six friends, $12 each, QR payment request, settlement board.
