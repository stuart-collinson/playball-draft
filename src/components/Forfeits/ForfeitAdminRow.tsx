"use client"

import { AdminRow } from "@pbd/components/Admin/AdminRow"
import { ConfirmDeleteButton } from "@pbd/components/Admin/ConfirmDeleteButton"
import { EditDetailsButton } from "@pbd/components/Admin/EditDetailsButton"
import { useDeleteForfeit } from "@pbd/hooks/forfeits/useDeleteForfeit"
import { useUpdateForfeit } from "@pbd/hooks/forfeits/useUpdateForfeit"
import { FORFEIT_DETAILS_FIELDS } from "@pbd/lib/constants/Forfeits"
import { LEAGUE_LABELS } from "@pbd/lib/constants/Fpl"
import { forfeitDetailsSchema } from "@pbd/lib/forfeits/schema"
import { forfeitDisplayLabel } from "@pbd/lib/forfeits/selection"
import { gameweekLabel } from "@pbd/lib/gameweeks"
import { participantLabelForSlug } from "@pbd/lib/people"
import type { RouterOutput } from "@pbd/types/api.types"
import type { JSX } from "react"

type ForfeitSummary = RouterOutput["forfeits"]["list"]["items"][number]

type Props = {
  forfeit: ForfeitSummary
}

export const ForfeitAdminRow = ({ forfeit }: Props): JSX.Element => {
  const updateForfeit = useUpdateForfeit()
  const deleteForfeit = useDeleteForfeit()

  return (
    <AdminRow
      leading={
        <img
          src={forfeit.thumbUrl}
          alt={forfeit.title}
          loading="lazy"
          className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover"
        />
      }
      title={forfeit.title}
      meta={[
        gameweekLabel(forfeit.gameweek),
        participantLabelForSlug(forfeit.person),
        LEAGUE_LABELS[forfeit.league],
      ].join(" · ")}
      detail={forfeitDisplayLabel(forfeit.type, forfeit.subType)}
      actions={
        <>
          <EditDetailsButton
            ariaLabel="Edit forfeit"
            description="Title and description only. The photo or video stays as it is."
            fields={FORFEIT_DETAILS_FIELDS}
            schema={forfeitDetailsSchema}
            defaultValues={{ title: forfeit.title, description: forfeit.description ?? "" }}
            fallbackError="Couldn't save those changes."
            isPending={updateForfeit.isPending}
            onSave={(values) => updateForfeit.mutateAsync({ id: forfeit.id, ...values })}
          />
          <ConfirmDeleteButton
            ariaLabel="Delete forfeit"
            heading="Delete this forfeit?"
            description={`${forfeit.title} and its photo or video are removed for good. There's no undo.`}
            confirmLabel="Delete"
            pendingLabel="Deleting"
            fallbackError="Couldn't delete that forfeit."
            isPending={deleteForfeit.isPending}
            onDelete={() => deleteForfeit.mutateAsync({ id: forfeit.id })}
          />
        </>
      }
    />
  )
}
