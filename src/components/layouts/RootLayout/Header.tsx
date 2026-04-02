import type { JSX } from "react"
import Link from "next/link"
import { APP_NAME } from "@pbd/lib/constants/app"

export const Header = (): JSX.Element => (
  <header className="border-b border-gray-200 bg-white px-6 py-4">
    <nav className="mx-auto flex max-w-7xl items-center justify-between">
      <Link href="/" className="text-xl font-bold text-brand-500">
        {APP_NAME}
      </Link>
      <ul className="flex list-none gap-6">
        <li>
          <Link href="/" className="text-sm text-gray-600 hover:text-brand-500">
            Home
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-brand-500">
            Dashboard
          </Link>
        </li>
      </ul>
    </nav>
  </header>
)
