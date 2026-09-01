import { ANNUAL_GAMEWEEK } from "@pbd/lib/constants/app"

const WEEKLY_GAMEWEEK_PATTERN = /^([1-9]|[12][0-9]|3[0-8])$/

export const isWeeklyGameweek = (value: string): boolean => WEEKLY_GAMEWEEK_PATTERN.test(value)

export const isGameweekValue = (value: string): boolean =>
  value === ANNUAL_GAMEWEEK || isWeeklyGameweek(value)

export const gameweekLabel = (value: string): string =>
  value === ANNUAL_GAMEWEEK ? "Annual" : `GW ${value}`

export const GAMEWEEK_OPTIONS = [
  { value: ANNUAL_GAMEWEEK, label: "Annual", fullWidth: true },
  ...Array.from({ length: 38 }, (_, index) => ({
    value: String(index + 1),
    label: String(index + 1),
  })),
]
