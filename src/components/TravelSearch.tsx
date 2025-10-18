import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Sparkles, TrendingDown, Bus, Wifi, Zap, Coffee, Armchair, ExternalLink, Droplet, BookOpen, Shield } from "lucide-react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const getBusTypeIcon = (type: string) => {
  if (type.includes("Sleeper")) return <Armchair className="h-4 w-4" />;
  return <Bus className="h-4 w-4" />;
};

const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes("wifi")) return <Wifi className="h-3 w-3" />;
  if (amenityLower.includes("charging") || amenityLower.includes("power")) return <Zap className="h-3 w-3" />;
  if (amenityLower.includes("water") || amenityLower.includes("bottle")) return <Droplet className="h-3 w-3" />;
  if (amenityLower.includes("reading") || amenityLower.includes("light")) return <BookOpen className="h-3 w-3" />;
  if (amenityLower.includes("blanket") || amenityLower.includes("pillow")) return <Armchair className="h-3 w-3" />;
  if (amenityLower.includes("emergency") || amenityLower.includes("safety")) return <Shield className="h-3 w-3" />;
  if (amenityLower.includes("snack") || amenityLower.includes("food") || amenityLower.includes("refreshment")) return <Coffee className="h-3 w-3" />;
  return <Sparkles className="h-3 w-3" />;
};

// Bus operator colors (no external images)
const busOperatorColors: Record<string, string> = {
  "VRL Travels": "from-blue-600 to-blue-800",
  "SRS Travels": "from-green-600 to-green-800",
  "Orange Travels": "from-orange-600 to-orange-800",
  "Kallada Travels": "from-purple-600 to-purple-800",
};

export default function TravelSearch() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any>(null);

  const scrapeTravel = useAction(api.scraper.scrapeTravel);
  const analyzeAndRecommend = useAction(api.scraper.analyzeAndRecommend);
  const saveBusSearch = useAction(api.busCache.saveBusSearch);
  const searchRealTimeBusPrices = useAction(api.busTickets.searchRealTimeBusPrices);
  const createBooking = useAction(api.bookings.createBooking);
  const generateRedirectUrl = useAction(api.bookings.generateRedirectUrl);
  const updateBookingStatus = useAction(api.bookings.updateBookingStatus);
  const cachedSearch = useQuery(
    api.busCache.getCachedBusSearch,
    source && destination && date ? { source, destination, date } : "skip"
  );

  const handleBookNow = async (busOption: any) => {
    try {
      toast.loading("Preparing your booking...");
      
      const redirectUrl = await generateRedirectUrl({
        platform: busOption.platform,
        category: "travel",
        source: source,
        destination: destination,
      });

      const bookingId = await createBooking({
        category: "travel",
        platform: busOption.platform,
        operator: busOption.operator,
        finalPrice: busOption.price,
        bookingData: JSON.stringify(busOption),
        redirectUrl,
      });

      await updateBookingStatus({
        bookingId,
        status: "redirected",
      });

      toast.success(`Redirecting to ${busOption.platform}...`);
      window.open(redirectUrl, "_blank");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to process booking");
    }
  };

  const handleSearch = async () => {
    if (!source.trim() || !destination.trim() || !date) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSearching(true);
    setResults(null);

    try {
      if (cachedSearch) {
        toast.success("Loaded from cache!");
        const analysis = await analyzeAndRecommend({
          category: "travel",
          results: JSON.stringify(cachedSearch),
        });
        setResults(analysis);
        setIsSearching(false);
        return;
      }

      toast.loading("Raayan is searching for the best bus options...");
      
      console.log("🔍 Attempting Perplexity API call...");
      const scrapedData = await searchRealTimeBusPrices({ source, destination, date });
      
      console.log("📊 Perplexity results:", scrapedData?.length || 0, "tickets");
      
      toast.dismiss();
      
      if (!scrapedData || scrapedData.length === 0) {
        toast.error("No bus options found. Please try different search criteria.");
        setIsSearching(false);
        return;
      }
      
      toast.success(`Found ${scrapedData.length} real-time bus options!`);
      
      await saveBusSearch({
        source,
        destination,
        date,
        results: JSON.stringify(scrapedData),
      });
      
      const analysis = await analyzeAndRecommend({
        category: "travel",
        results: JSON.stringify(scrapedData),
      });

      setResults(analysis);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch results");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-8 border">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">From</Label>
              <Input
                id="source"
                placeholder="e.g., Bangalore"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                disabled={isSearching}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">To</Label>
              <Input
                id="destination"
                placeholder="e.g., Chennai"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={isSearching}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Travel Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSearching}
            />
          </div>

          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full"
            size="lg"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Best Routes
              </>
            )}
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Raayan's Pick */}
            <Card className="bus-card p-6 border-2 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-md">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold tracking-tight mb-4">🏆 Best Bus Option</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`relative w-32 h-24 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-gradient-to-br ${busOperatorColors[results.recommendation.pick.operator] || "from-blue-600 to-blue-800"} flex items-center justify-center`}>
                        <Bus className="h-12 w-12 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-xl">{results.recommendation.pick.operator}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-blue-600 text-white text-xs">
                                {getBusTypeIcon(results.recommendation.pick.type)}
                                <span className="ml-1">{results.recommendation.pick.type}</span>
                              </Badge>
                              <Badge variant="secondary" className="text-xs">⭐ {results.recommendation.pick.rating}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-primary">₹{results.recommendation.pick.price}</p>
                            <p className="text-sm text-muted-foreground">{results.recommendation.pick.duration}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 flex-wrap mt-3 text-xs">
                          {results.recommendation.pick.amenities && results.recommendation.pick.amenities.length > 0 ? (
                            results.recommendation.pick.amenities.slice(0, 5).map((amenity: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="gap-1">
                                {getAmenityIcon(amenity)}
                                {amenity}
                              </Badge>
                            ))
                          ) : (
                            <>
                              <Badge variant="outline" className="gap-1">
                                <Wifi className="h-3 w-3" />
                                WiFi
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Zap className="h-3 w-3" />
                                Charging
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-background/50 p-3 rounded-lg">
                      <p className="text-sm leading-relaxed">{results.recommendation.reasoning}</p>
                    </div>
                    <div className="flex gap-4 flex-wrap text-sm">
                      <span className="flex items-center gap-1">
                        <Bus className="h-4 w-4" />
                        {results.recommendation.pick.platform}
                      </span>
                      <span>🕐 {results.recommendation.pick.departure} - {results.recommendation.pick.arrival}</span>
                      <span>💺 {results.recommendation.pick.seats} seats available</span>
                      {results.recommendation.pick.distance && results.recommendation.pick.distance !== "N/A" && (
                        <span>📍 {results.recommendation.pick.distance}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-4 flex-wrap mt-3">
                      {results.recommendation.savings > 0 && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                          <TrendingDown className="h-4 w-4" />
                          <span>Save ₹{results.recommendation.savings} compared to highest price</span>
                        </div>
                      )}
                      <Button 
                        onClick={() => handleBookNow(results.recommendation.pick)}
                        className="bg-primary hover:bg-primary/90 font-bold"
                        size="lg"
                      >
                        Book Now on {results.recommendation.pick.platform}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* All Results */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Compare All Options</h3>
              <div className="grid gap-3">
                {results.results.map((item: any, idx: number) => (
                  <Card key={idx} className="bus-card p-5 border hover:border-primary/50 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className={`relative w-24 h-20 rounded-lg overflow-hidden shadow flex-shrink-0 bg-gradient-to-br ${busOperatorColors[item.operator] || "from-blue-600 to-blue-800"} flex items-center justify-center`}>
                        <Bus className="h-10 w-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-base">{item.operator}</p>
                              <Badge variant="outline" className="text-xs">Score: {item.raayanScore}</Badge>
                              <Badge variant="secondary" className="text-xs">⭐ {item.rating}</Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-blue-600 text-white text-xs">
                                {getBusTypeIcon(item.type)}
                                <span className="ml-1">{item.type}</span>
                              </Badge>
                              <span className="text-xs text-muted-foreground">{item.platform}</span>
                            </div>
                            <div className="flex gap-3 text-xs mt-2 text-muted-foreground">
                              <span>🕐 {item.departure} - {item.arrival}</span>
                              <span>⏱️ {item.duration}</span>
                              <span>💺 {item.seats} seats</span>
                              {item.distance && item.distance !== "N/A" && (
                                <span>📍 {item.distance}</span>
                              )}
                            </div>
                            {item.amenities && item.amenities.length > 0 && (
                              <div className="flex gap-2 flex-wrap mt-2">
                                {item.amenities.slice(0, 4).map((amenity: string, amenityIdx: number) => (
                                  <Badge key={amenityIdx} variant="outline" className="text-xs gap-1">
                                    {getAmenityIcon(amenity)}
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-2xl font-bold text-primary">₹{item.price}</p>
                            <Button 
                              onClick={() => handleBookNow(item)}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              Book Now
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}