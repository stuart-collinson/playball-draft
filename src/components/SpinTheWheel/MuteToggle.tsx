import { Volume2, VolumeX } from "lucide-react"
import type { JSX } from "react"

type MuteToggleProps = {
  muted: boolean
  onToggle: () => void
}

const ICON_SIZE = 18

export const MuteToggle = ({ muted, onToggle }: MuteToggleProps): JSX.Element => (
  <button
    type="button"
    onClick={onToggle}
    aria-pressed={muted}
    aria-label={muted ? "Unmute tick sound" : "Mute tick sound"}
    className="rounded-full border border-border bg-card p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
  >
    {muted ? (
      <VolumeX size={ICON_SIZE} strokeWidth={2} />
    ) : (
      <Volume2 size={ICON_SIZE} strokeWidth={2} />
    )}
  </button>
)
