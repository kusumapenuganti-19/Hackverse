import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get comprehensive spend summary with optimized data structures
export const getSpendSummary = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Use Map for O(1) lookups instead of repeated array filters
    const bookingsByCategory = new Map<string, typeof bookings>();
    const filteredBookings: typeof bookings = [];
    
    // Single pass through bookings for filtering and categorization
    for (const booking of bookings) {
      // Date filtering
      if (args.startDate && booking._creationTime < args.startDate) continue;
      if (args.endDate && booking._creationTime > args.endDate) continue;
      
      filteredBookings.push(booking);
      
      // Categorize using Map
      const category = booking.category;
      if (!bookingsByCategory.has(category)) {
        bookingsByCategory.set(category, []);
      }
      bookingsByCategory.get(category)!.push(booking);
    }

    // Calculate totals in single pass
    let totalSpend = 0;
    let foodSpend = 0;
    let busSpend = 0;
    
    for (const booking of filteredBookings) {
      totalSpend += booking.finalPrice;
      if (booking.category === "food") {
        foodSpend += booking.finalPrice;
      } else if (booking.category === "travel") {
        busSpend += booking.finalPrice;
      }
    }

    const foodBookings = bookingsByCategory.get("food")?.length || 0;
    const busBookings = bookingsByCategory.get("travel")?.length || 0;

    const dayCount = args.startDate && args.endDate 
      ? Math.max(1, Math.ceil((args.endDate - args.startDate) / (1000 * 60 * 60 * 24)))
      : 30;

    return {
      totalSpend,
      foodSpend,
      busSpend,
      totalBookings: filteredBookings.length,
      foodBookings,
      busBookings,
      dailyAverage: totalSpend / dayCount,
      bookings: filteredBookings,
    };
  },
});

// Get savings analysis with optimized calculations
export const getSavingsAnalysis = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const completedBookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Single pass calculation with accumulated values
    let totalSavings = 0;
    let totalWithoutRaayan = 0;
    let totalWithRaayan = 0;

    for (const booking of completedBookings) {
      totalWithRaayan += booking.finalPrice;
      
      try {
        const bookingData = JSON.parse(booking.bookingData);
        
        if (bookingData.allOptions && Array.isArray(bookingData.allOptions)) {
          // Use reduce for efficient array aggregation
          const avgPrice = bookingData.allOptions.reduce((sum: number, opt: any) => 
            sum + (opt.finalPrice || opt.price || 0), 0) / bookingData.allOptions.length;
          
          const savings = avgPrice - booking.finalPrice;
          if (savings > 0) {
            totalSavings += savings;
          }
          totalWithoutRaayan += avgPrice;
        } else {
          // Estimate 15% savings if no comparison data
          const estimatedWithout = booking.finalPrice * 1.15;
          totalSavings += booking.finalPrice * 0.15;
          totalWithoutRaayan += estimatedWithout;
        }
      } catch (e) {
        // If parsing fails, estimate savings
        totalWithoutRaayan += booking.finalPrice * 1.15;
        totalSavings += booking.finalPrice * 0.15;
      }
    }

    const savingsPercentage = totalWithoutRaayan > 0 
      ? (totalSavings / totalWithoutRaayan) * 100 
      : 0;

    return {
      totalSavings,
      totalWithoutRaayan,
      totalWithRaayan,
      savingsPercentage,
      bookingCount: completedBookings.length,
    };
  },
});

// Get spending over time with optimized grouping using Map
export const getSpendTimeSeries = query({
  args: {
    groupBy: v.union(v.literal("day"), v.literal("week"), v.literal("month")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Use Map for O(1) grouping operations
    const grouped = new Map<string, { food: number; bus: number; total: number; timestamp: number }>();

    for (const booking of bookings) {
      // Date filtering
      if (args.startDate && booking._creationTime < args.startDate) continue;
      if (args.endDate && booking._creationTime > args.endDate) continue;

      const date = new Date(booking._creationTime);
      let key: string;

      // Optimize key generation
      if (args.groupBy === "day") {
        key = date.toISOString().split("T")[0];
      } else if (args.groupBy === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      // Initialize or update in single operation
      if (!grouped.has(key)) {
        grouped.set(key, { food: 0, bus: 0, total: 0, timestamp: date.getTime() });
      }

      const entry = grouped.get(key)!;
      entry.total += booking.finalPrice;
      
      if (booking.category === "food") {
        entry.food += booking.finalPrice;
      } else if (booking.category === "travel") {
        entry.bus += booking.finalPrice;
      }
    }

    // Convert Map to sorted array efficiently
    return Array.from(grouped.entries())
      .map(([key, value]) => ({ 
        date: key, 
        food: value.food, 
        bus: value.bus, 
        total: value.total 
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
});

// Get top platforms with optimized aggregation using Map
export const getTopPlatforms = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Use Map for O(1) platform lookups and updates
    const platformStats = new Map<string, { spend: number; count: number }>();

    for (const booking of bookings) {
      const platform = booking.platform;
      
      if (!platformStats.has(platform)) {
        platformStats.set(platform, { spend: 0, count: 0 });
      }
      
      const stats = platformStats.get(platform)!;
      stats.spend += booking.finalPrice;
      stats.count += 1;
    }

    // Convert Map to sorted array
    return Array.from(platformStats.entries())
      .map(([platform, stats]) => ({ platform, ...stats }))
      .sort((a, b) => b.spend - a.spend);
  },
});