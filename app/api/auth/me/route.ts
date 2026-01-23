// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/authService";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await authService.getCurrentUser(token);

    if (!user) {
      const response = NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
      authService.clearAuthCookie(response);
      return response;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
