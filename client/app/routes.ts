import {
  type RouteConfig,
  index,
} from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";
export default [
  index("routes/index/route.tsx"),
  ...(await flatRoutes({ ignoredRouteFiles: ["routes/index/route.tsx"] })),
] satisfies RouteConfig;
