"use client"

import { useForfeitDetail } from "@pbd/hooks/forfeits/useForfeitDetail"
import { LEAGUE_LABELS } from "@pbd/lib/constants/fpl"
import { forfeitDisplayLabel, participantLabelForSlug } from "@pbd/lib/forfeits"
import type { JSX } from "react"

type Props = {
  id: string
}

export const ForfeitDetail = ({ id }: Props): JSX.Element => {
  const { data: forfeit } = useForfeitDetail(id)

  const gameweekLabel = forfeit.gameweek === "annual" ? "Annual" : `GW ${forfeit.gameweek}`
  const chips = [
    forfeitDisplayLabel(forfeit.type, forfeit.subType),
    LEAGUE_LABELS[forfeit.league],
    forfeit.season,
  ]

  return (
    <div className="flex h-[calc(100dvh-15.5rem)] flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-foreground">{forfeit.title}</h2>
        <p className="text-sm text-muted-foreground">
          {gameweekLabel} · {participantLabelForSlug(forfeit.person)}
        </p>
      </div>

      {forfeit.description && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
          {forfeit.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-foreground/80"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="min-h-48 flex-1 overflow-hidden rounded-2xl border border-border bg-black">
        {forfeit.mediaKind === "photo" ? (
          <img
            src={forfeit.mediaUrl}
            alt={forfeit.title}
            className="h-full w-full object-contain"
          />
        ) : (
          // biome-ignore lint/a11y/useMediaCaption: pub forfeit videos have no caption tracks
          <video
            controls
            playsInline
            preload="none"
            poster={forfeit.thumbUrl}
            src={forfeit.mediaUrl}
            className="h-full w-full object-contain"
          />
        )}
      </div>
    </div>
  )
}
