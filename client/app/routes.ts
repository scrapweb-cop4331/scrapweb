import {
  type RouteConfig,
  type RouteConfigEntry,
  route,
} from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

console.log((await flatRoutes()));
export default [
  route("/", "./routes/home.tsx"),

//   ...(await flatRoutes()),
] satisfies RouteConfig;

