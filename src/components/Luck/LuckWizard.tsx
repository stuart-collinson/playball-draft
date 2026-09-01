"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LuckDetailsStep } from "@pbd/components/Luck/LuckDetailsStep"
import { WizardOptionGrid } from "@pbd/components/Wizard/WizardOptionGrid"
import { WizardReviewStep } from "@pbd/components/Wizard/WizardReviewStep"
import { Button } from "@pbd/components/ui/Button"
import { useCreateLuck } from "@pbd/hooks/luck/useCreateLuck"
import { CURRENT_SEASON } from "@pbd/lib/constants/app"
import { LEAGUE_LABELS, LEAGUE_SLUGS } from "@pbd/lib/constants/fpl"
import { GAMEWEEK_OPTIONS, gameweekLabel } from "@pbd/lib/gameweeks"
import { DEFAULT_LEAGUE_SLUG } from "@pbd/lib/leagues"
import { createLuckInputSchema } from "@pbd/lib/luckSchema"
import type { CreateLuckInput } from "@pbd/lib/luckSchema"
import { leaguePeople, participantLabelForSlug } from "@pbd/lib/people"
import { useRouter } from "next/navigation"
import type { JSX } from "react"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

const STEP_TITLES = [
  "Which league?",
  "Who got lucky?",
  "Which game week?",
  "The details",
  "Check it over",
] as const

const DETAILS_STEP = 3

const REVIEW_STEP = 4

const MANAGE_LUCK_HREF = "/admin/luck-of-the-week"

const LEAGUE_OPTIONS = LEAGUE_SLUGS.map((slug) => ({ value: slug, label: LEAGUE_LABELS[slug] }))

export const LuckWizard = (): JSX.Element => {
  const router = useRouter()
  const createLuck = useCreateLuck()
  const [stepIndex, setStepIndex] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<CreateLuckInput>({
    resolver: zodResolver(createLuckInputSchema),
    mode: "onChange",
    defaultValues: {
      league: DEFAULT_LEAGUE_SLUG,
      person: "",
      gameweek: "",
      title: "",
      description: "",
    },
  })

  const league = form.watch("league")
  const person = form.watch("person")
  const gameweek = form.watch("gameweek")

  const selectLeague = (value: string): void => {
    form.setValue("league", value as CreateLuckInput["league"], { shouldValidate: true })
    form.setValue("person", "")
  }

  const personOptions = leaguePeople(league).map((member) => ({
    value: member.slug,
    label: member.label,
  }))

  const nextFromDetails = async (): Promise<void> => {
    const fieldsValid = await form.trigger(["title", "description"])
    if (fieldsValid) setStepIndex(REVIEW_STEP)
  }

  const submit = async (): Promise<void> => {
    setSubmitError(null)

    try {
      const values = form.getValues()
      await createLuck.mutateAsync({
        league: values.league,
        gameweek: values.gameweek,
        person: values.person,
        title: values.title,
        description: values.description,
      })

      router.push(MANAGE_LUCK_HREF)
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : "Couldn't save it. Try again.")
    }
  }

  const stepValues = [league, person, gameweek]

  const reviewRows = [
    { label: "League", value: LEAGUE_LABELS[league] },
    { label: "Who", value: participantLabelForSlug(person) },
    { label: "Game week", value: gameweekLabel(gameweek) },
    { label: "Title", value: form.watch("title") },
  ]

  const renderStep = (): JSX.Element => {
    switch (stepIndex) {
      case 0:
        return (
          <WizardOptionGrid options={LEAGUE_OPTIONS} selected={league} onSelect={selectLeague} />
        )
      case 1:
        return (
          <WizardOptionGrid
            options={personOptions}
            selected={person}
            onSelect={(value) => form.setValue("person", value, { shouldValidate: true })}
          />
        )
      case 2:
        return (
          <WizardOptionGrid
            options={GAMEWEEK_OPTIONS}
            selected={gameweek}
            onSelect={(value) => form.setValue("gameweek", value, { shouldValidate: true })}
            columns={5}
          />
        )
      case DETAILS_STEP:
        return <LuckDetailsStep />
      default:
        return (
          <WizardReviewStep
            rows={reviewRows}
            previewUrl={null}
            buttonLabel={createLuck.isPending ? "Saving…" : "Save lucky moment"}
            isSubmitting={createLuck.isPending}
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
            onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
            disabled={stepIndex === 0 || createLuck.isPending}
          >
            Back
          </Button>
          {stepIndex < DETAILS_STEP && (
            <Button
              size="sm"
              onClick={() => setStepIndex((index) => index + 1)}
              disabled={!stepValues[stepIndex]}
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
