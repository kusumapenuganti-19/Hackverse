import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { toast } from "sonner";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function LocationAutocomplete({ value, onChange, disabled }: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);
    toast.loading("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Call Google Geocoding API to convert coordinates to address
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          
          if (!apiKey) {
            toast.dismiss();
            toast.error("Google Maps API key not configured");
            setIsLoadingLocation(false);
            return;
          }

          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );

          const data = await response.json();

          if (data.status === "OK" && data.results && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            setQuery(address);
            onChange(address);
            toast.dismiss();
            toast.success("Location detected successfully!");
          } else {
            toast.dismiss();
            toast.error("Could not determine address from your location");
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          toast.dismiss();
          toast.error("Failed to get address from location");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.dismiss();
        setIsLoadingLocation(false);
        
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please enable location access.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error("Location information unavailable");
        } else if (error.code === error.TIMEOUT) {
          toast.error("Location request timed out");
        } else {
          toast.error("Failed to get your location");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Your Address</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="location"
            placeholder="e.g., 123 Main St, Banjara Hills, Hyderabad"
            value={query}
            onChange={handleChange}
            disabled={disabled || isLoadingLocation}
            className="pl-10"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleUseCurrentLocation}
          disabled={disabled || isLoadingLocation}
          title="Use current location"
        >
          {isLoadingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Click the location icon to auto-fill your current address
      </p>
    </div>
  );
}