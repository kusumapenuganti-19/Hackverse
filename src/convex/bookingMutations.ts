import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const insertBooking = internalMutation({
  args: {
    category: v.union(v.literal("food"), v.literal("travel")),
    platform: v.string(),
    restaurant: v.optional(v.string()),
    operator: v.optional(v.string()),
    finalPrice: v.number(),
    bookingData: v.string(),
    redirectUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    const bookingId = await ctx.db.insert("bookings", {
      userId: user?._id,
      category: args.category,
      platform: args.platform,
      restaurant: args.restaurant,
      operator: args.operator,
      finalPrice: args.finalPrice,
      bookingData: args.bookingData,
      redirectUrl: args.redirectUrl,
      status: "pending",
    });

    return bookingId;
  },
});

export const patchBookingStatus = internalMutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("redirected"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: args.status,
    });
  },
});

export const getUserBookings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const getRecentPendingBookings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    // Get bookings from the last 24 hours that are still "redirected"
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    const allBookings = await ctx.db
      .query("bookings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
    
    return allBookings.filter(
      (booking) => 
        booking.status === "redirected" && 
        booking._creationTime > oneDayAgo
    );
  },
});