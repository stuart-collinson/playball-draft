export type Participant = {
  /** LeagueEntry.id — used in standings/league details API */
  apiId: number
  /** LeagueEntry.entry_id — used in draft choices API (choice.entry) */
  entryId: number
  name: string
  nickname: string | null
  image: string | null
}

export const PARTICIPANTS: Participant[] = [
  // Premiership (league 1069)
  {
    apiId: 3096,
    entryId: 3096,
    name: "Lewis Smyth",
    nickname: "Smyffler",
    image: "/participants/lewis_smyth.jpg",
  },
  {
    apiId: 3377,
    entryId: 3377,
    name: "Jake Stevenson",
    nickname: "Jakers",
    image: "/participants/jake_stevenson.jpg",
  },
  {
    apiId: 3826,
    entryId: 3825,
    name: "Robert McNutt",
    nickname: "Rob",
    image: "/participants/robert_mcnutt.jpg",
  },
  {
    apiId: 15355,
    entryId: 15340,
    name: "Rory Sproule",
    nickname: "Sprl",
    image: "/participants/rory_sproule.jpg",
  },
  {
    apiId: 15824,
    entryId: 15809,
    name: "Peter Baker",
    nickname: "Pete",
    image: "/participants/peter_baker.jpg",
  },
  {
    apiId: 16584,
    entryId: 16568,
    name: "Stuart Collinson",
    nickname: "Stu",
    image: "/participants/stuart_collinson.jpg",
  },
  {
    apiId: 255924,
    entryId: 257233,
    name: "Ewan Nelson",
    nickname: "Wan",
    image: "/participants/ewan_nelson.jpg",
  },
  {
    apiId: 259518,
    entryId: 260814,
    name: "Thomas Campbell",
    nickname: "Teece",
    image: "/participants/thomas_campbell.jpg",
  },
  // Championship (league 32779)
  {
    apiId: 159806,
    entryId: 162332,
    name: "Alan Waring",
    nickname: "Alan",
    image: "/participants/alan_waring.jpg",
  },
  {
    apiId: 159869,
    entryId: 162395,
    name: "Luke Niblock",
    nickname: "Nib",
    image: "/participants/luke_niblock.jpg",
  },
  {
    apiId: 172011,
    entryId: 174430,
    name: "Richard Kane",
    nickname: "Dicky",
    image: "/participants/richard_kane.jpg",
  },
  {
    apiId: 172104,
    entryId: 174523,
    name: "Louis Watts",
    nickname: "Lou",
    image: "/participants/louis_watts.jpg",
  },
  {
    apiId: 172221,
    entryId: 174639,
    name: "Tony McCracken",
    nickname: "Tony",
    image: "/participants/tony_mccracken.jpg",
  },
  {
    apiId: 172676,
    entryId: 175094,
    name: "Tyler Walker",
    nickname: "T Dawg",
    image: "/participants/tyler_walker.jpg",
  },
  {
    apiId: 173739,
    entryId: 176153,
    name: "Jamie Marks",
    nickname: "Jam",
    image: "/participants/jamie_marks.jpg",
  },
  {
    apiId: 333760,
    entryId: 334166,
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
