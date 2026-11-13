import "server-only"

import { ANNUAL_GAMEWEEK } from "@pbd/lib/constants/App"

const MAX_GAMEWEEK_DIGITS = 9

const ANNUAL_GAMEWEEK_ORDER = 10 ** MAX_GAMEWEEK_DIGITS

const UNREADABLE_GAMEWEEK_ORDER = 0

const NUMERIC_GAMEWEEK_PATTERN = `^[0-9]{1,${MAX_GAMEWEEK_DIGITS}}$`

export const gameweekOrderSql = (gameweek: string): string =>
  `(case when ${gameweek} = '${ANNUAL_GAMEWEEK}' then ${ANNUAL_GAMEWEEK_ORDER} when ${gameweek} ~ '${NUMERIC_GAMEWEEK_PATTERN}' then ${gameweek}::int else ${UNREADABLE_GAMEWEEK_ORDER} end)`
