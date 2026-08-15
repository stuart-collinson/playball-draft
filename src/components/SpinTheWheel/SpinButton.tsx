import type { JSX } from "react"

type SpinButtonProps = {
  disabled: boolean
  onSpin: () => void
}

export const SpinButton = ({ disabled, onSpin }: SpinButtonProps): JSX.Element => (
  <button
    type="button"
    onClick={onSpin}
    disabled={disabled}
    aria-label="Spin the wheel"
    className="absolute left-1/2 top-1/2 z-30 flex h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-sm font-black uppercase tracking-widest text-primary-foreground shadow-lg ring-4 ring-background transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-70"
  >
    Spin
  </button>
)
