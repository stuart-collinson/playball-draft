import Image from "next/image"
import type { JSX } from "react"

type ResultAvatarProps = {
  imageUrl: string
  type: "winner" | "loser"
  size?: "sm" | "lg"
}

const CONFIG = {
  winner: {
    ring: "ring-green-500/70",
    textColor: "text-green-400",
    glow: "0 0 6px rgba(0,0,0,1), 0 0 16px rgba(34,197,94,0.9)",
    label: "WINNER",
  },
  loser: {
    ring: "ring-red-500/70",
    textColor: "text-red-400",
    glow: "0 0 6px rgba(0,0,0,1), 0 0 16px rgba(239,68,68,0.9)",
    label: "LOSER",
  },
} as const

const SIZES = {
  sm: { container: "h-9 w-9", imgSizes: "36px", text: "text-[7px] tracking-[0.12em]", ring: "ring-2" },
  lg: { container: "h-20 w-20", imgSizes: "80px", text: "text-[10px] tracking-[0.15em]", ring: "ring-[3px]" },
}

export const ResultAvatar = ({ imageUrl, type, size = "sm" }: ResultAvatarProps): JSX.Element => {
  const { ring: ringColor, textColor, glow, label } = CONFIG[type]
  const { container, imgSizes, text, ring } = SIZES[size]
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full ${container} ${ring} ${ringColor}`}>
      <Image src={imageUrl} alt={label} fill sizes={imgSizes} className="object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
        <span
          className={`-rotate-[22deg] select-none whitespace-nowrap font-black ${text} ${textColor}`}
          style={{ textShadow: glow }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
