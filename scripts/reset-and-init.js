const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

async function resetDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all collections
    const collections = await mongoose.connection.db.collections();

    // Drop each collection
    for (const collection of collections) {
      await collection.drop();
      console.log(`Dropped collection: ${collection.collectionName}`);
    }

    console.log("Database reset complete");

    // Create admin user
    const adminUser = await mongoose.connection.collection("users").insertOne({
      role: "admin",
      name: "Main Shop Admin",
      phone: "+77011234567",
      pin: await bcrypt.hash("1234", 10),
      createdAt: new Date(),
    });

    console.log("Created admin user");

    // Create main shop
    const mainShop = await mongoose.connection
      .collection("coffeeshops")
      .insertOne({
        name: "Coffee House",
        location: "Almaty",
        address: "Al-Farabi Avenue, 110",
        adminId: adminUser.insertedId.toString(),
        isActive: true,
        createdAt: new Date(),
      });

    console.log("Created main shop");

    // Update admin user with shop ID
    await mongoose.connection
      .collection("users")
      .updateOne(
        { _id: adminUser.insertedId },
        { $set: { coffeeShopId: mainShop.insertedId.toString() } }
      );

    // Create menu items
    const products = [
      {
        name: "Hot Americano",
        price: 800,
        imageUrl: "/menu/hot-americano.jpg",
        coffeeShopId: mainShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Hot Latte",
        price: 1200,
        imageUrl: "/menu/hot-latte.jpg",
        coffeeShopId: mainShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Hot Cappuccino",
        price: 1200,
        imageUrl: "/menu/cappuccino.jpg",
        coffeeShopId: mainShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Hot Mocha",
        price: 1300,
        imageUrl: "/menu/mocha.jpg",
        coffeeShopId: mainShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Hot Chocolate",
        price: 1100,
        imageUrl: "/menu/hot-chocolate.jpg",
        coffeeShopId: mainShop.insertedId.toString(),
        createdAt: new Date(),
      },
    ];

    await mongoose.connection.collection("products").insertMany(products);
    console.log("Created menu items");

    // Create additional items
    const additionalItems = [
      {
        name: "Extra Shot",
        price: 300,
        coffeeShopId: mainShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Almond Milk",
        price: 500,
        coffeeShopId: mainShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Vanilla Syrup",
        price: 200,
        coffeeShopId: mainShop.insertedId.toString(),
        createdAt: new Date(),
      },
    ];

    await mongoose.connection
      .collection("additionalitems")
      .insertMany(additionalItems);
    console.log("Created additional items");

    // Create loyalty program
    const loyaltyProgram = {
      shopId: mainShop.insertedId.toString(),
      name: "Coffee Rewards",
      earningRate: 0.1, // 10% back in points
      pointExpiryDays: 365,
      tiers: [
        {
          key: "bronze",
          name: "Bronze",
          minPoints: 0,
          multiplier: 1.0,
        },
        {
          key: "silver",
          name: "Silver",
          minPoints: 1000,
          multiplier: 1.5,
        },
        {
          key: "gold",
          name: "Gold",
          minPoints: 3000,
          multiplier: 2.0,
        },
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await mongoose.connection
      .collection("loyaltyprograms")
      .insertOne(loyaltyProgram);
    console.log("Created loyalty program");

    // Create rewards
    const rewards = [
      {
        shopId: mainShop.insertedId.toString(),
        title: "Free Americano",
        description: "Get a free hot or iced americano",
        pointsCost: 1000,
        type: "free_item",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        shopId: mainShop.insertedId.toString(),
        title: "50% Off Any Drink",
        description: "Get 50% off any drink",
        pointsCost: 2000,
        type: "discount",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await mongoose.connection.collection("rewards").insertMany(rewards);
    console.log("Created rewards");

    // Create employee user
    const employeeUser = await mongoose.connection
      .collection("users")
      .insertOne({
        role: "employee",
        name: "Main Shop Employee",
        phone: "+77021234567",
        pin: await bcrypt.hash("1234", 10),
        coffeeShopId: mainShop.insertedId.toString(),
        createdAt: new Date(),
      });

    console.log("Created employee user");

    console.log("\nShop initialization complete!");
    console.log("\nCredentials:");
    console.log("Admin: +77011234567 (PIN: 1234)");
    console.log("Employee: +77021234567 (PIN: 1234)");

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

resetDatabase();
