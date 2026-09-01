import { PitchMarkings } from "@pbd/components/Pitch/PitchMarkings"
import { PitchPlayerChip } from "@pbd/components/Pitch/PitchPlayerChip"
import type { PitchPlayer, PitchRow } from "@pbd/types/pitch.types"
import type { JSX } from "react"

type Props = {
  rows: PitchRow[]
  bench?: PitchPlayer[]
}

const TURF =
  "repeating-linear-gradient(180deg, var(--pitch-stripe) 0 30px, var(--pitch-stripe-alt) 30px 60px)"

export const PitchSurface = ({ rows, bench }: Props): JSX.Element => (
  <div className="overflow-hidden rounded-xl">
    <div className="relative flex flex-col gap-2 px-1.5 py-3" style={{ backgroundImage: TURF }}>
      <PitchMarkings />

      {rows.map((row) => (
        <div key={row.key} className="relative z-10 flex justify-evenly gap-1">
          {row.players.map((player) => (
            <PitchPlayerChip key={player.key} player={player} />
          ))}
        </div>
      ))}
    </div>

    {bench && bench.length > 0 && (
      <div className="flex flex-col gap-1.5 bg-pitch-bench px-1.5 py-2.5">
        <span className="px-1 text-[8px] font-black uppercase tracking-[0.2em] text-white/40">
          Bench
        </span>
        <div className="flex justify-evenly gap-1">
          {bench.map((player) => (
            <PitchPlayerChip key={player.key} player={player} variant="bench" />
          ))}
        </div>
      </div>
    )}
  </div>
)
