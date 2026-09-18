"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CupGameweekStep } from "@pbd/components/Cup/CupGameweekStep"
import { WizardOptionGrid } from "@pbd/components/Wizard/WizardOptionGrid"
import { WizardReviewStep } from "@pbd/components/Wizard/WizardReviewStep"
import { WizardShell } from "@pbd/components/Wizard/WizardShell"
import { Field, FieldError, FieldLabel } from "@pbd/components/ui/field"
import { Input } from "@pbd/components/ui/input"
import { useCreateCup } from "@pbd/hooks/cups/useCreateCup"
import {
  CUP_FORMATS,
  CUP_FORMAT_HINTS,
  CUP_FORMAT_LABELS,
  CUP_NAME_MAX_LENGTH,
  CUP_ROUNDS,
  CUP_ROUND_LABELS,
} from "@pbd/lib/constants/Cups"
import { cupHref } from "@pbd/lib/constants/Pages"
import { cupRoundGameweekLabel } from "@pbd/lib/cups/labels"
import { defaultCupSchedule, withCupRoundGameweek } from "@pbd/lib/cups/schedule"
import {
  CUP_ROUND_FIELDS,
  createCupInputSchema,
  cupScheduleFrom,
  cupScheduleToInput,
} from "@pbd/lib/cups/schema"
import type { CreateCupInput } from "@pbd/lib/cups/schema"
import type { CupFormat, CupRound } from "@pbd/types/cups.types"
import { useRouter } from "next/navigation"
import type { JSX } from "react"
import { useId, useState } from "react"
import { useForm } from "react-hook-form"

type Props = {
  firstOpenGameweek: number
  allowTwoLegs: boolean
}

const STEP_TITLES = [
  "What's it called?",
  "How does it run?",
  "Round of 16",
  "Quarter finals",
  "Semi finals",
  "The final",
  "Check it over",
] as const

const NAME_STEP = 0

const FORMAT_STEP = 1

const FIRST_ROUND_STEP = 2

const REVIEW_STEP = 6

const FORMAT_COLUMNS = 2

export const CupWizardForm = ({ firstOpenGameweek, allowTwoLegs }: Props): JSX.Element => {
  const id = useId()
  const router = useRouter()
  const createCup = useCreateCup()
  const [stepIndex, setStepIndex] = useState(NAME_STEP)
  const [isSaved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<CreateCupInput>({
    resolver: zodResolver(createCupInputSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      ...cupScheduleToInput("knockout", defaultCupSchedule("knockout", firstOpenGameweek)),
    },
  })

  const values = form.watch()
  const schedule = cupScheduleFrom(values)

  const applySchedule = (round: CupRound, gameweek: number, format: CupFormat): void => {
    const next = withCupRoundGameweek(format, schedule, round, gameweek)
    for (const each of CUP_ROUNDS)
      form.setValue(CUP_ROUND_FIELDS[each], next[each], { shouldValidate: true })
  }

  const chooseFormat = (value: string): void => {
    const format = value as CupFormat
    const next = defaultCupSchedule(format, firstOpenGameweek)

    form.setValue("format", format, { shouldValidate: true })
    for (const round of CUP_ROUNDS) form.setValue(CUP_ROUND_FIELDS[round], next[round])
  }

  const submit = async (): Promise<void> => {
    setSubmitError(null)

    try {
      const input = form.getValues()
      const created = await createCup.mutateAsync({ ...input, name: input.name.trim() })

      setSaved(true)
      router.push(cupHref(created.id))
    } catch (cause) {
      setSubmitError(
        cause instanceof Error ? cause.message : "Couldn't create that cup. Try again.",
      )
    }
  }

  const nextFromName = async (): Promise<void> => {
    if (await form.trigger("name")) setStepIndex(FORMAT_STEP)
  }

  const resolveNext = (): (() => void) | null => {
    if (stepIndex === NAME_STEP) return () => void nextFromName()
    if (stepIndex < REVIEW_STEP) return () => setStepIndex((index) => index + 1)

    return null
  }

  const back = (): void => {
    setSubmitError(null)
    setStepIndex((index) => Math.max(NAME_STEP, index - 1))
  }

  const isBusy = createCup.isPending || isSaved

  const reviewRows = [
    { label: "Name", value: values.name.trim() },
    { label: "Format", value: CUP_FORMAT_LABELS[values.format] },
    ...CUP_ROUNDS.map((round) => ({
      label: CUP_ROUND_LABELS[round],
      value: cupRoundGameweekLabel(values.format, schedule, round),
    })),
  ]

  const renderStep = (): JSX.Element => {
    if (stepIndex === NAME_STEP)
      return (
        <Field data-invalid={Boolean(form.formState.errors.name) || undefined}>
          <FieldLabel htmlFor={`${id}-name`}>Cup name</FieldLabel>
          <Input
            id={`${id}-name`}
            {...form.register("name")}
            maxLength={CUP_NAME_MAX_LENGTH}
            placeholder="The Playball Cup"
            aria-invalid={Boolean(form.formState.errors.name) || undefined}
            className="h-11"
          />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
      )

    if (stepIndex === FORMAT_STEP)
      return (
        <WizardOptionGrid
          options={CUP_FORMATS.map((format) => ({
            value: format,
            label: CUP_FORMAT_LABELS[format],
            hint: CUP_FORMAT_HINTS[format],
            disabled: format === "two_legs" && !allowTwoLegs,
          }))}
          selected={values.format}
          onSelect={chooseFormat}
          columns={FORMAT_COLUMNS}
        />
      )

    const round = CUP_ROUNDS[stepIndex - FIRST_ROUND_STEP]
    if (round)
      return (
        <CupGameweekStep
          format={values.format}
          round={round}
          schedule={schedule}
          firstOpenGameweek={firstOpenGameweek}
          onSelect={(gameweek) => applySchedule(round, gameweek, values.format)}
        />
      )

    return (
      <WizardReviewStep
        rows={reviewRows}
        previewUrl={null}
        buttonLabel={isBusy ? "Drawing…" : "Draw the cup"}
        isSubmitting={isBusy}
        error={submitError}
        onConfirm={submit}
      />
    )
  }

  return (
    <WizardShell
      stepTitles={STEP_TITLES}
      stepIndex={stepIndex}
      isBusy={isBusy}
      nextDisabled={stepIndex === NAME_STEP && values.name.trim().length === 0}
      onBack={back}
      onNext={resolveNext()}
    >
      {renderStep()}
    </WizardShell>
  )
}
