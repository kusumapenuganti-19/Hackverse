import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Store, UtensilsCrossed, Star, Clock, MapPin } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import RestaurantAutocomplete from "@/components/RestaurantAutocomplete";

export default function FoodSearch() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [allLocationRestaurants, setAllLocationRestaurants] = useState<any[]>([]);
  const [isNewUser, setIsNewUser] = useState(true);

  const searchRestaurantsWithPerplexity = useAction(api.foodSearch.searchRestaurantsWithPerplexity);
  const getCachedFoodSearch = useAction(api.foodCache.getCachedFoodSearch);
  const saveFoodSearch = useAction(api.foodCache.saveFoodSearch);

  const handleSearch = async () => {
    if (!location.trim()) {
      toast.error("Please enter your address first");
      return;
    }

    setIsSearching(true);
    setAllLocationRestaurants([]);

    try {
      // Check cache first
      const cacheKey = { location: location || "India", restaurant: "", isNewUser: false };
      let allRestaurants = await getCachedFoodSearch(cacheKey);
      
      if (allRestaurants) {
        toast.success(`Found ${allRestaurants.length} restaurants (cached)!`);
        setAllLocationRestaurants(allRestaurants);
        setIsSearching(false);
        return;
      }

      toast.loading("Raayan is finding restaurants near you...");
      
      console.log("🔍 Attempting Perplexity API call for all restaurants...");
      allRestaurants = await searchRestaurantsWithPerplexity({ 
        location: location || "India", 
        restaurant: restaurant || ""
      });
      
      console.log("📊 Perplexity results:", allRestaurants?.length || 0, "restaurants");
      
      toast.dismiss();
      
      if (!allRestaurants || allRestaurants.length === 0) {
        toast.error("No restaurants found in this location. Please try a different address.");
        setIsSearching(false);
        return;
      }
      
      toast.success(`Found ${allRestaurants.length} restaurants near you!`);

      // Save to cache
      await saveFoodSearch({
        location: location || "India",
        restaurant: restaurant || "",
        isNewUser: false,
        results: JSON.stringify(allRestaurants),
      });

      setAllLocationRestaurants(allRestaurants);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load restaurants");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRestaurant = (restaurantName: string) => {
    navigate(`/dashboard/analyze?location=${encodeURIComponent(location)}&restaurant=${encodeURIComponent(restaurantName)}&isNewUser=${isNewUser}`);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border">
        <div className="space-y-4">
          <LocationAutocomplete
            value={location}
            onChange={setLocation}
            disabled={isSearching}
          />

          <RestaurantAutocomplete
            value={restaurant}
            onChange={setRestaurant}
            disabled={isSearching}
            location={location}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="newUser"
              checked={isNewUser}
              onChange={(e) => setIsNewUser(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="newUser" className="cursor-pointer text-sm">
              I'm a new user (get extra discounts!)
            </Label>
          </div>

          <Button
            onClick={handleSearch}
            disabled={isSearching || !location.trim()}
            className="w-full"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Restaurants
              </>
            )}
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {allLocationRestaurants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold">Available Restaurants</h3>
            <p className="text-xs text-muted-foreground">Delivering to: {location}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allLocationRestaurants.map((rest, idx) => (
                <Card 
                  key={idx} 
                  className="food-card p-4 border hover:border-primary cursor-pointer transition-colors"
                  onClick={() => handleSelectRestaurant(rest.restaurant || rest.name)}
                >
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm">
                      <UtensilsCrossed className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{rest.restaurant || rest.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{rest.cuisine || rest.address || "Restaurant"}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {rest.rating}
                        </span>
                        {rest.eta && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {rest.eta}m
                          </span>
                        )}
                        {rest.distance && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {rest.distance}km
                          </span>
                        )}
                        {rest.area && <span className="text-xs text-muted-foreground">{rest.area}</span>}
                      </div>
                      {rest.platform && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {rest.deliveryFee === 0 || (rest.freeDeliveryAbove && rest.freeDeliveryAbove < 200) ? (
                            <Badge className="bg-green-600 text-white text-xs">FREE Delivery</Badge>
                          ) : rest.deliveryFee && (
                            <Badge variant="outline" className="text-xs">₹{rest.deliveryFee} delivery</Badge>
                          )}
                          {rest.newUserDiscount > 0 && (
                            <Badge className="bg-blue-600 text-white text-xs">₹{rest.newUserDiscount} OFF</Badge>
                          )}
                          {rest.minOrderDiscount?.discount > 0 && (
                            <Badge className="bg-purple-600 text-white text-xs">{rest.minOrderDiscount.discount}% OFF</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}