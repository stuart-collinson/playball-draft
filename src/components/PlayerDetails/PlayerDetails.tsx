"use client"

import { PlayerSquad } from "@pbd/components/PlayerDetails/PlayerSquad"
import { PlayerStats } from "@pbd/components/PlayerDetails/PlayerStats"
import { Avatar, AvatarFallback, AvatarImage } from "@pbd/components/ui/avatar"
import { Badge } from "@pbd/components/ui/badge"
import { Button } from "@pbd/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@pbd/components/ui/drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@pbd/components/ui/tabs"
import { PARTICIPANT_BY_API_ID } from "@pbd/lib/constants/Participants"
import { leagueLabelForId } from "@pbd/lib/leagues"
import { personInitials } from "@pbd/lib/people"
import type { PlayerDialogData } from "@pbd/types/player.types"
import { BarChart3, Shirt, X } from "lucide-react"
import type { JSX } from "react"
import { useRef } from "react"

type Props = {
  player: PlayerDialogData | null
  onClose: () => void
}

const DRAWER_CONTENT_CLASSES =
  "mx-auto bg-card sm:max-w-md data-[vaul-drawer-direction=top]:mb-0 data-[vaul-drawer-direction=top]:h-[min(84dvh,42rem)] data-[vaul-drawer-direction=top]:max-h-none data-[vaul-drawer-direction=top]:rounded-b-3xl"

const TAB_CONTENT_CLASSES = "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2"

export const PlayerDetails = ({ player, onClose }: Props): JSX.Element => {
  const lastPlayerRef = useRef<PlayerDialogData | null>(player)
  if (player) lastPlayerRef.current = player
  const shown = lastPlayerRef.current

  const participant = shown ? PARTICIPANT_BY_API_ID[shown.apiId] : null

  return (
    <Drawer
      direction="top"
      open={player !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      {shown && (
        <DrawerContent className={DRAWER_CONTENT_CLASSES}>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close"
              className="absolute top-3 right-3 text-muted-foreground"
            >
              <X />
            </Button>
          </DrawerClose>

          <DrawerHeader className="items-center gap-2 pb-1">
            <Avatar className="size-14 ring-2 ring-border">
              {participant?.image && (
                <AvatarImage
                  src={participant.image}
                  alt={shown.playerName}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="text-xl font-bold">
                {personInitials(shown.playerName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-center gap-0.5">
              <DrawerTitle className="text-lg">{shown.playerName}</DrawerTitle>
              <DrawerDescription>{shown.teamName}</DrawerDescription>
            </div>

            <Badge variant="secondary">{leagueLabelForId(shown.leagueId)}</Badge>
          </DrawerHeader>

          <Tabs key={shown.apiId} defaultValue="stats" className="min-h-0 flex-1 gap-3 px-4 pb-2">
            <TabsList className="w-full shrink-0">
              <TabsTrigger value="stats">
                <BarChart3 />
                Stats
              </TabsTrigger>
              <TabsTrigger value="squad">
                <Shirt />
                Squad
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className={TAB_CONTENT_CLASSES}>
              <PlayerStats player={shown} />
            </TabsContent>
            <TabsContent value="squad" className={TAB_CONTENT_CLASSES}>
              <PlayerSquad player={shown} />
            </TabsContent>
          </Tabs>

          <span
            aria-hidden="true"
            className="mx-auto mb-3 h-2 w-[100px] shrink-0 rounded-full bg-muted"
          />
        </DrawerContent>
      )}
    </Drawer>
  )
}
