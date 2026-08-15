import { EmptyState } from "@pbd/components/EmptyState/EmptyState"
import { PageTitle } from "@pbd/components/PageTitle"
import { IS_VALID_LEAGUE_SCOPE, getLeagueLabel } from "@pbd/lib/leagues"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { JSX } from "react"

const PAGE_TITLE = "Transactions"

type PageProps = {
  params: Promise<{ league: string }>
}

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league)) return {}
  return { title: `${PAGE_TITLE} · ${getLeagueLabel(league)}` }
}

const TransactionsPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { league } = await params
  if (!IS_VALID_LEAGUE_SCOPE(league)) notFound()

  return (
    <>
      <PageTitle title={PAGE_TITLE} />
      <EmptyState title="Transactions" message="Transactions coming soon." />
    </>
  )
}

export default TransactionsPage
