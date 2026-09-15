import { Button } from "@pbd/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@pbd/components/ui/card"
import { Progress } from "@pbd/components/ui/progress"
import { CURRENT_SEASON } from "@pbd/lib/constants/App"
import type { JSX, ReactNode } from "react"

type Props = {
  stepTitles: readonly string[]
  stepIndex: number
  isBusy: boolean
  nextDisabled: boolean
  onBack: () => void
  onNext: (() => void) | null
  children: ReactNode
}

const PERCENT = 100

export const WizardShell = ({
  stepTitles,
  stepIndex,
  isBusy,
  nextDisabled,
  onBack,
  onNext,
  children,
}: Props): JSX.Element => (
  <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span>
        Step {stepIndex + 1} of {stepTitles.length}
      </span>
      <span>{CURRENT_SEASON}</span>
    </div>
    <Progress
      value={((stepIndex + 1) / stepTitles.length) * PERCENT}
      aria-label="Progress through the steps"
      className="h-1.5 bg-accent"
    />

    <Card className="gap-4 rounded-2xl py-5">
      <CardHeader className="px-5">
        <CardTitle className="text-lg font-bold">{stepTitles[stepIndex] ?? ""}</CardTitle>
      </CardHeader>
      <CardContent className="px-5">{children}</CardContent>
    </Card>

    <div className="flex justify-between">
      <Button variant="ghost" size="sm" onClick={onBack} disabled={stepIndex === 0 || isBusy}>
        Back
      </Button>
      {onNext && (
        <Button size="sm" onClick={onNext} disabled={nextDisabled}>
          Next
        </Button>
      )}
    </div>
  </div>
)
