import "server-only"

import { ANNUAL_GAMEWEEK } from "@pbd/lib/constants/App"
import { LAST_GAMEWEEK } from "@pbd/lib/constants/Fpl"

const ANNUAL_GAMEWEEK_ORDER = LAST_GAMEWEEK + 1

const UNKNOWN_GAMEWEEK_ORDER = 0

export const gameweekOrderSql = (gameweek: string): string =>
  `(case when ${gameweek} = '${ANNUAL_GAMEWEEK}' then ${ANNUAL_GAMEWEEK_ORDER} when ${gameweek} ~ '^[0-9]+$' then ${gameweek}::int else ${UNKNOWN_GAMEWEEK_ORDER} end)`
