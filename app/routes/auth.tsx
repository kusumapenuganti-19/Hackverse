import type { Route } from "./+types/auth";
import AuthPage from "../../src/pages/Auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Authentication - Raayan AI" },
    { name: "description", content: "Sign in to your Raayan AI account" },
  ];
}

export default function AuthRoute() {
  return <AuthPage redirectAfterAuth="/dashboard" />;
}
