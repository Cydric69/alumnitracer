// services/authService.ts
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import User, { IUser } from "@/models/User";
import { dbConnect } from "@/lib/dbConnect";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token?: string;
  message?: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

class AuthService {
  // Generate JWT Token - CORRECTED
  generateToken(user: IUser): string {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    // Convert string expiresIn to number of seconds
    let expiresInSeconds: number;

    if (JWT_EXPIRES_IN.endsWith("h")) {
      const hours = parseInt(JWT_EXPIRES_IN);
      expiresInSeconds = hours * 60 * 60;
    } else if (JWT_EXPIRES_IN.endsWith("d")) {
      const days = parseInt(JWT_EXPIRES_IN);
      expiresInSeconds = days * 24 * 60 * 60;
    } else if (JWT_EXPIRES_IN.endsWith("m")) {
      const minutes = parseInt(JWT_EXPIRES_IN);
      expiresInSeconds = minutes * 60;
    } else {
      expiresInSeconds = parseInt(JWT_EXPIRES_IN) || 24 * 60 * 60; // Default to 24h
    }

    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
  }

  // Alternative: Simple version without expiresIn parsing
  generateTokenSimple(user: IUser): string {
    return jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" } // Direct string
    );
  }

  // Verify JWT Token
  verifyToken(token: string): AuthTokenPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Type guard to ensure decoded is an object with expected properties
      if (typeof decoded === "object" && decoded !== null) {
        const payload = decoded as any;
        return {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          iat: payload.iat,
          exp: payload.exp,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    const payload = this.verifyToken(token);
    if (!payload) return true;

    return Date.now() >= payload.exp * 1000;
  }

  // Login with security features
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      await dbConnect();

      // Find user with password
      const user = await User.findOne({
        email: email.toLowerCase().trim(),
        role: { $in: ["admin", "super-admin"] },
      }).select("+password");

      if (!user) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          message: "Account is deactivated",
        };
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > new Date()) {
        const lockTime = Math.ceil(
          (user.lockUntil.getTime() - Date.now()) / 60000
        );
        return {
          success: false,
          message: `Account locked. Try again in ${lockTime} minutes.`,
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        // Increment failed login attempts
        const newAttempts = (user.loginAttempts || 0) + 1;

        const updateData: any = {
          loginAttempts: newAttempts,
        };

        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }

        await User.updateOne({ _id: user._id }, updateData);

        const attemptsLeft = 5 - newAttempts;
        return {
          success: false,
          message:
            attemptsLeft > 0
              ? `Invalid password. ${attemptsLeft} attempt${
                  attemptsLeft !== 1 ? "s" : ""
                } remaining.`
              : "Account locked for 15 minutes.",
        };
      }

      // Successful login - reset attempts and update last login
      await User.updateOne(
        { _id: user._id },
        {
          loginAttempts: 0,
          lockUntil: null,
          lastLogin: new Date(),
        }
      );

      // Generate token using simple version
      const token = this.generateTokenSimple(user);

      // Return user data (without sensitive info)
      return {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "An error occurred during login",
      };
    }
  }

  // Get current user
  async getCurrentUser(token: string): Promise<IUser | null> {
    try {
      const payload = this.verifyToken(token);
      if (!payload) return null;

      await dbConnect();

      return await User.findOne({
        _id: payload.userId,
        isActive: true,
      });
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  // Forgot password
  async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string; resetToken?: string }> {
    try {
      await dbConnect();

      const user = await User.findOne({
        email: email.toLowerCase().trim(),
        role: { $in: ["admin", "super-admin"] },
        isActive: true,
      });

      if (!user) {
        // Don't reveal if user exists
        return {
          success: true,
          message:
            "If an account exists with this email, you will receive a reset link.",
        };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

      await User.updateOne(
        { _id: user._id },
        {
          resetToken,
          resetTokenExpiry,
        }
      );

      return {
        success: true,
        message: "Password reset link sent to your email.",
        resetToken, // In production, send via email
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        message: "Failed to process password reset",
      };
    }
  }

  // Reset password
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await dbConnect();

      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() },
        isActive: true,
      });

      if (!user) {
        return {
          success: false,
          message: "Invalid or expired reset token",
        };
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token
      await User.updateOne(
        { _id: user._id },
        {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
          loginAttempts: 0,
          lockUntil: null,
        }
      );

      return {
        success: true,
        message: "Password reset successful.",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: "Failed to reset password",
      };
    }
  }

  // Change password
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await dbConnect();

      const user = await User.findById(userId).select("+password");
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return {
          success: false,
          message: "Current password is incorrect",
        };
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await User.updateOne({ _id: userId }, { password: hashedPassword });

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        message: "Failed to change password",
      };
    }
  }

  // Create initial admin (for setup)
  async createInitialAdmin(
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; message: string; admin?: IUser }> {
    try {
      await dbConnect();

      // Check if any admin exists
      const existingAdmin = await User.findOne({
        role: { $in: ["admin", "super-admin"] },
      });

      if (existingAdmin) {
        return {
          success: false,
          message: "Admin already exists.",
        };
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create admin
      const admin = await User.create({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        role: "super-admin",
        isActive: true,
      });

      return {
        success: true,
        message: "Admin created successfully.",
        admin,
      };
    } catch (error) {
      console.error("Create admin error:", error);
      return {
        success: false,
        message: "Failed to create admin",
      };
    }
  }

  // Set auth cookie
  setAuthCookie(token: string, response: NextResponse): NextResponse {
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  }

  // Clear auth cookie
  clearAuthCookie(response: NextResponse): NextResponse {
    response.cookies.delete("auth-token");
    return response;
  }
}

export const authService = new AuthService();
