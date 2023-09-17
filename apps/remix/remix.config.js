const { flatRoutes } = require("remix-flat-routes")

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/*"],
  future: {
    unstable_postcss: true,
    v2_meta: true,
    v2_routeConvention: true,
    v2_errorBoundary: true,
    unstable_cssSideEffectImports: true,
    v2_normalizeFormMethod: true,
    unstable_tailwind: true,
  },
  serverDependenciesToBundle: [
    "@boilerplate/api",
    "@boilerplate/database",
    "@boilerplate/database/types",
    "@boilerplate/emails",
    "@boilerplate/shared",
    "@boilerplate/tailwind-config",
    "@boilerplate/ui",
    "axios",
    "decode-uri-component",
    "filter-obj",
    "query-string",
    "split-on-first",
  ],
  watchPaths: ["../../packages/**/*"],
  routes: (defineRoutes) => {
    return flatRoutes("pages", defineRoutes)
  },
}
