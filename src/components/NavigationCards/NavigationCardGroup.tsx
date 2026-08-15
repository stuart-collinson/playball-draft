import { NavigationCard } from "@pbd/components/NavigationCards/NavigationCard"
import type { NavigationTile } from "@pbd/lib/constants/Navigation"
import type { JSX } from "react"

type Props = {
  heading: string
  tiles: NavigationTile[]
}

export const NavigationCardGroup = ({ heading, tiles }: Props): JSX.Element => (
  <section className="flex w-full flex-col gap-2.5">
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground">
        {heading}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
    <div className="grid auto-rows-fr grid-cols-5 gap-2">
      {tiles.map((tile) => (
        <NavigationCard
          key={tile.href}
          href={tile.href}
          label={tile.label}
          icon={tile.icon}
          accent={tile.accent}
        />
      ))}
    </div>
  </section>
)
