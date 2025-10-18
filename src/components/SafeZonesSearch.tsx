import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Sparkles, Phone, Navigation } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SafeZonesMap from "@/components/SafeZonesMap";

interface SafePlace {
  name: string;
  type: string;
  address: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  phoneNumber?: string;
  rating?: number;
  description?: string;
  crowdDensity?: string;
  popularityScore?: number;
  busyLevel?: string;
}

export default function SafeZonesSearch() {
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const searchSafePlaces = useAction(api.guardian.searchNearbySafePlaces);

  const handleSearch = async () => {
    if (!location.trim()) {
      toast.error("Please enter your location");
      return;
    }

    setLoading(true);
    setSafePlaces([]);
    setUserCoords(null);

    try {
      toast.info("Raayan is searching for safe places nearby...");
      const result = await searchSafePlaces({
        location: location.trim(),
        query: searchQuery.trim() || "police stations, hospitals, safe zones",
      });

      setSafePlaces(result.places);
      setUserCoords(result.userCoords);
      toast.success(`Raayan found ${result.places.length} safe places nearby`);
    } catch (error: any) {
      console.error("Safe places search error:", error);
      toast.error(error.message || "Failed to search for safe places");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("police")) return "bg-blue-500";
    if (lowerType.includes("hospital")) return "bg-red-500";
    if (lowerType.includes("fire")) return "bg-orange-500";
    return "bg-green-500";
  };

  const getTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("police")) return "🚓";
    if (lowerType.includes("hospital")) return "🏥";
    if (lowerType.includes("fire")) return "🚒";
    return "🛡️";
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter your location (e.g., Visakhapatnam, Andhra Pradesh)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">What are you looking for? (Optional)</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="e.g., police stations, hospitals, 24/7 pharmacies"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to search for all safe places (police, hospitals, fire stations)
            </p>
          </div>

          <Button
            onClick={handleSearch}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Raayan is Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Safe Places Nearby
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8 space-y-3"
        >
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Search className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-semibold text-primary">
            Raayan is finding safe places near you...
          </p>
          <p className="text-xs text-muted-foreground">
            Searching across multiple sources for the safest locations
          </p>
        </motion.div>
      )}

      {/* Map Visualization */}
      {userCoords && safePlaces.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Safe Places Map</h3>
          <SafeZonesMap
            userCoords={userCoords}
            safePlaces={safePlaces}
            apiKey=""
          />
        </div>
      )}

      {/* Results List */}
      {safePlaces.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Raayan Found {safePlaces.length} Safe Places
          </h3>
          <div className="grid gap-4">
            {safePlaces.map((place, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-5 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getTypeIcon(place.type)}</div>
                        <div>
                          <h4 className="font-semibold">{place.name}</h4>
                          <p className="text-sm text-muted-foreground">{place.address}</p>
                        </div>
                      </div>
                      <Badge className={getTypeColor(place.type)}>
                        {place.type}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-muted-foreground" />
                        <span>{place.distance.toFixed(2)} km away</span>
                      </div>
                      {place.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{place.phoneNumber}</span>
                        </div>
                      )}
                      {place.rating && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">⭐</span>
                          <span>{place.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {place.crowdDensity && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">👥</span>
                          <span className="capitalize">{place.crowdDensity}</span>
                        </div>
                      )}
                    </div>

                    {/* Popularity and Busy Level */}
                    {(place.popularityScore || place.busyLevel) && (
                      <div className="flex gap-2 text-xs">
                        {place.popularityScore && (
                          <Badge variant="secondary">
                            Popularity: {place.popularityScore}/100
                          </Badge>
                        )}
                        {place.busyLevel && (
                          <Badge variant="outline" className="capitalize">
                            {place.busyLevel.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    )}

                    {place.description && (
                      <p className="text-sm text-muted-foreground">{place.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates.lat},${place.coordinates.lng}`;
                          window.open(url, "_blank");
                        }}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Get Directions
                      </Button>
                      {place.phoneNumber && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`tel:${place.phoneNumber}`, "_self")}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}