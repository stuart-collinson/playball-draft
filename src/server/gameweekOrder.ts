import "server-only"

import { ANNUAL_GAMEWEEK } from "@pbd/lib/constants/App"
import { LAST_GAMEWEEK } from "@pbd/lib/constants/Fpl"

const ANNUAL_GAMEWEEK_ORDER = LAST_GAMEWEEK + 1

export const gameweekOrderSql = (gameweek: string): string =>
  `(case when ${gameweek} = '${ANNUAL_GAMEWEEK}' then ${ANNUAL_GAMEWEEK_ORDER} else ${gameweek}::int end)`
