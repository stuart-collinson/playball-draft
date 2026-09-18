"use client"

import { AdminRow } from "@pbd/components/Admin/AdminRow"
import { ConfirmDeleteButton } from "@pbd/components/Admin/ConfirmDeleteButton"
import { CupEditButton } from "@pbd/components/Cup/CupEditButton"
import { PersonFace } from "@pbd/components/PersonFace/PersonFace"
import { Badge } from "@pbd/components/ui/badge"
import { Button } from "@pbd/components/ui/button"
import { useDeleteCup } from "@pbd/hooks/cups/useDeleteCup"
import { CUP_FORMAT_LABELS } from "@pbd/lib/constants/Cups"
import { cupHref } from "@pbd/lib/constants/Pages"
import { cupSpanLabel, cupStatusLabel, cupStatusShortLabel } from "@pbd/lib/cups/labels"
import type { RouterOutput } from "@pbd/types/api.types"
import { Eye } from "lucide-react"
import Link from "next/link"
import type { JSX } from "react"

type CupSummary = RouterOutput["cups"]["list"][number]

type Props = {
  cup: CupSummary
}

export const CupAdminRow = ({ cup }: Props): JSX.Element => {
  const deleteCup = useDeleteCup()

  return (
    <AdminRow
      leading={
        <span className="flex w-14 shrink-0 items-center justify-center">
          {cup.final ? (
            <PersonFace slug={cup.final.winner} className="size-10" />
          ) : (
            <Badge
              variant="outline"
              className="px-2 py-1 font-black text-[10px] uppercase tracking-wide"
            >
              {cupStatusShortLabel(cup.status, cup.currentRound)}
            </Badge>
          )}
        </span>
      }
      title={cup.name}
      meta={[CUP_FORMAT_LABELS[cup.format], cupStatusLabel(cup.status, cup.currentRound)].join(
        " · ",
      )}
      detail={[cupSpanLabel(cup.format, cup.schedule), cup.season].join(" · ")}
      actions={
        <>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="shrink-0 text-foreground/70 hover:text-foreground"
          >
            <Link href={cupHref(cup.id)} aria-label="View cup">
              <Eye />
            </Link>
          </Button>
          <CupEditButton cup={cup} />
          <ConfirmDeleteButton
            ariaLabel="Delete cup"
            heading="Delete this cup?"
            description={`${cup.name} disappears from the cups page and its history. The draw can't be brought back.`}
            confirmLabel="Delete"
            pendingLabel="Deleting"
            fallbackError="Couldn't delete that cup."
            isPending={deleteCup.isPending}
            onDelete={() => deleteCup.mutateAsync({ id: cup.id })}
          />
        </>
      }
    />
  )
}
