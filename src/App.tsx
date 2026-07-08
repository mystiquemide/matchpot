import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { CheckCircle2, Copy, ShieldCheck, Trophy, Users, Wallet } from 'lucide-react'
import './App.css'
import { buildUsdtPaymentUri, createLocalWdkSession } from './wdk'

type Participant = {
  name: string
  wallet: string
  paid: boolean
}

const DEFAULT_PARTICIPANTS: Participant[] = [
  { name: 'Mide', wallet: 'USDT-NG-MIDE-001', paid: true },
  { name: 'Tomi', wallet: 'USDT-NG-TOMI-002', paid: false },
  { name: 'Ada', wallet: 'USDT-NG-ADA-003', paid: false },
  { name: 'Kunle', wallet: 'USDT-NG-KUNLE-004', paid: true },
  { name: 'Zainab', wallet: 'USDT-NG-ZAINAB-005', paid: false },
  { name: 'Chidi', wallet: 'USDT-NG-CHIDI-006', paid: false },
]

function currency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function short(text: string) {
  return text.length > 26 ? `${text.slice(0, 12)}…${text.slice(-8)}` : text
}

function App() {
  const [match, setMatch] = useState('Nigeria vs Argentina')
  const [venue, setVenue] = useState('Benin City Watch Party')
  const [total, setTotal] = useState(72)
  const [participants, setParticipants] = useState(DEFAULT_PARTICIPANTS)
  const [selected, setSelected] = useState(1)
  const [qr, setQr] = useState('')
  const [copied, setCopied] = useState(false)

  const wdk = useMemo(() => createLocalWdkSession(), [])
  const share = total / participants.length
  const paidTotal = participants.filter((p) => p.paid).length * share
  const selectedParticipant = participants[selected]
  const paymentUri = buildUsdtPaymentUri({
    address: selectedParticipant.wallet,
    amount: share,
    label: `${match} MatchPot`,
    memo: `${venue} contribution for ${selectedParticipant.name}`,
  })

  useEffect(() => {
    QRCode.toDataURL(paymentUri, { margin: 1, width: 240 }).then(setQr)
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
      <section className="hero">
        <div className="badge"><Trophy size={16} /> Tether Developers Cup · WDK Track</div>
        <h1>MatchPot</h1>
        <p className="lede">
          A self-custodial USDT match-night pot for football fans to split watch-party costs,
          team dues, tickets, transport, and merch without chasing transfers in group chats.
        </p>
        <div className="heroGrid">
          <div className="card stat">
            <Wallet />
            <span>WDK local wallet primitive</span>
            <strong>{wdk.walletReady ? 'Ready' : 'Unavailable'}</strong>
          </div>
          <div className="card stat">
            <Users />
            <span>Fans in pot</span>
            <strong>{participants.length}</strong>
          </div>
          <div className="card stat">
            <ShieldCheck />
            <span>Custody model</span>
            <strong>Self-custody</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <div className="card planner">
          <h2>Create match pot</h2>
          <label>
            Match
            <input value={match} onChange={(e) => setMatch(e.target.value)} />
          </label>
          <label>
            Venue / group
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
          <div className="splitBox">
            <span>Each fan pays</span>
            <strong>{currency(share)}</strong>
          </div>
          <p className="tiny">Use case: food, drinks, jersey order, match ticket bundle, transport, venue booking.</p>
        </div>

        <div className="card request">
          <h2>USDT payment request</h2>
          <div className="fanSelect">
            {participants.map((p, i) => (
              <button key={p.wallet} className={selected === i ? 'active' : ''} onClick={() => setSelected(i)}>
                {p.name}
              </button>
            ))}
          </div>
          <div className="qrWrap">{qr && <img src={qr} alt="USDT payment QR code" />}</div>
          <div className="uri">{short(paymentUri)}</div>
          <button className="primary" onClick={copyRequest}><Copy size={16} /> {copied ? 'Copied' : 'Copy payment request'}</button>
        </div>

        <div className="card board">
          <h2>Settlement board</h2>
          {participants.map((p, i) => (
            <button key={p.wallet} className={`row ${p.paid ? 'paid' : ''}`} onClick={() => togglePaid(i)}>
              <span>{p.name}</span>
              <code>{short(p.wallet)}</code>
              <strong>{p.paid ? 'Paid' : currency(share)}</strong>
            </button>
          ))}
          <div className="progress">
            <div style={{ width: `${(paidTotal / total) * 100}%` }} />
          </div>
          <p>{currency(paidTotal)} collected of {currency(total)}</p>
        </div>
      </section>

      <section className="card proof">
        <h2>Why this satisfies the WDK track</h2>
        <ul>
          <li><CheckCircle2 /> Uses <code>@tetherto/wdk</code> to generate and validate a local self-custodial seed.</li>
          <li><CheckCircle2 /> Payment requests are USDT-first and designed for WDK wallet send flows.</li>
          <li><CheckCircle2 /> No custodian, no bank account, no cloud wallet dependency in the MVP.</li>
          <li><CheckCircle2 /> The UX is football-specific: match pots, fan groups, watch parties and team expenses.</li>
        </ul>
        <details>
          <summary>Judge disclosure</summary>
          <p>{wdk.disclosure}</p>
          <p>Seed generated for this demo: <code>{wdk.seedPhrase}</code></p>
        </details>
      </section>
    </main>
  )
}

export default App
