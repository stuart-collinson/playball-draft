import type { PitchRow } from "@pbd/types/pitch.types"
import type { JSX } from "react"

type Props = {
  rows: PitchRow[]
}

export const CinemaLineup = ({ rows }: Props): JSX.Element => (
  <div className="flex w-full shrink-0 flex-col gap-1 border-y border-dashed border-cinema-cyan py-1.5">
    <span className="text-center text-[8px] font-bold uppercase tracking-[0.25em] text-cinema-cyan">
      The Cast
    </span>
    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 lg:grid-cols-3">
      {rows.flatMap((row) =>
        row.players.map((player) => (
          <span
            key={player.key}
            className="flex items-baseline justify-between gap-1 text-[8px] font-bold uppercase leading-tight text-cinema-ivory"
          >
            <span className="truncate">{player.name}</span>
            <b className="shrink-0 tabular-nums text-cinema-pink">{player.value}</b>
          </span>
        )),
      )}
    </div>
  </div>
)
