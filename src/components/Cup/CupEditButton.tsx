"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription } from "@pbd/components/ui/alert"
import { Button } from "@pbd/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pbd/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@pbd/components/ui/field"
import { Input } from "@pbd/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pbd/components/ui/select"
import { useCupScheduleWindow } from "@pbd/hooks/cups/useCupScheduleWindow"
import { useUpdateCup } from "@pbd/hooks/cups/useUpdateCup"
import { CUP_NAME_MAX_LENGTH, CUP_ROUNDS, CUP_ROUND_LABELS } from "@pbd/lib/constants/Cups"
import { cupRoundGameweekLabel } from "@pbd/lib/cups/labels"
import { cupGameweekOptions, lockedCupRounds, withCupRoundGameweek } from "@pbd/lib/cups/schedule"
import {
  CUP_ROUND_FIELDS,
  cupScheduleFrom,
  cupScheduleToInput,
  updateCupInputSchema,
} from "@pbd/lib/cups/schema"
import type { UpdateCupInput } from "@pbd/lib/cups/schema"
import type { RouterOutput } from "@pbd/types/api.types"
import type { CupRound } from "@pbd/types/cups.types"
import { AlertCircle, Pencil } from "lucide-react"
import type { JSX } from "react"
import { useId, useState } from "react"
import { useForm } from "react-hook-form"

type CupSummary = RouterOutput["cups"]["list"][number]

type Props = {
  cup: CupSummary
}

const FALLBACK_FIRST_OPEN = 1

export const CupEditButton = ({ cup }: Props): JSX.Element => {
  const id = useId()
  const updateCup = useUpdateCup()
  const { data: window } = useCupScheduleWindow()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultValues: UpdateCupInput = {
    id: cup.id,
    name: cup.name,
    ...cupScheduleToInput(cup.format, cup.schedule),
  }

  const form = useForm<UpdateCupInput>({
    resolver: zodResolver(updateCupInputSchema),
    defaultValues,
  })

  const values = form.watch()
  const schedule = cupScheduleFrom(values)
  const firstOpenGameweek = window.firstOpenGameweek ?? FALLBACK_FIRST_OPEN
  const locked = lockedCupRounds(cup.schedule, window.firstOpenGameweek)

  const gameweeksFor = (round: CupRound): number[] => {
    const current = schedule[round]
    const openWeeks = cupGameweekOptions(cup.format, round, schedule, firstOpenGameweek)
      .filter((option) => option.block === null)
      .map((option) => option.gameweek)

    if (openWeeks.includes(current)) return openWeeks

    return [current, ...openWeeks].sort((first, second) => first - second)
  }

  const chooseGameweek = (round: CupRound, gameweek: number): void => {
    const next = withCupRoundGameweek(cup.format, schedule, round, gameweek)
    for (const each of CUP_ROUNDS)
      form.setValue(CUP_ROUND_FIELDS[each], next[each], { shouldValidate: true })
  }

  const save = async (input: UpdateCupInput): Promise<void> => {
    setError(null)

    try {
      await updateCup.mutateAsync(input)
      setOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't save those changes.")
    }
  }

  const onOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen)
    if (nextOpen) {
      setError(null)
      form.reset(defaultValues)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit cup"
          className="shrink-0 text-foreground/70 hover:text-foreground"
        >
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85svh] overflow-y-auto rounded-2xl bg-card sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit the cup</DialogTitle>
          <DialogDescription>
            The draw is fixed. Rounds that have already kicked off can't be moved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(save)} className="flex flex-col gap-4">
          <Field data-invalid={Boolean(form.formState.errors.name) || undefined}>
            <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
            <Input
              id={`${id}-name`}
              {...form.register("name")}
              maxLength={CUP_NAME_MAX_LENGTH}
              aria-invalid={Boolean(form.formState.errors.name) || undefined}
              className="h-11"
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>

          {CUP_ROUNDS.map((round) => (
            <Field key={round}>
              <FieldLabel htmlFor={`${id}-${round}`}>{CUP_ROUND_LABELS[round]}</FieldLabel>
              <Select
                value={String(schedule[round])}
                disabled={locked.includes(round)}
                onValueChange={(value) => chooseGameweek(round, Number(value))}
              >
                <SelectTrigger id={`${id}-${round}`} className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gameweeksFor(round).map((gameweek) => (
                    <SelectItem key={gameweek} value={String(gameweek)}>
                      {cupRoundGameweekLabel(cup.format, { ...schedule, [round]: gameweek }, round)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ))}

          <FieldError errors={[form.formState.errors.finalGameweek]} />

          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={updateCup.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" isLoading={updateCup.isPending}>
              {updateCup.isPending ? "Saving" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
