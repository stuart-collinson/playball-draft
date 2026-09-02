"use client"

import { useState } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Crown,
  Swords,
  Trophy,
} from "lucide-react"

const players = {
  winners: [
    { name: "Pete", league: "Premiership", points: 71, color: "green", initials: "P" },
    { name: "Jam", league: "Championship", points: 75, color: "purple", initials: "J" },
  ],
  losers: [
    { name: "Teece", league: "Premiership", points: 40, color: "red", initials: "T" },
    { name: "Quinn", league: "Championship", points: 23, color: "red", initials: "Q" },
  ],
}

const variants = ["Scoreboard", "Podium", "Programme", "Snapshot", "Rivalry"]

function Portrait({ initials, tone = "green" }: { initials: string; tone?: string }) {
  return <div className={`hv-portrait hv-${tone}`}>{initials}</div>
}

function Scores() {
  return (
    <div className="hv-scores">
      <div>
        <span>PREMIERSHIP</span>
        <b className="hv-green-text">774</b>
      </div>
      <i>VS</i>
      <div>
        <span>CHAMPIONSHIP</span>
        <b className="hv-purple-text">763</b>
      </div>
    </div>
  )
}

function PlayerRow({
  player,
  winner = false,
}: { player: (typeof players.winners)[number]; winner?: boolean }) {
  return (
    <div className={`hv-player-row ${winner ? "hv-winner-row" : "hv-loser-row"}`}>
      <Portrait initials={player.initials} tone={winner ? player.color : "red"} />
      <div className="hv-player-copy">
        <strong>{player.name}</strong>
        <span>{player.league}</span>
      </div>
      <div className="hv-player-points">
        <b>{player.points}</b>
        <small>pts</small>
      </div>
    </div>
  )
}

function Scoreboard() {
  return (
    <section className="hv-screen hv-scoreboard">
      <div className="hv-kicker">
        GAMEWEEK 07 <span>•</span> FINAL WHISTLE
      </div>
      <h1>
        Playball <em>Draft</em>
      </h1>
      <p className="hv-subtitle">The week&apos;s highs &amp; lows</p>
      <Scores />
      <div className="hv-section-label hv-section-green">
        <span>TOP OF THE TABLE</span>
        <small>2 winners</small>
      </div>
      <div className="hv-two-col">
        {players.winners.map((p) => (
          <PlayerRow key={p.name} player={p} winner />
        ))}
      </div>
      <div className="hv-section-label hv-section-red">
        <span>THE FORFEITS</span>
        <small>2 losers</small>
      </div>
      <div className="hv-two-col">
        {players.losers.map((p) => (
          <PlayerRow key={p.name} player={p} />
        ))}
      </div>
    </section>
  )
}

function Podium() {
  return (
    <section className="hv-screen hv-podium">
      <div className="hv-podium-top">
        <span className="hv-kicker">GAMEWEEK 07</span>
        <Trophy size={18} />
        <span>FINAL</span>
      </div>
      <h1>THE WINNERS</h1>
      <p className="hv-subtitle">Two players rose above the rest.</p>
      <div className="hv-podium-stage">
        <div className="hv-podium-card hv-second">
          <span className="hv-place">02</span>
          <Portrait initials="P" />
          <strong>Pete</strong>
          <small>Premiership</small>
          <b>
            71 <i>PTS</i>
          </b>
        </div>
        <div className="hv-podium-card hv-first">
          <Crown size={20} />
          <span className="hv-place">01</span>
          <Portrait initials="J" tone="purple" />
          <strong>Jam</strong>
          <small>Championship</small>
          <b>
            75 <i>PTS</i>
          </b>
        </div>
      </div>
      <div className="hv-cold-zone">
        <div>
          <span>COLDEST FORM</span>
          <small>Last place this week</small>
        </div>
        {players.losers.map((p) => (
          <PlayerRow key={p.name} player={p} />
        ))}
      </div>
      <Scores />
    </section>
  )
}

function Programme() {
  return (
    <section className="hv-screen hv-programme">
      <div className="hv-programme-head">
        <span>PB / 07</span>
        <span>SEPTEMBER 2026</span>
      </div>
      <div className="hv-programme-title">
        <p>THE</p>
        <h1>
          GAMEWEEK
          <br />
          <em>REPORT</em>
        </h1>
        <span>Fantasy football, without the fantasy.</span>
      </div>
      <div className="hv-featured">
        <div className="hv-featured-mark">
          WIN
          <br />
          OF
          <br />
          THE
          <br />
          WEEK
        </div>
        <div>
          <span>PREMIERSHIP</span>
          <strong>Pete</strong>
          <b>71 points</b>
        </div>
        <ArrowUpRight />
      </div>
      <div className="hv-featured hv-featured-red">
        <div className="hv-featured-mark">
          LOW
          <br />
          OF
          <br />
          THE
          <br />
          WEEK
        </div>
        <div>
          <span>CHAMPIONSHIP</span>
          <strong>Quinn</strong>
          <b>23 points</b>
        </div>
        <ArrowDownRight />
      </div>
      <div className="hv-score-strip">
        <span>LEAGUE TOTALS</span>
        <b>774</b>
        <i>—</i>
        <b>763</b>
        <span>PREM&nbsp;&nbsp;&nbsp;&nbsp; CHAMP</span>
      </div>
      <div className="hv-programme-footer">
        JAM <b>75</b>
        <span>WEEKLY HONOURS</span> TEECE <b>40</b>
      </div>
    </section>
  )
}

function Snapshot() {
  return (
    <section className="hv-screen hv-snapshot">
      <div className="hv-snapshot-heading">
        <div>
          <span className="hv-kicker">GAMEWEEK 07</span>
          <h1>
            League
            <br />
            <em>snapshot</em>
          </h1>
        </div>
        <BarChart3 size={32} />
      </div>
      <div className="hv-total-card">
        <span>COMBINED LEAGUE SCORE</span>
        <strong>1,537</strong>
        <small>
          <ArrowUpRight size={14} /> +42 on last week
        </small>
        <div className="hv-bars">
          <i style={{ width: "51%" }} />
          <i style={{ width: "49%" }} />
        </div>
        <div>
          <span>
            PREMIERSHIP <b>774</b>
          </span>
          <span>
            CHAMPIONSHIP <b>763</b>
          </span>
        </div>
      </div>
      <div className="hv-snapshot-label">
        <span>WEEKLY MOVERS</span>
        <small>16 players / 2 highlighted</small>
      </div>
      <div className="hv-mover hv-mover-green">
        <div className="hv-rank">
          ↑<b>01</b>
        </div>
        <Portrait initials="P" />
        <div>
          <strong>Pete</strong>
          <span>Premiership · winner</span>
        </div>
        <b>71</b>
      </div>
      <div className="hv-mover hv-mover-purple">
        <div className="hv-rank">
          ↑<b>01</b>
        </div>
        <Portrait initials="J" tone="purple" />
        <div>
          <strong>Jam</strong>
          <span>Championship · winner</span>
        </div>
        <b>75</b>
      </div>
      <div className="hv-snapshot-label hv-loss-label">
        <span>RELEGATION WATCH</span>
        <small>lowest scores</small>
      </div>
      {players.losers.map((p) => (
        <div className="hv-compact-loss" key={p.name}>
          <span>↓</span>
          <strong>{p.name}</strong>
          <small>{p.league}</small>
          <b>{p.points}</b>
        </div>
      ))}
    </section>
  )
}

function Rivalry() {
  return (
    <section className="hv-screen hv-rivalry">
      <div className="hv-rivalry-head">
        <span className="hv-kicker">GAMEWEEK 07</span>
        <Swords size={22} />
        <span>HEAD TO HEAD</span>
      </div>
      <h1>
        WHO
        <br />
        <em>WON?</em>
      </h1>
      <div className="hv-league-split">
        <div>
          <span>PREMIERSHIP</span>
          <strong>774</strong>
          <small>+11 pts</small>
        </div>
        <div>
          <span>CHAMPIONSHIP</span>
          <strong>763</strong>
          <small>this week</small>
        </div>
      </div>
      <div className="hv-verdict">
        PREMIERSHIP <b>TAKES IT</b>
      </div>
      <div className="hv-duel-list">
        <div className="hv-duel-head">
          <span>WINNERS</span>
          <span>POINTS</span>
        </div>
        {players.winners.map((p) => (
          <div className="hv-duel" key={p.name}>
            <Portrait initials={p.initials} tone={p.color} />
            <div>
              <strong>{p.name}</strong>
              <span>{p.league}</span>
            </div>
            <b>{p.points}</b>
            <ChevronRight size={16} />
          </div>
        ))}
        <div className="hv-duel-head hv-duel-loss-head">
          <span>LOSERS</span>
          <span>POINTS</span>
        </div>
        {players.losers.map((p) => (
          <div className="hv-duel hv-duel-loss" key={p.name}>
            <Portrait initials={p.initials} tone="red" />
            <div>
              <strong>{p.name}</strong>
              <span>{p.league}</span>
            </div>
            <b>{p.points}</b>
            <ChevronRight size={16} />
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomeVariantGallery() {
  const [active, setActive] = useState(0)
  const screens = [
    <Scoreboard key="score" />,
    <Podium key="podium" />,
    <Programme key="programme" />,
    <Snapshot key="snapshot" />,
    <Rivalry key="rivalry" />,
  ]
  return (
    <main className="home-variant-gallery">
      <nav className="hv-selector" aria-label="Home screen concepts">
        {variants.map((name, index) => (
          <button
            key={name}
            className={active === index ? "active" : ""}
            onClick={() => setActive(index)}
          >
            {index + 1}. {name}
          </button>
        ))}
      </nav>
      <div className="hv-variant-caption">
        <span>HOME SCREEN CONCEPT {String(active + 1).padStart(2, "0")}</span>
        <strong>{variants[active]}</strong>
      </div>
      {screens[active]}
    </main>
  )
}

export default HomeVariantGallery
