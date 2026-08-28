import { Button } from "@pbd/components/ui/Button"
import type { JSX } from "react"

type Row = {
  label: string
  value: string
}

type Props = {
  rows: Row[]
  previewUrl: string | null
  buttonLabel: string
  isSubmitting: boolean
  error: string | null
  onConfirm: () => void
}

export const WizardReviewStep = ({
  rows,
  previewUrl,
  buttonLabel,
  isSubmitting,
  error,
  onConfirm,
}: Props): JSX.Element => (
  <div className="flex flex-col gap-4">
    <div className="flex items-start gap-4">
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Thumbnail preview"
          className="h-24 w-24 shrink-0 rounded-xl border border-border object-cover"
        />
      )}
      <dl className="flex min-w-0 flex-1 flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3 text-sm">
            <dt className="shrink-0 text-muted-foreground">{row.label}</dt>
            <dd className="truncate text-right font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
    <Button onClick={onConfirm} isLoading={isSubmitting} disabled={isSubmitting}>
      {buttonLabel}
    </Button>
  </div>
)
