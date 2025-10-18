import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Store search history and saved results
export const saveSearch = mutation({
  args: {
    category: v.union(v.literal("food"), v.literal("travel")),
    query: v.string(),
    results: v.string(), // JSON stringified results
    recommendation: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    return await ctx.db.insert("searches", {
      userId: user._id,
      category: args.category,
      query: args.query,
      results: args.results,
      recommendation: args.recommendation,
    });
  },
});

export const getUserSearches = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("searches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const deleteSearch = mutation({
  args: { id: v.id("searches") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User must be authenticated");
    }

    const search = await ctx.db.get(args.id);
    if (!search || search.userId !== user._id) {
      throw new Error("Search not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
