import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const insertFoodCache = internalMutation({
  args: {
    location: v.string(),
    restaurant: v.string(),
    cacheKey: v.string(),
    results: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if cache entry already exists and update it, otherwise insert
    const existing = await ctx.db
      .query("foodSearchCache")
      .filter((q) =>
        q.and(
          q.eq(q.field("location"), args.location),
          q.eq(q.field("restaurant"), args.restaurant),
          q.eq(q.field("cacheKey"), args.cacheKey)
        )
      )
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        results: args.results,
        expiresAt: args.expiresAt,
      });
    } else {
      await ctx.db.insert("foodSearchCache", {
        location: args.location,
        restaurant: args.restaurant,
        cacheKey: args.cacheKey,
        results: args.results,
        expiresAt: args.expiresAt,
      });
    }
  },
});

export const getCachedFoodSearchQuery = internalMutation({
  args: {
    location: v.string(),
    restaurant: v.string(),
    cacheKey: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("foodSearchCache")
      .filter((q) =>
        q.and(
          q.eq(q.field("location"), args.location),
          q.eq(q.field("restaurant"), args.restaurant),
          q.eq(q.field("cacheKey"), args.cacheKey),
          q.gt(q.field("expiresAt"), args.now)
        )
      )
      .first();
    
    return cached ? JSON.parse(cached.results) : null;
  },
});

export const clearExpiredFoodCache = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("foodSearchCache")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();
    
    for (const item of expired) {
      await ctx.db.delete(item._id);
    }
    
    return { deleted: expired.length };
  },
});
