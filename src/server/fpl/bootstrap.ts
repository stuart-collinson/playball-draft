import "server-only"

import { FPL_ENDPOINTS } from "@pbd/lib/constants/Fpl"
import { SERVER_TTL, fetchFpl } from "@pbd/server/fpl/client"
import type { BootstrapStaticResponse } from "@pbd/types/fpl.types"

export const fetchBootstrapStatic = (): Promise<BootstrapStaticResponse> =>
  fetchFpl(FPL_ENDPOINTS.bootstrapStatic(), SERVER_TTL.BOOTSTRAP)

export const finishedEventIds = (bootstrap: BootstrapStaticResponse): number[] =>
  bootstrap.events.data
    .filter((event) => event.finished)
    .map((event) => event.id)
    .sort((a, b) => a - b)
