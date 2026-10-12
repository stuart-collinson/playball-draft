import { clubKit } from "@pbd/lib/constants/Clubs"
import type { PitchFlag, PitchPlayer } from "@pbd/types/pitch.types"
import { Shirt } from "lucide-react"
import type { JSX, ReactNode } from "react"

type Props = {
  player: PitchPlayer
  variant?: "starter" | "bench"
}

type FlagPlate = { plate: string; text: string; club: string; divider: string; label: string }

const FLAGS: Record<PitchFlag, FlagPlate> = {
  amber: {
    plate: "bg-amber-400",
    text: "text-black",
    club: "text-black/60",
    divider: "border-black/15",
    label: "Doubtful",
  },
  red: {
    plate: "bg-red-600",
    text: "text-white",
    club: "text-white/70",
    divider: "border-white/20",
    label: "Injured or unavailable",
  },
}

const VARIANTS = {
  starter: {
    shirt: "",
    plate: "bg-black/60",
    text: "text-white",
    club: "text-white/50",
    divider: "border-white/10",
  },
  bench: {
    shirt: "opacity-70",
    plate: "bg-black/45",
    text: "text-white/85",
    club: "text-white/50",
    divider: "border-white/10",
  },
} as const

const ROOMY_NAME_LENGTH = 10
const SNUG_NAME_LENGTH = 11
const TIGHT_NAME_LENGTH = 13

const nameSize = (name: ReactNode): string => {
  if (typeof name !== "string" || name.length <= ROOMY_NAME_LENGTH) return "text-[10px]"
  if (name.length <= SNUG_NAME_LENGTH) return "text-[9px]"
  if (name.length <= TIGHT_NAME_LENGTH) return "text-[8px]"
  return "text-[7px]"
}

export const PitchPlayerChip = ({ player, variant = "starter" }: Props): JSX.Element => {
  const kit = clubKit(player.club)
  const styles = VARIANTS[variant]
  const flag = player.flag ? FLAGS[player.flag] : null
  const plate = flag ?? styles

  return (
    <div className="flex min-w-0 max-w-[74px] flex-1 basis-0 flex-col items-center gap-1">
      <div className={`relative ${styles.shirt}`}>
        <Shirt size={22} strokeWidth={1.5} fill={kit.primary} color={kit.secondary} />
        {player.label && (
          <span className="absolute -left-1.5 -top-1 rounded bg-black/70 px-1 text-[8px] font-bold leading-[1.4] text-white/70">
            {player.label}
          </span>
        )}
      </div>

      <div className={`w-full overflow-hidden rounded-md ring-1 ring-white/10 ${plate.plate}`}>
        {flag && <span className="sr-only">{flag.label}</span>}
        <p
          className={`truncate px-0.5 text-center font-semibold leading-tight ${plate.text} ${nameSize(player.name)}`}
        >
          {player.name}
        </p>
        <div
          className={`flex items-center gap-0.5 border-t px-1 ${plate.divider} ${player.club ? "justify-between" : "justify-center"}`}
        >
          {player.club && (
            <span className={`truncate text-[8px] font-bold uppercase tracking-wide ${plate.club}`}>
              {player.club}
            </span>
          )}
          <span className={`shrink-0 text-[10px] font-black tabular-nums ${plate.text}`}>
            {player.value}
          </span>
        </div>
      </div>
    </div>
  )
}
