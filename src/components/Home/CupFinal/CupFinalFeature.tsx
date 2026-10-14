"use client"

import { DataErrorBoundary } from "@pbd/components/DataErrorBoundary/DataErrorBoundary"
import { CupFinalMatch } from "@pbd/components/Home/CupFinal/CupFinalMatch"
import { CupFinalStage } from "@pbd/components/Home/CupFinal/CupFinalStage"
import { useFeaturedCupFinal } from "@pbd/hooks/cups/useFeaturedCupFinal"
import type { JSX } from "react"
import { Suspense } from "react"

type Props = {
  gameweek: number
}

const NO_FINAL_NOTICE = "No final on the calendar"

const FAILED_NOTICE = "The final didn't load"

const FINAL_ERROR_TITLE = "Final Unavailable"

const FINAL_ERROR_MESSAGE = "The cup final's live scores didn't load. Give it another go."

const placeholderStage = (gameweek: number, notice: string | null): JSX.Element => (
  <CupFinalStage
    cupName={null}
    tie={null}
    view={null}
    lineupGameweek={gameweek}
    showPoints={false}
    notice={notice}
  />
)

export const CupFinalFeature = ({ gameweek }: Props): JSX.Element => {
  const { cup, isLoading, isError } = useFeaturedCupFinal(gameweek)

  if (isError) return placeholderStage(gameweek, FAILED_NOTICE)
  if (isLoading) return placeholderStage(gameweek, null)
  if (!cup) return placeholderStage(gameweek, NO_FINAL_NOTICE)

  return (
    <DataErrorBoundary title={FINAL_ERROR_TITLE} message={FINAL_ERROR_MESSAGE}>
      <Suspense fallback={placeholderStage(gameweek, null)}>
        <CupFinalMatch cup={cup} gameweek={gameweek} />
      </Suspense>
    </DataErrorBoundary>
  )
}
