import "server-only"

import { ANNUAL_GAMEWEEK } from "@pbd/lib/constants/App"
import { LAST_GAMEWEEK } from "@pbd/lib/constants/Fpl"

const ANNUAL_GAMEWEEK_ORDER = LAST_GAMEWEEK + 1

const UNREADABLE_GAMEWEEK_ORDER = 0

const WEEKLY_GAMEWEEK_PATTERN = "^([1-9]|[12][0-9]|3[0-8])$"

export const gameweekOrderSql = (gameweek: string): string =>
  `(case when ${gameweek} = '${ANNUAL_GAMEWEEK}' then ${ANNUAL_GAMEWEEK_ORDER} when ${gameweek} ~ '${WEEKLY_GAMEWEEK_PATTERN}' then ${gameweek}::int else ${UNREADABLE_GAMEWEEK_ORDER} end)`
