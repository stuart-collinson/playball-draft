import { awardsProcedures } from "@pbd/server/routers/fpl/awards"
import { bootstrapProcedures } from "@pbd/server/routers/fpl/bootstrap"
import { entryProcedures } from "@pbd/server/routers/fpl/entries"
import { gameProcedures } from "@pbd/server/routers/fpl/game"
import { leagueProcedures } from "@pbd/server/routers/fpl/league"
import { liveProcedures } from "@pbd/server/routers/fpl/live"
import { marketStatsProcedures } from "@pbd/server/routers/fpl/marketStats"
import { seasonStatsProcedures } from "@pbd/server/routers/fpl/seasonStats"
import { statsProcedures } from "@pbd/server/routers/fpl/stats"
import { createTRPCRouter } from "@pbd/server/trpc"

export const fplRouter = createTRPCRouter({
  ...gameProcedures,
  ...leagueProcedures,
  ...bootstrapProcedures,
  ...entryProcedures,
  ...liveProcedures,
  ...statsProcedures,
  ...seasonStatsProcedures,
  ...marketStatsProcedures,
  ...awardsProcedures,
})
