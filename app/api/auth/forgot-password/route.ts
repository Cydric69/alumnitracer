// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/authService";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = forgotPasswordSchema.parse(body);

    // Process forgot password
    const result = await authService.forgotPassword(validatedData.email);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Forgot password API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.errors?.[0]?.message || "Invalid request",
      },
      { status: 400 }
    );
  }
}
