import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Shield, Ticket, Users, Wallet } from 'lucide-react'
import './App.css'
import { buildUsdtPaymentUri, createLocalWdkSession, type WdkSession } from './wdk'

type Participant = {
  name: string
  wallet: string
  paid: boolean
}

const DEFAULT_PARTICIPANTS: Participant[] = [
  { name: 'Mide', wallet: '0x7B8c2eA2fE4c5a9196d42fb93A10D6FcA9D129F4', paid: true },
  { name: 'Tomi', wallet: '0xA91e1D3C8b1f4c0a71a0D31d05A6A2468D0fB78C', paid: false },
  { name: 'Ada', wallet: '0x35dB7F75d5B72f067F2247F98Eb19e7AF5a88ddA', paid: false },
  { name: 'Kunle', wallet: '0x1F4d44c785EADaFcf11277cf6C24c5F79d9f9F82', paid: true },
  { name: 'Zainab', wallet: '0xe4D208a1FAbC32b48C088ADc39a93Df741C26F19', paid: false },
  { name: 'Chidi', wallet: '0x89AB492f515e8c27E76A32cD632d3DE80d6B1f4e', paid: false },
]

const DEFAULT_WDK: WdkSession = {
  seedPhrase: 'loading',
  validSeed: false,
  walletReady: false,
  chain: 'Initializing WDK',
  disclosure: 'Initializing local self-custodial wallet primitive.',
}

function currency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function short(text?: string) {
  if (!text) return 'Pending'
  return text.length > 24 ? `${text.slice(0, 8)}...${text.slice(-6)}` : text
}

function Nav() {
  return (
    <nav className="nav">
      <a className="logo" href="/" aria-label="MatchPot home"><span>MatchPot</span></a>
      <div className="navLinks">
        <a href="/#how">How it works</a>
        <a href="/dashboard">Dashboard</a>
        <a href="https://github.com/mystiquemide/matchpot" target="_blank">GitHub</a>
      </div>
    </nav>
  )
}

function LandingPage() {
  return (
    <main>
      <Nav />

      <section className="landingHero" id="top">
        <div className="heroCopy">
          <p className="kicker">USDT pots for match days</p>
          <h1>One calm place to split football costs.</h1>
          <p className="lede">
            Create a pot for tickets, food, transport or jerseys. Share one USDT request per fan.
            Track settlement without chasing people in group chats.
          </p>
          <div className="heroActions">
            <a href="/dashboard" className="button dark">Open dashboard</a>
            <a href="#how" className="button light">See how it works</a>
          </div>
        </div>

        <aside className="phoneCard" aria-label="MatchPot preview">
          <div className="phoneTop">
            <span>Nigeria vs Argentina</span>
            <strong>$72</strong>
          </div>
          <div className="phoneSplit">
            <span>Each fan pays</span>
            <strong>$12</strong>
          </div>
          <div className="miniList">
            <div><span>Mide</span><b>Settled</b></div>
            <div><span>Tomi</span><b>Waiting</b></div>
            <div><span>Ada</span><b>Waiting</b></div>
            <div><span>Kunle</span><b>Settled</b></div>
          </div>
        </aside>
      </section>

      <section className="logos" aria-label="Product values">
        <span>Watch parties</span>
        <span>Team dues</span>
        <span>Tickets</span>
        <span>Transport</span>
        <span>Merch</span>
      </section>

      <section className="how" id="how">
        <div>
          <p className="kicker">How it works</p>
          <h2>Built for the actual messy match-day payment moment.</h2>
        </div>
        <div className="steps">
          <article>
            <span>01</span>
            <h3>Create the pot</h3>
            <p>Add the match, group and total amount. MatchPot calculates everyone’s share.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Share USDT requests</h3>
            <p>Each fan gets a clean payment URI and QR code for their own contribution.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Close the tab</h3>
            <p>Mark who has paid and see the total collected before the game ends.</p>
          </article>
        </div>
      </section>

      <section className="landingCta">
        <p className="kicker">Ready for the match</p>
        <h2>Run the payment flow from one focused dashboard.</h2>
        <a href="/dashboard" className="button dark">Launch dashboard</a>
      </section>

      <footer>
        <span>MatchPot</span>
        <a href="https://github.com/mystiquemide/matchpot" target="_blank">Source code</a>
        <span>Apache 2.0</span>
      </footer>
    </main>
  )
}

function DashboardPage() {
  const [match, setMatch] = useState('Nigeria vs Argentina')
  const [venue, setVenue] = useState('Benin City watch party')
  const [total, setTotal] = useState(72)
  const [participants, setParticipants] = useState(DEFAULT_PARTICIPANTS)
  const [selected, setSelected] = useState(1)
  const [qr, setQr] = useState('')
  const [copied, setCopied] = useState(false)
  const [wdk, setWdk] = useState<WdkSession>(DEFAULT_WDK)

  useEffect(() => {
    setWdk(createLocalWdkSession())
  }, [])

  const share = total / participants.length
  const paidCount = participants.filter((p) => p.paid).length
  const paidTotal = paidCount * share
  const selectedParticipant = participants[selected]
  const paymentUri = useMemo(
    () => buildUsdtPaymentUri({
      address: selectedParticipant.wallet,
      amount: share,
      label: `${match} MatchPot`,
      memo: `${venue} contribution for ${selectedParticipant.name}`,
    }),
    [match, venue, selectedParticipant, share],
  )

  useEffect(() => {
    QRCode.toDataURL(paymentUri, { margin: 1, width: 212, color: { dark: '#111111', light: '#ffffff' } }).then(setQr)
  }, [paymentUri])

  function togglePaid(index: number) {
    setParticipants((current) => current.map((p, i) => (i === index ? { ...p, paid: !p.paid } : p)))
  }

  async function copyRequest() {
    await navigator.clipboard.writeText(paymentUri)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <main>
      <Nav />

      <section className="dashboardHeader">
        <div>
          <p className="kicker">Dashboard</p>
          <h1>Match pot control room.</h1>
          <p className="lede">Create the pot, send the payment request, then mark settlement as fans pay.</p>
        </div>
        <div className="summaryCard">
          <span>Total pot</span>
          <strong>{currency(total)}</strong>
          <p>{paidCount} of {participants.length} paid</p>
        </div>
      </section>

      <section className="dashboardGrid">
        <section className="panel setupPanel">
          <div className="panelTitle">
            <span>1</span>
            <h3>Create pot</h3>
          </div>
          <label>
            Match
            <input value={match} onChange={(e) => setMatch(e.target.value)} />
          </label>
          <label>
            Group
            <input value={venue} onChange={(e) => setVenue(e.target.value)} />
          </label>
          <label>
            Total cost in USDT
            <input type="number" min="1" value={total} onChange={(e) => setTotal(Number(e.target.value || 0))} />
          </label>
          <div className="splitCard">
            <span>{participants.length} fans</span>
            <strong>{currency(share)} each</strong>
          </div>
        </section>

        <section className="panel requestPanel">
          <div className="panelTitle">
            <span>2</span>
            <h3>Payment request</h3>
          </div>
          <div className="fanTabs">
            {participants.map((p, i) => (
              <button key={p.wallet} className={selected === i ? 'selected' : ''} onClick={() => setSelected(i)}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="qrWrap">{qr && <img src={qr} alt="USDT payment QR code" />}</div>
          <div className="requestMeta">
            <span>{selectedParticipant.name}</span>
            <code>{short(selectedParticipant.wallet)}</code>
            <strong>{currency(share)} USDT</strong>
          </div>
          <button className="copyButton" onClick={copyRequest}><Copy size={16} /> {copied ? 'Copied' : 'Copy payment request'}</button>
        </section>

        <section className="panel settlementPanel">
          <div className="panelTitle">
            <span>3</span>
            <h3>Settlement</h3>
          </div>
          <div className="settlementList">
            {participants.map((p, i) => (
              <button key={p.wallet} className={p.paid ? 'paid' : ''} onClick={() => togglePaid(i)}>
                <span>{p.name}</span>
                <code>{short(p.wallet)}</code>
                <strong>{p.paid ? 'Paid' : currency(share)}</strong>
              </button>
            ))}
          </div>
          <div className="progressTrack"><div style={{ width: `${(paidTotal / total) * 100}%` }} /></div>
          <p>{paidCount} of {participants.length} paid. {currency(paidTotal)} collected.</p>
        </section>
      </section>

      <section className="proof dashboardProof">
        <div>
          <p className="kicker">WDK proof</p>
          <h2>Self-custody first, without making the user feel crypto-native.</h2>
          <p>
            MatchPot uses Tether WDK in the browser for local seed generation, validation and WDK initialization.
            The repository includes an EVM wallet manager proof script for address derivation.
          </p>
        </div>
        <div className="proofCards">
          <article><Wallet /><span>WDK runtime</span><strong>{wdk.walletReady ? 'Ready' : 'Starting'}</strong></article>
          <article><Shield /><span>Seed valid</span><strong>{wdk.validSeed ? 'Yes' : 'Pending'}</strong></article>
          <article><Ticket /><span>Payment asset</span><strong>USDT</strong></article>
          <article><Users /><span>Wallet layer</span><strong>{wdk.chain}</strong></article>
        </div>
      </section>
    </main>
  )
}

function App() {
  return window.location.pathname === '/dashboard' ? <DashboardPage /> : <LandingPage />
}

export default App
