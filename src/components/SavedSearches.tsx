import { Card } from "@/components/ui/card";

export default function SavedSearches() {
  return (
    <Card className="p-12 text-center border">
      <p className="text-muted-foreground">Saved searches feature is disabled</p>
      <p className="text-sm text-muted-foreground mt-2">
        Authentication is required to save search history
      </p>
    </Card>
  );
}