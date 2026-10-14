import type { CupSummary } from "@pbd/types/cups.types"

type FinalLineups = {
  gameweek: number
  isConfirmed: boolean
}

const byFinalGameweek = (first: CupSummary, second: CupSummary): number =>
  first.schedule.final - second.schedule.final

export const featuredFinalCup = (
  cups: readonly CupSummary[],
  season: string,
  gameweek: number,
): CupSummary | null => {
  const seasonCups = cups.filter((cup) => cup.season === season).sort(byFinalGameweek)
  const latestPlayed = seasonCups.filter((cup) => cup.schedule.final <= gameweek).at(-1)
  const soonestUpcoming = seasonCups.find((cup) => cup.schedule.final > gameweek)

  return latestPlayed ?? soonestUpcoming ?? null
}

export const finalLineups = (finalGameweek: number, currentGameweek: number): FinalLineups => {
  const isConfirmed = finalGameweek <= currentGameweek

  return { gameweek: isConfirmed ? finalGameweek : currentGameweek, isConfirmed }
}
