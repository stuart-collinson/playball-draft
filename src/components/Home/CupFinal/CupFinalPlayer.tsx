import { cn } from "@pbd/lib/className"
import { cupFinalBodyFont } from "@pbd/lib/fonts"
import type { CupFinalSide } from "@pbd/types/home.types"
import type { PitchPlayer } from "@pbd/types/pitch.types"
import type { JSX } from "react"

type Props = {
  player: PitchPlayer
  side: CupFinalSide
  showPoints: boolean
}

const TOKEN_CLASSES: Record<CupFinalSide, string> = {
  one: "cupfinal-plate text-cupfinal-midnight",
  two: "bg-cupfinal-electric text-cupfinal-midnight shadow-[0_0_14px_var(--color-cupfinal-electric)]",
}

export const CupFinalPlayer = ({ player, side, showPoints }: Props): JSX.Element => (
  <div className="flex w-full min-w-0 flex-col items-center gap-0.5">
    <span
      className={cn(
        cupFinalBodyFont.className,
        "flex size-6 items-center justify-center rounded-full font-extrabold leading-none tabular-nums",
        showPoints ? "text-sm" : "text-[9px] uppercase",
        TOKEN_CLASSES[side],
      )}
    >
      {showPoints ? player.value : player.club}
    </span>
    <span
      className={cn(
        cupFinalBodyFont.className,
        "max-w-full truncate rounded-sm bg-cupfinal-midnight/55 px-1 text-[9.5px] font-bold uppercase leading-tight tracking-wide text-cupfinal-shine",
      )}
    >
      {player.name}
    </span>
  </div>
)
