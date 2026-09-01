import { LeagueStack } from "@pbd/components/LeagueStack/LeagueStack"
import { PitchSurface } from "@pbd/components/Pitch/PitchSurface"
import { SkeletonText } from "@pbd/components/SkeletonText/SkeletonText"
import { skeletonKeys } from "@pbd/lib/skeletonKeys"
import type { PitchRow } from "@pbd/types/pitch.types"
import type { JSX } from "react"

type Props = {
  leagueIds: number[]
}

const SKELETON_LINE_UP = [1, 4, 4, 2]

const SKELETON_ROWS: PitchRow[] = SKELETON_LINE_UP.map((players, rowIndex) => ({
  key: `row-${rowIndex}`,
  players: skeletonKeys(`player-${rowIndex}`, players).map((key) => ({
    key,
    name: <SkeletonText className="w-10" />,
    value: <SkeletonText className="w-6" />,
  })),
}))

export const FreeAgentXiSkeleton = ({ leagueIds }: Props): JSX.Element => (
  <LeagueStack leagueIds={leagueIds} gap="loose">
    {() => (
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <SkeletonText className="w-32" />
          </p>
          <p className="text-xs font-black tabular-nums text-foreground">
            <SkeletonText className="w-12" />
          </p>
        </div>
        <PitchSurface rows={SKELETON_ROWS} />
      </div>
    )}
  </LeagueStack>
)
