import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  platform: string;
}

interface CartSummaryProps {
  cart: CartItem[];
  onUpdateQuantity: (itemName: string, delta: number) => void;
}

export default function CartSummary({ cart, onUpdateQuantity }: CartSummaryProps) {
  if (cart.length === 0) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Card className="food-card p-5 border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent shadow-md">
      <h4 className="text-base font-bold mb-4 flex items-center gap-2 text-primary">
        <ShoppingCart className="h-5 w-5" />
        Your Cart ({cart.length} items)
      </h4>
      <div className="space-y-2">
        {cart.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">₹{item.price} each</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(item.name, -1)}
                className="h-6 w-6 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="font-bold w-6 text-center text-xs">{item.quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(item.name, 1)}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <span className="font-bold w-16 text-right">₹{item.price * item.quantity}</span>
            </div>
          </div>
        ))}
        <div className="pt-2 border-t flex justify-between items-center">
          <span className="font-bold text-sm">Subtotal</span>
          <span className="font-bold">₹{total}</span>
        </div>
      </div>
    </Card>
  );
}
