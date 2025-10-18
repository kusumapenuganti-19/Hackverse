import type { Route } from "./+types/guardian";
import Guardian from "../../src/pages/Guardian";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Raayan Guardian - Safety Companion" },
    { name: "description", content: "Your AI-powered safety companion for secure travel" },
  ];
}

export default function GuardianRoute() {
  return <Guardian />;
}
