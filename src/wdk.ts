import WDK from '@tetherto/wdk'

export type WdkSession = {
  seedPhrase: string
  validSeed: boolean
  walletReady: boolean
  address?: string
  chain: string
  disclosure: string
}

export function createLocalWdkSession(): WdkSession {
  try {
    const seedPhrase = WDK.getRandomSeedPhrase(12)
    const validSeed = WDK.isValidSeed(seedPhrase)
    if (validSeed) new WDK(seedPhrase).dispose()

    return {
      seedPhrase,
      validSeed,
      walletReady: validSeed,
      chain: 'WDK core browser runtime',
      disclosure:
        'Powered by @tetherto/wdk: local BIP-39 seed generation, seed validation and WDK instance initialization. No custodian or cloud wallet is used.',
    }
  } catch (error) {
    return {
      seedPhrase: 'WDK browser runtime unavailable in this environment',
      validSeed: false,
      walletReady: false,
      chain: 'WDK fallback',
      disclosure: `@tetherto/wdk is installed and wired, but this browser runtime could not initialize it safely: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export function buildUsdtPaymentUri({
  address,
  amount,
  label,
  memo,
}: {
  address: string
  amount: number
  label: string
  memo: string
}) {
  const params = new URLSearchParams({
    amount: amount.toFixed(2),
    asset: 'USDT',
    label,
    memo,
  })
  return `usdt:${address}?${params.toString()}`
}
