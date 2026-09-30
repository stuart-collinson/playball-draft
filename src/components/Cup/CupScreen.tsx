"use client"

import { CupBracket } from "@pbd/components/Cup/CupBracket"
import { CupBracketLive } from "@pbd/components/Cup/CupBracketLive"
import { CupDrawProof } from "@pbd/components/Cup/CupDrawProof"
import { CupHeader } from "@pbd/components/Cup/CupHeader"
import { useCup } from "@pbd/hooks/cups/useCup"
import { cupDrawPairs } from "@pbd/lib/cups/layout"
import type { JSX } from "react"
import { Suspense } from "react"

type Props = {
  cupId: string
}

export const CupScreen = ({ cupId }: Props): JSX.Element => {
  const { data } = useCup(cupId)
  const hasLiveRound = data.ties.some((tie) => tie.status === "live")

  const settledBracket = (
    <CupBracket
      format={data.cup.format}
      schedule={data.cup.schedule}
      ties={data.ties}
      live={null}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <CupHeader name={data.cup.name} season={data.cup.season} format={data.cup.format} />

      {hasLiveRound ? (
        <Suspense fallback={settledBracket}>
          <CupBracketLive
            format={data.cup.format}
            schedule={data.cup.schedule}
            ties={data.ties}
            currentGameweek={data.currentGameweek}
          />
        </Suspense>
      ) : (
        settledBracket
      )}

      <CupDrawProof
        drawSeed={data.cup.drawSeed}
        drawEntrants={data.cup.drawEntrants}
        drawPairs={cupDrawPairs(data.ties)}
        createdAt={data.cup.createdAt}
      />
    </div>
  )
}
