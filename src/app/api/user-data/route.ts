import { NextRequest, NextResponse } from "next/server";
import { LiveUserService } from "@/server/codeforces/live-user-service";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const handle = searchParams.get("handle") || "AC_on_first_TRY";
  const force = searchParams.get("force") === "true";

  if (!handle || typeof handle !== "string" || handle.trim().length === 0) {
    return NextResponse.json(
      { error: "Valid handle is required" },
      { status: 400 }
    );
  }

  try {
    const data = await LiveUserService.getUserDashboardData(handle.trim(), force);
    return NextResponse.json({
      success: true,
      handle: handle.trim(),
      data,
    });
  } catch (error: any) {
    console.error(`Error fetching user data for ${handle}:`, error);
    return NextResponse.json(
      {
        error: error.message ?? `Failed to fetch data for handle "${handle}"`,
        handle: handle.trim(),
      },
      { status: 404 }
    );
  }
}
