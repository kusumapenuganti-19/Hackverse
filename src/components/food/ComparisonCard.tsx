import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import BillBreakdown from "./BillBreakdown";

interface ComparisonCardProps {
  item: any;
  location?: string;
}

export default function ComparisonCard({ item, location }: ComparisonCardProps) {
  const createBooking = useAction(api.bookings.createBooking);
  const generateRedirectUrl = useAction(api.bookings.generateRedirectUrl);
  const updateBookingStatus = useAction(api.bookings.updateBookingStatus);

  const handleOrderNow = async () => {
    try {
      toast.loading("Preparing your order...");
      
      const redirectUrl = await generateRedirectUrl({
        platform: item.platform,
        category: "food",
        restaurant: item.restaurant,
        location: location,
      });

      const bookingId = await createBooking({
        category: "food",
        platform: item.platform,
        restaurant: item.restaurant,
        finalPrice: item.finalPrice,
        bookingData: JSON.stringify(item),
        redirectUrl,
      });

      await updateBookingStatus({
        bookingId,
        status: "redirected",
      });

      toast.success(`Redirecting to ${item.platform}...`);
      window.open(redirectUrl, "_blank");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to process booking");
    }
  };

  return (
    <Card className="food-card p-5 border hover:border-primary/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold">{item.platform}</p>
            <Badge variant="outline" className="text-xs">Score: {item.raayanScore}</Badge>
            <Badge variant="outline" className="text-xs">⭐ {item.rating}</Badge>
            <Badge variant="outline" className="text-xs">🕐 {item.eta}m</Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{item.restaurant}</p>
          
          <div className="flex gap-1 flex-wrap mt-1">
            {item.isFreeDelivery && (
              <Badge className="bg-green-600 text-white text-xs">FREE Delivery</Badge>
            )}
            {item.newUserDiscountAmount > 0 && (
              <Badge className="bg-blue-600 text-white text-xs">₹{item.newUserDiscountAmount} OFF</Badge>
            )}
            {item.minOrderDiscountAmount > 0 && (
              <Badge className="bg-purple-600 text-white text-xs">{item.minOrderDiscount.discount}% OFF</Badge>
            )}
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            <p>Sub: ₹{item.subtotal} | Del: {item.isFreeDelivery ? 'FREE' : `₹${item.deliveryFee}`} | Fee: ₹{item.platformFee}</p>
            {item.totalDiscount > 0 && (
              <p className="text-green-600 font-semibold">Discount: ₹{item.totalDiscount}</p>
            )}
          </div>
        </div>
        
        <div className="text-right space-y-2">
          <p className="text-2xl font-bold">₹{item.finalPrice}</p>
          <BillBreakdown restaurant={item} />
          <Button 
            onClick={handleOrderNow}
            variant="outline"
            size="sm"
            className="w-full mt-2"
          >
            Order Now
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
