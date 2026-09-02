"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Camera,
  Check,
  Clock3,
  Flame,
  Megaphone,
  Send,
  Skull,
  Trophy,
} from "lucide-react"

const losers = [
  {
    name: "Teece",
    league: "Premiership",
    points: 40,
    task: "Bring the snacks next matchday",
    initials: "T",
  },
  {
    name: "Quinn",
    league: "Championship",
    points: 23,
    task: "Read the group chat apology",
    initials: "Q",
  },
]
const variants = ["The Reveal", "Group Chat", "The Slip", "Mission Control", "Wanted Wall"]

function Face({ initials, muted = false }: { initials: string; muted?: boolean }) {
  return <div className={`hv-face ${muted ? "hv-face-muted" : ""}`}>{initials}</div>
}
function TinyProof() {
  return (
    <div className="hv-proof">
      <span>
        PREM <b>774</b>
      </span>
      <i>vs</i>
      <span>
        CHAMP <b>763</b>
      </span>
      <em>Winners: Pete 71 · Jam 75</em>
    </div>
  )
}
function ForfeitPair({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`hv-forfeit-pair ${compact ? "hv-compact" : ""}`}>
      {losers.map((p, i) => (
        <article className="hv-forfeit-card" key={p.name}>
          <div className="hv-card-top">
            <span>{i === 0 ? "01" : "02"}</span>
            <span>FORFEIT DUE</span>
          </div>
          <Face initials={p.initials} />
          <h2>{p.name}</h2>
          <p>
            {p.league} · {p.points} pts
          </p>
          <strong>{p.task}</strong>
          <small>Owes the group chat</small>
        </article>
      ))}
    </div>
  )
}
function Reveal() {
  return (
    <section className="hv-new hv-reveal">
      <div className="hv-eyebrow">
        PLAYBALL DRAFT <span>GAMEWEEK 07</span>
      </div>
      <div className="hv-reveal-title">
        <small>THE MOMENT OF TRUTH</small>
        <h1>
          WHO&apos;S
          <br />
          <em>COOKED?</em>
        </h1>
        <p>Two forfeits. No excuses.</p>
      </div>
      <ForfeitPair />
      <TinyProof />
    </section>
  )
}
function Chat() {
  return (
    <section className="hv-new hv-chat">
      <div className="hv-chat-head">
        <div>
          <span>THE GROUP CHAT</span>
          <h1>
            Sunday
            <br />
            <em>roast.</em>
          </h1>
        </div>
        <div className="hv-live">
          <i /> 16 online
        </div>
      </div>
      <div className="hv-message hv-system">
        <Megaphone size={15} /> Gameweek 07 is final. The damage is done.
      </div>
      <div className="hv-message hv-roast">
        <Face initials="P" />
        <div>
          <b>Pete</b>
          <p>Respectfully… someone has to own this week.</p>
          <small>now</small>
        </div>
      </div>
      <div className="hv-message hv-verdict">
        <Flame size={18} />
        <div>
          <b>THE FORFEIT ROLL CALL</b>
          <p>Teece and Quinn, please report to the chat.</p>
        </div>
      </div>
      <ForfeitPair compact />
      <button type="button" className="hv-share">
        <Send size={15} /> Share the shame
      </button>
    </section>
  )
}
function Slip() {
  return (
    <section className="hv-new hv-slip">
      <div className="hv-slip-brand">
        <span>PB</span>
        <div>
          PLAYBALL DRAFT
          <br />
          <b>OFFICIAL FORFEIT RECEIPT</b>
        </div>
        <span>07</span>
      </div>
      <div className="hv-slip-alert">
        <AlertTriangle size={20} />
        <div>
          <b>UNFORTUNATE RESULT</b>
          <span>These entries have been settled.</span>
        </div>
      </div>
      <h1>
        THE
        <br />
        <em>LOSING SLIP</em>
      </h1>
      {losers.map((p) => (
        <div className="hv-slip-line" key={p.name}>
          <div>
            <span>{p.league}</span>
            <b>{p.name}</b>
            <small>{p.task}</small>
          </div>
          <strong>
            {p.points}
            <i>PTS</i>
          </strong>
        </div>
      ))}
      <div className="hv-slip-total">
        <span>TOTAL FORFEITS DUE</span>
        <b>2</b>
      </div>
      <p className="hv-slip-foot">
        Present this receipt to the group chat. No cash value. No appeals.
      </p>
      <TinyProof />
    </section>
  )
}
function Mission() {
  return (
    <section className="hv-new hv-mission">
      <div className="hv-mission-bar">
        <span>
          <i /> LIVE OPERATIONS
        </span>
        <span>GW 07 / 16 PLAYERS</span>
      </div>
      <div className="hv-mission-hero">
        <small>MISSION STATUS</small>
        <h1>
          FORFEIT
          <br />
          <em>PROTOCOL</em>
        </h1>
        <div className="hv-countdown">
          <Clock3 size={18} />
          <b>2</b>
          <span>
            players
            <br />
            to brief
          </span>
        </div>
      </div>
      <div className="hv-objective">
        <span>PRIMARY OBJECTIVE</span>
        <b>Identify the weekly casualties</b>
        <small>Both targets are below the safe line.</small>
      </div>
      {losers.map((p, i) => (
        <div className="hv-agent" key={p.name}>
          <div className="hv-agent-number">0{i + 1}</div>
          <Face initials={p.initials} />
          <div>
            <b>{p.name}</b>
            <span>
              {p.league} / {p.points} pts
            </span>
          </div>
          <strong>
            BRIEF
            <br />
            DUE
          </strong>
        </div>
      ))}
      <div className="hv-mission-foot">
        <Check size={14} /> Winners cleared: Pete · Jam <span>Prem 774 / Champ 763</span>
      </div>
    </section>
  )
}
function Wanted() {
  return (
    <section className="hv-new hv-wanted">
      <div className="hv-wanted-head">
        <span>
          THE WEEKLY
          <br />
          NOTICEBOARD
        </span>
        <b>SEPT 2026</b>
      </div>
      <h1>WANTED</h1>
      <p className="hv-wanted-sub">For crimes against fantasy football</p>
      <div className="hv-mugshots">
        {losers.map((p) => (
          <article key={p.name}>
            <div className="hv-tape">FORFEIT DUE</div>
            <div className="hv-mug">
              <Camera size={20} />
              <Face initials={p.initials} />
            </div>
            <h2>{p.name}</h2>
            <div className="hv-wanted-meta">
              <span>{p.league}</span>
              <b>{p.points} PTS</b>
            </div>
            <p>{p.task}</p>
          </article>
        ))}
      </div>
      <div className="hv-reward">
        <Skull size={20} />
        <div>
          <b>REWARD: GROUP CHAT GLORY</b>
          <span>Two names. One very public punishment.</span>
        </div>
      </div>
      <div className="hv-wanted-proof">
        <Trophy size={14} /> The winners are laughing: Pete 71 · Jam 75
      </div>
    </section>
  )
}
export function HomeVariantGallery() {
  const [active, setActive] = useState(0)
  const screens = [
    <Reveal key="reveal" />,
    <Chat key="chat" />,
    <Slip key="slip" />,
    <Mission key="mission" />,
    <Wanted key="wanted" />,
  ]
  return (
    <main className="home-variant-gallery">
      <nav className="hv-selector" aria-label="Forfeit-first home screen concepts">
        {variants.map((name, i) => (
          <button
              type="button"
              key={name} className={active === i ? "active" : ""} onClick={() => setActive(i)}>
            {i + 1}. {name}
          </button>
        ))}
      </nav>
      <div className="hv-variant-caption">
        <span>FORFEIT-FIRST CONCEPT {String(active + 1).padStart(2, "0")}</span>
        <strong>{variants[active]}</strong>
      </div>
      {screens[active]}
    </main>
  )
}
export default HomeVariantGallery
