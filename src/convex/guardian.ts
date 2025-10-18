"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

interface RouteOption {
  routeId: string;
  distance: number;
  duration: number;
  safetyScore: number;
  polyline: string;
  warnings: string[];
  safePlacesNearby: number;
  weatherCondition: string;
  crowdLevel: string;
  weatherWaypoints?: Array<{
    lat: number;
    lng: number;
    weather: string;
    visibility_m: number;
    temp: number;
  }>;
}

interface Coordinates {
  lat: number;
  lng: number;
}

// Geocode address to coordinates using Google Geocoding API
async function geocodeAddress(address: string, apiKey: string): Promise<Coordinates> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  
  console.log(`🔍 Geocoding address: "${address}"`);
  console.log(`📍 API URL: ${url.replace(apiKey, 'API_KEY_HIDDEN')}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`❌ Geocoding API HTTP error: ${response.status} ${response.statusText}`);
    throw new Error(`Geocoding API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log(`📊 Geocoding API status: ${data.status}`);
  console.log(`📊 Results count: ${data.results?.length || 0}`);
  
  if (data.status === "REQUEST_DENIED") {
    console.error(`❌ API Request Denied: ${data.error_message}`);
    throw new Error(`Google Maps API error: ${data.error_message || "Request denied. Please check API key and billing."}`);
  }
  
  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    console.error(`❌ Geocoding failed for address: "${address}"`);
    console.error(`Status: ${data.status}, Results: ${JSON.stringify(data.results)}`);
    throw new Error(`Could not find location: "${address}". Please provide a more complete address (e.g., "Jagadamba Junction, Visakhapatnam" or "MG Road, Bangalore")`);
  }
  
  const location = data.results[0].geometry.location;
  console.log(`✅ Geocoded successfully: lat=${location.lat}, lng=${location.lng}`);
  return { lat: location.lat, lng: location.lng };
}

// Get route options from Google Directions API
async function getRouteOptions(
  source: Coordinates,
  destination: Coordinates,
  apiKey: string
): Promise<any[]> {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${source.lat},${source.lng}&destination=${destination.lat},${destination.lng}&alternatives=true&key=${apiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Directions API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
    throw new Error("No routes found");
  }
  
  return data.routes;
}

// Get weather conditions from OpenWeather API
async function getWeatherConditions(coords: Coordinates, apiKey: string): Promise<any> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${apiKey}&units=metric`;
  
  const response = await fetch(url);
  if (!response.ok) {
    console.warn("Weather API error, using default conditions");
    return { weather: [{ main: "Clear" }], visibility: 10000, main: { temp: 25 } };
  }
  
  return await response.json();
}

// Get weather conditions for multiple waypoints along a route
async function getWeatherAlongRoute(
  route: any,
  apiKey: string
): Promise<Array<{ lat: number; lng: number; weather: string; visibility_m: number; temp: number }>> {
  if (!apiKey) {
    console.warn("OpenWeather API key not configured, skipping waypoint weather");
    return [];
  }

  const waypoints: Array<{ lat: number; lng: number; weather: string; visibility_m: number; temp: number }> = [];
  
  // Get waypoints from the route (sample points along the path)
  const steps = route.legs[0].steps;
  const sampleInterval = Math.max(1, Math.floor(steps.length / 5)); // Sample ~5 points along route
  
  for (let i = 0; i < steps.length; i += sampleInterval) {
    const step = steps[i];
    const coords = {
      lat: step.start_location.lat,
      lng: step.start_location.lng,
    };
    
    try {
      const weatherData = await getWeatherConditions(coords, apiKey);
      waypoints.push({
        lat: coords.lat,
        lng: coords.lng,
        weather: weatherData.weather?.[0]?.description || "clear sky",
        visibility_m: weatherData.visibility || 10000,
        temp: weatherData.main?.temp || 25,
      });
    } catch (error) {
      console.warn(`Failed to get weather for waypoint ${i}:`, error);
    }
  }
  
  return waypoints;
}

// Get nearby POIs from Mapbox API
async function getNearbyPOIs(coords: Coordinates, apiKey: string): Promise<any[]> {
  if (!apiKey) {
    console.warn("Mapbox API key not configured, returning empty POIs");
    return [];
  }

  // Search for multiple POI types using Mapbox Places API
  const poiTypes = ["police", "hospital", "fire_station", "emergency"];
  const allPOIs: any[] = [];
  
  for (const type of poiTypes) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(type)}.json?proximity=${coords.lng},${coords.lat}&limit=10&access_token=${apiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Mapbox API error for type ${type}, skipping`);
        continue;
      }
      
      const data = await response.json();
      const features = data.features || [];
      
      features.forEach((feature: any) => {
        allPOIs.push({
          name: feature.text || feature.place_name || "Unknown Place",
          lat: feature.center[1],
          lng: feature.center[0],
          fcode: type === "police" ? "PPL" : "POI",
          place_name: feature.place_name,
          category: feature.properties?.category || type,
        });
      });
    } catch (error) {
      console.warn(`Mapbox API failed for type ${type}:`, error);
    }
  }
  
  return allPOIs;
}

// Get nearby places from Google Places API with crowd density and popularity
async function getNearbyPlacesFromGoogle(
  coords: Coordinates,
  apiKey: string,
  radius: number = 5000,
  types: string[] = ["police"]
): Promise<any[]> {
  const allPlaces: any[] = [];
  
  // Fetch multiple types of places for comprehensive coverage
  for (const type of types) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.lat},${coords.lng}&radius=${radius}&type=${type}&key=${apiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Google Places API error for type ${type}, skipping`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.warn(`Google Places API status for type ${type}: ${data.status}`);
        continue;
      }
      
      // Enhance each place with crowd density metrics
      const enhancedPlaces = (data.results || []).map((place: any) => ({
        ...place,
        crowdDensity: calculateCrowdDensity(place),
        popularityScore: calculatePopularityScore(place),
        busyLevel: determineBusyLevel(place),
      }));
      
      allPlaces.push(...enhancedPlaces);
    } catch (error) {
      console.warn(`Google Places API failed for type ${type}:`, error);
    }
  }
  
  return allPlaces;
}

// Calculate crowd density based on ratings and reviews
function calculateCrowdDensity(place: any): string {
  const ratingsTotal = place.user_ratings_total || 0;
  
  if (ratingsTotal > 1000) return "high";
  if (ratingsTotal > 300) return "moderate";
  if (ratingsTotal > 50) return "low";
  return "minimal";
}

// Calculate popularity score (0-100)
function calculatePopularityScore(place: any): number {
  const rating = place.rating || 0;
  const ratingsTotal = place.user_ratings_total || 0;
  const priceLevel = place.price_level || 0;
  
  // Weighted score: rating (50%), review count (30%), price accessibility (20%)
  const ratingScore = (rating / 5) * 50;
  const reviewScore = Math.min((ratingsTotal / 1000) * 30, 30);
  const priceScore = priceLevel > 0 ? ((5 - priceLevel) / 4) * 20 : 10;
  
  return Math.round(ratingScore + reviewScore + priceScore);
}

// Determine busy level based on current time and place data
function determineBusyLevel(place: any): string {
  const hour = new Date().getHours();
  const isBusinessHours = hour >= 9 && hour <= 18;
  const crowdDensity = calculateCrowdDensity(place);
  
  // Police stations and hospitals are typically busier during day
  if (isBusinessHours) {
    if (crowdDensity === "high") return "very_busy";
    if (crowdDensity === "moderate") return "busy";
    return "normal";
  } else {
    if (crowdDensity === "high") return "busy";
    return "quiet";
  }
}

// Calculate safety score based on multiple factors
function calculateSafetyScore(
  route: any,
  weather: any,
  pois: any[],
  incidents: number,
  timeOfDay: number,
  weatherWaypoints: Array<{ lat: number; lng: number; weather: string; visibility_m: number; temp: number }>
): { score: number; warnings: string[] } {
  let score = 50; // Base score
  const warnings: string[] = [];
  
  // Police stations nearby (+10 per station, max +30)
  const policeStations = pois.filter(poi => 
    poi.fcode === "PPL" || poi.name?.toLowerCase().includes("police")
  ).length;
  const policeBonus = Math.min(policeStations * 10, 30);
  score += policeBonus;
  if (policeStations > 0) {
    warnings.push(`${policeStations} police station(s) nearby`);
  }
  
  // Weather conditions
  const weatherMain = weather.weather?.[0]?.main?.toLowerCase() || "clear";
  const visibility = weather.visibility || 10000;
  
  if (weatherMain.includes("rain") || weatherMain.includes("storm")) {
    score -= 20;
    warnings.push("Heavy rain or storm conditions");
  } else if (weatherMain === "clear") {
    score += 10;
  }
  
  if (visibility < 1000) {
    score -= 15;
    warnings.push("Low visibility conditions");
  }
  
  // Analyze weather waypoints for hazards along route
  if (weatherWaypoints.length > 0) {
    const hazardousWaypoints = weatherWaypoints.filter(
      wp => wp.visibility_m < 1000 || wp.weather.includes("rain") || wp.weather.includes("fog")
    );
    
    if (hazardousWaypoints.length > 0) {
      const hazardPercentage = (hazardousWaypoints.length / weatherWaypoints.length) * 100;
      if (hazardPercentage > 50) {
        score -= 15;
        warnings.push(`Weather hazards detected along ${Math.round(hazardPercentage)}% of route`);
      } else if (hazardPercentage > 25) {
        score -= 8;
        warnings.push(`Some weather hazards along route`);
      }
    }
  }
  
  // Time of day (night time 8pm-6am)
  const hour = new Date(timeOfDay).getHours();
  if (hour >= 20 || hour < 6) {
    score -= 15;
    warnings.push("Night time travel - extra caution advised");
  } else {
    score += 10;
  }
  
  // Reported incidents in area
  if (incidents > 0) {
    const incidentPenalty = Math.min(incidents * 10, 30);
    score -= incidentPenalty;
    warnings.push(`${incidents} incident(s) reported in this area recently`);
  }
  
  // Route distance factor (longer routes slightly less safe)
  const distanceKm = route.legs[0].distance.value / 1000;
  if (distanceKm > 20) {
    score -= 5;
  }
  
  // Clamp score between 0-100
  score = Math.max(0, Math.min(100, score));
  
  return { score, warnings };
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Gemini API helper
async function callGeminiAPI(prompt: string, systemPrompt: string, apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nUser Query: ${prompt}\n\nRespond with valid JSON only.` }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Twilio SMS helper function
async function sendTwilioSMS(
  to: string,
  body: string,
  accountSid: string,
  authToken: string,
  from: string
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    const twilio = await import("twilio");
    const client = twilio.default(accountSid, authToken);
    
    const message = await client.messages.create({
      body,
      to,
      from,
    });
    
    console.log(`✅ SMS sent successfully to ${to}: ${message.sid}`);
    return { success: true, messageSid: message.sid };
  } catch (error: any) {
    console.error(`❌ Failed to send SMS to ${to}:`, error);
    return { success: false, error: error.message };
  }
}

export const analyzeRouteSafety = action({
  args: {
    source: v.string(),
    destination: v.string(),
  },
  handler: async (ctx, args): Promise<{
    sourceCoords: Coordinates;
    destCoords: Coordinates;
    routes: RouteOption[];
    weatherSummary: { condition: string; temp: number; visibility: number };
    cached?: boolean;
  }> => {
    console.log(`🛡️ Raayan Guardian: Analyzing route safety: ${args.source} → ${args.destination}`);
    
    // Check for cached route first
    const cachedRoute = await ctx.runQuery(internal.guardianMutations.getCachedRoute, {
      source: args.source,
      destination: args.destination,
    });
    
    if (cachedRoute) {
      console.log("✅ Returning cached route analysis (valid for 1 day)");
      return {
        sourceCoords: cachedRoute.sourceCoords,
        destCoords: cachedRoute.destCoords,
        routes: cachedRoute.routes,
        weatherSummary: {
          condition: cachedRoute.routes[0]?.weatherCondition || "Clear",
          temp: 25,
          visibility: 10000,
        },
        cached: true,
      };
    }
    
    console.log("🔍 No cached data found, performing fresh analysis...");
    
    // Get API keys
    const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
    const openWeatherKey = process.env.OPENWEATHER_API_KEY;
    const mapboxKey = process.env.MAPBOX_API_KEY;
    
    if (!googleMapsKey) {
      throw new Error("GOOGLE_MAPS_API_KEY is required. Please configure it in the API Keys tab.");
    }
    
    try {
      // Step 1: Geocode addresses
      console.log("📍 Geocoding addresses...");
      const sourceCoords = await geocodeAddress(args.source, googleMapsKey);
      const destCoords = await geocodeAddress(args.destination, googleMapsKey);
      
      // Step 2: Get route options
      console.log("🗺️ Fetching route options...");
      const routes = await getRouteOptions(sourceCoords, destCoords, googleMapsKey);
      
      // Step 3: Get weather conditions
      console.log("🌤️ Checking weather conditions...");
      const weather = openWeatherKey 
        ? await getWeatherConditions(sourceCoords, openWeatherKey)
        : { weather: [{ main: "Clear" }], visibility: 10000 };
      
      // Step 4: Get nearby POIs and crowd data
      console.log("🏢 Finding nearby safe places...");
      const pois = mapboxKey 
        ? await getNearbyPOIs(sourceCoords, mapboxKey)
        : [];
      
      // Get crowd density data for route area using Google Places
      console.log("👥 Analyzing crowd density along route...");
      const routeAreaPlaces = await getNearbyPlacesFromGoogle(
        sourceCoords, 
        googleMapsKey, 
        2000, 
        ["restaurant", "shopping_mall", "transit_station"]
      );
      
      // Calculate average crowd level for the area
      const avgCrowdDensity = routeAreaPlaces.length > 0
        ? routeAreaPlaces.reduce((sum, p) => {
            const densityMap: Record<string, number> = { minimal: 1, low: 2, moderate: 3, high: 4 };
            const densityValue = densityMap[p.crowdDensity as string] || 1;
            return sum + densityValue;
          }, 0) / routeAreaPlaces.length
        : 2;
      
      const areaCrowdLevel = avgCrowdDensity > 3 ? "high" : avgCrowdDensity > 2 ? "moderate" : "low";
      
      // Step 5: Check for recent incidents (query database)
      const incidents = 0; // TODO: Query safetyIncidents table
      
      // Step 6: Calculate safety scores for each route
      console.log("🔢 Calculating safety scores...");
      const analyzedRoutes: RouteOption[] = [];
      
      for (let index = 0; index < routes.length; index++) {
        const route = routes[index];
        
        // Get weather waypoints along this route
        console.log(`🌦️ Analyzing weather waypoints for route ${index + 1}...`);
        const weatherWaypoints = openWeatherKey 
          ? await getWeatherAlongRoute(route, openWeatherKey)
          : [];
        
        const { score, warnings } = calculateSafetyScore(
          route,
          weather,
          pois,
          incidents,
          Date.now(),
          weatherWaypoints
        );
        
        analyzedRoutes.push({
          routeId: `route_${index}`,
          distance: route.legs[0].distance.value,
          duration: route.legs[0].duration.value,
          safetyScore: score,
          polyline: route.overview_polyline.points,
          warnings,
          safePlacesNearby: pois.length,
          weatherCondition: weather.weather?.[0]?.main || "Clear",
          crowdLevel: areaCrowdLevel, // Now using actual Google Places crowd data
          weatherWaypoints: weatherWaypoints,
        });
      }
      
      // Sort by safety score (highest first)
      analyzedRoutes.sort((a, b) => b.safetyScore - a.safetyScore);
      
      console.log(`✅ Analyzed ${analyzedRoutes.length} routes`);
      
      // Step 7: Save to database
      await ctx.runMutation(internal.guardianMutations.insertRoute, {
        source: args.source,
        destination: args.destination,
        sourceCoords,
        destCoords,
        routes: analyzedRoutes,
      });
      
      return {
        sourceCoords,
        destCoords,
        routes: analyzedRoutes,
        weatherSummary: {
          condition: weather.weather?.[0]?.main || "Clear",
          temp: weather.main?.temp || 25,
          visibility: weather.visibility || 10000,
        },
        cached: false,
      };
      
    } catch (error) {
      console.error("❌ Error analyzing route safety:", error);
      throw new Error(`Failed to analyze route safety: ${error}`);
    }
  },
});

export const reportIncident = action({
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
    console.log(`🚨 Incident reported at ${args.location}`);
    
    await ctx.runMutation(internal.guardianMutations.insertIncident, {
      location: args.location,
      coordinates: args.coordinates,
      incidentType: args.incidentType,
      description: args.description,
      severity: args.severity,
    });
    
    return { success: true, message: "Incident reported successfully" };
  },
});

export const searchNearbySafePlaces = action({
  args: {
    location: v.string(),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`🔍 Searching safe places near: ${args.location}`);
    console.log(`📝 Query: ${args.query}`);
    
    const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
    const mapboxKey = process.env.MAPBOX_API_KEY;
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const useGemini = process.env.USE_GEMINI === "true";
    
    if (!googleMapsKey) {
      throw new Error("GOOGLE_MAPS_API_KEY is required");
    }
    
    try {
      // Step 1: Geocode user location
      console.log("📍 Geocoding user location...");
      const userCoords = await geocodeAddress(args.location, googleMapsKey);
      
      // Step 2: Get nearby POIs from Mapbox
      console.log("🏢 Fetching nearby places from Mapbox...");
      const mapboxPOIs = mapboxKey 
        ? await getNearbyPOIs(userCoords, mapboxKey)
        : [];
      
      // Step 3: Get nearby places from Google Places API with multiple types
      console.log("🗺️ Fetching nearby places from Google Places API...");
      const placeTypes = ["police", "hospital", "fire_station"];
      const googlePlaces = await getNearbyPlacesFromGoogle(userCoords, googleMapsKey, 5000, placeTypes);
      
      // Step 4: Use AI to enhance search with additional context
      console.log("🤖 Using AI to find additional safe places...");
      
      const shouldUseGemini = useGemini && geminiApiKey;
      const shouldUsePerplexity = !useGemini && perplexityApiKey;
      
      let aiPlaces: any[] = [];
      
      if (shouldUseGemini || shouldUsePerplexity) {
        const searchQuery = `Find safe places near ${args.location} including: ${args.query}. 
          Provide name, type (police_station/hospital/fire_station/safe_zone), address, 
          approximate coordinates (lat, lng), phone number if available, and brief description.
          Focus on emergency services and verified safe locations.`;
        
        const systemPrompt = `You are a safety location expert. Return valid JSON array with safe places.
          Each place MUST have: name (string), type (string: police_station/hospital/fire_station/safe_zone),
          address (string), coordinates (object: {lat: number, lng: number}), 
          phoneNumber (optional string), description (optional string).
          Return realistic data for Indian locations. Always return at least 3-5 places.`;
        
        try {
          let contentString: string;
          
          if (shouldUseGemini) {
            contentString = await callGeminiAPI(searchQuery, systemPrompt, geminiApiKey!);
          } else {
            const Perplexity = (await import("@perplexity-ai/perplexity_ai")).default;
            const client = new Perplexity({ apiKey: perplexityApiKey! });
            const completion = await client.chat.completions.create({
              model: "sonar-pro",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: searchQuery }
              ],
              temperature: 0.3,
              max_tokens: 2000,
            });
            
            const responseContent = completion.choices[0].message.content;
            contentString = typeof responseContent === 'string' 
              ? responseContent 
              : Array.isArray(responseContent)
                ? responseContent.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('')
                : "";
          }
          
          // Parse AI response - extract JSON from markdown code blocks if present
          let jsonString = contentString.trim();
          
          // Remove markdown code blocks if present
          if (jsonString.includes('```')) {
            jsonString = jsonString.replace(/```.*?```/gs, '');
          }
          
          // Try multiple patterns for JSON extraction
          const patterns = [
            /"name":"([^"]+)"/g,
            /"type":"([^"]+)"/g,
            /"address":"([^"]+)"/g,
            /"coordinates":\s*{([^}]*)}/g,
            /"phoneNumber":"([^"]+)"/g,
            /"description":"([^"]+)"/g,
          ];
          
          const matches: string[] = [];
          for (const pattern of patterns) {
            const result = jsonString.match(pattern);
            if (result) {
              matches.push(result[1]);
            }
          }
          
          aiPlaces = matches.map((match, index) => ({
            name: matches[index * 3],
            type: matches[index * 3 + 1],
            address: matches[index * 3 + 2],
            coordinates: { lat: parseFloat(matches[index * 3 + 3]), lng: parseFloat(matches[index * 3 + 4]) },
            phoneNumber: matches[index * 3 + 5],
            description: matches[index * 3 + 6],
          }));
        } catch (error) {
          console.warn("AI search failed:", error);
          aiPlaces = [];
        }
      }
      
      // Step 5: Combine and deduplicate results
      const allPlaces: any[] = [];
      
      // Add Mapbox POIs
      mapboxPOIs.forEach((poi: any) => {
        const distance = calculateDistance(
          userCoords.lat,
          userCoords.lng,
          poi.lat,
          poi.lng
        );
        
        let placeType = "safe_zone";
        if (poi.category?.includes("police")) placeType = "police_station";
        else if (poi.category?.includes("hospital")) placeType = "hospital";
        else if (poi.category?.includes("fire")) placeType = "fire_station";
        
        allPlaces.push({
          name: poi.name || "Unknown Place",
          type: placeType,
          address: poi.place_name || `${poi.name}, ${args.location}`,
          coordinates: { lat: poi.lat, lng: poi.lng },
          distance,
          phoneNumber: undefined,
          description: `Found via Mapbox - ${poi.category || 'safe location'}`,
        });
      });
      
      // Add Google Places with crowd density and popularity data
      googlePlaces.forEach((place: any) => {
        const distance = calculateDistance(
          userCoords.lat,
          userCoords.lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        );
        
        // Determine place type from Google Places types
        let placeType = "safe_zone";
        if (place.types?.includes("police")) placeType = "police_station";
        else if (place.types?.includes("hospital")) placeType = "hospital";
        else if (place.types?.includes("fire_station")) placeType = "fire_station";
        
        allPlaces.push({
          name: place.name,
          type: placeType,
          address: place.vicinity || place.formatted_address || "Address not available",
          coordinates: { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
          distance,
          phoneNumber: place.formatted_phone_number,
          rating: place.rating,
          description: `${place.vicinity || place.formatted_address} - Crowd: ${place.crowdDensity}, Popularity: ${place.popularityScore}/100, Currently: ${place.busyLevel}`,
          crowdDensity: place.crowdDensity,
          popularityScore: place.popularityScore,
          busyLevel: place.busyLevel,
        });
      });
      
      // Add AI places
      aiPlaces.forEach((place: any) => {
        const distance = calculateDistance(
          userCoords.lat,
          userCoords.lng,
          place.coordinates.lat,
          place.coordinates.lng
        );
        
        allPlaces.push({
          name: place.name,
          type: place.type,
          address: place.address,
          coordinates: place.coordinates,
          distance,
          phoneNumber: place.phoneNumber,
          description: place.description,
        });
      });
      
      // Sort by distance and limit to 20
      allPlaces.sort((a, b) => a.distance - b.distance);
      const topPlaces = allPlaces.slice(0, 20);
      
      console.log(`✅ Returning ${topPlaces.length} safe places`);
      
      return {
        userCoords,
        places: topPlaces,
      };
      
    } catch (error) {
      console.error("❌ Error searching safe places:", error);
      throw new Error(`Failed to search safe places: ${error}`);
    }
  },
});

export const triggerSOS = action({
  args: {
    userLocation: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    message: string;
    sentCount: number;
    totalContacts?: number;
    results?: Array<{
      contactName: string;
      phoneNumber: string;
      success: boolean;
      messageSid?: string;
      error?: string;
    }>;
  }> => {
    console.log("🚨 SOS ALERT TRIGGERED!");
    
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error("Twilio credentials not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in the API Keys tab.");
    }
    
    // Get user information
    const user = await ctx.runQuery(api.users.currentUser);
    const userName = user?.name || "Guest User";
    
    // Get trusted contacts
    const contacts: Array<{
      _id: any;
      _creationTime: number;
      userId?: any;
      contactName: string;
      phoneNumber: string;
      email?: string;
      relationship: string;
      isPrimary: boolean;
    }> = await ctx.runQuery(api.guardianMutations.getTrustedContacts);
    
    if (!contacts || contacts.length === 0) {
      console.warn("⚠️ No trusted contacts found for SOS alert");
      return {
        success: false,
        message: "No trusted contacts configured. Please add emergency contacts first.",
        sentCount: 0,
      };
    }
    
    // Construct emergency message with user name and location
    const locationText = args.userLocation
      ? `Location: https://www.google.com/maps?q=${args.userLocation.lat},${args.userLocation.lng}`
      : "Location: Not available";
    
    const emergencyMessage = args.message || `🚨 EMERGENCY ALERT from ${userName}`;
    const fullMessage = `${emergencyMessage}\n\n${locationText}\n\nThis is an automated emergency alert from Raayan Guardian. Please check on this person immediately.`;
    
    // Send SMS to all trusted contacts (prioritize primary contacts)
    const primaryContacts = contacts.filter((c) => c.isPrimary);
    const otherContacts = contacts.filter((c) => !c.isPrimary);
    const sortedContacts = [...primaryContacts, ...otherContacts];
    
    const results: Array<{
      contactName: string;
      phoneNumber: string;
      success: boolean;
      messageSid?: string;
      error?: string;
    }> = [];
    let successCount = 0;
    
    for (const contact of sortedContacts) {
      console.log(`📱 Sending SOS SMS to ${contact.contactName} (${contact.phoneNumber})...`);
      
      const result = await sendTwilioSMS(
        contact.phoneNumber,
        fullMessage,
        twilioAccountSid,
        twilioAuthToken,
        twilioPhoneNumber
      );
      
      results.push({
        contactName: contact.contactName,
        phoneNumber: contact.phoneNumber,
        ...result,
      });
      
      if (result.success) {
        successCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`✅ SOS alerts sent: ${successCount}/${sortedContacts.length} successful`);
    
    return {
      success: successCount > 0,
      message: `Emergency alerts sent to ${successCount} contact(s)`,
      sentCount: successCount,
      totalContacts: sortedContacts.length,
      results,
    };
  },
});

export const testGuardianAPIs = action({
  args: {},
  handler: async (ctx, args) => {
    const results: any = {
      timestamp: new Date().toISOString(),
      apiStatus: {},
      errors: [],
    };

    // Test 1: Check API Keys Configuration
    console.log("🔍 Testing API Keys Configuration...");
    const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
    const openWeatherKey = process.env.OPENWEATHER_API_KEY;
    const mapboxKey = process.env.MAPBOX_API_KEY;
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const useGemini = process.env.USE_GEMINI === "true";

    results.apiStatus.googleMaps = googleMapsKey ? "✅ Configured" : "❌ Missing";
    results.apiStatus.openWeather = openWeatherKey ? "✅ Configured" : "⚠️ Optional - Missing";
    results.apiStatus.mapbox = mapboxKey ? "✅ Configured" : "⚠️ Optional - Missing";
    results.apiStatus.perplexity = perplexityApiKey ? "✅ Configured" : "⚠️ Optional - Missing";
    results.apiStatus.gemini = geminiApiKey ? "✅ Configured" : "⚠️ Optional - Missing";
    results.apiStatus.aiProvider = useGemini ? "Gemini" : "Perplexity";

    if (!googleMapsKey) {
      results.errors.push("CRITICAL: GOOGLE_MAPS_API_KEY is required for core functionality");
      return results;
    }

    // Test 2: Geocoding API
    console.log("🔍 Testing Google Geocoding API...");
    try {
      const testCoords = await geocodeAddress("Visakhapatnam, Andhra Pradesh", googleMapsKey);
      results.apiStatus.geocoding = `✅ Working (${testCoords.lat.toFixed(4)}, ${testCoords.lng.toFixed(4)})`;
    } catch (error: any) {
      results.apiStatus.geocoding = `❌ Failed: ${error.message}`;
      results.errors.push(`Geocoding: ${error.message}`);
    }

    // Test 3: Directions API
    console.log("🔍 Testing Google Directions API...");
    try {
      const source = { lat: 17.6868, lng: 83.2185 }; // Visakhapatnam
      const dest = { lat: 17.7231, lng: 83.3012 }; // RK Beach
      const routes = await getRouteOptions(source, dest, googleMapsKey);
      results.apiStatus.directions = `✅ Working (${routes.length} routes found)`;
    } catch (error: any) {
      results.apiStatus.directions = `❌ Failed: ${error.message}`;
      results.errors.push(`Directions: ${error.message}`);
    }

    // Test 4: Weather API
    if (openWeatherKey) {
      console.log("🔍 Testing OpenWeather API...");
      try {
        const weather = await getWeatherConditions({ lat: 17.6868, lng: 83.2185 }, openWeatherKey);
        results.apiStatus.weather = `✅ Working (${weather.weather?.[0]?.main || "Unknown"})`;
      } catch (error: any) {
        results.apiStatus.weather = `⚠️ Failed: ${error.message}`;
      }
    }

    // Test 5: Mapbox API
    if (mapboxKey) {
      console.log("🔍 Testing Mapbox API...");
      try {
        const pois = await getNearbyPOIs({ lat: 17.6868, lng: 83.2185 }, mapboxKey);
        results.apiStatus.mapbox = `✅ Working (${pois.length} POIs found)`;
      } catch (error: any) {
        results.apiStatus.mapbox = `⚠️ Failed: ${error.message}`;
      }
    }

    // Test 6: Google Places API
    console.log("🔍 Testing Google Places API...");
    try {
      const places = await getNearbyPlacesFromGoogle(
        { lat: 17.6868, lng: 83.2185 },
        googleMapsKey,
        5000,
        ["police"]
      );
      results.apiStatus.googlePlaces = `✅ Working (${places.length} places found)`;
    } catch (error: any) {
      results.apiStatus.googlePlaces = `❌ Failed: ${error.message}`;
      results.errors.push(`Google Places: ${error.message}`);
    }

    // Test 7: AI API (Gemini or Perplexity)
    if ((useGemini && geminiApiKey) || (!useGemini && perplexityApiKey)) {
      console.log(`🔍 Testing ${useGemini ? "Gemini" : "Perplexity"} AI API...`);
      try {
        const testQuery = "Find police stations near Visakhapatnam";
        const systemPrompt = "Return a simple JSON array with one test place.";
        
        if (useGemini && geminiApiKey) {
          const response = await callGeminiAPI(testQuery, systemPrompt, geminiApiKey);
          results.apiStatus.ai = `✅ Gemini Working (${response.length} chars response)`;
        } else if (perplexityApiKey) {
          const Perplexity = (await import("@perplexity-ai/perplexity_ai")).default;
          const client = new Perplexity({ apiKey: perplexityApiKey });
          const completion = await client.chat.completions.create({
            model: "sonar-pro",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: testQuery }
            ],
            temperature: 0.3,
            max_tokens: 500,
          });
          results.apiStatus.ai = `✅ Perplexity Working`;
        }
      } catch (error: any) {
        results.apiStatus.ai = `⚠️ Failed: ${error.message}`;
      }
    }

    // Summary
    results.summary = {
      totalAPIs: Object.keys(results.apiStatus).length,
      criticalErrors: results.errors.length,
      status: results.errors.length === 0 ? "✅ All Critical APIs Working" : "❌ Some APIs Failed",
    };

    console.log("📊 API Test Results:", JSON.stringify(results, null, 2));
    return results;
  },
});