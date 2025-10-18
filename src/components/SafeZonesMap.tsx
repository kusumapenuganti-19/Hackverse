import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface SafePlace {
  name: string;
  type: string;
  address: string;
  coordinates: { lat: number; lng: number };
  distance: number;
  phoneNumber?: string;
  rating?: number;
  description?: string;
}

interface SafeZonesMapProps {
  userCoords: { lat: number; lng: number };
  safePlaces: SafePlace[];
  apiKey: string;
}

export default function SafeZonesMap({
  userCoords,
  safePlaces,
  apiKey,
}: SafeZonesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const markers = useRef<google.maps.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center: userCoords,
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setMap(newMap);
  }, [userCoords]);

  // Draw markers
  useEffect(() => {
    if (!map || safePlaces.length === 0) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    // Add user location marker
    const userMarker = new google.maps.Marker({
      position: userCoords,
      map,
      title: "Your Location",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    });
    markers.current.push(userMarker);

    // Add safe place markers
    safePlaces.forEach((place) => {
      const markerIcon = getMarkerIcon(place.type);
      
      const marker = new google.maps.Marker({
        position: place.coordinates,
        map,
        title: place.name,
        icon: {
          url: markerIcon,
        },
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <strong>${place.name}</strong><br/>
            <span style="color: #666;">${place.type}</span><br/>
            <span style="font-size: 12px;">${place.address}</span><br/>
            <span style="font-size: 12px; color: #666;">${place.distance.toFixed(2)} km away</span>
            ${place.phoneNumber ? `<br/><span style="font-size: 12px;">📞 ${place.phoneNumber}</span>` : ""}
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(userCoords);
    safePlaces.forEach((place) => bounds.extend(place.coordinates));
    map.fitBounds(bounds);
  }, [map, safePlaces, userCoords]);

  const getMarkerIcon = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("police")) return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    if (lowerType.includes("hospital")) return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    if (lowerType.includes("fire")) return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
    return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={`overflow-hidden ${isFullscreen ? "fixed inset-4 z-50" : ""}`}>
      <div className="relative">
        <div
          ref={mapRef}
          className={`w-full ${isFullscreen ? "h-[calc(100vh-2rem)]" : "h-[500px]"}`}
        />
        
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 shadow-lg"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs space-y-2">
          <div className="font-semibold mb-2">Legend</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>Police Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Hospital</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Fire Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Safe Zone</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
