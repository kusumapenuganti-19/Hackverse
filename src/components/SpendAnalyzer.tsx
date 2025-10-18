import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Loader2, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";
import SpendOverview from "./analytics/SpendOverview";
import CategoryBreakdown from "./analytics/CategoryBreakdown";
import SavingsComparison from "./analytics/SavingsComparison";
import SpendTimeline from "./analytics/SpendTimeline";
import PlatformBreakdown from "./analytics/PlatformBreakdown";

// Mock data for testing - set to false for production
const USE_MOCK_DATA = false;

// Memoized mock data generator
const generateMockData = () => {
  return {
    spendSummary: {
      totalSpend: 12450,
      dailyAverage: 415,
      totalBookings: 18,
      foodSpend: 8200,
      busSpend: 4250,
      foodBookings: 12,
      busBookings: 6,
    },
    savingsAnalysis: {
      totalSavings: 2340,
      totalWithoutRaayan: 14790,
      totalWithRaayan: 12450,
      savingsPercentage: 15.8,
      bookingCount: 18,
    },
    timeSeriesData: [
      { date: "2024-01-15", food: 850, bus: 0, total: 850 },
      { date: "2024-01-17", food: 620, bus: 450, total: 1070 },
      { date: "2024-01-19", food: 0, bus: 800, total: 800 },
      { date: "2024-01-21", food: 1200, bus: 0, total: 1200 },
      { date: "2024-01-23", food: 450, bus: 650, total: 1100 },
      { date: "2024-01-25", food: 980, bus: 0, total: 980 },
      { date: "2024-01-27", food: 720, bus: 550, total: 1270 },
      { date: "2024-01-29", food: 1100, bus: 0, total: 1100 },
      { date: "2024-01-31", food: 680, bus: 800, total: 1480 },
      { date: "2024-02-02", food: 850, bus: 0, total: 850 },
      { date: "2024-02-04", food: 0, bus: 700, total: 700 },
      { date: "2024-02-06", food: 1350, bus: 0, total: 1350 },
      { date: "2024-02-08", food: 520, bus: 600, total: 1120 },
      { date: "2024-02-10", food: 880, bus: 0, total: 880 },
      { date: "2024-02-12", food: 0, bus: 700, total: 700 },
    ],
    platformData: [
      { platform: "Swiggy", spend: 4200, count: 7 },
      { platform: "Zomato", spend: 4000, count: 5 },
      { platform: "RedBus", spend: 2450, count: 3 },
      { platform: "AbhiBus", spend: 1800, count: 3 },
    ],
  };
};

export default function SpendAnalyzer() {
  const [timeGrouping, setTimeGrouping] = useState<"day" | "week" | "month">("day");
  
  // Memoize date calculations to avoid recalculation on every render
  const dateRange = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();
    return { startOfMonth, endOfMonth, now };
  }, []);

  // Conditional query execution
  const shouldSkipQuery = USE_MOCK_DATA;

  const spendSummaryReal = useQuery(
    api.spendAnalytics.getSpendSummary,
    shouldSkipQuery ? "skip" : {
      startDate: dateRange.startOfMonth,
      endDate: dateRange.endOfMonth,
    }
  );

  const savingsAnalysisReal = useQuery(
    api.spendAnalytics.getSavingsAnalysis,
    shouldSkipQuery ? "skip" : {}
  );

  const timeSeriesDataReal = useQuery(
    api.spendAnalytics.getSpendTimeSeries,
    shouldSkipQuery ? "skip" : {
      groupBy: timeGrouping,
      startDate: dateRange.startOfMonth,
      endDate: dateRange.endOfMonth,
    }
  );

  const platformDataReal = useQuery(
    api.spendAnalytics.getTopPlatforms,
    shouldSkipQuery ? "skip" : {}
  );

  // Memoize mock data to prevent regeneration
  const mockData = useMemo(() => USE_MOCK_DATA ? generateMockData() : null, []);
  
  const spendSummary = mockData ? mockData.spendSummary : spendSummaryReal;
  const savingsAnalysis = mockData ? mockData.savingsAnalysis : savingsAnalysisReal;
  const timeSeriesData = mockData ? mockData.timeSeriesData : timeSeriesDataReal;
  const platformData = mockData ? mockData.platformData : platformDataReal;

  const isLoading = !mockData && (!spendSummary || !savingsAnalysis || !timeSeriesData || !platformData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state (only for real data)
  if (!USE_MOCK_DATA && spendSummary && spendSummary.totalBookings === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center py-20"
      >
        <Card className="p-8 text-center max-w-md">
          <div className="mb-4 flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Spending Data Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start making bookings with Raayan to see your spending insights and savings analysis here!
          </p>
          <p className="text-sm text-muted-foreground">
            Once you confirm your bookings, we'll show you detailed analytics including:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Total spending and daily averages</li>
            <li>• Savings from using Raayan</li>
            <li>• Category-wise breakdowns</li>
            <li>• Platform comparisons</li>
          </ul>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Spend Analyzer</h2>
            <p className="text-sm text-muted-foreground">
              Your spending insights for {dateRange.now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              {USE_MOCK_DATA && <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">Mock Data</span>}
            </p>
          </div>
        </div>
      </motion.div>

      <SpendOverview
        totalSpend={spendSummary!.totalSpend}
        dailyAverage={spendSummary!.dailyAverage}
        totalBookings={spendSummary!.totalBookings}
        totalSavings={savingsAnalysis!.totalSavings}
        savingsPercentage={savingsAnalysis!.savingsPercentage}
        foodSpend={spendSummary!.foodSpend}
        busSpend={spendSummary!.busSpend}
      />

      <SavingsComparison
        totalWithoutRaayan={savingsAnalysis!.totalWithoutRaayan}
        totalWithRaayan={savingsAnalysis!.totalWithRaayan}
        totalSavings={savingsAnalysis!.totalSavings}
        savingsPercentage={savingsAnalysis!.savingsPercentage}
      />

      <CategoryBreakdown
        foodSpend={spendSummary!.foodSpend}
        busSpend={spendSummary!.busSpend}
        foodBookings={spendSummary!.foodBookings}
        busBookings={spendSummary!.busBookings}
      />

      <SpendTimeline
        timeSeriesData={timeSeriesData!}
        groupBy={timeGrouping}
        onGroupByChange={setTimeGrouping}
      />

      {platformData!.length > 0 && <PlatformBreakdown platformData={platformData!} />}
    </div>
  );
}