"use client"

import { Button } from "@pbd/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@pbd/components/ui/dialog"
import type { CupDrawPair } from "@pbd/lib/cups/layout"
import { fmtDate } from "@pbd/lib/format"
import { participantLabelForSlug } from "@pbd/lib/people"
import { ShieldCheck } from "lucide-react"
import type { JSX } from "react"

type Props = {
  drawSeed: string
  drawEntrants: string[]
  drawPairs: CupDrawPair[]
  createdAt: string
}

const UNKNOWN = "?"

const STEPS = [
  "All sixteen of you went into one list, in alphabetical order. No rankings, no favours, nobody had a say in it.",
  "The computer drew a random 32-byte seed — the long line of letters and numbers below. It was saved against this cup the moment it was created and can never be changed.",
  "That seed was run through SHA-256 over and over to shuffle the list into a completely new order. The same seed always produces the same shuffle, so anyone can run it again and land on this exact bracket.",
  "The shuffled list was then paired off from the top: 1st plays 2nd, 3rd plays 4th, and so on down to the eighth tie. That's your Round of 16.",
]

const nameFor = (slug: string | null): string =>
  slug === null ? UNKNOWN : participantLabelForSlug(slug)

export const CupDrawProof = ({
  drawSeed,
  drawEntrants,
  drawPairs,
  createdAt,
}: Props): JSX.Element => (
  <Dialog>
    <DialogTrigger asChild>
      <Button
        variant="link"
        size="xs"
        className="h-auto self-center p-0 font-semibold text-muted-foreground"
      >
        <ShieldCheck />
        Provably random
      </Button>
    </DialogTrigger>

    <DialogContent className="max-h-[85svh] overflow-y-auto rounded-2xl bg-card sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Proving this draw was fair</DialogTitle>
        <DialogDescription>
          Nobody chose who plays who. Here is exactly how the bracket was made, so you can check it
          yourself.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-5">
        <section className="flex flex-col gap-2">
          <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            How the draw ran
          </h3>
          <ol className="flex list-decimal flex-col gap-2 pl-4 text-foreground/80 text-xs leading-relaxed">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            The list it started with
          </h3>
          <p className="text-foreground/80 text-xs leading-relaxed">
            {drawEntrants.map(participantLabelForSlug).join(", ")}
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            The seed
          </h3>
          <code className="break-all rounded-lg border bg-background p-2 font-mono text-[10px] leading-relaxed">
            {drawSeed}
          </code>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="font-black text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
            Where the shuffle put everyone
          </h3>
          <ol className="flex flex-col gap-1">
            {drawPairs.map((pair, index) => (
              <li
                key={`${pair.one ?? UNKNOWN}-${pair.two ?? UNKNOWN}`}
                className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-2 rounded-lg bg-background px-2 py-1.5 text-xs"
              >
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <span className="w-4 shrink-0 text-right text-[10px] text-muted-foreground tabular-nums">
                    {index * 2 + 1}
                  </span>
                  <span className="truncate font-semibold">{nameFor(pair.one)}</span>
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">v</span>
                <span className="flex min-w-0 items-baseline gap-1.5">
                  <span className="w-4 shrink-0 text-right text-[10px] text-muted-foreground tabular-nums">
                    {index * 2 + 2}
                  </span>
                  <span className="truncate font-semibold">{nameFor(pair.two)}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Drawn {fmtDate(createdAt)}
        </p>
      </div>
    </DialogContent>
  </Dialog>
)
