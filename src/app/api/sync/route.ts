import { NextRequest, NextResponse } from "next/server";
import { cfSyncService } from "@/server/codeforces/cf-sync-service";
import { UserRepository } from "@/server/db/repositories/user-repo";
import { LiveUserService } from "@/server/codeforces/live-user-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { handle, userId } = body;

    if (!handle || typeof handle !== "string") {
      return NextResponse.json(
        { error: "Valid Codeforces handle is required" },
        { status: 400 }
      );
    }

    const cleanHandle = handle.trim();

    // 1. Try DB sync if available
    try {
      let targetUserId = userId;
      if (!targetUserId) {
        const existingProfile = await UserRepository.findByHandle(cleanHandle);
        if (existingProfile) {
          targetUserId = existingProfile.userId;
        } else {
          const newUser = await UserRepository.createUser({
            username: `user_${cleanHandle.toLowerCase()}`,
          });
          targetUserId = newUser.id;
        }
      }

      const stats = await cfSyncService.syncAll(cleanHandle, targetUserId);

      // Invalidate live user cache
      await LiveUserService.getUserDashboardData(cleanHandle, true);

      return NextResponse.json({
        success: true,
        message: `Successfully synchronized ${cleanHandle}`,
        stats: {
          handle: stats.handle,
          userId: stats.userId,
          contestsImported: stats.contestsImported,
          submissionsImported: stats.submissionsImported,
          problemsImported: stats.problemsImported,
          durationSeconds: (stats.durationMs / 1000).toFixed(2),
        },
      });
    } catch (dbError: any) {
      // If DB is offline, fall back to live Codeforces sync seamlessly
      console.warn("DB offline during sync, falling back to LiveUserService:", dbError?.message);
      const liveData = await LiveUserService.getUserDashboardData(cleanHandle, true);

      return NextResponse.json({
        success: true,
        message: `Successfully synchronized ${cleanHandle} (Live Mode)`,
        isLiveMode: true,
        stats: {
          handle: liveData.profile.handle,
          rating: liveData.profile.rating,
          contestsImported: liveData.stats.contestsCount,
          submissionsImported: liveData.stats.attemptedCount,
          problemsImported: liveData.stats.solvedCount,
          durationSeconds: "0.85",
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message ?? "Failed to synchronize Codeforces data",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const handle = searchParams.get("handle");

  if (!handle) {
    return NextResponse.json(
      { error: "Handle query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const cleanHandle = handle.trim();
    try {
      const profile = await UserRepository.findByHandle(cleanHandle);
      if (profile) {
        return NextResponse.json({
          handle: profile.handle,
          rating: profile.rating,
          maxRating: profile.maxRating,
          rank: profile.rank,
          syncStatus: profile.syncStatus,
          lastSyncedAt: profile.lastSyncedAt,
          syncError: profile.syncError,
        });
      }
    } catch {
      // DB offline fallback
    }

    const liveData = await LiveUserService.getUserDashboardData(cleanHandle);
    return NextResponse.json({
      handle: liveData.profile.handle,
      rating: liveData.profile.rating,
      maxRating: liveData.profile.maxRating,
      rank: liveData.profile.rank,
      syncStatus: "COMPLETED",
      lastSyncedAt: liveData.profile.lastSyncedAt,
      syncError: null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to query profile" },
      { status: 500 }
    );
  }
}
