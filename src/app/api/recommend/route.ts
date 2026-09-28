import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/server/auth/session";
import {
  generateRecommendations,
  ProblemCandidate,
  RecommendationCategory,
} from "@/server/recommendations/recommendation-engine";
import { MOCK_TOPIC_WEAKNESSES } from "@/lib/mock-data";

const FALLBACK_CANDIDATE_PROBLEMS: ProblemCandidate[] = [
  {
    id: "1285-D",
    contestId: 1285,
    index: "D",
    name: "Dr. Evil Underscores",
    rating: 1500,
    tags: ["bitmasks", "dp", "trees"],
    solvedCount: 12400,
  },
  {
    id: "1946-C",
    contestId: 1946,
    index: "C",
    name: "Tree Cutting",
    rating: 1700,
    tags: ["binary search", "dfs and similar", "dp", "trees"],
    solvedCount: 8900,
  },
  {
    id: "1968-D",
    contestId: 1968,
    index: "D",
    name: "Permutation Game",
    rating: 1400,
    tags: ["games", "greedy", "math"],
    solvedCount: 16500,
  },
  {
    id: "1100-E",
    contestId: 1100,
    index: "E",
    name: "Andrew and Taxi",
    rating: 1800,
    tags: ["binary search", "dfs and similar", "graphs"],
    solvedCount: 5400,
  },
  {
    id: "970-D",
    contestId: 970,
    index: "D",
    name: "Colored Portals",
    rating: 1600,
    tags: ["binary search", "data structures", "graphs"],
    solvedCount: 9200,
  },
  {
    id: "970-E",
    contestId: 970,
    index: "E",
    name: "Not a Nim Problem",
    rating: 1800,
    tags: ["games", "math", "number theory"],
    solvedCount: 6100,
  },
  {
    id: "962-E",
    contestId: 962,
    index: "E",
    name: "Decode",
    rating: 1500,
    tags: ["combinatorics", "dp", "math"],
    solvedCount: 11200,
  },
  {
    id: "1352-E",
    contestId: 1352,
    index: "E",
    name: "Special Elements",
    rating: 1500,
    tags: ["two pointers", "implementation"],
    solvedCount: 14200,
  },
  {
    id: "1850-F",
    contestId: 1850,
    index: "F",
    name: "We Were Both Children",
    rating: 1300,
    tags: ["math", "number theory"],
    solvedCount: 19000,
  },
  {
    id: "1676-G",
    contestId: 1676,
    index: "G",
    name: "White-Black Balanced Subtrees",
    rating: 1300,
    tags: ["dfs and similar", "dp", "trees"],
    solvedCount: 22100,
  },
  {
    id: "1791-G2",
    contestId: 1791,
    index: "G2",
    name: "Teleporters (Hard Version)",
    rating: 1700,
    tags: ["binary search", "greedy", "sortings"],
    solvedCount: 7800,
  },
  {
    id: "1915-F",
    contestId: 1915,
    index: "F",
    name: "Greetings",
    rating: 1500,
    tags: ["data structures", "sortings"],
    solvedCount: 13500,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const topicParam = searchParams.get("topic") ?? undefined;
    const limitParam = searchParams.get("limit");
    const ratingParam = searchParams.get("rating");
    const handleParam = searchParams.get("handle");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const validCategory =
      categoryParam && categoryParam !== "ALL"
        ? (categoryParam.toUpperCase() as RecommendationCategory)
        : undefined;

    const session = await getSessionUser(request);
    let userRating = ratingParam ? parseInt(ratingParam, 10) : 1748;
    const userSolvedKeys = new Set<string>();
    let candidateProblems = FALLBACK_CANDIDATE_PROBLEMS;

    const topicWeaknesses = new Map<string, number>();
    for (const tw of MOCK_TOPIC_WEAKNESSES) {
      topicWeaknesses.set(tw.tag.toLowerCase(), tw.weaknessScore);
    }

    if (handleParam && handleParam.trim() && handleParam.toLowerCase() !== "alex_algo") {
      try {
        const { LiveUserService } = await import("@/server/codeforces/live-user-service");
        const liveData = await LiveUserService.getUserDashboardData(handleParam.trim());
        userRating = liveData.profile.rating || userRating;
        liveData.recentSubmissions
          .filter((s) => s.verdict === "OK")
          .forEach((s) => userSolvedKeys.add(`${s.contestId || 0}-${s.problemIndex}`));
        liveData.topicWeaknesses.forEach((tw) => {
          topicWeaknesses.set(tw.tag.toLowerCase(), tw.weaknessScore);
        });
      } catch (err) {
        console.warn("Could not load live user for recommendations:", err);
      }
    } else if (session?.userId) {
      try {
        const userProfile = await prisma.codeforcesProfile.findUnique({
          where: { userId: session.userId },
        });
        if (userProfile?.rating) {
          userRating = userProfile.rating;
        }

        const solved = await prisma.submission.findMany({
          where: { userId: session.userId, verdict: "OK" },
          select: { problemId: true, problem: { select: { codeforcesContestId: true, index: true } } },
        });

        for (const s of solved) {
          userSolvedKeys.add(s.problemId);
          if (s.problem.codeforcesContestId) {
            userSolvedKeys.add(`${s.problem.codeforcesContestId}-${s.problem.index}`);
          }
        }

        const dbProblems = await prisma.problem.findMany({
          include: { tags: true },
          take: 200,
        });

        if (dbProblems.length > 0) {
          candidateProblems = dbProblems.map((p) => ({
            id: p.id,
            contestId: p.codeforcesContestId,
            index: p.index,
            name: p.name,
            rating: p.rating,
            tags: p.tags.map((t) => t.tag),
            solvedCount: p.solvedCount,
          }));
        }
      } catch (dbErr: any) {
        console.warn("DB query skipped in recommend route:", dbErr?.message);
      }
    }

    const recommendations = generateRecommendations({
      candidateProblems,
      userSolvedProblemKeys: userSolvedKeys,
      userRating,
      topicWeaknesses,
      category: validCategory,
      topicFilter: topicParam,
      limit,
    });

    return NextResponse.json({
      success: true,
      userRating,
      category: validCategory ?? "ALL",
      count: recommendations.length,
      recommendations,
    });
  } catch (error: any) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
