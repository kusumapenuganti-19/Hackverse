import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingConfirmation() {
  const pendingBookings = useQuery(api.bookingMutations.getRecentPendingBookings);
  const confirmBooking = useAction(api.bookings.confirmBooking);
  const cancelBooking = useAction(api.bookings.cancelBooking);

  const handleConfirm = async (bookingId: any) => {
    try {
      await confirmBooking({ bookingId });
      toast.success("Booking confirmed! This will be tracked in your spend analysis.");
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("Failed to confirm booking");
    }
  };

  const handleCancel = async (bookingId: any) => {
    try {
      await cancelBooking({ bookingId });
      toast.success("Booking cancelled");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  if (!pendingBookings || pendingBookings.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="p-4 border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-sm mb-1">Pending Booking Confirmations</h3>
                <p className="text-xs text-muted-foreground">
                  Did you complete these bookings? Confirm them to track your spending.
                </p>
              </div>
              
              <div className="space-y-2">
                {pendingBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-background rounded-lg p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {booking.category === "food" ? "🍽️ Food" : "🚌 Bus"}
                        </Badge>
                        <span className="text-xs font-semibold">{booking.platform}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {booking.restaurant || booking.operator} • ₹{booking.finalPrice}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs"
                        onClick={() => handleConfirm(booking._id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleCancel(booking._id)}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}