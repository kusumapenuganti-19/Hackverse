import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import FoodSearch from "@/components/FoodSearch";
import TravelSearch from "@/components/TravelSearch";
import SavedSearches from "@/components/SavedSearches";
import BookingConfirmation from "@/components/BookingConfirmation";
import SpendAnalyzer from "@/components/SpendAnalyzer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("food");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "analyzer" || tab === "bookings") {
      setActiveTab("bookings");
    } else if (tab === "guardian") {
      navigate("/guardian");
    } else if (tab && ["food", "travel", "saved"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Raayan Dashboard</h1>
            <p className="text-muted-foreground mt-1">Your AI-powered decision optimizer</p>
          </div>
        </div>

        <BookingConfirmation />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="food">Food Delivery</TabsTrigger>
            <TabsTrigger value="travel">Bus Travel</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="saved">Saved Searches</TabsTrigger>
          </TabsList>

          <TabsContent value="food">
            <FoodSearch />
          </TabsContent>

          <TabsContent value="travel">
            <TravelSearch />
          </TabsContent>

          <TabsContent value="bookings">
            <SpendAnalyzer />
          </TabsContent>

          <TabsContent value="saved">
            <SavedSearches />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}