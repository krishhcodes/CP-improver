import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/server/auth/auth-service";
import { SESSION_COOKIE_NAME } from "@/server/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await AuthService.register(body);

    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    const isDbUnreachable =
      error?.name === "PrismaClientInitializationError" ||
      error?.message?.includes("Can't reach database server");

    if (isDbUnreachable) {
      return NextResponse.json(
        {
          error:
            "Database unreachable. Please ensure PostgreSQL is running at DATABASE_URL.",
          isDatabaseOffline: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error?.message ?? "Registration failed" },
      { status: 400 }
    );
  }
}
