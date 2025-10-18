"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Platform redirect URLs
const PLATFORM_URLS: Record<string, string> = {
  "Swiggy": "https://www.swiggy.com",
  "Zomato": "https://www.zomato.com",
  "Uber Eats": "https://www.ubereats.com",
  "EatSure": "https://www.eatsure.com",
  "RedBus": "https://www.redbus.in",
  "AbhiBus": "https://www.abhibus.com",
  "MakeMyTrip": "https://www.makemytrip.com",
};

export const createBooking = action({
  args: {
    category: v.union(v.literal("food"), v.literal("travel")),
    platform: v.string(),
    restaurant: v.optional(v.string()),
    operator: v.optional(v.string()),
    finalPrice: v.number(),
    bookingData: v.string(),
    redirectUrl: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"bookings">> => {
    const bookingId = await ctx.runMutation(internal.bookingMutations.insertBooking, args);
    return bookingId;
  },
});

export const updateBookingStatus = action({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("redirected"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runMutation(internal.bookingMutations.patchBookingStatus, args);
  },
});

export const generateRedirectUrl = action({
  args: {
    platform: v.string(),
    category: v.union(v.literal("food"), v.literal("travel")),
    restaurant: v.optional(v.string()),
    location: v.optional(v.string()),
    source: v.optional(v.string()),
    destination: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const baseUrl = PLATFORM_URLS[args.platform] || "https://www.google.com";
    
    if (args.category === "food" && args.restaurant) {
      // Generate food delivery URL with search parameters
      const searchQuery = encodeURIComponent(args.restaurant);
      const locationQuery = args.location ? encodeURIComponent(args.location) : "";
      
      if (args.platform === "Swiggy") {
        return `${baseUrl}/restaurants/${searchQuery}`;
      } else if (args.platform === "Zomato") {
        return `${baseUrl}/search?q=${searchQuery}`;
      } else if (args.platform === "Uber Eats") {
        return `${baseUrl}/search?q=${searchQuery}`;
      }
      
      return `${baseUrl}/search?q=${searchQuery}`;
    } else if (args.category === "travel" && args.source && args.destination) {
      // Generate bus booking URL
      const sourceQuery = encodeURIComponent(args.source);
      const destQuery = encodeURIComponent(args.destination);
      
      if (args.platform === "RedBus") {
        return `${baseUrl}/bus-tickets/${sourceQuery}-to-${destQuery}`;
      } else if (args.platform === "AbhiBus") {
        return `${baseUrl}/search?source=${sourceQuery}&destination=${destQuery}`;
      } else if (args.platform === "MakeMyTrip") {
        return `${baseUrl}/bus-tickets/${sourceQuery}-${destQuery}`;
      }
      
      return `${baseUrl}`;
    }
    
    return baseUrl;
  },
});

export const confirmBooking = action({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runMutation(internal.bookingMutations.patchBookingStatus, {
      bookingId: args.bookingId,
      status: "completed",
    });
  },
});

export const cancelBooking = action({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runMutation(internal.bookingMutations.patchBookingStatus, {
      bookingId: args.bookingId,
      status: "cancelled",
    });
  },
});