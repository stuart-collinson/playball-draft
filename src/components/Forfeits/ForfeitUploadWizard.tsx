"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { WizardDetailsStep } from "@pbd/components/Forfeits/WizardDetailsStep"
import { WizardOptionGrid } from "@pbd/components/Forfeits/WizardOptionGrid"
import { WizardReviewStep } from "@pbd/components/Forfeits/WizardReviewStep"
import { Button } from "@pbd/components/ui/Button"
import { useCreateForfeit } from "@pbd/hooks/forfeits/useCreateForfeit"
import {
  ANNUAL_GAMEWEEK,
  CURRENT_SEASON,
  FORFEIT_MEDIA_MIME_EXTENSIONS,
  FORFEIT_TYPES,
  MAX_FORFEIT_MEDIA_BYTES,
  WILDCARD_SUB_TYPES,
} from "@pbd/lib/constants/Forfeits"
import type { ForfeitMediaKind } from "@pbd/lib/constants/Forfeits"
import { LEAGUE_LABELS, LEAGUE_SLUGS } from "@pbd/lib/constants/fpl"
import {
  forfeitDisplayLabel,
  forfeitPeople,
  participantLabelForSlug,
  resolveForfeitSelection,
} from "@pbd/lib/forfeits"
import { forfeitBlobPaths } from "@pbd/lib/forfeitsPaths"
import { forfeitWizardSchema } from "@pbd/lib/forfeitsSchema"
import type { ForfeitWizardValues } from "@pbd/lib/forfeitsSchema"
import type { LeagueScope } from "@pbd/lib/leagues"
import { captureThumbnail } from "@pbd/lib/mediaCapture"
import { uploadPresigned } from "@vercel/blob/client"
import { useRouter } from "next/navigation"
import type { JSX } from "react"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"

type Props = {
  scope: LeagueScope
}

type MediaDraft = {
  file: File
  thumbBlob: Blob
  previewUrl: string
}

type Submission = {
  phase: "editing" | "uploading" | "saving"
  progress: number
  error: string | null
}

const STEP_TITLES = [
  "Which league?",
  "Who did it?",
  "Which game week?",
  "Which forfeit?",
  "The details",
  "Check it over",
] as const

const DETAILS_STEP = 4

const REVIEW_STEP = 5

const UPLOAD_ROUTE = "/api/forfeits/upload"

const IDLE_SUBMISSION: Submission = { phase: "editing", progress: 0, error: null }

const GAMEWEEK_OPTIONS = [
  { value: ANNUAL_GAMEWEEK, label: "Annual" },
  ...Array.from({ length: 38 }, (_, index) => ({
    value: String(index + 1),
    label: String(index + 1),
  })),
]

const LEAGUE_OPTIONS = LEAGUE_SLUGS.map((slug) => ({ value: slug, label: LEAGUE_LABELS[slug] }))

const mediaKindForFile = (file: File): ForfeitMediaKind =>
  file.type.startsWith("video/") ? "video" : "photo"

const formatMegabytes = (bytes: number): string => `${(bytes / (1024 * 1024)).toFixed(1)}MB`

export const ForfeitUploadWizard = ({ scope }: Props): JSX.Element => {
  const router = useRouter()
  const createForfeit = useCreateForfeit()
  const [stepIndex, setStepIndex] = useState(0)
  const [media, setMedia] = useState<MediaDraft | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [submission, setSubmission] = useState<Submission>(IDLE_SUBMISSION)

  const form = useForm<ForfeitWizardValues>({
    resolver: zodResolver(forfeitWizardSchema),
    mode: "onChange",
    defaultValues: {
      league: scope === "combined" ? "premiership" : scope,
      person: "",
      gameweek: "",
      selection: "",
      title: "",
      description: "",
    },
  })

  const league = form.watch("league")
  const person = form.watch("person")
  const gameweek = form.watch("gameweek")
  const selection = form.watch("selection")

  const selectLeague = (value: string): void => {
    form.setValue("league", value as ForfeitWizardValues["league"], { shouldValidate: true })
    form.setValue("person", "")
  }

  const selectGameweek = (value: string): void => {
    const categoryChanged = (gameweek === ANNUAL_GAMEWEEK) !== (value === ANNUAL_GAMEWEEK)
    form.setValue("gameweek", value, { shouldValidate: true })
    if (categoryChanged) form.setValue("selection", "")
  }

  const personOptions = forfeitPeople(league).map((member) => ({
    value: member.slug,
    label: member.label,
  }))

  const forfeitOptions =
    gameweek === ANNUAL_GAMEWEEK
      ? FORFEIT_TYPES.filter((type) => type.category === "annual").map((type) => ({
          value: type.slug,
          label: type.label,
        }))
      : [
          ...FORFEIT_TYPES.filter(
            (type) => type.category === "weekly" && type.slug !== "wildcard",
          ).map((type) => ({ value: type.slug, label: type.label })),
          ...WILDCARD_SUB_TYPES.map((outcome) => ({
            value: outcome.slug,
            label: outcome.label,
            hint: "Wildcard",
          })),
        ]

  const pickFile = async (file: File): Promise<void> => {
    if (!FORFEIT_MEDIA_MIME_EXTENSIONS[file.type]) {
      setMediaError("That file type isn't supported — use MP4, MOV, JPG, PNG or WebP")
      return
    }
    if (file.size > MAX_FORFEIT_MEDIA_BYTES) {
      setMediaError("That file is over 25MB — upload the copy WhatsApp saved")
      return
    }

    const thumbBlob = await captureThumbnail(file, mediaKindForFile(file))
    setMedia((previous) => {
      if (previous) URL.revokeObjectURL(previous.previewUrl)
      return { file, thumbBlob, previewUrl: URL.createObjectURL(thumbBlob) }
    })
    setMediaError(null)
  }

  const nextFromDetails = async (): Promise<void> => {
    const fieldsValid = await form.trigger(["title", "description"])
    if (!media) setMediaError("Add the photo or video")
    if (fieldsValid && media) setStepIndex(REVIEW_STEP)
  }

  const submit = async (): Promise<void> => {
    if (!media) return

    const values = form.getValues()
    const resolved = resolveForfeitSelection(values.selection)
    const extension = FORFEIT_MEDIA_MIME_EXTENSIONS[media.file.type]
    if (!resolved || !extension) {
      setSubmission({ ...IDLE_SUBMISSION, error: "Something's off — go back a step and re-pick" })
      return
    }

    setSubmission({ phase: "uploading", progress: 0, error: null })

    try {
      const paths = forfeitBlobPaths({
        season: CURRENT_SEASON,
        gameweek: values.gameweek,
        mediaExtension: extension,
      })

      const uploadedMedia = await uploadPresigned(paths.mediaPath, media.file, {
        access: "private",
        handleUploadUrl: UPLOAD_ROUTE,
        contentType: media.file.type,
        onUploadProgress: (event) =>
          setSubmission((previous) => ({ ...previous, progress: Math.round(event.percentage) })),
      })

      const uploadedThumb = await uploadPresigned(paths.thumbPath, media.thumbBlob, {
        access: "private",
        handleUploadUrl: UPLOAD_ROUTE,
        contentType: "image/jpeg",
      })

      setSubmission({ phase: "saving", progress: 100, error: null })

      await createForfeit.mutateAsync({
        league: values.league,
        gameweek: values.gameweek,
        type: resolved.type,
        subType: resolved.subType,
        person: values.person,
        title: values.title,
        description: values.description.trim() ? values.description : null,
        mediaKind: mediaKindForFile(media.file),
        mediaPath: uploadedMedia.pathname,
        thumbPath: uploadedThumb.pathname,
        mediaSizeBytes: media.file.size,
      })

      router.push(`/forfeits/${scope}`)
    } catch (error) {
      setSubmission({
        phase: "editing",
        progress: 0,
        error: error instanceof Error ? error.message : "Upload failed — try again",
      })
    }
  }

  const resolved = resolveForfeitSelection(selection)
  const isSubmitting = submission.phase !== "editing"
  const stepValues = [league, person, gameweek, selection]

  const reviewRows = [
    { label: "League", value: LEAGUE_LABELS[league] },
    { label: "Who", value: participantLabelForSlug(person) },
    { label: "Game week", value: gameweek === ANNUAL_GAMEWEEK ? "Annual" : `GW ${gameweek}` },
    {
      label: "Forfeit",
      value: resolved ? forfeitDisplayLabel(resolved.type, resolved.subType) : "",
    },
    { label: "Title", value: form.watch("title") },
    {
      label: "File",
      value: media ? `${media.file.name} · ${formatMegabytes(media.file.size)}` : "",
    },
  ]

  const buttonLabel =
    submission.phase === "uploading"
      ? `Uploading… ${submission.progress}%`
      : submission.phase === "saving"
        ? "Saving…"
        : "Upload forfeit"

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
            onSelect={selectGameweek}
            columns={5}
          />
        )
      case 3:
        return (
          <WizardOptionGrid
            options={forfeitOptions}
            selected={selection}
            onSelect={(value) => form.setValue("selection", value, { shouldValidate: true })}
          />
        )
      case DETAILS_STEP:
        return (
          <WizardDetailsStep
            previewUrl={media?.previewUrl ?? null}
            fileName={media?.file.name ?? null}
            mediaError={mediaError}
            onPickFile={pickFile}
          />
        )
      default:
        return (
          <WizardReviewStep
            rows={reviewRows}
            previewUrl={media?.previewUrl ?? null}
            buttonLabel={buttonLabel}
            isSubmitting={isSubmitting}
            error={submission.error}
            onConfirm={submit}
          />
        )
    }
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {stepIndex + 1} of {STEP_TITLES.length}
          </span>
          <span>{CURRENT_SEASON}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-accent">
          <div
            className="h-full bg-foreground/60 transition-all"
            style={{ width: `${((stepIndex + 1) / STEP_TITLES.length) * 100}%` }}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-3 font-bold text-base text-foreground">
            {STEP_TITLES[stepIndex] ?? ""}
          </h2>
          {renderStep()}
        </div>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
            disabled={stepIndex === 0 || isSubmitting}
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
