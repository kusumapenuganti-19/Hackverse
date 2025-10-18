import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Receipt, Truck, Tag, Gift } from "lucide-react";

interface BillBreakdownProps {
  restaurant: any;
}

export default function BillBreakdown({ restaurant }: BillBreakdownProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <Receipt className="h-3 w-3 mr-1" />
          Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{restaurant.platform} - Bill</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="space-y-1">
            <p className="font-semibold text-xs text-muted-foreground">Items</p>
            {restaurant.itemsOrdered.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span>{item.name} x{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-2 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">₹{restaurant.subtotal}</span>
            </div>
            
            {restaurant.isFreeDelivery ? (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Delivery
                </span>
                <span className="font-semibold">FREE</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>₹{restaurant.deliveryFee}</span>
                </div>
                {restaurant.amountToFreeDelivery > 0 && (
                  <p className="text-xs text-blue-600">
                    💡 Add ₹{restaurant.amountToFreeDelivery} for FREE delivery
                  </p>
                )}
              </>
            )}
            
            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span>₹{restaurant.platformFee}</span>
            </div>
          </div>

          {restaurant.totalDiscount > 0 && (
            <div className="border-t pt-2 space-y-1 bg-green-50 dark:bg-green-950 p-2 rounded">
              <p className="font-semibold text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Discounts
              </p>
              {restaurant.newUserDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Gift className="h-3 w-3" />
                    New User
                  </span>
                  <span className="font-semibold">-₹{restaurant.newUserDiscountAmount}</span>
                </div>
              )}
              {restaurant.minOrderDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Min Order ({restaurant.minOrderDiscount.discount}%)</span>
                  <span className="font-semibold">-₹{restaurant.minOrderDiscountAmount}</span>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-2">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total</span>
              <span className="text-xl font-bold text-primary">₹{restaurant.finalPrice}</span>
            </div>
            {restaurant.totalDiscount > 0 && (
              <p className="text-xs text-green-600 text-right mt-1">
                Saved ₹{restaurant.totalDiscount}! 🎉
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
