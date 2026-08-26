import type { JSX } from "react"

export type PitchPlayer = {
  key: string
  name: string
  value: string
  flag?: "amber" | "red"
  label?: string
}

export type PitchRow = { key: string; players: PitchPlayer[] }

type Props = {
  rows: PitchRow[]
  bench?: PitchPlayer[]
}

const FLAG_CLASSES: Record<"amber" | "red", string> = {
  amber: "bg-amber-400",
  red: "bg-red-500",
}

export const PitchSurface = ({ rows, bench }: Props): JSX.Element => (
  <div className="overflow-hidden rounded-xl">
    <div
      className="relative flex flex-col gap-4 px-2 py-5"
      style={{
        backgroundImage:
          "repeating-linear-gradient(180deg, #2d8a2d 0px, #2d8a2d 32px, #267326 32px, #267326 64px)",
      }}
    >
      <div className="pointer-events-none absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-white/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />

      {rows.map((row) => (
        <div key={row.key} className="relative z-10 flex justify-evenly">
          {row.players.map((player) => (
            <div key={player.key} className="flex w-14 flex-col items-center">
              <div className="relative w-full rounded bg-black/50 px-1 py-0.5 text-center">
                {player.flag && (
                  <span
                    className={`absolute -right-1 -top-1 h-2 w-2 rounded-full ${FLAG_CLASSES[player.flag]}`}
                  />
                )}
                <p className="truncate text-xs font-bold leading-tight text-white">{player.name}</p>
                <p className="text-[10px] text-white/80">{player.value}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>

    {bench && bench.length > 0 && (
      <div className="flex justify-evenly bg-green-900 px-2 py-3">
        {bench.map((player) => (
          <div key={player.key} className="flex w-14 flex-col items-center gap-0.5">
            <div className="relative w-full rounded bg-black/30 px-1 py-0.5 text-center">
              {player.flag && (
                <span
                  className={`absolute -right-1 -top-1 h-2 w-2 rounded-full ${FLAG_CLASSES[player.flag]}`}
                />
              )}
              <p className="truncate text-xs font-bold leading-tight text-white/80">
                {player.name}
              </p>
              <p className="text-[10px] text-white/60">{player.value}</p>
            </div>
            {player.label && <p className="text-[9px] text-white/40">{player.label}</p>}
          </div>
        ))}
      </div>
    )}
  </div>
)
