import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Raayan search history
    searches: defineTable({
      userId: v.id("users"),
      category: v.union(v.literal("food"), v.literal("travel")),
      query: v.string(),
      results: v.string(), // JSON stringified
      recommendation: v.string(),
    }).index("by_user", ["userId"]),

    // Bookings tracking
    bookings: defineTable({
      userId: v.optional(v.id("users")),
      category: v.union(v.literal("food"), v.literal("travel")),
      platform: v.string(),
      restaurant: v.optional(v.string()),
      operator: v.optional(v.string()),
      finalPrice: v.number(),
      bookingData: v.string(),
      redirectUrl: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("redirected"),
        v.literal("completed"),
        v.literal("cancelled")
      ),
    }).index("by_user", ["userId"]),

    // Bus search cache
    busSearchCache: defineTable({
      source: v.string(),
      destination: v.string(),
      date: v.string(),
      results: v.string(),
      expiresAt: v.number(),
    })
      .index("by_route", ["source", "destination", "date"])
      .index("by_expiration", ["expiresAt"]),

    // Food search cache with comprehensive caching
    foodSearchCache: defineTable({
      location: v.string(),
      restaurant: v.string(),
      cacheKey: v.string(), // JSON stringified comprehensive key
      results: v.string(),
      expiresAt: v.number(),
    })
      .index("by_search", ["location", "restaurant"])
      .index("by_cache_key", ["cacheKey"])
      .index("by_expiration", ["expiresAt"]),

    // Restaurant database
    restaurants: defineTable({
      name: v.string(),
      cuisine: v.string(),
      rating: v.number(),
      area: v.string(),
      city: v.string(),
      image: v.string(),
      platforms: v.array(v.string()),
      // Platform-specific data
      platformData: v.array(v.object({
        platform: v.string(),
        deliveryFee: v.number(),
        eta: v.number(),
        freeDeliveryAbove: v.number(),
        newUserDiscount: v.number(),
        minOrderDiscount: v.object({
          minOrder: v.number(),
          discount: v.number(),
        }),
        platformFee: v.number(),
      })),
      // Menu items
      menuItems: v.array(v.object({
        name: v.string(),
        price: v.number(),
        category: v.string(),
        image: v.string(),
      })),
    })
      .index("by_city", ["city"])
      .index("by_name", ["name"])
      .index("by_city_and_name", ["city", "name"]),

    // Location database
    locations: defineTable({
      name: v.string(),
      city: v.string(),
      state: v.string(),
      fullName: v.string(), // e.g., "Hyderabad, Telangana"
    })
      .index("by_city", ["city"])
      .index("by_full_name", ["fullName"]),

    // Guardian: Route safety analysis with caching
    guardianRoutes: defineTable({
      userId: v.optional(v.id("users")),
      source: v.string(),
      destination: v.string(),
      sourceCoords: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      destCoords: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      routes: v.array(v.object({
        routeId: v.string(),
        distance: v.number(), // in meters
        duration: v.number(), // in seconds
        safetyScore: v.number(), // 0-100
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
      selectedRouteId: v.optional(v.string()),
      expiresAt: v.number(), // Cache expiration timestamp
    })
      .index("by_user", ["userId"])
      .index("by_source_dest", ["source", "destination"])
      .index("by_expiration", ["expiresAt"]),

    // Guardian: Safety incidents (crowdsourced)
    safetyIncidents: defineTable({
      userId: v.optional(v.id("users")),
      location: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      incidentType: v.union(
        v.literal("harassment"),
        v.literal("theft"),
        v.literal("unsafe_area"),
        v.literal("poor_lighting"),
        v.literal("suspicious_activity"),
        v.literal("other")
      ),
      description: v.string(),
      severity: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      ),
      verified: v.boolean(),
      photoId: v.optional(v.id("_storage")),
    })
      .index("by_location", ["location"])
      .index("by_severity", ["severity"])
      .index("by_verified", ["verified"]),

    // Guardian: Trusted emergency contacts
    trustedContacts: defineTable({
      userId: v.optional(v.id("users")),
      contactName: v.string(),
      phoneNumber: v.string(),
      email: v.optional(v.string()),
      relationship: v.string(),
      isPrimary: v.boolean(),
    }).index("by_user", ["userId"]),

    // Guardian: Safety journey logs
    safetyLogs: defineTable({
      userId: v.id("users"),
      routeId: v.id("guardianRoutes"),
      startTime: v.number(),
      endTime: v.optional(v.number()),
      alertsTriggered: v.array(v.object({
        timestamp: v.number(),
        alertType: v.string(),
        message: v.string(),
      })),
      status: v.union(
        v.literal("active"),
        v.literal("completed"),
        v.literal("emergency"),
        v.literal("cancelled")
      ),
      currentLocation: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
      })),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"])
      .index("by_route", ["routeId"]),

    // Guardian: Verified safe places
    safePlaces: defineTable({
      name: v.string(),
      type: v.union(
        v.literal("police_station"),
        v.literal("hospital"),
        v.literal("fire_station"),
        v.literal("safe_zone"),
        v.literal("public_place")
      ),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      address: v.string(),
      city: v.string(),
      phoneNumber: v.optional(v.string()),
      verified: v.boolean(),
      rating: v.optional(v.number()),
    })
      .index("by_city", ["city"])
      .index("by_type", ["type"])
      .index("by_verified", ["verified"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;