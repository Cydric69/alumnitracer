// test-connection.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Collection, Document } from "mongodb";

// Load environment variables
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://lordcydric:Cydric123@ac-ljoy69t-shard-00-00.xdrhubk.mongodb.net:27017,ac-ljoy69t-shard-00-01.xdrhubk.mongodb.net:27017,ac-ljoy69t-shard-00-02.xdrhubk.mongodb.net:27017/alumni?replicaSet=atlas-e4n3kd-shard-0&ssl=true&authSource=admin";

interface ConnectionResult {
  success: boolean;
  message: string;
  error?: any;
}

interface IPResponse {
  ip: string;
}

interface CollectionInfo {
  name: string;
  type?: string;
  options?: Document;
  info?: {
    readOnly?: boolean;
    uuid?: string;
  };
  idIndex?: Document;
}

async function testConnection(): Promise<ConnectionResult> {
  console.log("🔍 Testing MongoDB Atlas connection...");
  console.log(
    "📝 Connection string:",
    MONGODB_URI.replace(/mongodb:\/\/([^:]+):([^@]+)@/, "mongodb://***:***@"),
  );

  try {
    // Set connection options
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log("⏳ Attempting to connect...");

    await mongoose.connect(MONGODB_URI, options);

    console.log("✅ Successfully connected to MongoDB Atlas!");

    // Check if we can access the alumni database
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Database connection not established");
    }

    console.log("📊 Database name:", db.databaseName);

    // List collections in the alumni database with proper typing
    const collections: CollectionInfo[] = (await db
      .listCollections()
      .toArray()) as CollectionInfo[];
    console.log("📁 Collections in alumni database:");
    collections.forEach((collection: CollectionInfo) => {
      console.log(`   - ${collection.name}`);
    });

    // Check connection state
    const state = mongoose.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    console.log(`🔌 Connection state: ${states[state]}`);

    // Close the connection
    await mongoose.connection.close();
    console.log("👋 Connection closed successfully");

    return {
      success: true,
      message: "Successfully connected to MongoDB Atlas",
    };
  } catch (error: any) {
    console.error("❌ Connection failed!");
    console.error("Error message:", error.message);

    // Detailed error information
    if (error.name === "MongooseServerSelectionError") {
      console.error("\n🔍 Detailed diagnosis:");
      console.error("1. Check if your IP is whitelisted in MongoDB Atlas");
      console.error(
        "2. Go to: Network Access → Add IP Address → Add Current IP",
      );
      console.error("3. Current IP:", await getCurrentIP());
      console.error("4. Check if cluster is running (not paused)");
      console.error("5. Verify username and password are correct");
    }

    if (error.name === "MongoServerError" && error.code === 18) {
      console.error("\n🔐 Authentication failed!");
      console.error(
        "Check your username and password in the connection string",
      );
    }

    console.error("\nFull error object:", {
      name: error.name,
      code: error.code,
      errorLabelSet: error.errorLabelSet,
    });

    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
}

async function getCurrentIP(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = (await response.json()) as IPResponse;
    return data.ip;
  } catch (error) {
    return "Unable to determine IP automatically. Visit https://api.ipify.org in your browser";
  }
}

// Alternative: Using MongoClient directly
async function testWithMongoClient(): Promise<void> {
  console.log("\n🔍 Testing with MongoClient directly...");

  const { MongoClient } = require("mongodb");

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  try {
    await client.connect();
    console.log("✅ MongoClient connected successfully!");

    const db = client.db("alumni");
    const collections: CollectionInfo[] = (await db
      .listCollections()
      .toArray()) as CollectionInfo[];

    console.log(
      "📁 Collections:",
      collections.map((c: CollectionInfo) => c.name),
    );

    await client.close();
    console.log("👋 Connection closed");
  } catch (error: any) {
    console.error("❌ MongoClient connection failed:", error.message);
  }
}

// Main execution
async function main(): Promise<void> {
  console.log("🚀 MongoDB Atlas Connection Test\n");
  console.log("=".repeat(50));

  const result = await testConnection();

  console.log("\n" + "=".repeat(50));

  if (result.success) {
    console.log("\n✨ Connection test PASSED!");
    console.log("Your MongoDB connection is working correctly.");
  } else {
    console.log("\n💥 Connection test FAILED!");
    console.log("\n📋 Troubleshooting checklist:");
    console.log("□ Is your IP whitelisted in Atlas? (Network Access)");
    console.log("□ Is your cluster running? (Clusters page)");
    console.log("□ Are your credentials correct? (Database Access)");
    console.log("□ Is your connection string correct? (.env.local)");
    console.log("□ Are you behind a VPN or firewall?");

    console.log("\n🔧 Quick fix commands:");
    console.log("1. Get your IP: curl ifconfig.me");
    console.log(
      "2. Add to Atlas: Network Access → Add IP Address → Add Current IP",
    );
  }

  // Exit process
  process.exit(result.success ? 0 : 1);
}

// Run the test
main().catch(console.error);
