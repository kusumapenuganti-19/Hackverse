import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, AlertCircle, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

export default function EmergencyPanel() {
  const triggerSOS = useAction(api.guardian.triggerSOS);
  const contacts = useQuery(api.guardianMutations.getTrustedContacts);
  const [isTriggering, setIsTriggering] = useState(false);

  const handleSOS = async () => {
    setIsTriggering(true);
    
    toast.error("🚨 SOS Alert Triggered!", {
      description: "Sending emergency alerts to your trusted contacts...",
      duration: 5000,
    });

    try {
      // Get user's current location
      let userLocation: { lat: number; lng: number } | undefined;
      
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true,
            });
          });
          
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        } catch (geoError) {
          console.warn("Could not get location:", geoError);
        }
      }

      // Trigger SOS with location
      const result = await triggerSOS({
        userLocation,
        message: "🚨 EMERGENCY ALERT from Raayan Guardian",
      });

      if (result.success) {
        toast.success(`Emergency alerts sent to ${result.sentCount} contact(s)!`, {
          description: userLocation 
            ? "Your location has been shared with your trusted contacts."
            : "Alerts sent successfully. Location unavailable.",
          duration: 7000,
        });
      } else {
        toast.error(result.message || "Failed to send emergency alerts", {
          description: "Please ensure you have trusted contacts configured.",
        });
      }
    } catch (error: any) {
      console.error("SOS trigger error:", error);
      toast.error("Failed to send emergency alerts", {
        description: error.message || "Please check your Twilio configuration in the Integrations tab.",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const handleEmergencyCall = (service: string, number: string) => {
    toast.info(`Calling ${service}...`);
    window.open(`tel:${number}`);
  };

  const handleShareLocation = () => {
    if ("geolocation" in navigator) {
      toast.info("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          
          // Copy to clipboard
          navigator.clipboard.writeText(mapsUrl).then(() => {
            toast.success("Location link copied to clipboard!", {
              description: "Share this link with your contacts",
            });
          });
        },
        (error) => {
          toast.error("Failed to get location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleAlertContacts = async () => {
    if (!contacts || contacts.length === 0) {
      toast.error("No trusted contacts configured", {
        description: "Please add emergency contacts first",
      });
      return;
    }

    toast.info(`Alerting ${contacts.length} trusted contact(s)...`);
    
    try {
      const result = await triggerSOS({
        message: "⚠️ Safety Alert from Raayan Guardian - Please check in",
      });

      if (result.success) {
        toast.success(`Alerts sent to ${result.sentCount} contact(s)!`);
      } else {
        toast.error(result.message || "Failed to send alerts");
      }
    } catch (error: any) {
      toast.error("Failed to alert contacts", {
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* SOS Button */}
      <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-red-600 rounded-full animate-pulse">
              <AlertCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-900 dark:text-red-100">Emergency SOS</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Press to alert your trusted contacts and emergency services
            </p>
            {contacts && contacts.length > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Will notify {contacts.length} trusted contact(s) via SMS
              </p>
            )}
          </div>
          <Button
            size="lg"
            className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-6"
            onClick={handleSOS}
            disabled={isTriggering}
          >
            <AlertCircle className="mr-2 h-6 w-6" />
            {isTriggering ? "SENDING ALERTS..." : "TRIGGER SOS"}
          </Button>
        </div>
      </Card>

      {/* Emergency Services */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Emergency Services</h3>
        <div className="grid gap-3">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={() => handleEmergencyCall("Police", "100")}
          >
            <Phone className="mr-3 h-5 w-5 text-blue-600" />
            <div className="text-left">
              <p className="font-semibold">Police</p>
              <p className="text-xs text-muted-foreground">Dial 100</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={() => handleEmergencyCall("Ambulance", "108")}
          >
            <Phone className="mr-3 h-5 w-5 text-red-600" />
            <div className="text-left">
              <p className="font-semibold">Ambulance</p>
              <p className="text-xs text-muted-foreground">Dial 108</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={() => handleEmergencyCall("Women Helpline", "1091")}
          >
            <Phone className="mr-3 h-5 w-5 text-purple-600" />
            <div className="text-left">
              <p className="font-semibold">Women Helpline</p>
              <p className="text-xs text-muted-foreground">Dial 1091</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={() => handleEmergencyCall("Fire Service", "101")}
          >
            <Phone className="mr-3 h-5 w-5 text-orange-600" />
            <div className="text-left">
              <p className="font-semibold">Fire Service</p>
              <p className="text-xs text-muted-foreground">Dial 101</p>
            </div>
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleShareLocation}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Share Live Location
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={handleAlertContacts}
          >
            <Users className="mr-2 h-4 w-4" />
            Alert Trusted Contacts
          </Button>
        </div>
      </Card>

      {/* Status Indicator */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Safety Status</span>
          </div>
          <Badge variant="default">Active</Badge>
        </div>
        {contacts && contacts.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {contacts.length} trusted contact(s) configured
          </p>
        )}
      </Card>
    </div>
  );
}