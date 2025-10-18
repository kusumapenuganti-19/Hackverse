import type { Route } from "./+types/home";
import Landing from "../../src/pages/Landing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Raayan AI - Your AI-powered decision optimizer" },
    { name: "description", content: "Meet Raayan - Your AI-powered decision optimizer for food delivery and travel booking" },
  ];
}

export default function Home() {
  return <Landing />;
}