import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import type { SurvivalBaseline, SurvivalStreak, SurvivalStreaks } from "@pbd/types/survival.types"

export type SurvivalVerdict = {
  event: number
  league: LeagueSlug
  loser: string
  players: string[]
}

export type RankedSurvivalStreak = SurvivalStreak & { rank: number }

type FoldOptions = {
  currentSeason: string
  finalGameweek: number
}

const CARRIED_OVER_ANCHOR = 0

const anchorGameweek = (row: SurvivalBaseline, options: FoldOptions): number | null => {
  if (row.asOfSeason === options.currentSeason) return row.asOfGameweek
  return row.asOfGameweek >= options.finalGameweek ? CARRIED_OVER_ANCHOR : null
}

const foldRow = (row: SurvivalBaseline, verdicts: SurvivalVerdict[], anchor: number): number =>
  verdicts
    .filter(
      (verdict) =>
        verdict.league === row.league &&
        verdict.event > anchor &&
        verdict.players.includes(row.person),
    )
    .sort((first, second) => first.event - second.event)
    .reduce((weeks, verdict) => (verdict.loser === row.person ? 0 : weeks + 1), row.weeksSinceLoss)

const toStreak = (row: SurvivalBaseline, weeksSinceLoss: number): SurvivalStreak => ({
  person: row.person,
  league: row.league,
  weeksSinceLoss,
})

export const foldSurvivalStreaks = (
  baselines: SurvivalBaseline[],
  verdicts: SurvivalVerdict[],
  options: FoldOptions,
): SurvivalStreaks => {
  const anchors = baselines.map((row) => anchorGameweek(row, options))
  const frozenIndex = anchors.findIndex((anchor) => anchor === null)

  if (frozenIndex !== -1) {
    const frozen = baselines[frozenIndex] as SurvivalBaseline
    return {
      asOfSeason: frozen.asOfSeason,
      asOfGameweek: frozen.asOfGameweek,
      streaks: baselines.map((row) => toStreak(row, row.weeksSinceLoss)),
    }
  }

  const resolvedAnchors = anchors.map((anchor) => anchor ?? CARRIED_OVER_ANCHOR)

  return {
    asOfSeason: options.currentSeason,
    asOfGameweek: Math.max(
      CARRIED_OVER_ANCHOR,
      ...resolvedAnchors,
      ...verdicts.map((v) => v.event),
    ),
    streaks: baselines.map((row, index) =>
      toStreak(row, foldRow(row, verdicts, resolvedAnchors[index] ?? CARRIED_OVER_ANCHOR)),
    ),
  }
}

export const rankSurvivalStreaks = (streaks: SurvivalStreak[]): RankedSurvivalStreak[] => {
  const ordered = [...streaks].sort(
    (first, second) =>
      second.weeksSinceLoss - first.weeksSinceLoss || first.person.localeCompare(second.person),
  )

  return ordered.map((streak) => ({
    ...streak,
    rank: ordered.findIndex((peer) => peer.weeksSinceLoss === streak.weeksSinceLoss) + 1,
  }))
}
