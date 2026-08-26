import { LEAGUE_IDS } from "./fpl"

export type Participant = {
  apiId: number
  entryId: number
  leagueId: number
  name: string
  nickname: string | null
  image: string | null
}

export const PARTICIPANTS: Participant[] = [
  {
    apiId: 19445,
    entryId: 19435,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Lewis Smyth",
    nickname: "Smyffler",
    image: "/participants/lewis_smyth.jpg",
  },
  {
    apiId: 19446,
    entryId: 19436,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Ewan Nelson",
    nickname: "Wan",
    image: "/participants/ewan_nelson.jpg",
  },
  {
    apiId: 19447,
    entryId: 19437,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Thomas Campbell",
    nickname: "Teece",
    image: "/participants/thomas_campbell.jpg",
  },
  {
    apiId: 19448,
    entryId: 19438,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Jake Stevenson",
    nickname: "Jakers",
    image: "/participants/jake_stevenson.jpg",
  },
  {
    apiId: 19449,
    entryId: 19440,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Robert McNutt",
    nickname: "Rob",
    image: "/participants/robert_mcnutt.jpg",
  },
  {
    apiId: 19451,
    entryId: 19441,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Rory Sproule",
    nickname: "Sprl",
    image: "/participants/rory_sproule.jpg",
  },
  {
    apiId: 19452,
    entryId: 19442,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Peter Baker",
    nickname: "Pete",
    image: "/participants/peter_baker.jpg",
  },
  {
    apiId: 19453,
    entryId: 19443,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Stuart Collinson",
    nickname: "Stu",
    image: "/participants/stuart_collinson.jpg",
  },
  {
    apiId: 96262,
    entryId: 96003,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Alan Waring",
    nickname: "Alan",
    image: "/participants/alan_waring.jpg",
  },
  {
    apiId: 96263,
    entryId: 96004,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Luke Niblock",
    nickname: "Nib",
    image: "/participants/luke_niblock.jpg",
  },
  {
    apiId: 96264,
    entryId: 96005,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Richard Kane",
    nickname: "Dicky",
    image: "/participants/richard_kane.jpg",
  },
  {
    apiId: 96265,
    entryId: 96006,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Louis Watts",
    nickname: "Lou",
    image: "/participants/louis_watts.jpg",
  },
  {
    apiId: 96266,
    entryId: 96007,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Tony McCracken",
    nickname: "Tony",
    image: "/participants/tony_mccracken.jpg",
  },
  {
    apiId: 96267,
    entryId: 96008,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Tyler Walker",
    nickname: "T Dawg",
    image: "/participants/tyler_walker.jpg",
  },
  {
    apiId: 96268,
    entryId: 96009,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Jamie Marks",
    nickname: "Jam",
    image: "/participants/jamie_marks.jpg",
  },
  {
    apiId: 96269,
    entryId: 96010,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Quinn Tierney",
    nickname: "Quinn",
    image: "/participants/quinn_tierney.jpg",
  },
]

export const PARTICIPANT_BY_API_ID = Object.fromEntries(
  PARTICIPANTS.map((p) => [p.apiId, p]),
) as Record<number, Participant>

export const PARTICIPANT_BY_ENTRY_ID = Object.fromEntries(
  PARTICIPANTS.map((p) => [p.entryId, p]),
) as Record<number, Participant>

export const PARTICIPANTS_BY_LEAGUE_ID = PARTICIPANTS.reduce<Record<number, Participant[]>>(
  (acc, p) => {
    const list = acc[p.leagueId] ?? []
    return { ...acc, [p.leagueId]: [...list, p] }
  },
  {},
)

export const countParticipants = (leagueIds: number[]): number =>
  leagueIds.reduce(
    (total, leagueId) => total + (PARTICIPANTS_BY_LEAGUE_ID[leagueId]?.length ?? 0),
    0,
  )
