import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const runAllTests = action({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; apiTest: any; message: string }> => {
    console.log("🧪 Starting Raayan Guardian API Tests...\n");

    // Test 1: API Configuration Test
    console.log("=" .repeat(50));
    console.log("TEST 1: API Configuration & Connectivity");
    console.log("=" .repeat(50));
    const apiTest: any = await ctx.runAction(api.guardian.testGuardianAPIs, {});
    console.log("\n✅ API Test Complete\n");

    // Test 2: Route Safety Analysis (Test Case 4)
    console.log("=" .repeat(50));
    console.log("TEST 2: Route Safety Analysis");
    console.log("=" .repeat(50));
    try {
      const routeTest = await ctx.runAction(api.guardian.analyzeRouteSafety, {
        source: "Jagadamba Junction, Visakhapatnam",
        destination: "RK Beach, Visakhapatnam",
      });
      console.log(`✅ Route Analysis: Found ${routeTest.routes.length} routes`);
      console.log(`   Top Safety Score: ${routeTest.routes[0]?.safetyScore}/100`);
    } catch (error: any) {
      console.error(`❌ Route Analysis Failed: ${error.message}`);
    }

    // Test 3: Safe Zones Search (Test Case 2)
    console.log("\n" + "=".repeat(50));
    console.log("TEST 3: Nearby Safe Places Search");
    console.log("=" .repeat(50));
    try {
      const safePlacesTest = await ctx.runAction(api.guardian.searchNearbySafePlaces, {
        location: "Visakhapatnam, Andhra Pradesh",
        query: "police stations, hospitals",
      });
      console.log(`✅ Safe Places: Found ${safePlacesTest.places.length} locations`);
      console.log(`   Nearest: ${safePlacesTest.places[0]?.name} (${safePlacesTest.places[0]?.distance.toFixed(2)} km)`);
    } catch (error: any) {
      console.error(`❌ Safe Places Search Failed: ${error.message}`);
    }

    // Test 4: Incident Reporting
    console.log("\n" + "=".repeat(50));
    console.log("TEST 4: Incident Reporting");
    console.log("=" .repeat(50));
    try {
      const incidentTest = await ctx.runAction(api.guardian.reportIncident, {
        location: "Test Location, Visakhapatnam",
        coordinates: { lat: 17.6868, lng: 83.2185 },
        incidentType: "suspicious_activity",
        description: "Test incident report",
        severity: "low",
      });
      console.log(`✅ Incident Reporting: ${incidentTest.message}`);
    } catch (error: any) {
      console.error(`❌ Incident Reporting Failed: ${error.message}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 ALL TESTS COMPLETED");
    console.log("=" .repeat(50));
    console.log("\nAPI Status Summary:");
    console.log(JSON.stringify(apiTest.apiStatus, null, 2));
    console.log("\nTest Summary:");
    console.log(`- API Configuration: ${apiTest.summary.status}`);
    console.log(`- Critical Errors: ${apiTest.summary.criticalErrors}`);
    
    return {
      success: apiTest.summary.criticalErrors === 0,
      apiTest,
      message: "Test suite completed. Check console for detailed results.",
    };
  },
});
