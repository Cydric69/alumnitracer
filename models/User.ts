// models/User.ts (Complete Fixed Version)
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: "admin" | "super-admin";
  isActive: boolean;
  lastLogin?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  loginAttempts: number;
  lockUntil?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
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

// Hash password before saving - no next() needed in async middleware
UserSchema.pre("save", async function () {
  // Only hash if password is modified
  if (!this.isModified("password")) return;

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Prevent model recompilation in development (Next.js hot reload)
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
