"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LuckDetailsFields } from "@pbd/components/Luck/LuckDetailsFields"
import { WizardOptionGrid } from "@pbd/components/Wizard/WizardOptionGrid"
import { WizardReviewStep } from "@pbd/components/Wizard/WizardReviewStep"
import { Button } from "@pbd/components/ui/Button"
import { useCreateLuck } from "@pbd/hooks/luck/useCreateLuck"
import { CURRENT_SEASON } from "@pbd/lib/constants/app"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import { GAMEWEEK_OPTIONS, gameweekLabel } from "@pbd/lib/gameweeks"
import { MAX_LUCK_PEOPLE, createLuckInputSchema } from "@pbd/lib/luckSchema"
import type { CreateLuckInput } from "@pbd/lib/luckSchema"
import { leaguePeople, peopleLabel } from "@pbd/lib/people"
import { useRouter } from "next/navigation"
import type { JSX } from "react"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

const STEP_TITLES = ["Who got lucky?", "Which game week?", "The details", "Check it over"] as const

const PEOPLE_STEP = 0

const DETAILS_STEP = 2

const REVIEW_STEP = 3

const MANAGE_LUCK_HREF = "/admin/luck-of-the-week"

const PERSON_OPTIONS = leaguePeople("combined").map((member) => ({
  value: member.slug,
  label: member.label,
  hint: LEAGUE_LABELS[member.league],
}))

export const LuckWizard = (): JSX.Element => {
  const router = useRouter()
  const createLuck = useCreateLuck()
  const [stepIndex, setStepIndex] = useState(0)
  const [isSaved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<CreateLuckInput>({
    resolver: zodResolver(createLuckInputSchema),
    mode: "onChange",
    defaultValues: {
      people: [],
      gameweek: "",
      title: "",
      description: "",
    },
  })

  const people = form.watch("people")
  const gameweek = form.watch("gameweek")

  const togglePerson = (value: string): void => {
    const next = people.includes(value)
      ? people.filter((slug) => slug !== value)
      : [...people, value]
    if (next.length > MAX_LUCK_PEOPLE) return

    form.setValue("people", next, { shouldValidate: true })
  }

  const nextFromDetails = async (): Promise<void> => {
    const fieldsValid = await form.trigger(["title", "description"])
    if (fieldsValid) setStepIndex(REVIEW_STEP)
  }

  const submit = async (): Promise<void> => {
    setSubmitError(null)

    try {
      const values = form.getValues()
      await createLuck.mutateAsync({
        gameweek: values.gameweek,
        people: values.people,
        title: values.title.trim(),
        description: values.description.trim(),
      })

      setSaved(true)
      router.push(MANAGE_LUCK_HREF)
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : "Couldn't save it. Try again.")
    }
  }

  const isBusy = createLuck.isPending || isSaved
  const stepComplete = [people.length > 0, Boolean(gameweek)]

  const reviewRows = [
    { label: "Who", value: peopleLabel(people) },
    { label: "Game week", value: gameweekLabel(gameweek) },
    { label: "Title", value: form.watch("title").trim() },
  ]

  const renderStep = (): JSX.Element => {
    switch (stepIndex) {
      case PEOPLE_STEP:
        return (
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-xs">
              Pick one, or two when the same bit of luck hit an owner in each league.
            </p>
            <WizardOptionGrid options={PERSON_OPTIONS} selected={people} onSelect={togglePerson} />
          </div>
        )
      case 1:
        return (
          <WizardOptionGrid
            options={GAMEWEEK_OPTIONS}
            selected={gameweek}
            onSelect={(value) => form.setValue("gameweek", value, { shouldValidate: true })}
            columns={5}
          />
        )
      case DETAILS_STEP:
        return <LuckDetailsFields />
      default:
        return (
          <WizardReviewStep
            rows={reviewRows}
            previewUrl={null}
            buttonLabel={isBusy ? "Saving…" : "Save lucky moment"}
            isSubmitting={isBusy}
            error={submitError}
            onConfirm={submit}
          />
        )
    }
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>
            Step {stepIndex + 1} of {STEP_TITLES.length}
          </span>
          <span>{CURRENT_SEASON}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-accent">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((stepIndex + 1) / STEP_TITLES.length) * 100}%` }}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-bold text-foreground text-lg">{STEP_TITLES[stepIndex] ?? ""}</h2>
          {renderStep()}
        </div>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSubmitError(null)
              setStepIndex((index) => Math.max(0, index - 1))
            }}
            disabled={stepIndex === 0 || isBusy}
          >
            Back
          </Button>
          {stepIndex < DETAILS_STEP && (
            <Button
              size="sm"
              onClick={() => setStepIndex((index) => index + 1)}
              disabled={!stepComplete[stepIndex]}
            >
              Next
            </Button>
          )}
          {stepIndex === DETAILS_STEP && (
            <Button size="sm" onClick={nextFromDetails}>
              Next
            </Button>
          )}
        </div>
      </div>
    </FormProvider>
  )
}
