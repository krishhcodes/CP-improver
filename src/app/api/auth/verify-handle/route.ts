import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/server/auth/auth-service";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const handle = searchParams.get("handle");

  if (!handle || handle.trim().length < 2) {
    return NextResponse.json(
      { error: "Handle must be at least 2 characters" },
      { status: 400 }
    );
  }

  try {
    const cfUser = await AuthService.verifyCodeforcesHandle(handle.trim());
    return NextResponse.json({
      valid: true,
      user: {
        handle: cfUser.handle,
        rating: cfUser.rating ?? 0,
        maxRating: cfUser.maxRating ?? 0,
        rank: cfUser.rank ?? "Unrated",
        avatar: cfUser.avatar,
        contribution: cfUser.contribution,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        valid: false,
        error: error.message ?? "Could not verify handle",
      },
      { status: 404 }
    );
  }
}
