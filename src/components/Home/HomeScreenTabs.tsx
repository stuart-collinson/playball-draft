import { HOME_SCREENS } from "@pbd/lib/constants/Home"
import type { HomeScreenKey } from "@pbd/lib/constants/Home"
import { cn } from "@pbd/lib/utils/cn"
import type { JSX } from "react"

type Props = {
  active: HomeScreenKey
  onSelect: (screen: HomeScreenKey) => void
}

export const HomeScreenTabs = ({ active, onSelect }: Props): JSX.Element => (
  <div role="tablist" aria-label="Home screen style" className="flex gap-1.5">
    {HOME_SCREENS.map(({ key, label }) => (
      <button
        key={key}
        type="button"
        role="tab"
        aria-selected={active === key}
        onClick={() => onSelect(key)}
        className={cn(
          "flex-1 rounded-full border px-3 py-2 text-xs font-bold tracking-wide transition-colors",
          active === key
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        {label}
      </button>
    ))}
  </div>
)
