import { Button } from "@pbd/components/ui/button"
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
    <div className="h-1.5 overflow-hidden rounded-full bg-accent">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${((stepIndex + 1) / stepTitles.length) * 100}%` }}
      />
    </div>

    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-4 text-lg font-bold text-foreground">{stepTitles[stepIndex] ?? ""}</h2>
      {children}
    </div>

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
