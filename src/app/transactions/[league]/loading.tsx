import { PageTitle } from "@pbd/components/PageTitle"
import { TransactionsSkeleton } from "@pbd/components/Transactions/TransactionsSkeleton"
import { PAGE_TITLES } from "@pbd/lib/constants/Pages"
import type { JSX } from "react"

const TransactionsLoading = (): JSX.Element => (
  <>
    <PageTitle title={PAGE_TITLES.transactions} />
    <TransactionsSkeleton />
  </>
)

export default TransactionsLoading
