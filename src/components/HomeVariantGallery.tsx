"use client"

import { useState } from "react"
import { Send, Star, Tv } from "lucide-react"

const losers = [
  { name: "Teece", points: 40, task: "Bring the snacks next matchday", initials: "T" },
  { name: "Quinn", points: 23, task: "Read the group chat apology", initials: "Q" },
]
const variants = [
  "Neon Comic",
  "Teletext 2.0",
  "Cinema Marquee",
  "The Receipt",
  "Doomscroll",
  "Penalty Shootout",
  "Album Drop",
  "Nightclub Flyer",
  "Case File",
  "Game Show",
]

function Face({ initials, large = false }: { initials: string; large?: boolean }) {
  return <div className={`hv10-face ${large ? "hv10-face-large" : ""}`}>{initials}</div>
}
function Forfeit({ p, tone = "" }: { p: (typeof losers)[number]; tone?: string }) {
  return (
    <article className={`hv10-forfeit ${tone}`}>
      <div className="hv10-forfeit-meta">
        <span>GW07 / FORFEIT</span>
        <b>{p.points} PTS</b>
      </div>
      <Face initials={p.initials} large />
      <h2>{p.name}</h2>
      <strong>{p.task}</strong>
      <small>NO APPEALS</small>
    </article>
  )
}
function Footer() {
  return (
    <div className="hv10-footer">
      TWO LOSERS · GAMEWEEK 07 <span>SHARE THE DAMAGE</span>
    </div>
  )
}
function Comic() {
  return (
    <section className="hv10 hv10-comic">
      <div className="hv10-comic-brand">
        PLAYBALL COMICS <b>GAMEWEEK 07</b>
      </div>
      <div className="hv10-comic-speech">
        TWO FALLEN
        <br />
        <em>MANAGERS!</em>
      </div>
      <h1>
        FORFEIT
        <br />
        <em>FORCE</em>
      </h1>
      <div className="hv10-comic-panel">
        <Face initials="T" large />
        <div>
          <b>TEECE</b>
          <span>40 POINTS</span>
          <strong>SNACK DUTY!</strong>
        </div>
        <i>POW</i>
      </div>
      <div className="hv10-comic-panel hv10-comic-panel-two">
        <Face initials="Q" large />
        <div>
          <b>QUINN</b>
          <span>23 POINTS</span>
          <strong>APOLOGY READING!</strong>
        </div>
        <i>OOF</i>
      </div>
      <Footer />
    </section>
  )
}
function Teletext() {
  return (
    <section className="hv10 hv10-tele">
      <header>
        <Tv /> PAGE 301 <b>PLAYBALL DRAFT</b>
        <span>GW07</span>
      </header>
      <h1>
        FORFEIT
        <br />
        CENTRE
      </h1>
      <p className="hv10-tele-yellow">LIVE RESULTS SERVICE / TWO PENALTIES ISSUED</p>
      <div className="hv10-tele-box">
        <b>GAMEWEEK 07</b>
        {losers.map((p, i) => (
          <div key={p.name}>
            <strong>
              0{i + 1} {p.name}
            </strong>
            <span>{p.points} PTS</span>
            <small>&gt; {p.task}</small>
          </div>
        ))}
      </div>
      <p className="hv10-tele-foot">PRESS 1 TO SHARE · PRESS 9 FOR GROUP CHAT REACTION</p>
    </section>
  )
}
function Cinema() {
  return (
    <section className="hv10 hv10-cinema">
      <div className="hv10-cinema-marquee">
        <Star />
        <b>PLAYBALL PICTURES</b>
        <Star />
      </div>
      <p>NOW SCREENING · GAMEWEEK 07</p>
      <h1>
        THE
        <br />
        <em>FORFEITORS</em>
      </h1>
      <div className="hv10-cinema-tag">A double feature in two terrible performances</div>
      <div className="hv10-cinema-poster">
        {losers.map((p, i) => (
          <div key={p.name}>
            <span>FEATURE {i + 1}</span>
            <Face initials={p.initials} large />
            <h2>{p.name}</h2>
            <b>{p.task}</b>
          </div>
        ))}
      </div>
      <div className="hv10-cinema-cta">ON NOW IN THE GROUP CHAT</div>
      <Footer />
    </section>
  )
}
function Receipt() {
  return (
    <section className="hv10 hv10-receipt">
      <div className="hv10-receipt-head">
        PLAYBALL DRAFT <span>VOID IF WINNING</span>
      </div>
      <h1>
        LOSING
        <br />
        <em>RECEIPT</em>
      </h1>
      <p>GAMEWEEK 07 · FINAL SETTLEMENT</p>
      {losers.map((p, i) => (
        <div className="hv10-receipt-row" key={p.name}>
          <span>0{i + 1}</span>
          <div>
            <b>{p.name}</b>
            <small>{p.task}</small>
          </div>
          <strong>{p.points}</strong>
        </div>
      ))}
      <div className="hv10-receipt-total">
        <span>FORFEITS DUE</span>
        <b>2</b>
      </div>
      <button type="button">
        <Send /> SEND TO GROUP CHAT
      </button>
    </section>
  )
}
function Doomscroll() {
  return (
    <section className="hv10 hv10-scroll">
      <div className="hv10-scroll-top">
        <span>GROUP CHAT / 16 MEMBERS</span>
        <b>GAMEWEEK 07</b>
      </div>
      <h1>
        THE CHAT
        <br />
        <em>KNOWS.</em>
      </h1>
      <div className="hv10-post hv10-post-alert">
        <Face initials="T" />
        <div>
          <b>system</b>
          <p>
            Teece has been assigned: <strong>bring the snacks</strong>
          </p>
          <small>just now · 14 reactions</small>
        </div>
      </div>
      <div className="hv10-post">
        <Face initials="Q" />
        <div>
          <b>system</b>
          <p>
            Quinn has been assigned: <strong>read the apology</strong>
          </p>
          <small>just now · 16 reactions</small>
        </div>
      </div>
      <div className="hv10-reactions">
        THE PEOPLE HAVE SPOKEN <span>SHARE RESULTS →</span>
      </div>
      <Footer />
    </section>
  )
}
function Shootout() {
  return (
    <section className="hv10 hv10-shootout">
      <div className="hv10-shoot-head">
        <span>PLAYBALL / PENALTY ROOM</span>
        <b>GW 07</b>
      </div>
      <h1>
        FINAL
        <br />
        <em>WHISTLE</em>
      </h1>
      <p>Two managers step up. Two forfeits remain.</p>
      <div className="hv10-shoot-line">
        <span>TEECE</span>
        <div className="hv10-penalty-dots">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <b>40</b>
      </div>
      <strong className="hv10-shoot-task">BRING THE SNACKS NEXT MATCHDAY</strong>
      <div className="hv10-shoot-line">
        <span>QUINN</span>
        <div className="hv10-penalty-dots">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <b>23</b>
      </div>
      <strong className="hv10-shoot-task">READ THE GROUP CHAT APOLOGY</strong>
      <div className="hv10-whistle">
        FORFEIT
        <br />
        CONFIRMED
      </div>
    </section>
  )
}
function Album() {
  return (
    <section className="hv10 hv10-album">
      <div className="hv10-album-top">
        <span>PLAYBALL RECORDS</span>
        <b>GW07</b>
      </div>
      <div className="hv10-album-art">
        <div>
          THE
          <br />
          <em>LOWEST</em>
          <br />
          HITS
        </div>
        <span>VOL. 07</span>
      </div>
      <div className="hv10-track">
        <span>A1</span>
        <b>TEECE</b>
        <small>SNACK DUTY</small>
        <strong>40</strong>
      </div>
      <div className="hv10-track">
        <span>A2</span>
        <b>QUINN</b>
        <small>APOLOGY READING</small>
        <strong>23</strong>
      </div>
      <button type="button" className="hv10-listen">
        PLAY FOR THE GROUP CHAT <Send />
      </button>
    </section>
  )
}
function Flyer() {
  return (
    <section className="hv10 hv10-flyer">
      <div className="hv10-flyer-stamp">ONE NIGHT</div>
      <p>YOU ARE INVITED TO</p>
      <h1>
        THE
        <br />
        <em>
          SHAME
          <br />
          CLUB
        </em>
      </h1>
      <div className="hv10-flyer-date">GAMEWEEK 07 · TWO GUESTS · ZERO EXCUSES</div>
      <div className="hv10-flyer-guests">
        {losers.map((p) => (
          <div key={p.name}>
            <Face initials={p.initials} />
            <b>{p.name}</b>
            <span>{p.task}</span>
          </div>
        ))}
      </div>
      <Footer />
    </section>
  )
}
function CaseFile() {
  return (
    <section className="hv10 hv10-case">
      <div className="hv10-case-file">
        CASE 007 <span>OPEN</span>
      </div>
      <h1>
        THE
        <br />
        <em>FALL GUYS</em>
      </h1>
      <p>Two suspects. One gameweek. Full forfeits.</p>
      {losers.map((p, i) => (
        <div className="hv10-suspect" key={p.name}>
          <div className="hv10-case-num">0{i + 1}</div>
          <Face initials={p.initials} />
          <div>
            <b>{p.name}</b>
            <small>
              {p.points} PTS · {p.task}
            </small>
          </div>
          <strong>GUILTY</strong>
        </div>
      ))}
      <div className="hv10-case-stamp">
        SENTENCE
        <br />
        HANDED DOWN
      </div>
    </section>
  )
}
function GameShow() {
  return (
    <section className="hv10 hv10-show">
      <div className="hv10-show-top">
        <span>THE PLAYBALL SHOW</span>
        <b>ROUND 07</b>
      </div>
      <div className="hv10-show-lights">● ● ● ● ● ● ●</div>
      <h1>
        WHO
        <br />
        <em>LOST?</em>
      </h1>
      <div className="hv10-show-answer">
        {losers.map((p) => (
          <div key={p.name}>
            <Face initials={p.initials} large />
            <b>{p.name}</b>
            <small>{p.task}</small>
            <strong>{p.points} POINTS</strong>
          </div>
        ))}
      </div>
      <div className="hv10-show-reveal">
        THE ANSWER IS: <b>TWO LOSERS</b>
      </div>
      <Footer />
    </section>
  )
}
const screens = [
  Comic,
  Teletext,
  Cinema,
  Receipt,
  Doomscroll,
  Shootout,
  Album,
  Flyer,
  CaseFile,
  GameShow,
]
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
        <span>FORFEIT-FIRST CONCEPT {String(active + 1).padStart(2, "0")}</span>
        <strong>{variants[active]}</strong>
      </div>
      <Screen />
    </main>
  )
}
export default HomeVariantGallery
