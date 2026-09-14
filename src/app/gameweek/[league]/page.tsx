import { LeagueTableScreen } from "@pbd/components/LeagueTable/LeagueTableScreen"
import { PAGE_TITLES } from "@pbd/lib/constants/Pages"
import { IS_VALID_LEAGUE_SCOPE, getLeagueIds, getLeagueLabel } from "@pbd/lib/leagues"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { JSX } from "react"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ league: string }>
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league)) return {}
  return { title: `${PAGE_TITLES.gameweek} · ${getLeagueLabel(league)}` }
}

const GameweekPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league)) notFound()

  return (
    <LeagueTableScreen
      leagueIds={getLeagueIds(league)}
      mode="form"
      title={PAGE_TITLES.gameweek}
      errorTitle="No Gameweek Scores"
      errorMessage="Fantasy Premier League didn't return this gameweek's scores."
    />
  )
}

export default GameweekPage
