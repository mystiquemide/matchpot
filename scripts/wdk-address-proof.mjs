import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'

const seedPhrase = WDK.getRandomSeedPhrase(12)
const wdk = new WDK(seedPhrase)
wdk.registerWallet('ethereum', WalletManagerEvm, {
  provider: 'https://eth.drpc.org',
})

const account = await wdk.getAccount('ethereum', 0)
const address = await account.getAddress()
console.log(JSON.stringify({
  seedValid: WDK.isValidSeed(seedPhrase),
  wallet: 'ethereum',
  address,
}, null, 2))

wdk.dispose()
