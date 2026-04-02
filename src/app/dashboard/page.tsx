import type { Metadata } from "next"
import type { JSX } from "react"

export const metadata: Metadata = {
  title: "Dashboard",
}

const DashboardPage = (): JSX.Element => (
  <main className="p-8">
    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
    <p className="mt-2 text-gray-600">Protected content goes here.</p>
  </main>
)

export default DashboardPage
