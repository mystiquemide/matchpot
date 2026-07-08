import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Copy, Shield, Ticket, Users, Wallet, Zap } from 'lucide-react'
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

function App() {
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
    () =>
      buildUsdtPaymentUri({
        address: selectedParticipant.wallet,
        amount: share,
        label: `${match} MatchPot`,
        memo: `${venue} contribution for ${selectedParticipant.name}`,
      }),
    [match, venue, selectedParticipant, share],
  )

  useEffect(() => {
    QRCode.toDataURL(paymentUri, { margin: 1, width: 220, color: { dark: '#08110d', light: '#f7fff9' } }).then(setQr)
  }, [paymentUri])

  function togglePaid(index: number) {
    setParticipants((current) =>
      current.map((p, i) => (i === index ? { ...p, paid: !p.paid } : p)),
    )
  }

  async function copyRequest() {
    await navigator.clipboard.writeText(paymentUri)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main>
      <header className="topbar">
        <div className="brandMark">MP</div>
        <div>
          <strong>MatchPot</strong>
          <span>WDK powered USDT settlement</span>
        </div>
        <a href="https://github.com/mystiquemide/matchpot" target="_blank">GitHub</a>
      </header>

      <section className="hero">
        <div className="eyebrow">Football fan payments, settled cleanly</div>
        <h1>Split the match night. Settle in USDT.</h1>
        <p className="lede">
          MatchPot creates a shared pot for watch parties, team dues, ticket bundles,
          transport and merch. Fans get clear USDT payment requests. Organisers get a clean settlement board.
        </p>
        <div className="heroActions">
          <a href="#workspace" className="primaryLink">Open pot</a>
          <a href="#proof" className="secondaryLink">View WDK proof</a>
        </div>
      </section>

      <section className="metrics">
        <div className="metric">
          <Wallet />
          <span>WDK wallet manager</span>
          <strong>{wdk.walletReady ? 'Ready' : 'Starting'}</strong>
        </div>
        <div className="metric">
          <Users />
          <span>Fans in pot</span>
          <strong>{participants.length}</strong>
        </div>
        <div className="metric">
          <Ticket />
          <span>Each fan pays</span>
          <strong>{currency(share)}</strong>
        </div>
        <div className="metric">
          <Shield />
          <span>Custody</span>
          <strong>Self-custody</strong>
        </div>
      </section>

      <section className="workspace" id="workspace">
        <div className="panel setupPanel">
          <div className="panelHeader">
            <span>01</span>
            <h2>Create match pot</h2>
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
            <input
              type="number"
              min="1"
              value={total}
              onChange={(e) => setTotal(Number(e.target.value || 0))}
            />
          </label>
          <div className="costCard">
            <span>Split across {participants.length} fans</span>
            <strong>{currency(share)}</strong>
          </div>
        </div>

        <div className="panel payPanel">
          <div className="panelHeader">
            <span>02</span>
            <h2>Send payment request</h2>
          </div>
          <div className="fanSelect">
            {participants.map((p, i) => (
              <button key={p.wallet} className={selected === i ? 'active' : ''} onClick={() => setSelected(i)}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="qrCard">{qr && <img src={qr} alt="USDT payment QR code" />}</div>
          <div className="requestLine">
            <span>{selectedParticipant.name}</span>
            <code>{short(selectedParticipant.wallet)}</code>
            <strong>{currency(share)} USDT</strong>
          </div>
          <button className="primaryButton" onClick={copyRequest}><Copy size={16} /> {copied ? 'Copied' : 'Copy request'}</button>
        </div>

        <div className="panel settlePanel">
          <div className="panelHeader">
            <span>03</span>
            <h2>Track settlement</h2>
          </div>
          <div className="settleList">
            {participants.map((p, i) => (
              <button key={p.wallet} className={`settleRow ${p.paid ? 'paid' : ''}`} onClick={() => togglePaid(i)}>
                <span>{p.name}</span>
                <code>{short(p.wallet)}</code>
                <strong>{p.paid ? 'Paid' : currency(share)}</strong>
              </button>
            ))}
          </div>
          <div className="progress"><div style={{ width: `${(paidTotal / total) * 100}%` }} /></div>
          <p className="settleSummary">{paidCount} of {participants.length} paid. {currency(paidTotal)} collected.</p>
        </div>
      </section>

      <section className="proofPanel" id="proof">
        <div>
          <div className="eyebrow">WDK integration</div>
          <h2>Local wallet primitive, not a custodial checkout</h2>
          <p>
            MatchPot uses Tether WDK in the browser to create and validate a local seed and initialize a WDK instance.
            A repo script also proves EVM wallet manager registration and address derivation for the live wallet layer.
          </p>
        </div>
        <div className="proofGrid">
          <div><Check /><span>Seed valid</span><strong>{wdk.validSeed ? 'Yes' : 'Pending'}</strong></div>
          <div><Zap /><span>Chain module</span><strong>{wdk.chain}</strong></div>
          <div><Wallet /><span>CLI address proof</span><strong>{wdk.address ? short(wdk.address) : 'Script included'}</strong></div>
        </div>
      </section>
    </main>
  )
}

export default App
