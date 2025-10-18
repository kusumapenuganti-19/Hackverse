import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";

// Query restaurants by city and search term
export const searchRestaurants = internalQuery({
  args: {
    query: v.string(),
    city: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 8;
    
    // Get all restaurants and filter in memory (for simple search)
    // In production, you'd want full-text search
    let restaurants = await ctx.db.query("restaurants").collect();
    
    // Filter by city if provided
    if (args.city) {
      restaurants = restaurants.filter(r => r.city.toLowerCase() === args.city!.toLowerCase());
    }
    
    // If query is empty, return all restaurants for the city
    if (!args.query || args.query.length < 2) {
      return restaurants.slice(0, limit);
    }

    const query = args.query.toLowerCase();
    
    // Filter by name or cuisine
    restaurants = restaurants.filter(r => 
      r.name.toLowerCase().includes(query) ||
      r.cuisine.toLowerCase().includes(query)
    );
    
    return restaurants.slice(0, limit);
  },
});

// Query locations by search term
export const searchLocations = internalQuery({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    
    if (!args.query || args.query.length < 2) {
      return [];
    }

    const query = args.query.toLowerCase();
    
    let locations = await ctx.db.query("locations").collect();
    
    locations = locations.filter(l => 
      l.fullName.toLowerCase().includes(query) ||
      l.city.toLowerCase().includes(query)
    );
    
    return locations.slice(0, limit).map(l => l.fullName);
  },
});

// Get restaurant by ID
export const getRestaurant = query({
  args: { id: v.id("restaurants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Seed initial restaurant data (internal mutation)
export const seedRestaurants = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("restaurants").first();
    if (existing) {
      // Clear existing data to allow re-seeding
      const allRestaurants = await ctx.db.query("restaurants").collect();
      for (const restaurant of allRestaurants) {
        await ctx.db.delete(restaurant._id);
      }
      
      const allLocations = await ctx.db.query("locations").collect();
      for (const location of allLocations) {
        await ctx.db.delete(location._id);
      }
    }

    // Seed locations
    const locations = [
      { name: "Hyderabad", city: "Hyderabad", state: "Telangana", fullName: "Hyderabad, Telangana" },
      { name: "Secunderabad", city: "Secunderabad", state: "Telangana", fullName: "Secunderabad, Telangana" },
      { name: "Visakhapatnam", city: "Visakhapatnam", state: "Andhra Pradesh", fullName: "Visakhapatnam, Andhra Pradesh" },
      { name: "Vizag", city: "Visakhapatnam", state: "Andhra Pradesh", fullName: "Vizag, Andhra Pradesh" },
      { name: "Bangalore", city: "Bangalore", state: "Karnataka", fullName: "Bangalore, Karnataka" },
      { name: "Mumbai", city: "Mumbai", state: "Maharashtra", fullName: "Mumbai, Maharashtra" },
      { name: "Delhi", city: "Delhi", state: "NCR", fullName: "Delhi, NCR" },
      { name: "Chennai", city: "Chennai", state: "Tamil Nadu", fullName: "Chennai, Tamil Nadu" },
    ];

    for (const location of locations) {
      await ctx.db.insert("locations", location);
    }

    // Seed restaurants - Hyderabad
    const hyderabadRestaurants = [
      {
        name: "Paradise Biryani",
        cuisine: "Biryani, Indian",
        rating: 4.5,
        area: "Secunderabad",
        city: "Hyderabad",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100",
        platforms: ["Swiggy", "Zomato", "EatSure", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 40,
            eta: 35,
            freeDeliveryAbove: 199,
            newUserDiscount: 50,
            minOrderDiscount: { minOrder: 300, discount: 15 },
            platformFee: 5,
          },
          {
            platform: "Zomato",
            deliveryFee: 35,
            eta: 30,
            freeDeliveryAbove: 299,
            newUserDiscount: 75,
            minOrderDiscount: { minOrder: 400, discount: 25 },
            platformFee: 3,
          },
        ],
        menuItems: [
          { name: "Chicken Biryani", price: 320, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Mutton Biryani", price: 380, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Veg Biryani", price: 250, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Raita", price: 60, category: "Sides", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
        ],
      },
      {
        name: "Bawarchi",
        cuisine: "Biryani, Hyderabadi",
        rating: 4.3,
        area: "RTC X Roads",
        city: "Hyderabad",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 30,
            eta: 40,
            freeDeliveryAbove: 249,
            newUserDiscount: 60,
            minOrderDiscount: { minOrder: 350, discount: 20 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Chicken Biryani", price: 280, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Mutton Biryani", price: 350, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Chicken 65", price: 180, category: "Starters", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
        ],
      },
    ];

    // Seed Vizag restaurants
    const vizagRestaurants = [
      {
        name: "Dakshin Restaurant",
        cuisine: "South Indian, Seafood",
        rating: 4.4,
        area: "Beach Road",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 35,
            eta: 30,
            freeDeliveryAbove: 199,
            newUserDiscount: 50,
            minOrderDiscount: { minOrder: 300, discount: 15 },
            platformFee: 5,
          },
          {
            platform: "Zomato",
            deliveryFee: 30,
            eta: 28,
            freeDeliveryAbove: 249,
            newUserDiscount: 60,
            minOrderDiscount: { minOrder: 350, discount: 20 },
            platformFee: 3,
          },
        ],
        menuItems: [
          { name: "Fish Curry", price: 280, category: "Main Course", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400" },
          { name: "Prawn Fry", price: 320, category: "Starters", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400" },
          { name: "Crab Masala", price: 450, category: "Main Course", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400" },
          { name: "Andhra Meals", price: 220, category: "Thali", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400" },
        ],
      },
      {
        name: "Vizag Biryani House",
        cuisine: "Biryani, Andhra",
        rating: 4.2,
        area: "MVP Colony",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 30,
            eta: 35,
            freeDeliveryAbove: 249,
            newUserDiscount: 60,
            minOrderDiscount: { minOrder: 350, discount: 20 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Chicken Biryani", price: 260, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Mutton Biryani", price: 340, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Gongura Chicken", price: 280, category: "Main Course", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
        ],
      },
      {
        name: "The Spicy Venue",
        cuisine: "North Indian, Chinese",
        rating: 4.3,
        area: "Siripuram",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 40,
            eta: 32,
            freeDeliveryAbove: 199,
            newUserDiscount: 50,
            minOrderDiscount: { minOrder: 300, discount: 15 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Paneer Butter Masala", price: 240, category: "Main Course", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400" },
          { name: "Hakka Noodles", price: 180, category: "Chinese", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400" },
          { name: "Manchurian", price: 200, category: "Chinese", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400" },
        ],
      },
      {
        name: "Sea Inn",
        cuisine: "Seafood, Coastal",
        rating: 4.5,
        area: "RK Beach",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=100",
        platforms: ["Swiggy", "Zomato", "EatSure"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 40,
            eta: 35,
            freeDeliveryAbove: 299,
            newUserDiscount: 70,
            minOrderDiscount: { minOrder: 400, discount: 18 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Apollo Fish", price: 300, category: "Starters", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400" },
          { name: "Squid Fry", price: 350, category: "Starters", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400" },
          { name: "Fish Biryani", price: 320, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
        ],
      },
      {
        name: "Domino's Pizza",
        cuisine: "Pizza, Fast Food",
        rating: 4.0,
        area: "Dwaraka Nagar",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 30,
            eta: 30,
            freeDeliveryAbove: 199,
            newUserDiscount: 50,
            minOrderDiscount: { minOrder: 300, discount: 15 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Margherita Pizza", price: 250, category: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400" },
          { name: "Peppy Paneer Pizza", price: 320, category: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400" },
          { name: "Garlic Bread", price: 120, category: "Sides", image: "https://images.unsplash.com/photo-1573140401552-388e7e2f0f6d?w=400" },
        ],
      },
      {
        name: "KFC",
        cuisine: "Chicken, Fast Food",
        rating: 4.1,
        area: "Jagadamba Junction",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 35,
            eta: 32,
            freeDeliveryAbove: 249,
            newUserDiscount: 60,
            minOrderDiscount: { minOrder: 350, discount: 20 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Chicken Bucket", price: 450, category: "Chicken", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400" },
          { name: "Zinger Burger", price: 180, category: "Burgers", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400" },
          { name: "Popcorn Chicken", price: 150, category: "Snacks", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400" },
        ],
      },
      {
        name: "Subway",
        cuisine: "Sandwiches, Healthy",
        rating: 3.9,
        area: "Waltair Main Road",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 25,
            eta: 28,
            freeDeliveryAbove: 199,
            newUserDiscount: 40,
            minOrderDiscount: { minOrder: 250, discount: 10 },
            platformFee: 4,
          },
        ],
        menuItems: [
          { name: "Veggie Delite Sub", price: 180, category: "Sandwiches", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400" },
          { name: "Chicken Teriyaki Sub", price: 240, category: "Sandwiches", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400" },
          { name: "Cookie", price: 50, category: "Desserts", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400" },
        ],
      },
      {
        name: "Burger King",
        cuisine: "Burgers, Fast Food",
        rating: 4.0,
        area: "CMR Central",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 30,
            eta: 30,
            freeDeliveryAbove: 249,
            newUserDiscount: 55,
            minOrderDiscount: { minOrder: 300, discount: 15 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Whopper", price: 220, category: "Burgers", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400" },
          { name: "Chicken Fries", price: 140, category: "Sides", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400" },
          { name: "Veg Whopper", price: 180, category: "Burgers", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400" },
        ],
      },
      {
        name: "Minerva Coffee Shop",
        cuisine: "South Indian, Biryani",
        rating: 4.2,
        area: "Seethammadhara",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=100",
        platforms: ["Swiggy", "Zomato", "EatSure"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 30,
            eta: 32,
            freeDeliveryAbove: 199,
            newUserDiscount: 50,
            minOrderDiscount: { minOrder: 300, discount: 15 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Masala Dosa", price: 110, category: "Breakfast", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400" },
          { name: "Chicken Biryani", price: 270, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Idli Sambar", price: 80, category: "Breakfast", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400" },
        ],
      },
      {
        name: "Taco Bell",
        cuisine: "Mexican, Fast Food",
        rating: 3.8,
        area: "Madhurawada",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 35,
            eta: 35,
            freeDeliveryAbove: 249,
            newUserDiscount: 50,
            minOrderDiscount: { minOrder: 300, discount: 12 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Crunchy Taco", price: 120, category: "Tacos", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400" },
          { name: "Burrito Supreme", price: 200, category: "Burritos", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400" },
          { name: "Nachos", price: 150, category: "Sides", image: "https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400" },
        ],
      },
      {
        name: "Cafe Coffee Day",
        cuisine: "Coffee, Snacks",
        rating: 3.7,
        area: "Rushikonda",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 25,
            eta: 25,
            freeDeliveryAbove: 149,
            newUserDiscount: 40,
            minOrderDiscount: { minOrder: 200, discount: 10 },
            platformFee: 4,
          },
        ],
        menuItems: [
          { name: "Cappuccino", price: 120, category: "Beverages", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400" },
          { name: "Sandwich", price: 140, category: "Snacks", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400" },
          { name: "Brownie", price: 100, category: "Desserts", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400" },
        ],
      },
      {
        name: "Baskin Robbins",
        cuisine: "Ice Cream, Desserts",
        rating: 4.1,
        area: "Gajuwaka",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 30,
            eta: 28,
            freeDeliveryAbove: 199,
            newUserDiscount: 45,
            minOrderDiscount: { minOrder: 250, discount: 12 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Chocolate Chip Ice Cream", price: 180, category: "Ice Cream", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400" },
          { name: "Sundae", price: 220, category: "Desserts", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400" },
          { name: "Milkshake", price: 160, category: "Beverages", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400" },
        ],
      },
      {
        name: "Pizza Hut",
        cuisine: "Pizza, Italian",
        rating: 4.1,
        area: "Kommadi",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 35,
            eta: 33,
            freeDeliveryAbove: 249,
            newUserDiscount: 60,
            minOrderDiscount: { minOrder: 350, discount: 18 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Farmhouse Pizza", price: 320, category: "Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400" },
          { name: "Chicken Wings", price: 280, category: "Starters", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400" },
          { name: "Pasta", price: 220, category: "Italian", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400" },
        ],
      },
      {
        name: "Barbeque Nation",
        cuisine: "BBQ, North Indian",
        rating: 4.4,
        area: "Vizag Central",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 45,
            eta: 40,
            freeDeliveryAbove: 399,
            newUserDiscount: 80,
            minOrderDiscount: { minOrder: 500, discount: 20 },
            platformFee: 6,
          },
        ],
        menuItems: [
          { name: "BBQ Platter", price: 550, category: "BBQ", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400" },
          { name: "Grilled Chicken", price: 380, category: "BBQ", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
          { name: "Paneer Tikka", price: 280, category: "Starters", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400" },
        ],
      },
      {
        name: "Mainland China",
        cuisine: "Chinese, Asian",
        rating: 4.3,
        area: "Asilmetta",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=100",
        platforms: ["Swiggy", "Zomato", "EatSure"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 40,
            eta: 35,
            freeDeliveryAbove: 299,
            newUserDiscount: 65,
            minOrderDiscount: { minOrder: 400, discount: 18 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Dim Sum", price: 320, category: "Chinese", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400" },
          { name: "Fried Rice", price: 220, category: "Chinese", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400" },
          { name: "Chilli Chicken", price: 280, category: "Chinese", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
        ],
      },
      {
        name: "Starbucks",
        cuisine: "Coffee, Cafe",
        rating: 4.2,
        area: "Varun Beach",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 30,
            eta: 30,
            freeDeliveryAbove: 249,
            newUserDiscount: 50,
            minOrderDiscount: { minOrder: 300, discount: 12 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Caffe Latte", price: 280, category: "Beverages", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400" },
          { name: "Blueberry Muffin", price: 180, category: "Bakery", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400" },
          { name: "Sandwich", price: 240, category: "Snacks", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400" },
        ],
      },
      {
        name: "Ulavacharu",
        cuisine: "Andhra, South Indian",
        rating: 4.3,
        area: "Pendurthi",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 35,
            eta: 38,
            freeDeliveryAbove: 249,
            newUserDiscount: 60,
            minOrderDiscount: { minOrder: 350, discount: 18 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Andhra Thali", price: 280, category: "Thali", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400" },
          { name: "Gongura Mutton", price: 380, category: "Main Course", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400" },
          { name: "Pesarattu", price: 120, category: "Breakfast", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400" },
        ],
      },
      {
        name: "The Chocolate Room",
        cuisine: "Desserts, Cafe",
        rating: 4.3,
        area: "Maddilapalem",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 30,
            eta: 30,
            freeDeliveryAbove: 199,
            newUserDiscount: 50,
            minOrderDiscount: { minOrder: 250, discount: 15 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Death by Chocolate", price: 220, category: "Desserts", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400" },
          { name: "Hot Chocolate", price: 150, category: "Beverages", image: "https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=400" },
          { name: "Waffle", price: 180, category: "Desserts", image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400" },
        ],
      },
      {
        name: "Kritunga",
        cuisine: "Andhra, Seafood",
        rating: 4.0,
        area: "Akkayyapalem",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 35,
            eta: 35,
            freeDeliveryAbove: 249,
            newUserDiscount: 55,
            minOrderDiscount: { minOrder: 350, discount: 18 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Royyala Vepudu", price: 380, category: "Seafood", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400" },
          { name: "Natu Kodi Pulusu", price: 340, category: "Main Course", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
          { name: "Andhra Meals", price: 250, category: "Thali", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400" },
        ],
      },
      {
        name: "McDonald's",
        cuisine: "Burgers, Fast Food",
        rating: 4.1,
        area: "NAD Junction",
        city: "Visakhapatnam",
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 30,
            eta: 28,
            freeDeliveryAbove: 199,
            newUserDiscount: 50,
            minOrderDiscount: { minOrder: 300, discount: 15 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "McAloo Tikki Burger", price: 60, category: "Burgers", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400" },
          { name: "McChicken Burger", price: 120, category: "Burgers", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400" },
          { name: "French Fries", price: 80, category: "Sides", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400" },
        ],
      },
    ];

    // Seed Bangalore restaurants
    const bangaloreRestaurants = [
      {
        name: "Meghana Foods",
        cuisine: "Biryani, Andhra",
        rating: 4.5,
        area: "Koramangala",
        city: "Bangalore",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 45,
            eta: 38,
            freeDeliveryAbove: 249,
            newUserDiscount: 75,
            minOrderDiscount: { minOrder: 400, discount: 20 },
            platformFee: 6,
          },
          {
            platform: "Zomato",
            deliveryFee: 40,
            eta: 35,
            freeDeliveryAbove: 299,
            newUserDiscount: 80,
            minOrderDiscount: { minOrder: 450, discount: 25 },
            platformFee: 4,
          },
        ],
        menuItems: [
          { name: "Chicken Biryani", price: 300, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Mutton Biryani", price: 380, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Chicken Kebab", price: 250, category: "Starters", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
          { name: "Gulab Jamun", price: 70, category: "Desserts", image: "https://images.unsplash.com/photo-1589301773859-34e5d0b6d1c6?w=400" },
        ],
      },
      {
        name: "Truffles",
        cuisine: "Burgers, American",
        rating: 4.4,
        area: "Indiranagar",
        city: "Bangalore",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 50,
            eta: 40,
            freeDeliveryAbove: 299,
            newUserDiscount: 60,
            minOrderDiscount: { minOrder: 350, discount: 15 },
            platformFee: 6,
          },
        ],
        menuItems: [
          { name: "Classic Burger", price: 280, category: "Burgers", image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400" },
          { name: "Chicken Wings", price: 320, category: "Starters", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400" },
          { name: "Loaded Fries", price: 180, category: "Sides", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400" },
        ],
      },
      {
        name: "MTR",
        cuisine: "South Indian, Breakfast",
        rating: 4.6,
        area: "Jayanagar",
        city: "Bangalore",
        image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=100",
        platforms: ["Swiggy", "Zomato", "EatSure"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 35,
            eta: 30,
            freeDeliveryAbove: 199,
            newUserDiscount: 50,
            minOrderDiscount: { minOrder: 250, discount: 10 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Masala Dosa", price: 120, category: "Breakfast", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400" },
          { name: "Idli Vada", price: 100, category: "Breakfast", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400" },
          { name: "Filter Coffee", price: 50, category: "Beverages", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400" },
        ],
      },
    ];

    // Seed Delhi restaurants
    const delhiRestaurants = [
      {
        name: "Karim's",
        cuisine: "Mughlai, Kebabs",
        rating: 4.5,
        area: "Jama Masjid",
        city: "Delhi",
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 50,
            eta: 42,
            freeDeliveryAbove: 299,
            newUserDiscount: 80,
            minOrderDiscount: { minOrder: 450, discount: 20 },
            platformFee: 7,
          },
          {
            platform: "Zomato",
            deliveryFee: 45,
            eta: 40,
            freeDeliveryAbove: 349,
            newUserDiscount: 90,
            minOrderDiscount: { minOrder: 500, discount: 25 },
            platformFee: 5,
          },
        ],
        menuItems: [
          { name: "Mutton Korma", price: 420, category: "Main Course", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400" },
          { name: "Chicken Seekh Kebab", price: 320, category: "Starters", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
          { name: "Mutton Biryani", price: 450, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Rumali Roti", price: 40, category: "Breads", image: "https://images.unsplash.com/photo-1619740455993-9e0c7c1c6c84?w=400" },
        ],
      },
      {
        name: "Haldiram's",
        cuisine: "North Indian, Snacks",
        rating: 4.3,
        area: "Connaught Place",
        city: "Delhi",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 40,
            eta: 35,
            freeDeliveryAbove: 249,
            newUserDiscount: 60,
            minOrderDiscount: { minOrder: 300, discount: 15 },
            platformFee: 6,
          },
        ],
        menuItems: [
          { name: "Chole Bhature", price: 180, category: "Main Course", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400" },
          { name: "Samosa Chaat", price: 120, category: "Snacks", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
          { name: "Paneer Tikka", price: 240, category: "Starters", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400" },
        ],
      },
      {
        name: "Biryani Blues",
        cuisine: "Biryani, Hyderabadi",
        rating: 4.4,
        area: "Hauz Khas",
        city: "Delhi",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 45,
            eta: 38,
            freeDeliveryAbove: 299,
            newUserDiscount: 70,
            minOrderDiscount: { minOrder: 400, discount: 18 },
            platformFee: 6,
          },
        ],
        menuItems: [
          { name: "Chicken Biryani", price: 340, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Mutton Biryani", price: 420, category: "Biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Raita", price: 70, category: "Sides", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400" },
        ],
      },
    ];

    // Seed Mumbai restaurants
    const mumbaiRestaurants = [
      {
        name: "Britannia & Co.",
        cuisine: "Parsi, Iranian",
        rating: 4.6,
        area: "Ballard Estate",
        city: "Mumbai",
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 55,
            eta: 45,
            freeDeliveryAbove: 349,
            newUserDiscount: 90,
            minOrderDiscount: { minOrder: 500, discount: 22 },
            platformFee: 8,
          },
          {
            platform: "Zomato",
            deliveryFee: 50,
            eta: 42,
            freeDeliveryAbove: 399,
            newUserDiscount: 100,
            minOrderDiscount: { minOrder: 550, discount: 25 },
            platformFee: 6,
          },
        ],
        menuItems: [
          { name: "Berry Pulav", price: 380, category: "Main Course", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400" },
          { name: "Dhansak", price: 420, category: "Main Course", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400" },
          { name: "Caramel Custard", price: 150, category: "Desserts", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400" },
        ],
      },
      {
        name: "Theobroma",
        cuisine: "Bakery, Desserts",
        rating: 4.5,
        area: "Colaba",
        city: "Mumbai",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 50,
            eta: 35,
            freeDeliveryAbove: 299,
            newUserDiscount: 70,
            minOrderDiscount: { minOrder: 350, discount: 15 },
            platformFee: 7,
          },
        ],
        menuItems: [
          { name: "Chocolate Brownie", price: 180, category: "Desserts", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400" },
          { name: "Red Velvet Cake", price: 220, category: "Desserts", image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400" },
          { name: "Croissant", price: 120, category: "Bakery", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400" },
        ],
      },
      {
        name: "Bademiya",
        cuisine: "Kebabs, Rolls",
        rating: 4.4,
        area: "Colaba",
        city: "Mumbai",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=100",
        platforms: ["Swiggy", "Zomato"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 45,
            eta: 38,
            freeDeliveryAbove: 249,
            newUserDiscount: 65,
            minOrderDiscount: { minOrder: 350, discount: 18 },
            platformFee: 7,
          },
        ],
        menuItems: [
          { name: "Chicken Seekh Roll", price: 180, category: "Rolls", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400" },
          { name: "Mutton Seekh Kebab", price: 280, category: "Kebabs", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
          { name: "Chicken Tikka", price: 240, category: "Starters", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400" },
        ],
      },
      {
        name: "Gajalee",
        cuisine: "Seafood, Coastal",
        rating: 4.5,
        area: "Vile Parle",
        city: "Mumbai",
        image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=100",
        platforms: ["Swiggy", "Zomato", "Uber Eats"],
        platformData: [
          {
            platform: "Swiggy",
            deliveryFee: 50,
            eta: 40,
            freeDeliveryAbove: 349,
            newUserDiscount: 80,
            minOrderDiscount: { minOrder: 450, discount: 20 },
            platformFee: 7,
          },
        ],
        menuItems: [
          { name: "Bombil Fry", price: 320, category: "Seafood", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400" },
          { name: "Prawn Curry", price: 380, category: "Main Course", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400" },
          { name: "Crab Masala", price: 480, category: "Seafood", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400" },
        ],
      },
    ];

    // Insert all restaurants
    for (const restaurant of [...hyderabadRestaurants, ...vizagRestaurants, ...bangaloreRestaurants, ...delhiRestaurants, ...mumbaiRestaurants]) {
      await ctx.db.insert("restaurants", restaurant);
    }

    const totalCount = hyderabadRestaurants.length + vizagRestaurants.length + bangaloreRestaurants.length + delhiRestaurants.length + mumbaiRestaurants.length;
    return { message: "Database seeded successfully", count: totalCount };
  },
});