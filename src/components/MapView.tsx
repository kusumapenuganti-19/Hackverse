import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface MapViewProps {
  address: string;
}

export default function MapView({ address }: MapViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Encode address for URL
  const encodedAddress = encodeURIComponent(address);
  
  // Using OpenStreetMap embed (no API key required)
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=78.3,17.3,78.6,17.5&layer=mapnik&marker=17.385,78.486`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <MapPin className="h-4 w-4" />
          View Map
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Map
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Address:</p>
            <p className="text-sm text-muted-foreground">{address}</p>
          </div>
          
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden border">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapUrl}
              className="w-full h-full"
              title="Location Map"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')}
            >
              Open in Google Maps
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(`https://www.openstreetmap.org/search?query=${encodedAddress}`, '_blank')}
            >
              Open in OpenStreetMap
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
