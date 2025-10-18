"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import Perplexity from "@perplexity-ai/perplexity_ai";

interface BusTicket {
  operator: string;
  type: string;
  price: number;
  duration: string;
  departure: string;
  arrival: string;
  rating: number;
  seats: number;
  platform: string;
}

export const searchRealTimeBusPrices = action({
  args: {
    source: v.string(),
    destination: v.string(),
    date: v.string(),
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
      console.log(`🚌 Searching buses: ${args.source} → ${args.destination} on ${args.date}`);
      
      const userQuery = `Find bus tickets from ${args.source} to ${args.destination} for ${args.date}. Include operator names, bus types, departure times, arrival times, prices in INR, journey duration, available seats, ratings, distance, and all available amenities (WiFi, charging points, blankets, water bottles, snacks, reading lights, etc.). Search across RedBus, AbhiBus, MakeMyTrip, and Paytm platforms.`;
      
      const systemPrompt = (
        "You are an expert bus ticket booking analyst for India. Provide COMPREHENSIVE and REALISTIC bus travel options.\n\n" +
        "CRITICAL REQUIREMENTS:\n" +
        "1. ALWAYS return valid JSON array - NEVER empty or null\n" +
        "2. MINIMUM 5-8 bus options required - NO EXCEPTIONS\n" +
        "3. Include variety: different operators, timings, prices, and bus types\n" +
        "4. Use REAL Indian bus operators and realistic routes\n\n" +
        "JSON STRUCTURE (strict format):\n" +
        "[\n" +
        "  {\n" +
        "    \"operator\": \"VRL Travels\" | \"SRS Travels\" | \"Orange Travels\" | \"Kallada\" | \"KPN\" | \"Parveen\",\n" +
        "    \"type\": \"AC Sleeper\" | \"AC Semi-Sleeper\" | \"Non-AC Seater\" | \"Volvo Multi-Axle\",\n" +
        "    \"price\": 500-1500 (number in INR),\n" +
        "    \"duration\": \"8h 30m\" (string format),\n" +
        "    \"departure\": \"22:30\" (24-hour format),\n" +
        "    \"arrival\": \"07:00\" (24-hour format),\n" +
        "    \"rating\": 3.5-4.8 (number),\n" +
        "    \"seats\": 5-35 (number available),\n" +
        "    \"platform\": \"RedBus\" | \"AbhiBus\" | \"MakeMyTrip\" | \"Paytm\",\n" +
        "    \"distance\": \"450 km\" (string with unit),\n" +
        "    \"amenities\": [\"WiFi\", \"Charging Point\", \"Blanket\", \"Water Bottle\", \"Reading Light\", \"Emergency Exit\", \"GPS Tracking\"]\n" +
        "  }\n" +
        "]\n\n" +
        "IMPORTANT RULES:\n" +
        "- Include morning (6-10am), afternoon (12-4pm), evening (6-10pm), and night (10pm-2am) departures\n" +
        "- Vary prices based on bus type and timing (night buses often cheaper)\n" +
        "- Premium buses (Volvo, Multi-Axle) should be 20-30% more expensive\n" +
        "- Include at least 4-6 amenities per bus\n" +
        "- Ensure realistic journey durations based on distance\n" +
        "- All platforms (RedBus, AbhiBus, MakeMyTrip, Paytm) should be represented\n\n" +
        "RESPONSE FORMAT: Return ONLY the JSON array, no additional text or markdown formatting."
      );

      console.log("📡 Calling Perplexity API...");
      
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
          max_tokens: 3000,
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
        // Try to extract JSON from markdown code blocks if present
        let jsonString = contentString.trim();
        
        // Try multiple patterns for JSON extraction
        const patterns = [
          /```json([\s\S]*?)```/,
          /```(?:json|javascript)([\s\S]*?)```/,
          /```(?:\w+)?json([\s\S]*?)```/,
        ];
        
        for (const pattern of patterns) {
          const match = jsonString.match(pattern);
          if (match) {
            jsonString = match[1].trim();
            break;
          }
        }
        
        const parsed = JSON.parse(jsonString);
        const tickets = Array.isArray(parsed) ? parsed : parsed.tickets || [];
        
        console.log(`✅ Parsed ${tickets.length} bus tickets from Perplexity`);
        
        // Validate and normalize the data
        const normalizedTickets = tickets.map((ticket: any) => ({
          operator: ticket.operator || "Unknown Operator",
          type: ticket.type || "AC Sleeper",
          price: typeof ticket.price === 'number' ? ticket.price : 800,
          duration: ticket.duration || "8h 30m",
          departure: ticket.departure || "22:00",
          arrival: ticket.arrival || "06:30",
          rating: typeof ticket.rating === 'number' ? ticket.rating : 4.0,
          seats: typeof ticket.seats === 'number' ? ticket.seats : 10,
          platform: ticket.platform || "RedBus",
        }));
        
        return normalizedTickets;
      } catch (parseError) {
        console.error("❌ Failed to parse Perplexity response:", parseError);
        console.error("Response content:", contentString);
        return [];
      }

    } catch (error) {
      console.error("❌ Error calling Perplexity API:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw new Error(`Failed to retrieve bus ticket information from Perplexity API: ${error}`);
    }
  },
});