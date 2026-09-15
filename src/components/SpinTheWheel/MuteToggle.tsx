import { Toggle } from "@pbd/components/ui/toggle"
import { Volume2, VolumeX } from "lucide-react"
import type { JSX } from "react"

type MuteToggleProps = {
  muted: boolean
  onToggle: () => void
}

export const MuteToggle = ({ muted, onToggle }: MuteToggleProps): JSX.Element => (
  <Toggle
    variant="outline"
    pressed={muted}
    onPressedChange={() => onToggle()}
    aria-label={muted ? "Unmute tick sound" : "Mute tick sound"}
    className="rounded-full bg-card text-muted-foreground hover:text-foreground"
  >
    {muted ? <VolumeX /> : <Volume2 />}
  </Toggle>
)
