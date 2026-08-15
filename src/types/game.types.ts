export type GamePhase = "live" | "imminent" | "break" | "idle"

export type GameState = {
  currentEvent: number | null
  phase: GamePhase
  seasonOver: boolean
  nextDeadline: string | null
}
