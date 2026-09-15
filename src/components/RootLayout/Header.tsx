"use client"

import { AccessKeyButton } from "@pbd/components/RootLayout/AccessKeyButton"
import { SplitFlapText } from "@pbd/components/ui/split-flap-text"
import { useGameState } from "@pbd/hooks/fpl/useGameState"
import { APP_NAME, CURRENT_SEASON } from "@pbd/lib/constants/App"
import { usePathname } from "next/navigation"
import type { JSX } from "react"

type Props = {
  showAccessKey: boolean
}

const HEADERLESS_PATHNAME = "/home"

const BOARD_CYCLE_DELAY_MS = 5000

const BOARD_FLIP_DURATION_SECONDS = 0.24

const BOARD_STAGGER_SECONDS = 0.14

const BOARD_FLIPS_PER_CHAR = 7

const BOARD_FONT_SIZE = "clamp(18px, 5.6vw, 30px)"

const boardWords = (gameweek: number | null): string[] => [
  APP_NAME.toUpperCase(),
  `SEASON ${CURRENT_SEASON}`,
  ...(gameweek === null ? [] : [`GAMEWEEK ${gameweek}`]),
]

export const Header = ({ showAccessKey }: Props): JSX.Element | null => {
  const pathname = usePathname()
  const { data: gameState } = useGameState()

  if (pathname === HEADERLESS_PATHNAME) return null

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto grid h-16 max-w-5xl grid-cols-[2.25rem_1fr_2.25rem] items-center px-4">
        <SplitFlapText
          words={boardWords(gameState?.currentEvent ?? null)}
          cycleDelay={BOARD_CYCLE_DELAY_MS}
          flipDuration={BOARD_FLIP_DURATION_SECONDS}
          stagger={BOARD_STAGGER_SECONDS}
          flipsPerChar={BOARD_FLIPS_PER_CHAR}
          fontSize={BOARD_FONT_SIZE}
          gap={2}
          tileRadius={4}
          tileColor="var(--muted)"
          textColor="var(--foreground)"
          aria-label={APP_NAME}
          className="col-start-2 justify-self-center"
        />
        {showAccessKey && <AccessKeyButton className="col-start-3 justify-self-end" />}
      </div>
    </header>
  )
}
