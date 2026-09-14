import Image from "next/image"
import type { JSX } from "react"

type Props = {
  imageUrl: string
}

const LABEL = "LOSER"

const GLOW = "0 0 6px rgba(0,0,0,1), 0 0 16px rgba(239,68,68,0.9)"

export const LoserAvatar = ({ imageUrl }: Props): JSX.Element => (
  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-red-500/70">
    <Image src={imageUrl} alt={LABEL} fill sizes="48px" className="object-cover" />
    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
      <span
        className="-rotate-[22deg] select-none whitespace-nowrap text-[8px] font-black tracking-[0.12em] text-red-400"
        style={{ textShadow: GLOW }}
      >
        {LABEL}
      </span>
    </div>
  </div>
)
