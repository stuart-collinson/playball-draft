import { Card, CardContent } from "@pbd/components/ui/card"
import { CUP_FORMAT_LABELS, CUP_ROUND_LABELS } from "@pbd/lib/constants/Cups"
import { cupHref } from "@pbd/lib/constants/Pages"
import { cupRoundGameweekLabel } from "@pbd/lib/cups/labels"
import type { RouterOutput } from "@pbd/types/api.types"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import type { JSX } from "react"

type CupSummary = RouterOutput["cups"]["list"][number]

type Props = {
  cup: CupSummary
}

export const CupSelectorCard = ({ cup }: Props): JSX.Element => (
  <Link href={cupHref(cup.id)} className="rounded-2xl focus-visible:outline-none">
    <Card className="gap-0 rounded-2xl py-4 transition-colors hover:border-primary/40">
      <CardContent className="flex items-center gap-3 px-4">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-bold text-sm">{cup.name}</span>
          <span className="truncate text-muted-foreground text-xs">
            {[CUP_FORMAT_LABELS[cup.format], cup.season].join(" · ")}
          </span>
          {cup.currentRound && (
            <span className="truncate font-bold text-[10px] text-primary uppercase tracking-wider">
              {[
                CUP_ROUND_LABELS[cup.currentRound],
                cupRoundGameweekLabel(cup.format, cup.schedule, cup.currentRound),
              ].join(" · ")}
            </span>
          )}
        </div>
        <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </CardContent>
    </Card>
  </Link>
)
