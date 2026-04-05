import { LEAGUE_IDS } from "./fpl";

export type Participant = {
  /** LeagueEntry.id — used in standings/league details API */
  apiId: number;
  /** LeagueEntry.entry_id — used in draft choices API (choice.entry) */
  entryId: number;
  leagueId: number;
  name: string;
  nickname: string | null;
  image: string | null;
};

export const PARTICIPANTS: Participant[] = [
  // Premiership (league 1069)
  {
    apiId: 3096,
    entryId: 3096,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Lewis Smyth",
    nickname: "Smyffler",
    image: "/participants/lewis_smyth.jpg",
  },
  {
    apiId: 3377,
    entryId: 3377,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Jake Stevenson",
    nickname: "Jakers",
    image: "/participants/jake_stevenson.jpg",
  },
  {
    apiId: 3826,
    entryId: 3825,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Robert McNutt",
    nickname: "Rob",
    image: "/participants/robert_mcnutt.jpg",
  },
  {
    apiId: 15355,
    entryId: 15340,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Rory Sproule",
    nickname: "Sprl",
    image: "/participants/rory_sproule.jpg",
  },
  {
    apiId: 15824,
    entryId: 15809,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Peter Baker",
    nickname: "Pete",
    image: "/participants/peter_baker.jpg",
  },
  {
    apiId: 16584,
    entryId: 16568,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Stuart Collinson",
    nickname: "Stu",
    image: "/participants/stuart_collinson.jpg",
  },
  {
    apiId: 255924,
    entryId: 257233,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Ewan Nelson",
    nickname: "Wan",
    image: "/participants/ewan_nelson.jpg",
  },
  {
    apiId: 259518,
    entryId: 260814,
    leagueId: LEAGUE_IDS.PREMIERSHIP,
    name: "Thomas Campbell",
    nickname: "Teece",
    image: "/participants/thomas_campbell.jpg",
  },
  // Championship (league 32779)
  {
    apiId: 159806,
    entryId: 162332,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Alan Waring",
    nickname: "Alan",
    image: "/participants/alan_waring.jpg",
  },
  {
    apiId: 159869,
    entryId: 162395,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Luke Niblock",
    nickname: "Nib",
    image: "/participants/luke_niblock.jpg",
  },
  {
    apiId: 172011,
    entryId: 174430,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Richard Kane",
    nickname: "Dicky",
    image: "/participants/richard_kane.jpg",
  },
  {
    apiId: 172104,
    entryId: 174523,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Louis Watts",
    nickname: "Lou",
    image: "/participants/louis_watts.jpg",
  },
  {
    apiId: 172221,
    entryId: 174639,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Tony McCracken",
    nickname: "Tony",
    image: "/participants/tony_mccracken.jpg",
  },
  {
    apiId: 172676,
    entryId: 175094,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Tyler Walker",
    nickname: "T Dawg",
    image: "/participants/tyler_walker.jpg",
  },
  {
    apiId: 173739,
    entryId: 176153,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Jamie Marks",
    nickname: "Jam",
    image: "/participants/jamie_marks.jpg",
  },
  {
    apiId: 333760,
    entryId: 334166,
    leagueId: LEAGUE_IDS.CHAMPIONSHIP,
    name: "Quinn Tierney",
    nickname: "Quinn",
    image: "/participants/quinn_tierney.jpg",
  },
];

export const PARTICIPANT_BY_API_ID = Object.fromEntries(
  PARTICIPANTS.map((p) => [p.apiId, p]),
) as Record<number, Participant>;

export const PARTICIPANT_BY_ENTRY_ID = Object.fromEntries(
  PARTICIPANTS.map((p) => [p.entryId, p]),
) as Record<number, Participant>;

export const PARTICIPANTS_BY_LEAGUE_ID = PARTICIPANTS.reduce<
  Record<number, Participant[]>
>((acc, p) => {
  const list = acc[p.leagueId] ?? [];
  return { ...acc, [p.leagueId]: [...list, p] };
}, {});
