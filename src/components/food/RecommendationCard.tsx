import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingDown, Clock, Truck, Gift, Tag, ExternalLink } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import BillBreakdown from "./BillBreakdown";

interface RecommendationCardProps {
  recommendation: any;
  location?: string;
}

export default function RecommendationCard({ recommendation, location }: RecommendationCardProps) {
  const { pick, reasoning, savings, timeSaved } = recommendation;
  
  const createBooking = useAction(api.bookings.createBooking);
  const generateRedirectUrl = useAction(api.bookings.generateRedirectUrl);
  const updateBookingStatus = useAction(api.bookings.updateBookingStatus);

  const handleOrderNow = async () => {
    try {
      toast.loading("Preparing your order...");
      
      // Generate redirect URL
      const redirectUrl = await generateRedirectUrl({
        platform: pick.platform,
        category: "food",
        restaurant: pick.restaurant,
        location: location,
      });

      // Create booking record
      const bookingId = await createBooking({
        category: "food",
        platform: pick.platform,
        restaurant: pick.restaurant,
        finalPrice: pick.finalPrice,
        bookingData: JSON.stringify(pick),
        redirectUrl,
      });

      // Update status to redirected
      await updateBookingStatus({
        bookingId,
        status: "redirected",
      });

      toast.success(`Redirecting to ${pick.platform}...`);
      
      // Open in new tab
      window.open(redirectUrl, "_blank");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to process booking");
    }
  };

  return (
    <Card className="food-card p-6 border-2 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-md">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold tracking-tight mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">🏆 Raayan's Pick</h3>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold">{pick.platform}</p>
                <p className="text-sm text-muted-foreground">{pick.restaurant}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {pick.isFreeDelivery && (
                    <Badge className="bg-green-600 text-white font-bold text-xs">
                      <Truck className="h-3 w-3 mr-1" />
                      FREE DELIVERY
                    </Badge>
                  )}
                  {pick.newUserDiscountAmount > 0 && (
                    <Badge className="bg-blue-600 text-white font-bold text-xs">
                      <Gift className="h-3 w-3 mr-1" />
                      NEW USER
                    </Badge>
                  )}
                  {pick.minOrderDiscountAmount > 0 && (
                    <Badge className="bg-purple-600 text-white font-bold text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {pick.minOrderDiscount.discount}% OFF
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">₹{pick.finalPrice}</p>
                <p className="text-xs text-muted-foreground">{pick.eta} mins</p>
                {pick.totalDiscount > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    Saved ₹{pick.totalDiscount}
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-background/50 p-3 rounded-lg">
              <p className="text-xs leading-relaxed">{reasoning}</p>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-3 flex-wrap text-xs">
                {savings > 0 && (
                  <div className="flex items-center gap-1 font-semibold">
                    <TrendingDown className="h-3 w-3 text-green-600" />
                    <span>Save ₹{savings}</span>
                  </div>
                )}
                {timeSaved > 0 && (
                  <div className="flex items-center gap-1 font-semibold">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span>Save {timeSaved}m</span>
                  </div>
                )}
                <BillBreakdown restaurant={pick} />
              </div>
              
              <Button 
                onClick={handleOrderNow}
                className="bg-primary hover:bg-primary/90 font-bold"
                size="lg"
              >
                Order Now on {pick.platform}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
