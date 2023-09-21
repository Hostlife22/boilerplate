import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createTRPCProxyClient } from "@trpc/client"
import { createTRPCReact, httpBatchLink, inferReactQueryProcedureOptions, loggerLink } from "@trpc/react-query"
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import { PropsWithChildren, useState } from "react"
import superjson from "superjson"

import { AppRouter } from "@boilerplate/api"

export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>
export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>

export const trpc = createTRPCReact<AppRouter>()
export const trpcSsrClient = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) => true,
    }),
    httpBatchLink({ url: "http://localhost:3000/api/trpc" }),
  ],
})

export const TrpcProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) => true,
        }),
        httpBatchLink({ url: "/api/trpc" }),
      ],
    }),
  )
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
