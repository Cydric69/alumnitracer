// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { authService } from "@/services/authService";

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    return authService.clearAuthCookie(response);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
