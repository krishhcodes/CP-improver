import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/server/auth/session";
import { generateAdaptiveTrainingPlan } from "@/server/recommendations/training-plan";
import { ProblemCandidate } from "@/server/recommendations/recommendation-engine";

const CALIBRATED_TRAINING_PROBLEMS: ProblemCandidate[] = [
  // 800 - 1100 (Newbie / Pupil)
  { id: "4-A", contestId: 4, index: "A", name: "Watermelon", rating: 800, tags: ["brute force", "math"] },
  { id: "71-A", contestId: 71, index: "A", name: "Way Too Long Words", rating: 800, tags: ["strings"] },
  { id: "231-A", contestId: 231, index: "A", name: "Team", rating: 800, tags: ["brute force", "greedy"] },
  { id: "158-A", contestId: 158, index: "A", name: "Next Round", rating: 800, tags: ["implementation"] },
  { id: "282-A", contestId: 282, index: "A", name: "Bit++", rating: 800, tags: ["implementation"] },
  { id: "112-A", contestId: 112, index: "A", name: "Petya and Strings", rating: 800, tags: ["strings"] },
  { id: "263-A", contestId: 263, index: "A", name: "Beautiful Matrix", rating: 800, tags: ["implementation"] },
  { id: "96-A", contestId: 96, index: "A", name: "Football", rating: 900, tags: ["strings"] },
  { id: "160-A", contestId: 160, index: "A", name: "Twins", rating: 900, tags: ["greedy", "sortings"] },
  { id: "318-A", contestId: 318, index: "A", name: "Even Odds", rating: 900, tags: ["math"] },
  { id: "133-A", contestId: 133, index: "A", name: "HQ9+", rating: 900, tags: ["implementation"] },
  { id: "58-A", contestId: 58, index: "A", name: "Chat room", rating: 1000, tags: ["greedy", "strings"] },
  { id: "69-A", contestId: 69, index: "A", name: "Young Physicist", rating: 1000, tags: ["math"] },
  { id: "118-A", contestId: 118, index: "A", name: "String Task", rating: 1000, tags: ["strings"] },
  { id: "122-A", contestId: 122, index: "A", name: "Lucky Division", rating: 1000, tags: ["brute force", "number theory"] },
  { id: "479-A", contestId: 479, index: "A", name: "Expression", rating: 1000, tags: ["brute force", "math"] },
  { id: "1-A", contestId: 1, index: "A", name: "Theatre Square", rating: 1000, tags: ["math"] },
  { id: "230-A", contestId: 230, index: "A", name: "Dragons", rating: 1000, tags: ["greedy", "sortings"] },
  { id: "1352-C", contestId: 1352, index: "C", name: "K-th Not Divisible by n", rating: 1200, tags: ["binary search", "math"] },
  { id: "492-B", contestId: 492, index: "B", name: "Vanya and Lanterns", rating: 1200, tags: ["binary search", "sortings"] },
  { id: "489-C", contestId: 489, index: "C", name: "Given Length and Sum of Digits...", rating: 1400, tags: ["dp", "greedy"] },
  // 1400 - 1800 (Specialist / Expert)
  { id: "1285-D", contestId: 1285, index: "D", name: "Dr. Evil Underscores", rating: 1500, tags: ["dp", "bitmasks"] },
  { id: "1946-C", contestId: 1946, index: "C", name: "Tree Cutting", rating: 1700, tags: ["trees", "binary search"] },
  { id: "1968-D", contestId: 1968, index: "D", name: "Permutation Game", rating: 1400, tags: ["greedy", "math"] },
  { id: "1100-E", contestId: 1100, index: "E", name: "Andrew and Taxi", rating: 1800, tags: ["graphs", "dfs and similar"] },
  { id: "970-D", contestId: 970, index: "D", name: "Colored Portals", rating: 1600, tags: ["graphs", "binary search"] },
  { id: "970-E", contestId: 970, index: "E", name: "Not a Nim Problem", rating: 1800, tags: ["math", "games"] },
  { id: "962-E", contestId: 962, index: "E", name: "Decode", rating: 1500, tags: ["dp", "combinatorics"] },
  { id: "1352-E", contestId: 1352, index: "E", name: "Special Elements", rating: 1500, tags: ["two pointers"] },
  { id: "1850-F", contestId: 1850, index: "F", name: "We Were Both Children", rating: 1300, tags: ["math", "number theory"] },
  { id: "1791-G2", contestId: 1791, index: "G2", name: "Teleporters (Hard Version)", rating: 1700, tags: ["greedy", "binary search"] },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    const queryRating = request.nextUrl.searchParams.get("rating");
    const parsedQueryRating = queryRating ? parseInt(queryRating, 10) : null;
    let userRating = parsedQueryRating && !isNaN(parsedQueryRating) ? parsedQueryRating : 1000;
    const userSolvedKeys = new Set<string>();
    let candidateProblems = CALIBRATED_TRAINING_PROBLEMS;

    if (session?.userId) {
      try {
        const userProfile = await prisma.codeforcesProfile.findUnique({
          where: { userId: session.userId },
        });
        if (userProfile?.rating && !parsedQueryRating) {
          userRating = userProfile.rating;
        }

        const solved = await prisma.submission.findMany({
          where: { userId: session.userId, verdict: "OK" },
          select: { problemId: true },
        });
        for (const s of solved) {
          userSolvedKeys.add(s.problemId);
        }

        const dbProblems = await prisma.problem.findMany({
          include: { tags: true },
          take: 100,
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
        console.warn("DB query skipped in training route:", dbErr?.message);
      }
    }

    const plan = generateAdaptiveTrainingPlan({
      userRating,
      criticalWeaknesses: ["dp", "strings"],
      strongTopics: ["graphs", "greedy"],
      candidateProblems,
      userSolvedKeys,
      currentDayIndex: 2, // Wednesday
    });

    return NextResponse.json({
      success: true,
      userRating,
      plan,
    });
  } catch (error: any) {
    console.error("Error generating training plan:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
