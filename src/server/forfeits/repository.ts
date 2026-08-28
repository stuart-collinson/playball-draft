import "server-only"

import { CURRENT_SEASON } from "@pbd/lib/constants/Forfeits"
import type { ForfeitMediaKind } from "@pbd/lib/constants/Forfeits"
import type { LeagueSlug } from "@pbd/lib/constants/fpl"
import type { ForfeitsCursor } from "@pbd/lib/forfeitsCursor"
import type { CreateForfeitInput } from "@pbd/lib/forfeitsSchema"
import { getSql } from "@pbd/server/forfeits/db"
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
  gameweek: string | null
  type: string | null
  subType: string | null
  person: string | null
}

const FORFEIT_COLUMNS =
  "id, season, gameweek, league, type, sub_type, person, title, description, media_kind, media_path, thumb_path, media_size_bytes, archive, created_at"

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

  const addCondition = (buildClause: (index: number) => string, value: unknown): void => {
    params.push(value)
    conditions.push(buildClause(params.length))
  }

  if (filters.league) addCondition((index) => `league = $${index}`, filters.league)
  if (filters.gameweek) addCondition((index) => `gameweek = $${index}`, filters.gameweek)
  if (filters.type) addCondition((index) => `type = $${index}`, filters.type)
  if (filters.subType) addCondition((index) => `sub_type = $${index}`, filters.subType)
  if (filters.person) addCondition((index) => `person = $${index}`, filters.person)

  if (cursor) {
    params.push(cursor.createdAt, cursor.id)
    conditions.push(
      `(date_trunc('milliseconds', created_at), id) < ($${params.length - 1}::timestamptz, $${params.length}::uuid)`,
    )
  }

  params.push(limit)
  const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : ""
  const rows = await getSql().query(
    `select ${FORFEIT_COLUMNS} from forfeits ${whereClause} order by date_trunc('milliseconds', created_at) desc, id desc limit $${params.length}`,
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
