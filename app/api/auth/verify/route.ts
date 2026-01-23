// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/authService";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No authentication token" },
        { status: 401 }
      );
    }

    const tokenResult = authService.verifyToken(token);

    if (!tokenResult || authService.isTokenExpired(token)) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: tokenResult.userId,
        email: tokenResult.email,
        role: tokenResult.role,
      },
    });
  } catch (error: any) {
    console.error("Auth verification error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
