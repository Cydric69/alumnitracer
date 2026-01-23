// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/authService";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = resetPasswordSchema.parse(body);

    // Process password reset
    const result = await authService.resetPassword(
      validatedData.token,
      validatedData.password
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Reset password API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.errors?.[0]?.message || "Invalid request",
      },
      { status: 400 }
    );
  }
}
