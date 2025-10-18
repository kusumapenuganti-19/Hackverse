import { v } from "convex/values";
import { internalMutation, internalQuery, query, mutation } from "./_generated/server";

export const insertRoute = internalMutation({
  args: {
    source: v.string(),
    destination: v.string(),
    sourceCoords: v.object({ lat: v.number(), lng: v.number() }),
    destCoords: v.object({ lat: v.number(), lng: v.number() }),
    routes: v.array(v.object({
      routeId: v.string(),
      distance: v.number(),
      duration: v.number(),
      safetyScore: v.number(),
      polyline: v.string(),
      warnings: v.array(v.string()),
      safePlacesNearby: v.number(),
      weatherCondition: v.string(),
      crowdLevel: v.string(),
      weatherWaypoints: v.optional(v.array(v.object({
        lat: v.number(),
        lng: v.number(),
        weather: v.string(),
        visibility_m: v.number(),
        temp: v.number(),
      }))),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || undefined;
    
    // Set cache expiration to 1 day from now
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    
    return await ctx.db.insert("guardianRoutes", {
      userId: userId as any,
      source: args.source,
      destination: args.destination,
      sourceCoords: args.sourceCoords,
      destCoords: args.destCoords,
      routes: args.routes,
      expiresAt,
    });
  },
});

export const getCachedRoute = internalQuery({
  args: {
    source: v.string(),
    destination: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Find cached route that hasn't expired
    const cachedRoute = await ctx.db
      .query("guardianRoutes")
      .withIndex("by_source_dest", (q) => 
        q.eq("source", args.source).eq("destination", args.destination)
      )
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .order("desc")
      .first();
    
    return cachedRoute;
  },
});

export const clearExpiredRoutes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredRoutes = await ctx.db
      .query("guardianRoutes")
      .withIndex("by_expiration")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect();
    
    for (const route of expiredRoutes) {
      await ctx.db.delete(route._id);
    }
    
    return { deleted: expiredRoutes.length };
  },
});

export const insertIncident = internalMutation({
  args: {
    location: v.string(),
    coordinates: v.object({ lat: v.number(), lng: v.number() }),
    incidentType: v.union(
      v.literal("harassment"),
      v.literal("theft"),
      v.literal("unsafe_area"),
      v.literal("poor_lighting"),
      v.literal("suspicious_activity"),
      v.literal("other")
    ),
    description: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || undefined;
    
    return await ctx.db.insert("safetyIncidents", {
      userId: userId as any,
      location: args.location,
      coordinates: args.coordinates,
      incidentType: args.incidentType,
      description: args.description,
      severity: args.severity,
      verified: false,
    });
  },
});

export const getUserRoutes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    return await ctx.db
      .query("guardianRoutes")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject as any))
      .order("desc")
      .take(20);
  },
});

export const addTrustedContact = mutation({
  args: {
    contactName: v.string(),
    phoneNumber: v.string(),
    email: v.optional(v.string()),
    relationship: v.string(),
    isPrimary: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || undefined;
    
    return await ctx.db.insert("trustedContacts", {
      userId: userId as any,
      contactName: args.contactName,
      phoneNumber: args.phoneNumber,
      email: args.email,
      relationship: args.relationship,
      isPrimary: args.isPrimary,
    });
  },
});

export const getTrustedContacts = query({
  args: {},
  handler: async (ctx): Promise<Array<{
    _id: any;
    _creationTime: number;
    userId?: any;
    contactName: string;
    phoneNumber: string;
    email?: string;
    relationship: string;
    isPrimary: boolean;
  }>> => {
    const identity = await ctx.auth.getUserIdentity();
    
    // If authenticated, return only user's contacts
    if (identity) {
      const userId = identity.subject;
      return await ctx.db
        .query("trustedContacts")
        .withIndex("by_user", (q) => q.eq("userId", userId as any))
        .collect();
    }
    
    // For guests, return all contacts (or implement session-based filtering)
    // For now, returning all contacts for guests
    return await ctx.db
      .query("trustedContacts")
      .collect();
  },
});