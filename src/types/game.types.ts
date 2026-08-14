// App-derived game-state model (not a raw FPL response shape — those live
// in fpl.types.ts). Drives all cache/polling decisions.
export type GamePhase = "live" | "imminent" | "break" | "idle"

export type GameState = {
  currentEvent: number | null
  phase: GamePhase
  seasonOver: boolean
}
