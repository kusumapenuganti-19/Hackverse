"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const saveFoodSearch = action({
  args: {
    location: v.string(),
    restaurant: v.string(),
    isNewUser: v.optional(v.boolean()),
    results: v.string(),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 1 day cache
    
    // Create a comprehensive cache key that includes all parameters
    const cacheKey = JSON.stringify({
      location: args.location,
      restaurant: args.restaurant,
      isNewUser: args.isNewUser ?? true,
    });
    
    await ctx.runMutation(internal.foodCacheMutations.insertFoodCache, {
      location: args.location,
      restaurant: args.restaurant,
      cacheKey,
      results: args.results,
      expiresAt,
    });
  },
});

export const getCachedFoodSearch = action({
  args: {
    location: v.string(),
    restaurant: v.string(),
    isNewUser: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<any> => {
    const now = Date.now();
    
    // Create the same comprehensive cache key
    const cacheKey = JSON.stringify({
      location: args.location,
      restaurant: args.restaurant,
      isNewUser: args.isNewUser ?? true,
    });
    
    const cached: any = await ctx.runMutation(internal.foodCacheMutations.getCachedFoodSearchQuery, {
      location: args.location,
      restaurant: args.restaurant,
      cacheKey,
      now,
    });
    
    return cached;
  },
});