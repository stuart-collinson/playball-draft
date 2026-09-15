import { Button } from "@pbd/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import type { JSX } from "react"

type Props = {
  href: string
}

export const BackLink = ({ href }: Props): JSX.Element => (
  <Button variant="outline" size="icon" asChild className="-ml-0.5 shrink-0">
    <Link href={href} aria-label="Back">
      <ChevronLeft className="size-5" />
    </Link>
  </Button>
)
