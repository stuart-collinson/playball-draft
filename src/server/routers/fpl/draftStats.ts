import { FPL_ENDPOINTS } from "@pbd/lib/constants/fpl"
import { PARTICIPANT_BY_ENTRY_ID } from "@pbd/lib/constants/participants"
import { SERVER_TTL, fetchFpl } from "@pbd/server/fpl/client"
import { fetchLeagueDraftChoices } from "@pbd/server/fpl/leagueData"
import { leagueIdsInput } from "@pbd/server/routers/fpl/inputs"
import { publicProcedure } from "@pbd/server/trpc"
import type { BootstrapStaticResponse } from "@pbd/types/fpl.types"
import type { TRPCRouterRecord } from "@trpc/server"

export const draftStatsProcedures = {
  draftBoard: publicProcedure.input(leagueIdsInput).query(async ({ input }) => {
    const [allChoices, bootstrap] = await Promise.all([
      Promise.all(input.leagueIds.map(fetchLeagueDraftChoices)),
      fetchFpl<BootstrapStaticResponse>(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP),
    ])

    const elementMap = new Map(bootstrap.elements.map((element) => [element.id, element]))
    const teamMap = new Map(bootstrap.teams.map((team) => [team.id, team.short_name]))

    const picks = allChoices.flatMap((choices, index) => {
      const leagueId = input.leagueIds[index] ?? input.leagueIds[0] ?? 0
      return choices.choices.flatMap((choice) => {
        const element = elementMap.get(choice.element)
        if (!element) return []
        const participant = PARTICIPANT_BY_ENTRY_ID[choice.entry]
        return [
          {
            leagueId,
            round: choice.round,
            pickNumber: choice.index,
            entryApiId: participant?.apiId ?? 0,
            managerName:
              participant?.nickname ??
              participant?.name ??
              `${choice.player_first_name} ${choice.player_last_name}`,
            teamName: choice.entry_name,
            elementId: choice.element,
            playerName: element.web_name,
            playerTeam: teamMap.get(element.team) ?? "",
            positionType: element.element_type,
            seasonPoints: element.total_points,
            draftRank: element.draft_rank,
          },
        ]
      })
    })

    return { picks }
  }),
} satisfies TRPCRouterRecord
