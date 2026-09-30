import "server-only"

import { CURRENT_SEASON } from "@pbd/lib/constants/App"
import type { CupBakeRow, CupDrawSlot } from "@pbd/lib/cups/bracket"
import { getSql } from "@pbd/server/db"
import type { Cup, CupFormat, CupRound, CupSchedule, CupTieRow } from "@pbd/types/cups.types"

type CupRecord = {
  id: string
  season: string
  name: string
  format: CupFormat
  draw_seed: string
  draw_entrants: string[]
  round_of_16_gameweek: number
  quarter_final_gameweek: number
  semi_final_gameweek: number
  final_gameweek: number
  created_at: string
}

type CupTieRecord = {
  id: string
  cup_id: string
  round: CupRound
  position: number
  person_one: string | null
  person_two: string | null
  person_one_leg_one: number | null
  person_two_leg_one: number | null
  person_one_leg_two: number | null
  person_two_leg_two: number | null
  winner: string | null
}

const CUP_COLUMNS =
  "id, season, name, format, draw_seed, draw_entrants, round_of_16_gameweek, quarter_final_gameweek, semi_final_gameweek, final_gameweek, created_at"

const TIE_COLUMNS =
  "id, cup_id, round, position, person_one, person_two, person_one_leg_one, person_two_leg_one, person_one_leg_two, person_two_leg_two, winner"

const toCup = (record: CupRecord): Cup => ({
  id: record.id,
  season: record.season,
  name: record.name,
  format: record.format,
  drawSeed: record.draw_seed,
  drawEntrants: record.draw_entrants,
  schedule: {
    round_of_16: record.round_of_16_gameweek,
    quarter_final: record.quarter_final_gameweek,
    semi_final: record.semi_final_gameweek,
    final: record.final_gameweek,
  },
  createdAt: new Date(record.created_at).toISOString(),
})

const toTieRow = (record: CupTieRecord): CupTieRow => ({
  id: record.id,
  round: record.round,
  position: record.position,
  personOne: record.person_one,
  personTwo: record.person_two,
  personOneLegOne: record.person_one_leg_one,
  personTwoLegOne: record.person_two_leg_one,
  personOneLegTwo: record.person_one_leg_two,
  personTwoLegTwo: record.person_two_leg_two,
  winner: record.winner,
})

export const listCups = async (): Promise<Cup[]> => {
  const rows = await getSql().query(
    `select ${CUP_COLUMNS} from cups where archive = false order by created_at desc`,
    [],
  )

  return (rows as CupRecord[]).map(toCup)
}

export const findCup = async (id: string): Promise<Cup | null> => {
  const rows = await getSql().query(
    `select ${CUP_COLUMNS} from cups where id = $1::uuid and archive = false`,
    [id],
  )

  const record = (rows as CupRecord[])[0]
  return record ? toCup(record) : null
}

export const listCupTies = async (cupIds: string[]): Promise<Map<string, CupTieRow[]>> => {
  const byCup = new Map<string, CupTieRow[]>(cupIds.map((cupId) => [cupId, []]))
  if (cupIds.length === 0) return byCup

  const rows = await getSql().query(
    `select ${TIE_COLUMNS} from cup_ties
     where cup_id = any($1::uuid[])
     order by cup_id, round, position`,
    [cupIds],
  )

  for (const record of rows as CupTieRecord[]) byCup.get(record.cup_id)?.push(toTieRow(record))

  return byCup
}

export const hasAnyCup = async (): Promise<boolean> => {
  const rows = await getSql().query(
    "select 1 as present from cups where archive = false limit 1",
    [],
  )

  return (rows as { present: number }[]).length > 0
}

type InsertCupInput = {
  name: string
  format: CupFormat
  schedule: CupSchedule
  drawSeed: string
  drawEntrants: string[]
  slots: CupDrawSlot[]
}

export const insertCup = async (input: InsertCupInput): Promise<string> => {
  const rows = await getSql().query(
    `with new_cup as (
       insert into cups (season, name, format, draw_seed, draw_entrants,
                         round_of_16_gameweek, quarter_final_gameweek,
                         semi_final_gameweek, final_gameweek)
       values ($1, $2, $3, $4, $5::text[], $6, $7, $8, $9)
       returning id
     )
     insert into cup_ties (cup_id, round, position, person_one, person_two)
     select new_cup.id, slot.round, slot.position, slot.person_one, slot.person_two
     from new_cup, unnest($10::text[], $11::int[], $12::text[], $13::text[])
       as slot(round, position, person_one, person_two)
     returning cup_id`,
    [
      CURRENT_SEASON,
      input.name,
      input.format,
      input.drawSeed,
      input.drawEntrants,
      input.schedule.round_of_16,
      input.schedule.quarter_final,
      input.schedule.semi_final,
      input.schedule.final,
      input.slots.map((slot) => slot.round),
      input.slots.map((slot) => slot.position),
      input.slots.map((slot) => slot.personOne),
      input.slots.map((slot) => slot.personTwo),
    ],
  )

  const cupId = (rows as { cup_id: string }[])[0]?.cup_id
  if (!cupId) throw new Error("Insert returned no cup")

  return cupId
}

type UpdateCupInput = {
  id: string
  name: string
  schedule: CupSchedule
}

export const updateCup = async (input: UpdateCupInput): Promise<boolean> => {
  const rows = await getSql().query(
    `update cups
     set name = $2,
         round_of_16_gameweek = $3,
         quarter_final_gameweek = $4,
         semi_final_gameweek = $5,
         final_gameweek = $6,
         updated_at = now()
     where id = $1::uuid and archive = false
     returning id`,
    [
      input.id,
      input.name,
      input.schedule.round_of_16,
      input.schedule.quarter_final,
      input.schedule.semi_final,
      input.schedule.final,
    ],
  )

  return (rows as { id: string }[]).length > 0
}

export const archiveCup = async (id: string): Promise<boolean> => {
  const rows = await getSql().query(
    "update cups set archive = true, updated_at = now() where id = $1::uuid and archive = false returning id",
    [id],
  )

  return (rows as { id: string }[]).length > 0
}

export const bakeCupTies = async (bakeRows: CupBakeRow[]): Promise<void> => {
  if (bakeRows.length === 0) return

  await getSql().query(
    `update cup_ties as tie
     set person_one = coalesce(tie.person_one, baked.person_one),
         person_two = coalesce(tie.person_two, baked.person_two),
         person_one_leg_one = coalesce(tie.person_one_leg_one, baked.person_one_leg_one),
         person_two_leg_one = coalesce(tie.person_two_leg_one, baked.person_two_leg_one),
         person_one_leg_two = coalesce(tie.person_one_leg_two, baked.person_one_leg_two),
         person_two_leg_two = coalesce(tie.person_two_leg_two, baked.person_two_leg_two),
         winner = coalesce(tie.winner, baked.winner),
         updated_at = now()
     from unnest($1::uuid[], $2::text[], $3::text[], $4::int[], $5::int[], $6::int[], $7::int[], $8::text[])
       as baked(id, person_one, person_two, person_one_leg_one, person_two_leg_one,
                person_one_leg_two, person_two_leg_two, winner)
     where tie.id = baked.id and tie.winner is null`,
    [
      bakeRows.map((row) => row.id),
      bakeRows.map((row) => row.personOne),
      bakeRows.map((row) => row.personTwo),
      bakeRows.map((row) => row.personOneLegOne),
      bakeRows.map((row) => row.personTwoLegOne),
      bakeRows.map((row) => row.personOneLegTwo),
      bakeRows.map((row) => row.personTwoLegTwo),
      bakeRows.map((row) => row.winner),
    ],
  )
}
