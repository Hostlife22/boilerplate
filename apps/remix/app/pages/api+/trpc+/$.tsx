import type { ActionArgs, LoaderArgs } from "@vercel/remix"
import * as trpcFetch from "@trpc/server/adapters/fetch"

import { appRouter, createContext } from "@boilerplate/api"

function handleRequest(args: LoaderArgs | ActionArgs) {
  return trpcFetch.fetchRequestHandler({
    endpoint: "/api/trpc",
    req: args.request,
    router: appRouter,
    createContext,
  })
}
export const loader = async (args: LoaderArgs) => handleRequest(args)
export const action = async (args: ActionArgs) => handleRequest(args)
