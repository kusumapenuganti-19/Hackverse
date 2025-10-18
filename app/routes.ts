import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("test", "routes/test.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("dashboard/analyze", "routes/restaurant-analysis.tsx"),
  route("guardian", "routes/guardian.tsx"),
  route("auth", "routes/auth.tsx"),
] satisfies RouteConfig;
