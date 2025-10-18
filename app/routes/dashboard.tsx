import type { Route } from "./+types/dashboard";
import Dashboard from "../../src/pages/Dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Raayan AI" },
    { name: "description", content: "Your AI-powered decision optimizer dashboard" },
  ];
}

export default function DashboardRoute() {
  return <Dashboard />;
}
