import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import RecommendationCard from "@/components/food/RecommendationCard";
import ComparisonCard from "@/components/food/ComparisonCard";

export default function RestaurantAnalysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = searchParams.get("location") || "";
  const restaurant = searchParams.get("restaurant") || "";
  const isNewUser = searchParams.get("isNewUser") === "true";

  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState("Searching across delivery partners...");

  const searchRestaurantsWithPerplexity = useAction(api.foodSearch.searchRestaurantsWithPerplexity);
  const analyzeAndRecommend = useAction(api.scraper.analyzeAndRecommend);
  const getCachedFoodSearch = useAction(api.foodCache.getCachedFoodSearch);
  const saveFoodSearch = useAction(api.foodCache.saveFoodSearch);

  useEffect(() => {
    if (!location || !restaurant) {
      toast.error("Missing location or restaurant information");
      navigate("/dashboard");
      return;
    }

    analyzeRestaurant();
  }, [location, restaurant, isNewUser]);

  const analyzeRestaurant = async () => {
    setIsAnalyzing(true);
    setLoadingMessage("Searching across delivery partners...");

    try {
      // Check cache first
      const cacheKey = { location, restaurant, isNewUser };
      let scrapedData = await getCachedFoodSearch(cacheKey);
      
      if (scrapedData) {
        setLoadingMessage("Analyzing delivery options...");
        await new Promise(resolve => setTimeout(resolve, 800)); // Brief delay for UX
        
        const analysis = await analyzeAndRecommend({
          category: "food",
          results: JSON.stringify(scrapedData),
          selectedItems: JSON.stringify([]),
          isNewUser,
        });

        setResults(analysis);
        toast.success("Analysis complete!");
        setIsAnalyzing(false);
        return;
      }

      // Fetch from Perplexity API
      setLoadingMessage(`Finding ${restaurant} on all platforms...`);
      console.log(`🔍 Searching for ${restaurant} across all delivery partners...`);
      
      scrapedData = await searchRestaurantsWithPerplexity({ 
        location, 
        restaurant
      });
      
      console.log("📊 Perplexity results:", scrapedData?.length || 0, "options");
      
      if (!scrapedData || scrapedData.length === 0) {
        toast.error("This restaurant is not available for delivery at your location");
        setIsAnalyzing(false);
        return;
      }

      // Save to cache
      await saveFoodSearch({
        location,
        restaurant,
        isNewUser,
        results: JSON.stringify(scrapedData),
      });

      // Analyze and recommend
      setLoadingMessage("Calculating the best deal for you...");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay for UX
      
      const analysis = await analyzeAndRecommend({
        category: "food",
        results: JSON.stringify(scrapedData),
        selectedItems: JSON.stringify([]),
        isNewUser,
      });

      setResults(analysis);
      toast.success("Here's Raayan's Pick!");
    } catch (error: any) {
      console.error("❌ Analysis error:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to analyze delivery options";
      
      if (error?.message?.includes("API key")) {
        errorMessage = "API key not configured. Please set up Gemini or Perplexity API key.";
      } else if (error?.message?.includes("Empty response")) {
        errorMessage = "AI service returned empty response. Please try again.";
      } else if (error?.message?.includes("No restaurants found")) {
        errorMessage = "No delivery options found for this restaurant.";
      } else if (error?.message?.includes("parse")) {
        errorMessage = "Failed to process AI response. Please try again.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{restaurant}</h1>
            <p className="text-sm text-muted-foreground mt-1">Delivering to: {location}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative p-6 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-xl">
                  <Sparkles className="h-12 w-12 text-primary-foreground animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Raayan is working its magic...</h3>
                <p className="text-muted-foreground animate-pulse">{loadingMessage}</p>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </motion.div>
          ) : results ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <RecommendationCard recommendation={results.recommendation} location={location} />

              <div>
                <h3 className="text-sm font-semibold mb-3">Compare All Options</h3>
                <div className="grid gap-3">
                  {results.results.map((item: any, idx: number) => (
                    <ComparisonCard key={idx} item={item} location={location} />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <p className="text-muted-foreground">No delivery options found for this restaurant.</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-4 text-primary hover:underline"
              >
                Go back to search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
