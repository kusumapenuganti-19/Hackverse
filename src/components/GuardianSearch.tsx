import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, Clock, AlertTriangle, Navigation, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import GuardianMap from "@/components/GuardianMap";

interface RouteOption {
  routeId: string;
  distance: number;
  duration: number;
  safetyScore: number;
  polyline: string;
  warnings: string[];
  safePlacesNearby: number;
  weatherCondition: string;
  crowdLevel: string;
  weatherWaypoints?: Array<{
    lat: number;
    lng: number;
    weather: string;
    visibility_m: number;
    temp: number;
  }>;
}

export default function GuardianSearch() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [mapData, setMapData] = useState<{
    sourceCoords: { lat: number; lng: number };
    destCoords: { lat: number; lng: number };
  } | null>(null);

  const analyzeRoute = useAction(api.guardian.analyzeRouteSafety);

  const handleAnalyze = async () => {
    if (!source.trim() || !destination.trim()) {
      toast.error("Please enter both source and destination");
      return;
    }

    if (source.trim().length < 5 || destination.trim().length < 5) {
      toast.error("Please enter complete addresses (e.g., 'Jagadamba Junction, Visakhapatnam')");
      return;
    }

    setLoading(true);
    setRoutes([]);
    setSelectedRoute(null);
    setMapData(null);

    try {
      toast.info("Raayan is analyzing route safety...");
      const result = await analyzeRoute({ source, destination });
      
      setRoutes(result.routes);
      setMapData({
        sourceCoords: result.sourceCoords,
        destCoords: result.destCoords,
      });
      toast.success(`Raayan found ${result.routes.length} route options`);
    } catch (error: any) {
      console.error("Route analysis error:", error);
      
      if (error.message?.includes("Could not find location")) {
        toast.error(error.message);
      } else if (error.message?.includes("GOOGLE_MAPS_API_KEY")) {
        toast.error("Google Maps API key is not configured. Please contact support.");
      } else {
        toast.error("Failed to analyze route safety. Please check your addresses and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartJourney = (route: RouteOption) => {
    if (!mapData) {
      toast.error("Route coordinates not available. Please try analyzing the route again.");
      return;
    }

    const origin = encodeURIComponent(`${mapData.sourceCoords.lat},${mapData.sourceCoords.lng}`);
    const destination = encodeURIComponent(`${mapData.destCoords.lat},${mapData.destCoords.lng}`);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    console.log("Opening Google Maps with URL:", googleMapsUrl);
    toast.success("Starting your journey with Raayan's safest route!");
    
    const newWindow = window.open(googleMapsUrl, '_blank');
    if (!newWindow) {
      toast.error("Please allow pop-ups to open Google Maps");
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getSafetyBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Source Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                placeholder="Enter complete address (e.g., Jagadamba Junction, Visakhapatnam)"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Destination</label>
            <div className="relative">
              <Navigation className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                placeholder="Enter complete address (e.g., RK Beach, Visakhapatnam)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Raayan is Analyzing...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Analyze Route Safety
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
              <Shield className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-semibold text-primary">
            Raayan is analyzing route safety factors...
          </p>
          <p className="text-xs text-muted-foreground">
            Checking weather, nearby safe places, and route conditions
          </p>
        </motion.div>
      )}

      {/* Map Visualization */}
      {mapData && routes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Route Map</h3>
          <GuardianMap
            sourceCoords={mapData.sourceCoords}
            destCoords={mapData.destCoords}
            routes={routes}
            selectedRouteId={selectedRoute}
            apiKey=""
          />
        </div>
      )}

      {/* Route Options */}
      {routes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Raayan's Route Suggestions (Ranked by Safety)</h3>
          {routes.map((route, index) => (
            <motion.div
              key={route.routeId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`p-5 cursor-pointer transition-all ${
                  selectedRoute === route.routeId
                    ? "border-2 border-primary shadow-lg"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedRoute(route.routeId)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className={`h-6 w-6 ${getSafetyColor(route.safetyScore)}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">Route {index + 1}</h4>
                          {index === 0 && (
                            <Badge variant="default" className="text-xs">
                              Raayan's Choice
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Safety Score: <span className={`font-bold ${getSafetyColor(route.safetyScore)}`}>
                            {route.safetyScore}/100
                          </span>
                        </p>
                      </div>
                    </div>
                    <Badge variant={getSafetyBadgeVariant(route.safetyScore)}>
                      {route.safetyScore >= 80 ? "Safe" : route.safetyScore >= 60 ? "Moderate" : "Caution"}
                    </Badge>
                  </div>

                  {/* Route Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-muted-foreground" />
                      <span>{(route.distance / 1000).toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{Math.round(route.duration / 60)} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>{route.safePlacesNearby} safe places</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">☁️</span>
                      <span>{route.weatherCondition}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">👥</span>
                      <span className="capitalize">{route.crowdLevel} crowd</span>
                    </div>
                  </div>

                  {/* Warnings */}
                  {route.warnings.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Safety Alerts:</p>
                      <div className="space-y-1">
                        {route.warnings.map((warning, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{warning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weather Waypoints */}
                  {route.weatherWaypoints && route.weatherWaypoints.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <p className="text-xs font-medium text-muted-foreground">Weather Along Route:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {route.weatherWaypoints.map((waypoint, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Point {idx + 1}</span>
                              <span className="text-muted-foreground">☁️ {waypoint.weather}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={waypoint.visibility_m < 1000 ? "text-yellow-600" : "text-muted-foreground"}>
                                👁️ {waypoint.visibility_m}m
                              </span>
                              <span className="text-muted-foreground">🌡️ {Math.round(waypoint.temp)}°C</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant={selectedRoute === route.routeId ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoute(route.routeId);
                        toast.success(index === 0 ? "Raayan's safest route selected!" : "Route selected");
                      }}
                    >
                      {selectedRoute === route.routeId ? "Selected" : "Select This Route"}
                    </Button>
                    {selectedRoute === route.routeId && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartJourney(route);
                        }}
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Start Journey
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}