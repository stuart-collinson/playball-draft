import "server-only"

import { ANNUAL_GAMEWEEK } from "@pbd/lib/constants/App"
import { LAST_GAMEWEEK } from "@pbd/lib/constants/Fpl"

const ANNUAL_GAMEWEEK_ORDER = LAST_GAMEWEEK + 1

const UNREADABLE_GAMEWEEK_ORDER = 0

const NUMERIC_GAMEWEEK_PATTERN = "^[0-9]+$"

export const gameweekOrderSql = (gameweek: string): string =>
  `(case when ${gameweek} = '${ANNUAL_GAMEWEEK}' then ${ANNUAL_GAMEWEEK_ORDER} when ${gameweek} ~ '${NUMERIC_GAMEWEEK_PATTERN}' then ${gameweek}::int else ${UNREADABLE_GAMEWEEK_ORDER} end)`
