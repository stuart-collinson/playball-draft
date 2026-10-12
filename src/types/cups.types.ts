export type CupFormat = "knockout" | "two_legs"

export type CupRound = "round_of_16" | "quarter_final" | "semi_final" | "final"

export type CupTieStatus = "pending" | "scheduled" | "live" | "settled"

export type CupStatus = "running" | "finished" | "unfinished"

export type CupGameweekBlock = "deadline_passed" | "clashes" | "no_room"

export type CupSchedule = Record<CupRound, number>

export type Cup = {
  id: string
  season: string
  name: string
  format: CupFormat
  drawSeed: string
  drawEntrants: string[]
  schedule: CupSchedule
  createdAt: string
}

export type CupTieRow = {
  id: string
  round: CupRound
  position: number
  personOne: string | null
  personTwo: string | null
  personOneLegOne: number | null
  personTwoLegOne: number | null
  personOneLegTwo: number | null
  personTwoLegTwo: number | null
  winner: string | null
}

export type CupTieLeg = {
  gameweek: number
  personOne: number | null
  personTwo: number | null
}

export type CupTie = {
  id: string
  round: CupRound
  position: number
  personOne: string | null
  personTwo: string | null
  feederOne: string[]
  feederTwo: string[]
  legs: CupTieLeg[]
  aggregateOne: number | null
  aggregateTwo: number | null
  winner: string | null
  status: CupTieStatus
}

export type CupFinalResult = {
  winner: string
  loser: string
  winnerPoints: number
  loserPoints: number
}

export type CupSummary = {
  id: string
  season: string
  name: string
  format: CupFormat
  schedule: CupSchedule
  status: CupStatus
  currentRound: CupRound | null
  final: CupFinalResult | null
  createdAt: string
}

export type ResolvedCup = {
  cup: Cup
  status: CupStatus
  currentRound: CupRound | null
  currentGameweek: number | null
  ties: CupTie[]
}

export type CupGameweekOption = {
  gameweek: number
  block: CupGameweekBlock | null
}

export type CupScheduleWindow = {
  firstOpenGameweek: number | null
  knockout: boolean
  twoLegs: boolean
}
