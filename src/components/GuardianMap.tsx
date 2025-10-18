import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Maximize2, Minimize2 } from "lucide-react";

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

interface GuardianMapProps {
  sourceCoords: { lat: number; lng: number };
  destCoords: { lat: number; lng: number };
  routes: RouteOption[];
  selectedRouteId: string | null;
  apiKey: string;
}

export default function GuardianMap({
  sourceCoords,
  destCoords,
  routes,
  selectedRouteId,
  apiKey,
}: GuardianMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const directionsRenderers = useRef<google.maps.DirectionsRenderer[]>([]);
  const weatherMarkers = useRef<google.maps.Marker[]>([]);

  // Initialize map with robust retry mechanism
  useEffect(() => {
    if (!mapRef.current) return;

    let retryCount = 0;
    const maxRetries = 20;

    const initMap = () => {
      if (typeof window === 'undefined' || !window.google?.maps) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(`⏳ Raayan Guardian: Google Maps API not ready, retrying... (${retryCount}/${maxRetries})`);
          setTimeout(initMap, 300);
        } else {
          console.error("❌ Raayan Guardian: Failed to load Google Maps API after maximum retries");
          setIsLoading(false);
        }
        return;
      }

      console.log("✅ Raayan Guardian: Initializing map with Google Maps JavaScript API...");
      
      try {
        const newMap = new google.maps.Map(mapRef.current!, {
          center: sourceCoords,
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
        });

        setMap(newMap);
        setIsLoading(false);
        console.log("✅ Raayan Guardian: Map initialized successfully");
      } catch (error) {
        console.error("❌ Raayan Guardian: Error initializing map:", error);
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(initMap, 300);
        } else {
          setIsLoading(false);
        }
      }
    };

    // Start initialization after a short delay
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [sourceCoords]);

  // Render routes using Google Maps Directions API with DirectionsRenderer
  useEffect(() => {
    if (!map || routes.length === 0 || isLoading) {
      console.log("⏳ Raayan Guardian: Waiting for map or routes...", { map: !!map, routesCount: routes.length, isLoading });
      return;
    }

    if (!window.google?.maps?.DirectionsService) {
      console.error("❌ Raayan Guardian: Google Maps Directions API not available");
      return;
    }

    console.log(`🗺️ Raayan Guardian: Rendering ${routes.length} routes using Google Maps Directions API...`);

    // Clear existing renderers and markers
    directionsRenderers.current.forEach((renderer) => renderer.setMap(null));
    weatherMarkers.current.forEach((marker) => marker.setMap(null));
    directionsRenderers.current = [];
    weatherMarkers.current = [];

    const directionsService = new google.maps.DirectionsService();
    const bounds = new google.maps.LatLngBounds();

    // Request directions from Google Directions API for each route
    routes.forEach((route, index) => {
      const isSelected = route.routeId === selectedRouteId || index === 0;
      
      const request: google.maps.DirectionsRequest = {
        origin: sourceCoords,
        destination: destCoords,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const renderer = new google.maps.DirectionsRenderer({
            map: map,
            directions: result,
            routeIndex: Math.min(index, result.routes.length - 1),
            suppressMarkers: false, // Show A/B markers
            suppressInfoWindows: true,
            preserveViewport: index > 0,
            polylineOptions: {
              strokeColor: getRouteColor(route.safetyScore, isSelected),
              strokeOpacity: isSelected ? 0.9 : 0.5,
              strokeWeight: isSelected ? 6 : 4,
            },
          });

          directionsRenderers.current.push(renderer);
          console.log(`✅ Raayan Guardian: Route ${index + 1} rendered (Safety: ${route.safetyScore})`);

          // Extend bounds to include this route
          if (result.routes[0]) {
            bounds.extend(result.routes[0].bounds.getNorthEast());
            bounds.extend(result.routes[0].bounds.getSouthWest());
          }

          // Add weather waypoint markers for selected route
          if (route.weatherWaypoints && isSelected) {
            route.weatherWaypoints.forEach((waypoint, wpIndex) => {
              const waypointMarker = new google.maps.Marker({
                position: { lat: waypoint.lat, lng: waypoint.lng },
                map,
                title: `Weather: ${waypoint.weather}`,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: getWeatherColor(waypoint.visibility_m, waypoint.weather),
                  fillOpacity: 0.8,
                  strokeColor: "#fff",
                  strokeWeight: 2,
                },
                label: {
                  text: `${wpIndex + 1}`,
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: "bold",
                },
              });

              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div style="padding: 8px;">
                    <strong>Weather Point ${wpIndex + 1}</strong><br/>
                    Condition: ${waypoint.weather}<br/>
                    Visibility: ${waypoint.visibility_m}m<br/>
                    Temperature: ${Math.round(waypoint.temp)}°C
                  </div>
                `,
              });

              waypointMarker.addListener("click", () => {
                infoWindow.open(map, waypointMarker);
              });

              weatherMarkers.current.push(waypointMarker);
            });
          }

          // Fit map to show all routes
          if (index === routes.length - 1) {
            map.fitBounds(bounds);
          }
        } else {
          console.error(`❌ Raayan Guardian: Directions request failed for route ${index + 1}:`, status);
        }
      });
    });

    console.log("✅ Raayan Guardian: All routes requested from Google Directions API");
  }, [map, routes, selectedRouteId, sourceCoords, destCoords, isLoading]);

  const getRouteColor = (safetyScore: number, isSelected: boolean): string => {
    if (isSelected) {
      if (safetyScore >= 80) return "#10b981"; // green
      if (safetyScore >= 60) return "#f59e0b"; // yellow
      return "#ef4444"; // red
    }
    return "#6b7280"; // gray for non-selected
  };

  const getWeatherColor = (visibility: number, weather: string): string => {
    if (visibility < 1000 || weather.includes("rain") || weather.includes("fog")) {
      return "#ef4444"; // red for hazardous
    }
    return "#10b981"; // green for clear
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={`overflow-hidden ${isFullscreen ? "fixed inset-4 z-50" : ""}`}>
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="text-center space-y-2">
              <div className="animate-pulse text-primary font-semibold text-lg">Raayan Guardian</div>
              <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
              <p className="text-xs text-muted-foreground">Initializing route visualization</p>
            </div>
          </div>
        )}
        <div
          ref={mapRef}
          className={`w-full ${isFullscreen ? "h-[calc(100vh-2rem)]" : "h-[500px]"}`}
        />
        
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 shadow-lg z-20"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs space-y-2 z-20">
          <div className="font-semibold mb-2">Route Safety</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500 rounded"></div>
            <span>Safe (80+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-yellow-500 rounded"></div>
            <span>Moderate (60-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-500 rounded"></div>
            <span>Caution (&lt;60)</span>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-2 border-t">
            <MapPin className="h-3 w-3 text-green-600" />
            <span>Source (A)</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-red-600" />
            <span>Destination (B)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Clear Weather</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Weather Hazard</span>
          </div>
        </div>
      </div>
    </Card>
  );
}