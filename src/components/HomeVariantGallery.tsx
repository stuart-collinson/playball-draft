"use client"

import { useState } from "react"
import { ArrowRight, Disc3, Send, Star, Tv } from "lucide-react"

const losers = [
  { name: "Teece", points: 40, task: "BRING THE SNACKS", initials: "T" },
  { name: "Quinn", points: 23, task: "READ THE APOLOGY", initials: "Q" },
]
const variants = ["Comic Strip", "Neon Ticket", "Football Teletext"]

function Face({ initials, large = false }: { initials: string; large?: boolean }) {
  return <div className={`hv3-face ${large ? "hv3-face-large" : ""}`}>{initials}</div>
}
function Footer({ label = "SHARE FORFEITS" }) {
  return (
    <div className="hv3-footer">
      <span>PLAYBALL DRAFT</span>
      <b>GW07</b>
      <strong>{label} →</strong>
    </div>
  )
}
function Comic() {
  return (
    <section className="hv3 hv3-comic">
      <div className="hv3-comic-top">
        <b>PLAYBALL</b>
        <span>ISSUE 07</span>
        <span>COMIC DIVISION</span>
      </div>
      <div className="hv3-comic-burst">
        TWO LOSERS.
        <br />
        <em>ZERO ESCAPE.</em>
      </div>
      <h1>
        THE
        <br />
        <em>FORFEIT</em>
        <br />
        SQUAD
      </h1>
      <p className="hv3-comic-dek">Gameweek 07 has chosen its heroes... unfortunately.</p>
      <div className="hv3-panels">
        {losers.map((p, i) => (
          <article className={`hv3-panel hv3-panel-${i + 1}`} key={p.name}>
            <div className="hv3-panel-tag">LOSER {i + 1} / GW07</div>
            <Face initials={p.initials} large />
            <h2>{p.name}!</h2>
            <b>{p.points} PTS</b>
            <div className="hv3-caption">
              <strong>{p.task}</strong>
              <small>MISSION ACCEPTED</small>
            </div>
            <i>{i === 0 ? "POW!" : "OOF!"}</i>
          </article>
        ))}
      </div>
      <button type="button" className="hv3-comic-share">
        <Send /> SEND THIS ISSUE TO THE GROUP CHAT
      </button>
    </section>
  )
}
function Cinema() {
  return (
    <section className="hv3 hv3-cinema">
      <div className="hv3-neon-sign">
        <span>★</span>
        <b>PLAYBALL</b>
        <span>★</span>
      </div>
      <div className="hv3-cinema-meta">
        <span>THE JUKEBOX CINEMA</span>
        <strong>NOW PLAYING / GW07</strong>
      </div>
      <div className="hv3-cinema-title">
        <small>A DOUBLE FEATURE</small>
        <h1>
          FORFEIT
          <br />
          <em>AFTER DARK</em>
        </h1>
        <p>Two tickets. Two terrible performances.</p>
      </div>
      <div className="hv3-tickets">
        {losers.map((p, i) => (
          <article key={p.name}>
            <div className="hv3-ticket-notch" />
            <div className="hv3-ticket-head">
              <span>ADMIT ONE</span>
              <b>07</b>
            </div>
            <Face initials={p.initials} large />
            <strong>{p.name.toUpperCase()}</strong>
            <small>{p.points} POINTS</small>
            <div className="hv3-ticket-line" />
            <b className="hv3-ticket-task">{p.task}</b>
            <span className="hv3-ticket-footer">NO REFUNDS / ONE NIGHT ONLY</span>
          </article>
        ))}
      </div>
      <div className="hv3-neon-cta">
        <Disc3 /> YOUR FORFEIT ADMISSION IS CONFIRMED <ArrowRight />
      </div>
    </section>
  )
}
function Teletext() {
  return (
    <section className="hv3 hv3-teletext">
      <header>
        <span>TELETEXT</span>
        <b>PAGE 301</b>
        <strong>22:46:07</strong>
      </header>
      <div className="hv3-tele-mast">FOOTBALL</div>
      <div className="hv3-tele-sub">
        TELETEXT FOOTBALL RESULTS <span>ON YOUR PHONE</span>
      </div>
      <nav>RESULTS　 TABLES　 FIXTURES　 FORFEITS</nav>
      <div className="hv3-tele-status">PLAYBALL DRAFT / GAMEWEEK 07 / FINAL SCORES</div>
      <div className="hv3-tele-section">
        FORFEIT RESULTS <span>LIVE</span>
      </div>
      {losers.map((p, i) => (
        <div className="hv3-tele-row" key={p.name}>
          <div className="hv3-tele-row-top">
            <b>
              {String(i + 1).padStart(2, "0")}　{p.name.toUpperCase()}
            </b>
            <strong>{p.points} PTS</strong>
          </div>
          <div className="hv3-tele-task">
            &gt; {p.task} <span>FT</span>
          </div>
        </div>
      ))}
      <div className="hv3-tele-section hv3-tele-secondary">
        GAMEWEEK 07 <span>PLAYBALL LEAGUE</span>
      </div>
      <div className="hv3-tele-mini">TWO FORFEITS ISSUED　　　　　　　　　 PAGE 1/1</div>
      <div className="hv3-tele-foot">PRESS RED TO SHARE　　PRESS 9 FOR GROUP CHAT REACTION</div>
    </section>
  )
}
const screens = [Comic, Cinema, Teletext]
export function HomeVariantGallery() {
  const [active, setActive] = useState(0)
  const Screen = screens[active] ?? Comic
  return (
    <main className="home-variant-gallery">
      <nav className="hv-selector" aria-label="Home screen concepts">
        {variants.map((name, i) => (
          <button
            type="button"
            key={name}
            className={active === i ? "active" : ""}
            onClick={() => setActive(i)}
          >
            {i + 1}. {name}
          </button>
        ))}
      </nav>
      <div className="hv-variant-caption">
        <span>THREE DIRECTIONS / FORFEIT-FIRST</span>
        <strong>{variants[active]}</strong>
      </div>
      <Screen />
    </main>
  )
}
export default HomeVariantGallery
