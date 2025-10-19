import type { Route } from "./+types/404";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "404 - Page Not Found" },
    { name: "description", content: "The page you're looking for doesn't exist" },
  ];
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">Page Not Found</p>
        <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="space-y-2">
          <a href="/" className="block text-blue-600 hover:underline">Go Home</a>
          <a href="/dashboard" className="block text-blue-600 hover:underline">Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
}
