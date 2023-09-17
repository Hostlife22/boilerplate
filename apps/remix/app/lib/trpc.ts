import { AppRouter } from "@boilerplate/api"
import { createTRPCReact, inferReactQueryProcedureOptions } from "@trpc/react-query"
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>

export const trpc = createTRPCReact<AppRouter>()
