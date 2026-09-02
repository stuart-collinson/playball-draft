"use client"

import { useState } from "react"
import { Send, Star } from "lucide-react"

const winners = [
  { name: "Pete", points: 71, league: "Premiership", initials: "P" },
  { name: "Jam", points: 75, league: "Championship", initials: "J" },
]
const losers = [
  { name: "Teece", points: 40, league: "Premiership", task: "BRING THE SNACKS", initials: "T" },
  { name: "Quinn", points: 23, league: "Championship", task: "READ THE APOLOGY", initials: "Q" },
]
const leagueScores = { premiership: 774, championship: 763 }
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
        <span>{winners[0].name} · {winners[1].name}</span>
      </div>
      <div className="hv3-comic-burst">
        PREMIERSHIP
        <br />
        <em>{leagueScores.premiership}</em>
        <br />
        VS
        <br />
        <em>{leagueScores.championship}</em>
        <br />
        CHAMPIONSHIP
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
            <div className="hv3-panel-tag">{p.league.toUpperCase()} LOSER / GW07</div>
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
        <Send /> SHARE HIS WEEK'S ISSUE
      </button>
    </section>
  )
}
function Cinema() {
  return (
    <section className="hv3 hv3-cinema">
      <div className="hv3-neon-sign">
        <span>★</span>
        <b>PLAYBALL DRAFT</b>
        <span>★</span>
      </div>
      <div className="hv3-cinema-meta">
        <span>{winners[0].name} {winners[1].name}</span>
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
              <span>{p.league.toUpperCase()} LOSER</span>
              <b>07</b>
            </div>
            <Face initials={p.initials} large />
            <strong>{p.name.toUpperCase()}</strong>
            <small>{p.points} POINTS</small>
            <div className="hv3-ticket-line" />
            <b className="hv3-ticket-task">{p.task}</b>
            <span className="hv3-ticket-footer">REALITY CAN WAIT</span>
          </article>
        ))}
      </div>
      <div className="hv3-cinema-scores">
        <span>LEAGUE SCOREBOARD</span>
        <strong>{leagueScores.premiership}</strong><i>VS</i><strong>{leagueScores.championship}</strong>
      </div>
      <button type="button" className="hv3-neon-cta">
        <Send /> SHARE YOUR FORFEIT ADMISSION
      </button>
    </section>
  )
}
function Teletext() {
  return (
    <section className="hv3 hv3-teletext">
      <header>
        <span>TELETEXT</span>
        <b>PAGE 301</b>
        <strong>GW07</strong>
      </header>
      <div className="hv3-tele-mast">FOOTBALL</div>
      <div className="hv3-tele-sub">
        TELETEXT FOOTBALL RESULTS <span>ON YOUR PHONE</span>
      </div>
      <nav>PREMIERSHIP {leagueScores.premiership}　 VS　 CHAMPIONSHIP {leagueScores.championship}</nav>
      <div className="hv3-tele-status">PLAYBALL DRAFT / GAMEWEEK 07 / FINAL SCORES</div>
      <div className="hv3-tele-section hv3-tele-secondary">
        GAMEWEEK WINNERS <span>FT</span>
      </div>
      <div className="hv3-tele-winners">
        {winners.map((p) => <span key={p.name}>{p.league.toUpperCase()} {p.name} <b>{p.points}</b></span>)}
      </div>
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
      <button type="button" className="hv3-tele-share"><Send /> PRESS RED TO SHARE FORFEITS</button>
      <div className="hv3-tele-foot">PRESS 9 FOR GROUP CHAT REACTION</div>
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
