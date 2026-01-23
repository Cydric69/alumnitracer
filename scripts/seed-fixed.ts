// scripts/seed-fixed.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

async function seedAdmin() {
  try {
    console.log("🚀 Starting admin seed...");

    // Load environment variables
    require("dotenv").config({ path: ".env.local" });

    const MONGODB_URI = process.env.MONGODB_URI!;

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env.local");
    }

    // Connect to MongoDB
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Define User schema directly (avoid import issues)
    const UserSchema = new mongoose.Schema(
      {
        email: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true,
        },
        password: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          default: "admin",
          enum: ["admin", "super-admin"],
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        lastLogin: Date,
        resetToken: String,
        resetTokenExpiry: Date,
        loginAttempts: {
          type: Number,
          default: 0,
        },
        lockUntil: Date,
      },
      {
        timestamps: true,
        collection: "users",
      }
    );

    // Add pre-save hook for hashing - SIMPLIFIED VERSION (no next parameter)
    UserSchema.pre("save", async function () {
      // Only hash if password is modified
      // @ts-ignore - TypeScript workaround
      if (!this.isModified("password")) return;

      // @ts-ignore - TypeScript workaround
      const user = this;

      try {
        const salt = await bcrypt.genSalt(12);
        // @ts-ignore - TypeScript workaround
        user.password = await bcrypt.hash(user.password, salt);
      } catch (error: any) {
        throw error;
      }
    });

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    // Check if admin exists
    const existingAdmin = await User.findOne({
      email: "admin@alumni.edu",
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin._id}`);

      // Test the password
      const testPassword = "Admin@123!";
      const isMatch = await bcrypt.compare(
        testPassword,
        existingAdmin.password
      );
      console.log(`   Password test: ${isMatch ? "✅ CORRECT" : "❌ WRONG"}`);

      await mongoose.disconnect();
      return;
    }

    // Create admin - IMPORTANT: Use the same method as your app
    const adminData = {
      email: "admin@alumni.edu",
      password: "Admin@123!", // Raw password - will be hashed by pre-save hook
      name: "Alumni Admin",
      role: "super-admin" as const,
    };

    console.log("\n🔐 Creating admin account...");

    // Create user - Mongoose will trigger the pre-save hook
    const admin = await User.create({
      email: adminData.email.toLowerCase().trim(),
      password: adminData.password, // Will be hashed by pre-save hook
      name: adminData.name.trim(),
      role: adminData.role,
      isActive: true,
      loginAttempts: 0,
    });

    console.log("\n🎉 ADMIN ACCOUNT CREATED!");
    console.log("============================");
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: ${adminData.password}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`🎯 Role: ${admin.role}`);
    console.log(`🆔 ID: ${admin._id}`);
    console.log(`🔐 Password hash: ${admin.password.substring(0, 30)}...`);
    console.log("============================");

    // Test login immediately
    console.log("\n🔍 Testing password verification...");
    const testPassword = "Admin@123!";
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    console.log(
      `Password test: ${
        isMatch
          ? "✅ SUCCESS - Password will work!"
          : "❌ FAILED - Something wrong"
      }`
    );

    console.log("\n⚠️  IMPORTANT:");
    console.log("   - Change password after first login");
    console.log("   - Store credentials securely");
  } catch (error: any) {
    console.error("❌ Seed failed:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("\n🔌 Disconnected from MongoDB");
    }
    process.exit(0);
  }
}

// Run seed
seedAdmin();
