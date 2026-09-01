import "server-only"

import { CURRENT_SEASON } from "@pbd/lib/constants/app"
import type { CreateLuckInput, UpdateLuckInput } from "@pbd/lib/luckSchema"
import { getSql } from "@pbd/server/db"
import type { LuckMoment } from "@pbd/types/luck.types"

type LuckRow = {
  id: string
  season: string
  gameweek: string
  people: string[]
  title: string
  description: string
  archive: boolean
  created_at: string
}

const LUCK_COLUMNS = "id, season, gameweek, people, title, description, archive, created_at"

const GAMEWEEK_SORT =
  "case when gameweek = 'annual' then 999 when gameweek ~ '^[0-9]+$' then gameweek::int else 0 end"

const toLuckMoment = (row: LuckRow): LuckMoment => ({
  id: row.id,
  season: row.season,
  gameweek: row.gameweek,
  people: row.people,
  title: row.title,
  description: row.description,
  archive: row.archive,
  createdAt: new Date(row.created_at).toISOString(),
})

export const listLuckMoments = async (): Promise<LuckMoment[]> => {
  const rows = await getSql().query(
    `select ${LUCK_COLUMNS} from luck_of_the_week
     where archive = false
     order by season desc, ${GAMEWEEK_SORT} desc, created_at desc`,
    [],
  )

  return (rows as LuckRow[]).map(toLuckMoment)
}

export const insertLuckMoment = async (input: CreateLuckInput): Promise<LuckMoment> => {
  const rows = await getSql().query(
    `insert into luck_of_the_week (season, gameweek, people, title, description)
     values ($1, $2, $3::text[], $4, $5)
     returning ${LUCK_COLUMNS}`,
    [CURRENT_SEASON, input.gameweek, input.people, input.title, input.description],
  )

  const row = (rows as LuckRow[])[0]
  if (!row) throw new Error("Insert returned no row")

  return toLuckMoment(row)
}

export const updateLuckMomentDetails = async (
  input: UpdateLuckInput,
): Promise<LuckMoment | null> => {
  const rows = await getSql().query(
    `update luck_of_the_week set title = $2, description = $3, updated_at = now()
     where id = $1::uuid
     returning ${LUCK_COLUMNS}`,
    [input.id, input.title, input.description],
  )

  const row = (rows as LuckRow[])[0]
  return row ? toLuckMoment(row) : null
}

export const deleteLuckMomentById = async (id: string): Promise<boolean> => {
  const rows = await getSql().query(
    "delete from luck_of_the_week where id = $1::uuid returning id",
    [id],
  )

  return (rows as { id: string }[]).length > 0
}
