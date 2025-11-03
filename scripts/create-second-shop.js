import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;

async function createSecondShop() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Create admin user first
    const adminUser = await mongoose.connection.collection("users").insertOne({
      role: "admin",
      name: "Second Shop Admin",
      phone: "+77031234567",
      pin: await bcrypt.hash("1234", 10),
      createdAt: new Date(),
    });

    console.log("Created second shop admin user");

    // Create second shop
    const secondShop = await mongoose.connection
      .collection("coffeeshops")
      .insertOne({
        name: "Coffee Express",
        location: "Astana",
        address: "Kabanbay Batyr Avenue, 62",
        adminId: adminUser.insertedId.toString(),
        isActive: true,
        createdAt: new Date(),
      });

    console.log("Created second shop");

    // Update admin user with shop ID
    await mongoose.connection
      .collection("users")
      .updateOne(
        { _id: adminUser.insertedId },
        { $set: { coffeeShopId: secondShop.insertedId.toString() } }
      );

    // Create some menu items
    const products = [
      {
        name: "Ice Americano",
        price: 1000,
        imageUrl: "/menu/ice-americano.jpg",
        coffeeShopId: secondShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Ice Latte",
        price: 1400,
        imageUrl: "/menu/ice-latte.jpg",
        coffeeShopId: secondShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Matcha Latte",
        price: 1500,
        imageUrl: "/menu/matcha-latte.jpg",
        coffeeShopId: secondShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Caramel Frappuccino",
        price: 1600,
        imageUrl: "/menu/caramel-frappuccino.jpg",
        coffeeShopId: secondShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Bubble Tea",
        price: 1300,
        imageUrl: "/menu/bubble-tea.jpg",
        coffeeShopId: secondShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Taro Milk Tea",
        price: 1400,
        imageUrl: "/menu/taro-milk-tea.jpg",
        coffeeShopId: secondShop.insertedId.toString(),
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
        coffeeShopId: secondShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Coconut Milk",
        price: 400,
        coffeeShopId: secondShop.insertedId.toString(),
        createdAt: new Date(),
      },
      {
        name: "Brown Sugar",
        price: 200,
        coffeeShopId: secondShop.insertedId.toString(),
        createdAt: new Date(),
      },
    ];

    await mongoose.connection
      .collection("additionalitems")
      .insertMany(additionalItems);
    console.log("Created additional items");

    // Create loyalty program
    const loyaltyProgram = {
      shopId: secondShop.insertedId.toString(),
      name: "Express Points",
      earningRate: 0.15, // 15% back in points
      pointExpiryDays: 365,
      tiers: [
        {
          key: "regular",
          name: "Regular",
          minPoints: 0,
          multiplier: 1.0,
        },
        {
          key: "vip",
          name: "VIP",
          minPoints: 2000,
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
        shopId: secondShop.insertedId.toString(),
        title: "Free Ice Americano",
        description: "Redeem for a free Ice Americano",
        pointsCost: 1200,
        type: "free_item",
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
        name: "Second Shop Employee",
        phone: "+77041234567",
        pin: await bcrypt.hash("1234", 10),
        coffeeShopId: secondShop.insertedId.toString(),
        createdAt: new Date(),
      });

    console.log("Created employee user");

    // Create some tasks
    const tasks = [
      {
        description: "Check ice machine",
        status: "pending",
        coffeeShopId: secondShop.insertedId.toString(),
        employeeId: employeeUser.insertedId.toString(),
        isGlobal: false,
        createdAt: new Date(),
      },
    ];

    await mongoose.connection.collection("tasks").insertMany(tasks);
    console.log("Created tasks");

    // Create a promotion
    const promotion = {
      type: "news",
      title: "New Location",
      description: "Visit our new location at Kabanbay Batyr Avenue!",
      coffeeShopId: secondShop.insertedId.toString(),
      isActive: true,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdBy: adminUser.insertedId.toString(),
      createdAt: new Date(),
    };

    await mongoose.connection.collection("promotions").insertOne(promotion);
    console.log("Created promotion");

    console.log("\nSecond shop initialization complete!");
    console.log("\nCredentials:");
    console.log("Admin: +77031234567 (PIN: 1234)");
    console.log("Employee: +77041234567 (PIN: 1234)");

    process.exit(0);
  } catch (error) {
    console.error("Error initializing second shop:", error);
    process.exit(1);
  }
}

createSecondShop();
