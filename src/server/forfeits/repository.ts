import "server-only"

import { ANNUAL_GAMEWEEK, CURRENT_SEASON } from "@pbd/lib/constants/App"
import type { ForfeitMediaKind } from "@pbd/lib/constants/Forfeits"
import { LAST_GAMEWEEK, type LeagueSlug } from "@pbd/lib/constants/Fpl"
import type { ForfeitsCursor } from "@pbd/lib/forfeits/cursor"
import type { CreateForfeitInput, UpdateForfeitInput } from "@pbd/lib/forfeits/schema"
import { getSql } from "@pbd/server/db"
import type { Forfeit } from "@pbd/types/forfeits.types"

type ForfeitRow = {
  id: string
  season: string
  gameweek: string
  league: LeagueSlug
  type: string
  sub_type: string | null
  person: string
  title: string
  description: string | null
  media_kind: ForfeitMediaKind
  media_path: string
  thumb_path: string
  media_size_bytes: number
  archive: boolean
  created_at: string
}

export type ForfeitListFilters = {
  league: LeagueSlug | null
  cadence: "weekly" | "annual"
  gameweek: string | null
  type: string | null
  subType: string | null
  person: string | null
}

const FORFEIT_COLUMNS =
  "id, season, gameweek, league, type, sub_type, person, title, description, media_kind, media_path, thumb_path, media_size_bytes, archive, created_at"

const ANNUAL_GAMEWEEK_ORDER = LAST_GAMEWEEK + 1

const gameweekOrder = (gameweek: string): string =>
  `(case when ${gameweek} = '${ANNUAL_GAMEWEEK}' then ${ANNUAL_GAMEWEEK_ORDER} else ${gameweek}::int end)`

const LIST_ORDER = [
  "season",
  gameweekOrder("gameweek"),
  "date_trunc('milliseconds', created_at)",
  "id",
]

const toForfeit = (row: ForfeitRow): Forfeit => ({
  id: row.id,
  season: row.season,
  gameweek: row.gameweek,
  league: row.league,
  type: row.type,
  subType: row.sub_type,
  person: row.person,
  title: row.title,
  description: row.description,
  mediaKind: row.media_kind,
  mediaPath: row.media_path,
  thumbPath: row.thumb_path,
  mediaSizeBytes: row.media_size_bytes,
  archive: row.archive,
  createdAt: new Date(row.created_at).toISOString(),
})

export const listForfeits = async (
  filters: ForfeitListFilters,
  cursor: ForfeitsCursor | null,
  limit: number,
): Promise<Forfeit[]> => {
  const conditions: string[] = []
  const params: unknown[] = []

  const addParam = (value: unknown): string => {
    params.push(value)
    return `$${params.length}`
  }

  const addCondition = (buildClause: (placeholder: string) => string, value: unknown): void => {
    conditions.push(buildClause(addParam(value)))
  }

  if (filters.league) addCondition((placeholder) => `league = ${placeholder}`, filters.league)
  if (filters.gameweek) addCondition((placeholder) => `gameweek = ${placeholder}`, filters.gameweek)
  else if (filters.cadence === "annual")
    addCondition((placeholder) => `gameweek = ${placeholder}`, ANNUAL_GAMEWEEK)
  else addCondition((placeholder) => `gameweek <> ${placeholder}`, ANNUAL_GAMEWEEK)
  if (filters.type) addCondition((placeholder) => `type = ${placeholder}`, filters.type)
  if (filters.subType) addCondition((placeholder) => `sub_type = ${placeholder}`, filters.subType)
  if (filters.person) addCondition((placeholder) => `person = ${placeholder}`, filters.person)

  if (cursor) {
    const cursorPosition = [
      `${addParam(cursor.season)}::text`,
      gameweekOrder(`${addParam(cursor.gameweek)}::text`),
      `${addParam(cursor.createdAt)}::timestamptz`,
      `${addParam(cursor.id)}::uuid`,
    ]
    conditions.push(`(${LIST_ORDER.join(", ")}) < (${cursorPosition.join(", ")})`)
  }

  const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : ""
  const orderClause = LIST_ORDER.map((column) => `${column} desc`).join(", ")
  const rows = await getSql().query(
    `select ${FORFEIT_COLUMNS} from forfeits ${whereClause} order by ${orderClause} limit ${addParam(limit)}`,
    params,
  )

  return (rows as ForfeitRow[]).map(toForfeit)
}

export const getForfeitById = async (id: string): Promise<Forfeit | null> => {
  const rows = await getSql().query(`select ${FORFEIT_COLUMNS} from forfeits where id = $1::uuid`, [
    id,
  ])

  const row = (rows as ForfeitRow[])[0]
  return row ? toForfeit(row) : null
}

export const insertForfeit = async (input: CreateForfeitInput): Promise<Forfeit> => {
  const rows = await getSql().query(
    `insert into forfeits (season, gameweek, league, type, sub_type, person, title, description, media_kind, media_path, thumb_path, media_size_bytes)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     returning ${FORFEIT_COLUMNS}`,
    [
      CURRENT_SEASON,
      input.gameweek,
      input.league,
      input.type,
      input.subType,
      input.person,
      input.title,
      input.description,
      input.mediaKind,
      input.mediaPath,
      input.thumbPath,
      input.mediaSizeBytes,
    ],
  )

  const row = (rows as ForfeitRow[])[0]
  if (!row) throw new Error("Insert returned no row")

  return toForfeit(row)
}

export const updateForfeitDetails = async (input: UpdateForfeitInput): Promise<Forfeit | null> => {
  const rows = await getSql().query(
    `update forfeits set title = $2, description = $3, updated_at = now()
     where id = $1::uuid
     returning ${FORFEIT_COLUMNS}`,
    [input.id, input.title, input.description],
  )

  const row = (rows as ForfeitRow[])[0]
  return row ? toForfeit(row) : null
}

export const deleteForfeitById = async (id: string): Promise<boolean> => {
  const rows = await getSql().query("delete from forfeits where id = $1::uuid returning id", [id])

  return (rows as { id: string }[]).length > 0
}
