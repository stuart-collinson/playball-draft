"use client"

import { CupFinalCard } from "@pbd/components/Cup/CupFinalCard"
import { Button } from "@pbd/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@pbd/components/ui/drawer"
import { useCupsList } from "@pbd/hooks/cups/useCupsList"
import { usePinnedPageScroll } from "@pbd/hooks/usePinnedPageScroll"
import { History } from "lucide-react"
import type { JSX } from "react"
import { useState } from "react"

export const CupHistoryDrawer = (): JSX.Element | null => {
  const { data: cups } = useCupsList()
  const [open, setOpen] = useState(false)

  usePinnedPageScroll(open)

  const past = cups.filter((cup) => cup.status !== "running")
  if (past.length === 0) return null

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <History />
          History
        </Button>
      </DrawerTrigger>

      <DrawerContent className="mx-auto select-none bg-card data-[vaul-drawer-direction=bottom]:max-h-[85dvh] data-[vaul-drawer-direction=bottom]:rounded-t-3xl sm:max-w-lg">
        <DrawerHeader>
          <DrawerTitle>Previous Cups</DrawerTitle>
          <DrawerDescription>Your infamous past winners 🏆</DrawerDescription>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {past.map((cup) => (
            <CupFinalCard key={cup.id} cup={cup} />
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
