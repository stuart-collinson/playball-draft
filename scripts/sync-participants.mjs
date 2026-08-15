import { readFileSync } from "node:fs"

const FPL_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}

const PARTICIPANTS_PATH = "src/lib/constants/participants.ts"
const LEAGUE_CONSTANTS = ["LEAGUE_IDS.PREMIERSHIP", "LEAGUE_IDS.CHAMPIONSHIP"]

const fetchLeague = async (leagueId) => {
  const response = await fetch(`https://draft.premierleague.com/api/league/${leagueId}/details`, {
    headers: FPL_HEADERS,
  })
  if (!response.ok) throw new Error(`League ${leagueId}: ${response.status} ${response.statusText}`)
  return response.json()
}

const readExistingProfiles = () => {
  const source = readFileSync(PARTICIPANTS_PATH, "utf8")
  const pattern =
    /name:\s*"([^"]+)",\s*nickname:\s*(null|"[^"]*"),\s*image:\s*(null|"[^"]*")/g
  const profiles = new Map()
  for (const [, name, nickname, image] of source.matchAll(pattern)) {
    profiles.set(name, { nickname, image })
  }
  return profiles
}

const main = async () => {
  const leagueIds = process.argv.slice(2).map(Number)
  if (leagueIds.length !== 2 || leagueIds.some(Number.isNaN)) {
    console.error("Usage: node scripts/sync-participants.mjs <premiershipId> <championshipId>")
    process.exit(1)
  }

  const profiles = readExistingProfiles()
  const leagues = await Promise.all(leagueIds.map(fetchLeague))

  const lines = ["export const PARTICIPANTS: Participant[] = ["]
  const unmatched = []
  const seen = new Set()

  leagues.forEach((league, index) => {
    const leagueConstant = LEAGUE_CONSTANTS[index]
    const entries = league.league_entries ?? []
    const leagueName = league.league?.name ?? "Unknown league"
    console.error(`${leagueName} (${leagueIds[index]}): ${entries.length} entries`)

    if (entries.length === 0) {
      console.error("NO ENTRIES — has this league been created and drafted yet?")
    }

    for (const entry of entries) {
      const name = `${entry.player_first_name} ${entry.player_last_name}`
      const profile = profiles.get(name)
      if (!profile) unmatched.push(name)
      seen.add(name)

      lines.push("  {")
      lines.push(`    apiId: ${entry.id},`)
      lines.push(`    entryId: ${entry.entry_id},`)
      lines.push(`    leagueId: ${leagueConstant},`)
      lines.push(`    name: "${name}",`)
      lines.push(`    nickname: ${profile?.nickname ?? "null"},`)
      lines.push(`    image: ${profile?.image ?? "null"},`)
      lines.push("  },")
    }
  })

  lines.push("]")
  console.log(lines.join("\n"))

  const departed = [...profiles.keys()].filter((name) => !seen.has(name))
  if (unmatched.length > 0) {
    console.error(`\n// New to the league (no nickname/image yet): ${unmatched.join(", ")}`)
  }
  if (departed.length > 0) {
    console.error(`// In the old file but not in these leagues: ${departed.join(", ")}`)
  }
  console.error(`\n// Remember to update LEAGUE_IDS in src/lib/constants/fpl.ts to ${leagueIds.join(" and ")}.`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
