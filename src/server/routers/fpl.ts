import { createTRPCRouter } from "@pbd/server/trpc"
import { awardsProcedures } from "./fpl/awards"
import { bootstrapProcedures } from "./fpl/bootstrap"
import { draftStatsProcedures } from "./fpl/draftStats"
import { entryProcedures } from "./fpl/entries"
import { gameProcedures } from "./fpl/game"
import { leagueProcedures } from "./fpl/league"
import { liveProcedures } from "./fpl/live"
import { seasonStatsProcedures } from "./fpl/seasonStats"
import { statsProcedures } from "./fpl/stats"

export const fplRouter = createTRPCRouter({
  ...gameProcedures,
  ...leagueProcedures,
  ...bootstrapProcedures,
  ...entryProcedures,
  ...liveProcedures,
  ...statsProcedures,
  ...seasonStatsProcedures,
  ...draftStatsProcedures,
  ...awardsProcedures,
})
