import { CupFinalistRow } from "@pbd/components/Cup/CupFinalistRow"
import { Card, CardContent } from "@pbd/components/ui/card"
import { CUP_FORMAT_LABELS } from "@pbd/lib/constants/Cups"
import type { RouterOutput } from "@pbd/types/api.types"
import type { JSX } from "react"

type CupSummary = RouterOutput["cups"]["list"][number]

type Props = {
  cup: CupSummary
}

export const CupFinalCard = ({ cup }: Props): JSX.Element => (
  <Card className="gap-0 rounded-2xl py-3">
    <CardContent className="flex flex-col gap-2.5 px-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate font-bold text-sm">{cup.name}</span>
        <span className="shrink-0 text-[10px] text-muted-foreground uppercase tracking-wider">
          {[cup.season, CUP_FORMAT_LABELS[cup.format]].join(" · ")}
        </span>
      </div>

      {cup.final ? (
        <div className="flex flex-col gap-1.5">
          <CupFinalistRow slug={cup.final.winner} points={cup.final.winnerPoints} isWinner />
          <CupFinalistRow slug={cup.final.loser} points={cup.final.loserPoints} isWinner={false} />
        </div>
      ) : (
        <span className="text-muted-foreground text-xs">This one never reached a final.</span>
      )}
    </CardContent>
  </Card>
)
