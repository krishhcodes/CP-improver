import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/server/auth/session";
import { UserRepository } from "@/server/db/repositories/user-repo";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  try {
    const user = await UserRepository.findById(session.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        handle: user.codeforcesProfile?.handle,
        rating: user.codeforcesProfile?.rating,
        rank: user.codeforcesProfile?.rank,
        avatar: user.codeforcesProfile?.avatar,
      },
    });
  } catch {
    // Fallback using session claims if DB is offline
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        username: session.username,
        handle: session.handle,
      },
    });
  }
}
