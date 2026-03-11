import {
  type RouteConfig,
  index,
} from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";
console.log(await flatRoutes());
export default [
  index("routes/index/index.tsx"),
  ...(await flatRoutes({ ignoredRouteFiles: ["routes/index/index.tsx"] })),
] satisfies RouteConfig;
