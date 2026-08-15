import type { JSX } from "react"

type WheelAnnouncementProps = {
  winnerLabel: string | null
}

export const WheelAnnouncement = ({ winnerLabel }: WheelAnnouncementProps): JSX.Element => (
  <div aria-live="polite" className="sr-only">
    {winnerLabel ? `You got: ${winnerLabel}` : ""}
  </div>
)
