import type { Route } from "./+types/restaurant-analysis";
import RestaurantAnalysis from "../../src/pages/RestaurantAnalysis";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Restaurant Analysis - Raayan AI" },
    { name: "description", content: "Analyze restaurant spending and get AI recommendations" },
  ];
}

export default function RestaurantAnalysisRoute() {
  return <RestaurantAnalysis />;
}
