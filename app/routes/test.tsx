import type { Route } from "./+types/test";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Test Route" },
    { name: "description", content: "Test route to verify routing works" },
  ];
}

export default function TestRoute() {
  return (
    <div>
      <h1>Test Route Working!</h1>
      <p>If you can see this, routing is working correctly.</p>
    </div>
  );
}
