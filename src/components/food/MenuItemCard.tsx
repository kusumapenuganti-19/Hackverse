import { Button } from "@/components/ui/button";
import { Plus, UtensilsCrossed } from "lucide-react";

interface MenuItem {
  name: string;
  price: number;
  category: string;
  image: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: () => void;
}

export default function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <div className="food-card flex gap-3 p-3 border rounded-xl hover:bg-accent/50 transition-all cursor-pointer group">
      <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm">
        <UtensilsCrossed className="h-10 w-10 text-white" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate text-foreground">{item.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
        <p className="text-base font-bold mt-1 text-primary">₹{item.price}</p>
      </div>
      <Button
        size="sm"
        onClick={onAdd}
        className="self-center h-8 w-8 p-0 rounded-full shadow-sm hover:shadow-md transition-all"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}