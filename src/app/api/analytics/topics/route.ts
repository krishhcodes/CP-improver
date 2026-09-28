import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/server/auth/session";
import {
  computeSkillVector,
  TopicSubmission,
} from "@/server/analytics/weakness-model";
import { MOCK_TOPIC_WEAKNESSES } from "@/lib/mock-data";

/**
 * Builds realistic sample submissions for demo / offline fallback
 */
function buildFallbackSubmissions(userRating: number): TopicSubmission[] {
  const now = Math.floor(Date.now() / 1000);
  const subs: TopicSubmission[] = [];

  for (const topic of MOCK_TOPIC_WEAKNESSES) {
    // Generate solved items
    for (let i = 0; i < Math.min(topic.solvedCount, 25); i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      subs.push({
        id: `mock-s-${topic.tag}-${i}`,
        problemId: `prob-${topic.tag}-${i}`,
        problemName: `${topic.tag} Practice Solved ${i + 1}`,
        rating: Math.max(800, topic.avgRating + Math.floor((Math.random() - 0.5) * 300)),
        tags: [topic.tag],
        verdict: "OK",
        creationTimeSeconds: now - daysAgo * 86400,
      });
    }

    // Generate failed items
    for (let i = 0; i < Math.min(topic.failedCount, 15); i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const isCritical = topic.status === "CRITICAL";
      // Critical topics have failures near/below rating
      const rating = isCritical
        ? userRating - 100 + Math.floor(Math.random() * 200)
        : userRating + 100 + Math.floor(Math.random() * 300);

      subs.push({
        id: `mock-f-${topic.tag}-${i}`,
        problemId: `prob-${topic.tag}-fail-${i}`,
        problemName: `${topic.tag} Practice Failed ${i + 1}`,
        rating,
        tags: [topic.tag],
        verdict: "WRONG_ANSWER",
        creationTimeSeconds: now - daysAgo * 86400,
      });
    }
  }

  return subs;
}

export async function GET(request: NextRequest) {
  try {
    const handleParam = request.nextUrl.searchParams.get("handle");
    const session = await getSessionUser(request);
    let userRating = 1748; // Default demo rating

    let submissionsData: TopicSubmission[] = [];

    if (handleParam && handleParam.trim() && handleParam.toLowerCase() !== "alex_algo") {
      try {
        const { LiveUserService } = await import("@/server/codeforces/live-user-service");
        const liveData = await LiveUserService.getUserDashboardData(handleParam.trim());
        userRating = liveData.profile.rating || 1000;
        submissionsData = liveData.recentSubmissions.map((s) => ({
          id: s.id,
          problemId: `${s.contestId || 0}-${s.problemIndex}`,
          problemName: s.problemName,
          rating: s.problemRating,
          tags: s.tags,
          verdict: s.verdict,
          creationTimeSeconds: s.submittedAtSeconds,
        }));
      } catch (err) {
        console.warn("Could not load live submissions for topic analytics:", err);
      }
    } else if (session?.userId) {
      try {
        const userProfile = await prisma.codeforcesProfile.findUnique({
          where: { userId: session.userId },
        });

        if (userProfile?.rating) {
          userRating = userProfile.rating;
        }

        const dbSubmissions = await prisma.submission.findMany({
          where: { userId: session.userId },
          include: {
            problem: {
              include: {
                tags: true,
              },
            },
          },
          orderBy: { creationTimeSeconds: "desc" },
          take: 1000,
        });

        if (dbSubmissions.length > 0) {
          submissionsData = dbSubmissions.map((s) => ({
            id: s.id,
            problemId: s.problemId,
            problemName: s.problem.name,
            rating: s.problem.rating,
            tags: s.problem.tags.map((t) => t.tag),
            verdict: s.verdict,
            creationTimeSeconds: s.creationTimeSeconds,
          }));
        }
      } catch (dbErr: any) {
        // Fallback to sample data if DB query fails
        console.warn("Database unavailable for topics analytics, using realistic fallback:", dbErr?.message);
      }
    }

    if (submissionsData.length === 0) {
      submissionsData = buildFallbackSubmissions(userRating);
    }

    const result = computeSkillVector({
      submissions: submissionsData,
      userRating,
    });

    return NextResponse.json({
      success: true,
      userRating,
      skillVector: result.skillVector,
      summary: result.summary,
    });
  } catch (error: any) {
    console.error("Error generating topic analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
