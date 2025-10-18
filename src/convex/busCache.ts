import { v } from "convex/values";
import { query, internalMutation, action } from "./_generated/server";
import { internal } from "./_generated/api";

export const saveBusSearch = action({
  args: {
    source: v.string(),
    destination: v.string(),
    date: v.string(),
    results: v.string(),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 1 day cache
    
    await ctx.runMutation(internal.busCache.insertBusCache, {
      source: args.source,
      destination: args.destination,
      date: args.date,
      results: args.results,
      expiresAt,
    });
  },
});

export const insertBusCache = internalMutation({
  args: {
    source: v.string(),
    destination: v.string(),
    date: v.string(),
    results: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("busSearchCache", {
      source: args.source,
      destination: args.destination,
      date: args.date,
      results: args.results,
      expiresAt: args.expiresAt,
    });
  },
});

export const getCachedBusSearch = query({
  args: {
    source: v.string(),
    destination: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const cached = await ctx.db
      .query("busSearchCache")
      .filter((q) =>
        q.and(
          q.eq(q.field("source"), args.source),
          q.eq(q.field("destination"), args.destination),
          q.eq(q.field("date"), args.date),
          q.gt(q.field("expiresAt"), now)
        )
      )
      .first();
    
    return cached ? JSON.parse(cached.results) : null;
  },
});

export const clearExpiredCache = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("busSearchCache")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();
    
    for (const item of expired) {
      await ctx.db.delete(item._id);
    }
    
    return { deleted: expired.length };
  },
});