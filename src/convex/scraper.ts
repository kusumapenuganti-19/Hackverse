"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Enhanced mock data for food delivery with detailed menu items and offers
const mockFoodData = {
  swiggy: [
    { 
      platform: "Swiggy", 
      restaurant: "Paradise Biryani", 
      deliveryFee: 40, 
      eta: 35, 
      rating: 4.5,
      freeDeliveryAbove: 199,
      newUserDiscount: 50,
      minOrderDiscount: { minOrder: 300, discount: 15 },
      platformFee: 5,
      availableItems: [
        { name: "Chicken Biryani", price: 320, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Mutton Biryani", price: 380, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Veg Biryani", price: 250, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Raita", price: 60, category: "Sides", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
      ]
    },
    { 
      platform: "Swiggy", 
      restaurant: "Bawarchi", 
      deliveryFee: 30, 
      eta: 40, 
      rating: 4.3,
      freeDeliveryAbove: 249,
      newUserDiscount: 60,
      minOrderDiscount: { minOrder: 350, discount: 20 },
      platformFee: 5,
      availableItems: [
        { name: "Chicken Biryani", price: 280, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Mutton Biryani", price: 350, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Chicken 65", price: 180, category: "Starters", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
      ]
    },
  ],
  zomato: [
    { 
      platform: "Zomato", 
      restaurant: "Paradise Biryani", 
      deliveryFee: 35, 
      eta: 30, 
      rating: 4.5,
      freeDeliveryAbove: 299,
      newUserDiscount: 75,
      minOrderDiscount: { minOrder: 400, discount: 25 },
      platformFee: 3,
      availableItems: [
        { name: "Chicken Biryani", price: 330, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Mutton Biryani", price: 390, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Veg Biryani", price: 260, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Gulab Jamun", price: 80, category: "Desserts", image: "https://images.unsplash.com/photo-1589301773859-34e5d0b6d1c6?w=400" },
      ]
    },
    { 
      platform: "Zomato", 
      restaurant: "Bawarchi", 
      deliveryFee: 25, 
      eta: 38, 
      rating: 4.3,
      freeDeliveryAbove: 199,
      newUserDiscount: 50,
      minOrderDiscount: { minOrder: 300, discount: 15 },
      platformFee: 3,
      availableItems: [
        { name: "Chicken Biryani", price: 290, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Paneer Tikka", price: 220, category: "Starters", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400" },
      ]
    },
  ],
  eatsure: [
    { 
      platform: "EatSure", 
      restaurant: "Paradise Biryani", 
      deliveryFee: 20, 
      eta: 45, 
      rating: 4.4,
      freeDeliveryAbove: 149,
      newUserDiscount: 100,
      minOrderDiscount: { minOrder: 250, discount: 10 },
      platformFee: 2,
      availableItems: [
        { name: "Chicken Biryani", price: 310, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Mutton Biryani", price: 370, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Egg Biryani", price: 200, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
      ]
    },
  ],
  ubereats: [
    { 
      platform: "Uber Eats", 
      restaurant: "Paradise Biryani", 
      deliveryFee: 50, 
      eta: 32, 
      rating: 4.5,
      freeDeliveryAbove: 399,
      newUserDiscount: 40,
      minOrderDiscount: { minOrder: 500, discount: 30 },
      platformFee: 8,
      availableItems: [
        { name: "Chicken Biryani", price: 340, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Mutton Biryani", price: 400, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Chicken Kebab", price: 240, category: "Starters", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
      ]
    },
    { 
      platform: "Uber Eats", 
      restaurant: "Bawarchi", 
      deliveryFee: 45, 
      eta: 42, 
      rating: 4.2,
      freeDeliveryAbove: 349,
      newUserDiscount: 50,
      minOrderDiscount: { minOrder: 400, discount: 20 },
      platformFee: 8,
      availableItems: [
        { name: "Chicken Biryani", price: 295, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        { name: "Fish Fry", price: 260, category: "Starters", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400" },
      ]
    },
  ],
};

// Mock data for bus travel
const mockTravelData = {
  redbus: [
    { platform: "RedBus", operator: "VRL Travels", type: "AC Sleeper", price: 850, duration: "8h 30m", departure: "22:30", arrival: "07:00", rating: 4.2, seats: 12 },
    { platform: "RedBus", operator: "SRS Travels", type: "AC Semi-Sleeper", price: 720, duration: "9h 15m", departure: "23:00", arrival: "08:15", rating: 4.0, seats: 8 },
  ],
  abhibus: [
    { platform: "AbhiBus", operator: "VRL Travels", type: "AC Sleeper", price: 830, duration: "8h 30m", departure: "22:30", arrival: "07:00", rating: 4.2, seats: 15 },
    { platform: "AbhiBus", operator: "Orange Travels", type: "AC Sleeper", price: 780, duration: "8h 45m", departure: "22:00", arrival: "06:45", rating: 4.3, seats: 10 },
  ],
  makemytrip: [
    { platform: "MakeMyTrip", operator: "VRL Travels", type: "AC Sleeper", price: 870, duration: "8h 30m", departure: "22:30", arrival: "07:00", rating: 4.2, seats: 9 },
    { platform: "MakeMyTrip", operator: "Kallada Travels", type: "AC Sleeper", price: 920, duration: "8h 15m", departure: "23:30", arrival: "07:45", rating: 4.4, seats: 6 },
  ],
};

// Mock restaurant database for autocomplete suggestions - Enhanced with 50+ restaurants
const restaurantDatabase = [
  { name: "Paradise Biryani", cuisine: "Biryani, Indian", rating: 4.5, area: "Secunderabad", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100", platforms: ["Swiggy", "Zomato", "EatSure", "Uber Eats"] },
  { name: "Bawarchi", cuisine: "Biryani, Hyderabadi", rating: 4.3, area: "RTC X Roads", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100", platforms: ["Swiggy", "Zomato", "Uber Eats"] },
  { name: "Shah Ghouse", cuisine: "Biryani, Mughlai", rating: 4.4, area: "Tolichowki", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100", platforms: ["Swiggy", "Zomato"] },
  { name: "Cafe Bahar", cuisine: "Biryani, Indian", rating: 4.2, area: "Basheer Bagh", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100", platforms: ["Swiggy", "Zomato", "Uber Eats"] },
  { name: "Mehfil", cuisine: "North Indian, Biryani", rating: 4.1, area: "Banjara Hills", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100", platforms: ["Swiggy", "Zomato"] },
  { name: "Pista House", cuisine: "Biryani, Haleem", rating: 4.3, area: "Charminar", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100", platforms: ["Swiggy", "Zomato", "EatSure"] },
  { name: "Domino's Pizza", cuisine: "Pizza, Fast Food", rating: 4.0, area: "Multiple Locations", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100", platforms: ["Swiggy", "Zomato", "Uber Eats"] },
  { name: "McDonald's", cuisine: "Burgers, Fast Food", rating: 4.1, area: "Multiple Locations", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=100", platforms: ["Swiggy", "Zomato", "Uber Eats"] },
  { name: "KFC", cuisine: "Chicken, Fast Food", rating: 4.0, area: "Multiple Locations", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=100", platforms: ["Swiggy", "Zomato", "Uber Eats"] },
  { name: "Subway", cuisine: "Sandwiches, Healthy", rating: 3.9, area: "Multiple Locations", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100", platforms: ["Swiggy", "Zomato"] },
  { name: "Burger King", cuisine: "Burgers, Fast Food", rating: 4.0, area: "Multiple Locations", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100", platforms: ["Swiggy", "Zomato", "Uber Eats"] },
  { name: "Pizza Hut", cuisine: "Pizza, Italian", rating: 4.1, area: "Multiple Locations", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100", platforms: ["Swiggy", "Zomato", "Uber Eats"] },
  { name: "Barbeque Nation", cuisine: "BBQ, North Indian", rating: 4.4, area: "Banjara Hills", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=100", platforms: ["Swiggy", "Zomato"] },
  { name: "Absolute Barbecues", cuisine: "BBQ, Multi-Cuisine", rating: 4.3, area: "Jubilee Hills", image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=100", platforms: ["Swiggy", "Zomato", "EatSure"] },
  { name: "Ohri's", cuisine: "Multi-Cuisine, Fine Dining", rating: 4.2, area: "Banjara Hills", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100", platforms: ["Swiggy", "Zomato"] },
  { name: "Chutneys", cuisine: "South Indian, Breakfast", rating: 4.4, area: "Somajiguda", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=100", platforms: ["Swiggy", "Zomato", "Uber Eats"] },
  { name: "Minerva Coffee Shop", cuisine: "South Indian, Biryani", rating: 4.2, area: "Multiple Locations", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=100", platforms: ["Swiggy", "Zomato", "EatSure"] },
  { name: "Ulavacharu", cuisine: "Andhra, South Indian", rating: 4.3, area: "Madhapur", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=100", platforms: ["Swiggy", "Zomato"] },
  { name: "Rayalaseema Ruchulu", cuisine: "Andhra, Spicy", rating: 4.1, area: "Kondapur", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100", platforms: ["Swiggy", "Zomato", "Uber Eats"] },
  { name: "Kritunga", cuisine: "Andhra, Seafood", rating: 4.0, area: "Gachibowli", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=100", platforms: ["Swiggy", "Zomato"] },
  { name: "Chicha's", cuisine: "Mexican, Tex-Mex", rating: 4.2, area: "Jubilee Hills", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=100", platforms: ["Swiggy", "Zomato", "Uber Eats"] },
  { name: "Taco Bell", cuisine: "Mexican, Fast Food", rating: 3.9, area: "Multiple Locations", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=100", platforms: ["Swiggy", "Zomato"] },
  { name: "Mainland China", cuisine: "Chinese, Asian", rating: 4.3, area: "Banjara Hills", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=100", platforms: ["Swiggy", "Zomato", "EatSure"] },
  { name: "Bercos", cuisine: "Chinese, Thai", rating: 4.1, area: "Hitech City", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=100", platforms: ["Swiggy", "Zomato"] },
  { name: "Sushi Junction", cuisine: "Japanese, Sushi", rating: 4.4, area: "Jubilee Hills", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100", platforms: ["Swiggy", "Zomato", "Uber Eats"] },
  { name: "Starbucks", cuisine: "Coffee, Cafe", rating: 4.2, area: "Multiple Locations", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100", platforms: ["Swiggy", "Zomato"] },
  { name: "Cafe Coffee Day", cuisine: "Coffee, Snacks", rating: 3.8, area: "Multiple Locations", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100", platforms: ["Swiggy", "Zomato", "EatSure"] },
  { name: "The Chocolate Room", cuisine: "Desserts, Cafe", rating: 4.3, area: "Banjara Hills", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100", platforms: ["Swiggy", "Zomato"] },
  { name: "Baskin Robbins", cuisine: "Ice Cream, Desserts", rating: 4.1, area: "Multiple Locations", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=100", platforms: ["Swiggy", "Zomato", "Uber Eats"] },
  { name: "Cream Stone", cuisine: "Ice Cream, Desserts", rating: 4.2, area: "Madhapur", image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=100", platforms: ["Swiggy", "Zomato"] },
];

// Mock location database
const locationDatabase = [
  "Hyderabad, Telangana",
  "Secunderabad, Telangana",
  "Bangalore, Karnataka",
  "Mumbai, Maharashtra",
  "Delhi, NCR",
  "Chennai, Tamil Nadu",
  "Pune, Maharashtra",
  "Kolkata, West Bengal",
];

export const scrapeFood = action({
  args: {
    location: v.string(),
    restaurant: v.string(),
  },
  handler: async (ctx, args) => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const allResults = [
      ...mockFoodData.swiggy,
      ...mockFoodData.zomato,
      ...mockFoodData.eatsure,
      ...mockFoodData.ubereats,
    ].filter(item => 
      item.restaurant.toLowerCase().includes(args.restaurant.toLowerCase())
    );

    return allResults;
  },
});

export const scrapeTravel = action({
  args: {
    source: v.string(),
    destination: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const allResults = [
      ...mockTravelData.redbus,
      ...mockTravelData.abhibus,
      ...mockTravelData.makemytrip,
    ];

    return allResults;
  },
});

export const analyzeAndRecommend = action({
  args: {
    category: v.union(v.literal("food"), v.literal("travel")),
    results: v.string(),
    selectedItems: v.optional(v.string()), // JSON stringified array of selected items with quantities
    isNewUser: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const data = JSON.parse(args.results);

    if (args.category === "food") {
      const selectedItems = args.selectedItems ? JSON.parse(args.selectedItems) : [];
      const isNewUser = args.isNewUser ?? true;

      const scored = data.map((restaurant: any) => {
        // Calculate subtotal from selected items
        let subtotal = 0;
        const itemsOrdered: any[] = [];
        
        selectedItems.forEach((selected: any) => {
          const item = restaurant.availableItems.find((i: any) => i.name === selected.name);
          if (item) {
            subtotal += item.price * selected.quantity;
            itemsOrdered.push({ ...item, quantity: selected.quantity });
          }
        });

        // If no items selected, use a default item for comparison
        if (subtotal === 0 && restaurant.availableItems.length > 0) {
          subtotal = restaurant.availableItems[0].price;
          itemsOrdered.push({ ...restaurant.availableItems[0], quantity: 1 });
        }

        // Calculate delivery fee (free if above threshold)
        const deliveryFee = subtotal >= restaurant.freeDeliveryAbove ? 0 : restaurant.deliveryFee;
        const isFreeDelivery = deliveryFee === 0;

        // Calculate discounts
        let newUserDiscountAmount = 0;
        if (isNewUser) {
          newUserDiscountAmount = restaurant.newUserDiscount;
        }

        let minOrderDiscountAmount = 0;
        if (subtotal >= restaurant.minOrderDiscount.minOrder) {
          minOrderDiscountAmount = Math.round(subtotal * restaurant.minOrderDiscount.discount / 100);
        }

        const totalDiscount = newUserDiscountAmount + minOrderDiscountAmount;
        
        // Calculate final price
        const finalPrice = Math.max(0, subtotal + deliveryFee + restaurant.platformFee - totalDiscount);

        // Calculate proximity to free delivery
        const amountToFreeDelivery = Math.max(0, restaurant.freeDeliveryAbove - subtotal);

        // Scoring
        const maxPrice = Math.max(...data.map((d: any) => {
          let s = 0;
          selectedItems.forEach((sel: any) => {
            const it = d.availableItems.find((i: any) => i.name === sel.name);
            if (it) s += it.price * sel.quantity;
          });
          return s || d.availableItems[0]?.price || 300;
        }));

        const priceScore = 1 - (finalPrice / (maxPrice + 100));
        const timeScore = 1 - (restaurant.eta / Math.max(...data.map((d: any) => d.eta)));
        const ratingScore = restaurant.rating / 5;
        
        const totalScore = (0.5 * priceScore) + (0.3 * timeScore) + (0.2 * ratingScore);
        
        return {
          ...restaurant,
          itemsOrdered,
          subtotal: Math.round(subtotal),
          deliveryFee,
          isFreeDelivery,
          platformFee: restaurant.platformFee,
          newUserDiscountAmount,
          minOrderDiscountAmount,
          totalDiscount,
          finalPrice: Math.round(finalPrice),
          amountToFreeDelivery,
          raayanScore: Math.round(totalScore * 100),
        };
      });

      scored.sort((a: any, b: any) => b.raayanScore - a.raayanScore);
      const best = scored[0];

      // Generate detailed reasoning
      let reasoning = `🎯 **Best Value Choice!** `;
      
      if (best.isFreeDelivery) {
        reasoning += `✅ **FREE DELIVERY** (saved ₹${scored.find((s: any) => !s.isFreeDelivery)?.deliveryFee || 40}). `;
      } else if (best.amountToFreeDelivery > 0) {
        reasoning += `📦 Add ₹${best.amountToFreeDelivery} more for FREE delivery. `;
      }

      if (best.newUserDiscountAmount > 0) {
        reasoning += `🎉 **New User Offer**: Flat ₹${best.newUserDiscountAmount} OFF! `;
      }

      if (best.minOrderDiscountAmount > 0) {
        reasoning += `💰 **${best.minOrderDiscount.discount}% OFF** on orders above ₹${best.minOrderDiscount.minOrder} (saved ₹${best.minOrderDiscountAmount}). `;
      }

      reasoning += `⚡ Delivery in ${best.eta} mins. ⭐ ${best.rating} rating. **Total Savings: ₹${best.totalDiscount}**`;

      const maxFinalPrice = Math.max(...scored.map((s: any) => s.finalPrice));
      const savings = Math.round(maxFinalPrice - best.finalPrice);

      return {
        results: scored,
        recommendation: {
          pick: best,
          reasoning,
          savings,
          timeSaved: Math.round(Math.max(...scored.map((s: any) => s.eta)) - best.eta),
        },
      };
    } else {
      // Calculate scores for travel options
      const scored = data.map((item: any) => {
        const priceScore = 1 - (item.price / Math.max(...data.map((d: any) => d.price)));
        const durationMins = parseInt(item.duration.split('h')[0]) * 60 + parseInt(item.duration.split('h')[1]);
        const timeScore = 1 - (durationMins / Math.max(...data.map((d: any) => {
          const mins = parseInt(d.duration.split('h')[0]) * 60 + parseInt(d.duration.split('h')[1]);
          return mins;
        })));
        const ratingScore = item.rating / 5;
        
        const totalScore = (0.5 * priceScore) + (0.3 * timeScore) + (0.2 * ratingScore);
        
        return {
          ...item,
          raayanScore: Math.round(totalScore * 100),
        };
      });

      scored.sort((a: any, b: any) => b.raayanScore - a.raayanScore);
      const best = scored[0];

      const reasoning = `This bus offers the best combination: ₹${best.price} (${best.price < 800 ? 'budget-friendly' : 'premium'}), ${best.duration} journey time, departs at ${best.departure}, ${best.seats} seats available, and ${best.rating}★ rating. ${best.type} for comfortable travel.`;

      return {
        results: scored,
        recommendation: {
          pick: best,
          reasoning,
          savings: Math.round(Math.max(...scored.map((s: any) => s.price)) - best.price),
          timeSaved: 0,
        },
      };
    }
  },
});

export const searchRestaurants = action({
  args: {
    query: v.string(),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Extract city from location if provided (first part is the city)
    let city: string | undefined;
    if (args.location) {
      const locationParts = args.location.split(',').map(p => p.trim());
      city = locationParts[0]; // First part is always the city
    }

    // Call the query to search restaurants
    const results: Array<any> = await ctx.runQuery(internal.restaurants.searchRestaurants, {
      query: args.query,
      city,
      limit: 8,
    });

    // Transform to match the expected format for autocomplete
    return results.map((r: any) => ({
      name: r.name,
      cuisine: r.cuisine,
      rating: r.rating,
      area: r.area,
      image: r.image,
      platforms: r.platforms,
    }));
  },
});

export const searchLocations = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Call the query to search locations
    const results: Array<string> = await ctx.runQuery(internal.restaurants.searchLocations, {
      query: args.query,
      limit: 5,
    });

    return results;
  },
});