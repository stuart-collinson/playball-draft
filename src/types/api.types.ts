import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "@pbd/server/routers/index"

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
