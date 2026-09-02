"use client"

import { useState } from "react"
import { Clapperboard, Gamepad2, Megaphone, Send, Star, Tv, Zap } from "lucide-react"

const losers = [
  {
    name: "Teece",
    league: "PREM",
    points: 40,
    task: "Bring the snacks next matchday",
    initials: "T",
  },
  {
    name: "Quinn",
    league: "CHAMP",
    points: 23,
    task: "Read the group chat apology",
    initials: "Q",
  },
]
const variants = [
  "Front Page",
  "Game Over",
  "Teletext",
  "The Ticket",
  "Neon Cinema",
  "Control Room",
  "Sticker Drop",
  "Comic Strip",
]

function Face({ initials, large = false }: { initials: string; large?: boolean }) {
  return <div className={`hv8-face ${large ? "hv8-face-large" : ""}`}>{initials}</div>
}
function Loser({
  p,
  index,
  className = "",
}: { p: (typeof losers)[number]; index: number; className?: string }) {
  return (
    <article className={`hv8-loser ${className}`}>
      <div className="hv8-loser-top">
        <span>LOSER {String(index + 1).padStart(2, "0")}</span>
        <span>{p.points} PTS</span>
      </div>
      <Face initials={p.initials} large />
      <h2>{p.name}</h2>
      <small>{p.league} LEAGUE</small>
      <strong>{p.task}</strong>
      <em>FORFEIT DUE</em>
    </article>
  )
}
function QuietFooter() {
  return (
    <footer className="hv8-footer">
      <span>WINNERS: PETE 71 · JAM 75</span>
      <span>PREM 774 / CHAMP 763</span>
    </footer>
  )
}
function FrontPage() {
  return (
    <section className="hv8 hv8-front">
      <div className="hv8-mast">
        <span>PLAYBALL DRAFT</span>
        <b>GAMEWEEK 07</b>
      </div>
      <p className="hv8-kicker">EXCLUSIVE GROUP CHAT EDITION</p>
      <h1>
        THE TWO
        <br />
        <em>WHO BLEW IT.</em>
      </h1>
      <div className="hv8-rule" />
      <p className="hv8-dek">
        Teece and Quinn named, shamed and sentenced to this week&apos;s forfeits.
      </p>
      <div className="hv8-cover-grid">
        {losers.map((p, i) => (
          <Loser p={p} index={i} key={p.name} />
        ))}
      </div>
      <QuietFooter />
    </section>
  )
}
function GameOver() {
  return (
    <section className="hv8 hv8-game">
      <div className="hv8-pixel-head">
        <Gamepad2 /> PLAYBALL ARCADE <span>INSERT CHAT</span>
      </div>
      <div className="hv8-game-title">
        <small>GAMEWEEK 07</small>
        <h1>
          GAME
          <br />
          <em>OVER</em>
        </h1>
        <p>NO CONTINUES REMAINING</p>
      </div>
      <div className="hv8-score-list">
        {losers.map((p, i) => (
          <div className="hv8-game-row" key={p.name}>
            <span>0{i + 1}</span>
            <Face initials={p.initials} />
            <div>
              <b>{p.name}</b>
              <small>{p.task}</small>
            </div>
            <strong>{p.points}</strong>
          </div>
        ))}
      </div>
      <div className="hv8-game-cta">
        TWO PLAYERS HAVE BEEN SELECTED
        <br />
        <b>FORFEIT MODE ACTIVATED</b>
      </div>
      <QuietFooter />
    </section>
  )
}
function Teletext() {
  return (
    <section className="hv8 hv8-tele">
      <div className="hv8-tele-top">
        <Tv /> PAGE 301 <span>09:42</span>
      </div>
      <h1>PLAYBALL DRAFT</h1>
      <div className="hv8-tele-sub">WEEKLY FORFEIT SERVICE</div>
      <div className="hv8-tele-block">
        <b>301</b>
        <h2>GAMEWEEK 07 RESULTS</h2>
        <p>
          THE FOLLOWING PLAYERS HAVE
          <br />
          BEEN RELEGATED TO FORFEITS:
        </p>
        <div className="hv8-tele-player">
          <span>01</span>
          <b>TEECE</b>
          <strong>40 PTS</strong>
        </div>
        <div className="hv8-tele-task">&gt; BRING THE SNACKS NEXT MATCHDAY</div>
        <div className="hv8-tele-player">
          <span>02</span>
          <b>QUINN</b>
          <strong>23 PTS</strong>
        </div>
        <div className="hv8-tele-task">&gt; READ THE GROUP CHAT APOLOGY</div>
      </div>
      <p className="hv8-tele-foot">PRESS 888 TO SHARE · PREMIERSHIP 774 · CHAMPIONSHIP 763</p>
    </section>
  )
}
function Ticket() {
  return (
    <section className="hv8 hv8-ticket">
      <div className="hv8-ticket-head">
        <Clapperboard />
        <span>PLAYBALL LIVE</span>
        <b>ADMIT TWO</b>
      </div>
      <div className="hv8-ticket-main">
        <p>ONE NIGHT ONLY</p>
        <h1>
          THE
          <br />
          <em>FORFEITS</em>
        </h1>
        <span>GAMEWEEK 07 · FRONT ROW</span>
        <div className="hv8-ticket-stubs">
          {losers.map((p) => (
            <div key={p.name}>
              <Face initials={p.initials} />
              <b>{p.name}</b>
              <small>{p.task}</small>
              <strong>{p.points} PTS</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="hv8-barcode">
        |||| ||| |||| || ||||| <span>NO REFUNDS · NO APPEALS</span>
      </div>
      <QuietFooter />
    </section>
  )
}
function Cinema() {
  return (
    <section className="hv8 hv8-cinema">
      <div className="hv8-marquee">
        <Star />
        <span>PLAYBALL</span>
        <Star />
      </div>
      <p className="hv8-present">A GAMEWEEK 07 PRESENTATION</p>
      <h1>
        THE
        <br />
        <em>LAST TWO</em>
      </h1>
      <p className="hv8-cinema-sub">A cautionary tale in 2 forfeits</p>
      <div className="hv8-cinema-cards">
        {losers.map((p, i) => (
          <div key={p.name}>
            <div className="hv8-cinema-num">{i + 1}</div>
            <Face initials={p.initials} />
            <h2>{p.name}</h2>
            <b>{p.points} POINTS</b>
            <small>{p.task}</small>
          </div>
        ))}
      </div>
      <div className="hv8-neon-line">NOW SHOWING IN THE GROUP CHAT</div>
      <QuietFooter />
    </section>
  )
}
function Control() {
  return (
    <section className="hv8 hv8-control">
      <div className="hv8-control-head">
        <span>
          <Zap /> FPL / LIVE FEED
        </span>
        <b>GW07</b>
      </div>
      <h1>
        CASUALTY
        <br />
        <em>BOARD</em>
      </h1>
      <div className="hv8-alert">
        <Megaphone /> <b>ALERT:</b> 2 FORFEITS REQUIRE ASSIGNMENT
      </div>
      {losers.map((p, i) => (
        <div className="hv8-control-row" key={p.name}>
          <span className="hv8-status">TARGET 0{i + 1}</span>
          <Face initials={p.initials} />
          <div>
            <b>{p.name}</b>
            <small>
              {p.league} · {p.points} points
            </small>
          </div>
          <div className="hv8-task">
            <span>ASSIGNMENT</span>
            <strong>{p.task}</strong>
          </div>
        </div>
      ))}
      <div className="hv8-control-foot">
        SYSTEM READY <span>WINNERS CLEARED: PETE / JAM</span>
      </div>
    </section>
  )
}
function StickerDrop() {
  return (
    <section className="hv8 hv8-sticker">
      <div className="hv8-drop-head">
        <span>PLAYBALL SUPPLY CO.</span>
        <b>DROP 07</b>
      </div>
      <h1>
        THE
        <br />
        <em>SHAME DROP</em>
      </h1>
      <p>Limited edition weekly forfeits. Available now in the group chat.</p>
      <div className="hv8-stickers">
        {losers.map((p) => (
          <div key={p.name} className="hv8-sticker-item">
            <div className="hv8-sticker-star">
              FORFEIT
              <br />
              DUE
            </div>
            <Face initials={p.initials} large />
            <h2>{p.name}</h2>
            <b>{p.points} PTS</b>
            <small>{p.task}</small>
          </div>
        ))}
      </div>
      <button type="button" className="hv8-drop-btn">
        <Send /> SEND TO GROUP CHAT
      </button>
      <QuietFooter />
    </section>
  )
}
function Comic() {
  return (
    <section className="hv8 hv8-comic">
      <div className="hv8-comic-top">
        BREAKING NEWS! <span>PLAYBALL COMICS</span>
      </div>
      <div className="hv8-speech">
        WHO WILL
        <br />
        <em>FACE THE MUSIC?</em>
      </div>
      <h1>
        IT&apos;S
        <br />
        <em>TEECE!</em>
      </h1>
      <div className="hv8-comic-panel">
        <Face initials="T" large />
        <div className="hv8-boom">
          40
          <br />
          <small>PTS</small>
        </div>
        <p>“Bring the snacks…”</p>
      </div>
      <div className="hv8-comic-panel hv8-comic-second">
        <Face initials="Q" large />
        <div className="hv8-boom">
          23
          <br />
          <small>PTS</small>
        </div>
        <p>“Read the apology…”</p>
      </div>
      <div className="hv8-comic-caption">NEXT ISSUE: THE GROUP CHAT REACTS</div>
      <QuietFooter />
    </section>
  )
}
const screens = [FrontPage, GameOver, Teletext, Ticket, Cinema, Control, StickerDrop, Comic]
export function HomeVariantGallery() {
  const [active, setActive] = useState(0)
  const Screen = screens[active] ?? FrontPage
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
        <span>FORFEIT-FIRST CONCEPT {String(active + 1).padStart(2, "0")}</span>
        <strong>{variants[active]}</strong>
      </div>
      <Screen />
    </main>
  )
}
export default HomeVariantGallery
