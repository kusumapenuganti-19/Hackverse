"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import Perplexity from "@perplexity-ai/perplexity_ai";

interface RestaurantOption {
  platform: string;
  restaurant: string;
  deliveryFee: number;
  eta: number;
  rating: number;
  freeDeliveryAbove: number;
  newUserDiscount: number;
  minOrderDiscount: { minOrder: number; discount: number };
  platformFee: number;
  availableItems: Array<{
    name: string;
    price: number;
    category: string;
    image: string;
  }>;
}

export const searchRestaurantsWithPerplexity = action({
  args: {
    location: v.string(),
    restaurant: v.string(),
  },
  handler: async (ctx, args) => {
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

    console.log("🔍 API Configuration:", {
      perplexity: perplexityApiKey ? "✅ Found" : "❌ Missing",
    });

    if (!perplexityApiKey) {
      console.error("❌ No Perplexity API key configured");
      throw new Error("Please configure PERPLEXITY_API_KEY in your environment variables.");
    }

    try {
      console.log(`🍽️ Searching restaurants: ${args.restaurant} in ${args.location}`);
      
      const searchQuery = args.restaurant.trim() 
        ? `Find food delivery options for "${args.restaurant}" in ${args.location}. If "${args.restaurant}" is a restaurant name, show that restaurant across all platforms first. If it's a dish name, show restaurants serving that dish.` 
        : `Find the top 5-8 most popular restaurants with food delivery in ${args.location}`;
      
      const userQuery = `${searchQuery}. Include data from Swiggy, Zomato, Uber Eats, and other delivery platforms. For each option provide: restaurant name, full address, delivery fee (in INR), estimated delivery time (in minutes), rating (out of 5), distance from ${args.location} (in km), free delivery threshold (in INR), new user discount (in INR), minimum order discount (percentage and minimum amount), platform fee (in INR), and 3-5 popular menu items with prices. Return realistic Indian food delivery data.`;
      
      const systemPrompt = (
        "You are an expert food delivery data analyst for India. Your task is to provide COMPREHENSIVE and REALISTIC restaurant delivery information.\n\n" +
        "CRITICAL REQUIREMENTS:\n" +
        "1. ALWAYS return a valid JSON array - NEVER return empty array or null\n" +
        "2. MINIMUM 6-8 restaurant options required - NO EXCEPTIONS\n" +
        "3. If specific restaurant not found, provide similar popular restaurants in that area\n" +
        "4. Use REAL Indian restaurant chains and local favorites\n\n" +
        "JSON STRUCTURE (strict format):\n" +
        "[\n" +
        "  {\n" +
        "    \"platform\": \"Swiggy\" | \"Zomato\" | \"Uber Eats\" | \"EatSure\",\n" +
        "    \"restaurant\": \"Restaurant Name\",\n" +
        "    \"address\": \"Full address with area and city\",\n" +
        "    \"distance\": 0.5-10 (number in km),\n" +
        "    \"deliveryFee\": 0-50 (number in INR),\n" +
        "    \"eta\": 20-60 (number in minutes),\n" +
        "    \"rating\": 3.5-5.0 (number),\n" +
        "    \"freeDeliveryAbove\": 99-399 (number in INR),\n" +
        "    \"newUserDiscount\": 30-100 (number in INR),\n" +
        "    \"minOrderDiscount\": {\"minOrder\": 200-500, \"discount\": 10-30},\n" +
        "    \"platformFee\": 2-10 (number in INR),\n" +
        "    \"availableItems\": [\n" +
        "      {\"name\": \"Item name\", \"price\": 50-500, \"category\": \"Category\", \"image\": \"URL\"}\n" +
        "    ]\n" +
        "  }\n" +
        "]\n\n" +
        "IMPORTANT RULES:\n" +
        "- If searching for specific restaurant (e.g., 'Zeeshan'), show that restaurant on ALL platforms first\n" +
        "- Include popular chains: Domino's, KFC, McDonald's, Burger King, Subway, Pizza Hut\n" +
        "- Include local favorites: Paradise Biryani, Bawarchi, Mehfil, Shah Ghouse, etc.\n" +
        "- Vary delivery fees, ETAs, and ratings realistically\n" +
        "- Ensure at least 3-5 menu items per restaurant\n" +
        "- Use realistic Indian food pricing\n\n" +
        "RESPONSE FORMAT: Return ONLY the JSON array, no additional text or markdown formatting."
      );
      
      console.log("📡 Calling Perplexity API for restaurant search...");
      
      let contentString: string;
      
      try {
        const client = new Perplexity({ apiKey: perplexityApiKey });
        const completion = await client.chat.completions.create({
          model: "sonar-pro",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userQuery }
          ],
          temperature: 0.3,
          max_tokens: 4000,
        });

        console.log("✅ Perplexity API response received");
        const responseContent = completion.choices[0].message.content;
        
        if (!responseContent) {
          console.warn("⚠️ Empty response from Perplexity");
          throw new Error("Empty response from Perplexity API");
        }

        if (typeof responseContent === 'string') {
          contentString = responseContent;
        } else if (Array.isArray(responseContent)) {
          contentString = responseContent
            .filter((chunk: any) => chunk.type === 'text')
            .map((chunk: any) => chunk.text)
            .join('');
        } else {
          console.warn("⚠️ Unexpected response format from Perplexity");
          throw new Error("Unexpected response format from Perplexity API");
        }
      } catch (perplexityError) {
        console.error("❌ Perplexity API call failed:", perplexityError);
        throw new Error(`Perplexity API failed: ${perplexityError}`);
      }

      console.log("📝 Raw response:", contentString.substring(0, 300) + "...");

      try {
        // Try to extract JSON from markdown code blocks
        let jsonString = contentString.trim();
        
        // Multiple patterns for JSON extraction
        const patterns = [
          /```json([\s\S]*?)```/g,
          /```json\s*([\s\S]*?)\s*```/g,
          /```json\s*([\s\S]*?)\s*```/g,
          /```json([\s\S]*?)```/g,
          /```json\s*([\s\S]*?)\s*```/g,
          /```json([\s\S]*?)```/g,
        ];
        
        for (const pattern of patterns) {
          const match = jsonString.match(pattern);
          if (match) {
            jsonString = match[1].trim();
            break;
          }
        }
        
        if (!jsonString) {
          console.error("❌ No JSON content found in response");
          throw new Error("No JSON content found in response");
        }
        
        const parsed = JSON.parse(jsonString);
        const restaurants = Array.isArray(parsed) ? parsed : parsed.restaurants || [];
        
        console.log(`✅ Parsed ${restaurants.length} restaurant options from Perplexity`);
        
        const normalizedRestaurants = restaurants.map((rest: any, index: number) => {
          console.log(`🔍 Processing restaurant ${index + 1}:`, rest.restaurant || rest.name);
          
          return {
            platform: rest.platform || "Swiggy",
            restaurant: rest.restaurant || rest.name || args.restaurant || "Restaurant",
            address: rest.address || "Address not available",
            distance: typeof rest.distance === 'number' ? rest.distance : (typeof rest.distance === 'string' ? parseFloat(rest.distance) || 2.5 : 2.5),
            deliveryFee: typeof rest.deliveryFee === 'number' ? rest.deliveryFee : 40,
            eta: typeof rest.eta === 'number' ? rest.eta : 35,
            rating: typeof rest.rating === 'number' ? rest.rating : 4.0,
            freeDeliveryAbove: typeof rest.freeDeliveryAbove === 'number' ? rest.freeDeliveryAbove : 199,
            newUserDiscount: typeof rest.newUserDiscount === 'number' ? rest.newUserDiscount : 50,
            minOrderDiscount: rest.minOrderDiscount || { minOrder: 300, discount: 15 },
            platformFee: typeof rest.platformFee === 'number' ? rest.platformFee : 5,
            availableItems: Array.isArray(rest.availableItems) ? rest.availableItems.map((item: any) => ({
              name: item.name || "Item",
              price: typeof item.price === 'number' ? item.price : 200,
              category: item.category || "Main Course",
              image: item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
            })) : [],
          };
        });
        
        console.log(`✅ Successfully normalized ${normalizedRestaurants.length} restaurants`);
        
        return normalizedRestaurants;
      } catch (parseError) {
        console.error("❌ Failed to parse Perplexity response:", parseError);
        console.error("Response content:", contentString);
        return [];
      }

    } catch (error) {
      console.error("❌ Error calling Perplexity API:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw new Error(`Failed to retrieve restaurant information from Perplexity API: ${error}`);
    }
  },
});