/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as bookingMutations from "../bookingMutations.js";
import type * as bookings from "../bookings.js";
import type * as busCache from "../busCache.js";
import type * as busTickets from "../busTickets.js";
import type * as foodCache from "../foodCache.js";
import type * as foodCacheMutations from "../foodCacheMutations.js";
import type * as foodSearch from "../foodSearch.js";
import type * as guardian from "../guardian.js";
import type * as guardianMutations from "../guardianMutations.js";
import type * as http from "../http.js";
import type * as raayan from "../raayan.js";
import type * as restaurants from "../restaurants.js";
import type * as scraper from "../scraper.js";
import type * as seedData from "../seedData.js";
import type * as spendAnalytics from "../spendAnalytics.js";
import type * as testGuardian from "../testGuardian.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  bookingMutations: typeof bookingMutations;
  bookings: typeof bookings;
  busCache: typeof busCache;
  busTickets: typeof busTickets;
  foodCache: typeof foodCache;
  foodCacheMutations: typeof foodCacheMutations;
  foodSearch: typeof foodSearch;
  guardian: typeof guardian;
  guardianMutations: typeof guardianMutations;
  http: typeof http;
  raayan: typeof raayan;
  restaurants: typeof restaurants;
  scraper: typeof scraper;
  seedData: typeof seedData;
  spendAnalytics: typeof spendAnalytics;
  testGuardian: typeof testGuardian;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
