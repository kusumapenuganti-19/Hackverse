import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Star, X } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";

interface Restaurant {
  name: string;
  cuisine: string;
  rating: number;
  area: string;
  image: string;
  platforms: string[];
}

interface RestaurantAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  location: string;
}

export default function RestaurantAutocomplete({ value, onChange, disabled, location }: RestaurantAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Restaurant[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRestaurants = useAction(api.scraper.searchRestaurants);

  useEffect(() => {
    if (!value) {
      setQuery("");
      setSelectedRestaurant(null);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedRestaurant) return; // Don't search if already selected

    const delayDebounce = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const results = await searchRestaurants({ query, location });
          setSuggestions(results);
          setIsOpen(true);
        } catch (error) {
          console.error("Failed to fetch restaurants:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, location, searchRestaurants, selectedRestaurant]);

  const handleSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setQuery(restaurant.name);
    onChange(restaurant.name);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setSelectedRestaurant(null);
    setQuery("");
    onChange("");
    setSuggestions([]);
  };

  return (
    <div className="space-y-2" ref={wrapperRef}>
      <Label htmlFor="restaurant">Restaurant or Dish</Label>
      
      {selectedRestaurant ? (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
          <img 
            src={selectedRestaurant.image} 
            alt={selectedRestaurant.name}
            className="w-12 h-12 rounded-md object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold">{selectedRestaurant.name}</p>
            <p className="text-xs text-muted-foreground">{selectedRestaurant.cuisine}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {selectedRestaurant.rating}
              </Badge>
              <span className="text-xs text-muted-foreground">{selectedRestaurant.area}</span>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="restaurant"
            placeholder="e.g., Paradise, Biryani, Pizza"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={disabled || !location}
            className="pl-10"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && !selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-80 overflow-auto"
          >
            {suggestions.map((restaurant, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(restaurant)}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3 border-b last:border-b-0"
              >
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name}
                  className="w-12 h-12 rounded-md object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{restaurant.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{restaurant.cuisine}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {restaurant.rating}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{restaurant.area}</span>
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!location && (
        <p className="text-xs text-muted-foreground">Please select a location first</p>
      )}
    </div>
  );
}
