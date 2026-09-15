"use client"

import { AdminRow } from "@pbd/components/Admin/AdminRow"
import { ConfirmDeleteButton } from "@pbd/components/Admin/ConfirmDeleteButton"
import { EditDetailsButton } from "@pbd/components/Admin/EditDetailsButton"
import { PersonFace } from "@pbd/components/PersonFace/PersonFace"
import { useDeleteLuck } from "@pbd/hooks/luck/useDeleteLuck"
import { useUpdateLuck } from "@pbd/hooks/luck/useUpdateLuck"
import { cn } from "@pbd/lib/className"
import { LUCK_DETAILS_FIELDS } from "@pbd/lib/constants/Luck"
import { gameweekLabel } from "@pbd/lib/gameweeks"
import { luckDetailsSchema } from "@pbd/lib/luck/schema"
import { peopleLabel, peopleLeaguesLabel } from "@pbd/lib/people"
import type { RouterOutput } from "@pbd/types/api.types"
import type { JSX } from "react"

type LuckMomentSummary = RouterOutput["luck"]["list"][number]

type Props = {
  moment: LuckMomentSummary
}

export const LuckAdminRow = ({ moment }: Props): JSX.Element => {
  const updateLuck = useUpdateLuck()
  const deleteLuck = useDeleteLuck()

  return (
    <AdminRow
      leading={
        <span className="flex w-14 shrink-0 items-center justify-center">
          {moment.people.map((slug, index) => (
            <PersonFace key={slug} slug={slug} className={cn("h-10 w-10", index > 0 && "-ml-4")} />
          ))}
        </span>
      }
      title={moment.title}
      meta={[gameweekLabel(moment.gameweek), peopleLabel(moment.people)].join(" · ")}
      detail={[peopleLeaguesLabel(moment.people), moment.season].filter(Boolean).join(" · ")}
      actions={
        <>
          <EditDetailsButton
            ariaLabel="Edit lucky moment"
            description="Title and story only. Delete and re-add if the week or person is wrong."
            fields={LUCK_DETAILS_FIELDS}
            schema={luckDetailsSchema}
            defaultValues={{ title: moment.title, description: moment.description }}
            fallbackError="Couldn't save those changes."
            isPending={updateLuck.isPending}
            onSave={(values) => updateLuck.mutateAsync({ id: moment.id, ...values })}
          />
          <ConfirmDeleteButton
            ariaLabel="Delete lucky moment"
            heading="Delete this lucky moment?"
            description={`${moment.title} is removed for good. There's no undo.`}
            confirmLabel="Delete"
            pendingLabel="Deleting"
            fallbackError="Couldn't delete that lucky moment."
            isPending={deleteLuck.isPending}
            onDelete={() => deleteLuck.mutateAsync({ id: moment.id })}
          />
        </>
      }
    />
  )
}
