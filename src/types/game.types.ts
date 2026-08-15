// App-derived game-state model (not a raw FPL response shape — those live
// in fpl.types.ts). Drives all cache/polling decisions.
export type GamePhase = "live" | "imminent" | "break" | "idle"

export type GameState = {
  // Null before the season's first gameweek starts. Everything that renders
  // per-gameweek results keys off this to know there is nothing to show yet.
  currentEvent: number | null
  phase: GamePhase
  seasonOver: boolean
  // Only populated while there is no current gameweek — it is what the
  // pre-season countdown counts down to. Null once a season is underway.
  nextDeadline: string | null
}
