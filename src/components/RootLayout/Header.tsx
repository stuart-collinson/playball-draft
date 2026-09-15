"use client"

import { SplitFlapText } from "@pbd/components/ui/split-flap-text"
import { useGameState } from "@pbd/hooks/fpl/useGameState"
import { APP_NAME, CURRENT_SEASON } from "@pbd/lib/constants/App"
import { usePathname } from "next/navigation"
import type { JSX } from "react"

const HEADERLESS_PATHNAME = "/home"

const BOARD_CYCLE_DELAY_MS = 5000

const BOARD_FLIP_DURATION_SECONDS = 0.24

const BOARD_STAGGER_SECONDS = 0.14

const BOARD_FLIPS_PER_CHAR = 7

const BOARD_FONT_SIZE = "clamp(20px, 6.4vw, 32px)"

const boardWords = (gameweek: number | null): string[] => [
  APP_NAME.toUpperCase(),
  `SEASON ${CURRENT_SEASON}`,
  ...(gameweek === null ? [] : [`GAMEWEEK ${gameweek}`]),
]

export const Header = (): JSX.Element | null => {
  const pathname = usePathname()
  const { data: gameState } = useGameState()

  if (pathname === HEADERLESS_PATHNAME) return null

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-center px-4">
        <SplitFlapText
          words={boardWords(gameState?.currentEvent ?? null)}
          cycleDelay={BOARD_CYCLE_DELAY_MS}
          flipDuration={BOARD_FLIP_DURATION_SECONDS}
          stagger={BOARD_STAGGER_SECONDS}
          flipsPerChar={BOARD_FLIPS_PER_CHAR}
          fontSize={BOARD_FONT_SIZE}
          gap={3}
          tileRadius={4}
          tileColor="var(--muted)"
          textColor="var(--foreground)"
          aria-label={APP_NAME}
        />
      </div>
    </header>
  )
}
