import type { CupSummary } from "@pbd/types/cups.types"

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
