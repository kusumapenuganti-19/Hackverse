"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Action to trigger seeding (can be called via CLI)
export const runSeed = action({
  args: {},
  handler: async (ctx) => {
    const result: any = await ctx.runMutation(internal.restaurants.seedRestaurants);
    return result;
  },
});
