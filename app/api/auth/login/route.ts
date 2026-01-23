// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/authService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Authenticate user
    const result = await authService.login(email, password);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
      redirectTo: "/dashboard", // Add redirect URL
    });

    // Set HTTP-only cookie for authentication
    response.cookies.set({
      name: "auth-token",
      value: result.token!,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Set user info in cookies for client-side access (non-sensitive data only)
    response.cookies.set({
      name: "user-info",
      value: JSON.stringify({
        id: result.user!.id,
        email: result.user!.email,
        name: result.user!.name,
        role: result.user!.role,
      }),
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Optional: Add logout endpoint
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear authentication cookies
    response.cookies.delete("auth-token");
    response.cookies.delete("user-info");

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
