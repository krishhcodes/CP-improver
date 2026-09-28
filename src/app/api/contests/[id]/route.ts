import { NextRequest, NextResponse } from "next/server";
import { analyzeContestPerformance } from "@/server/analytics/contest-analytics";
import { ContestRepository } from "@/server/db/repositories/contest-repo";
import { MOCK_CONTEST_AUTOPSY } from "@/lib/mock-data";
import { CODEFORCES_REQUEST_HEADERS } from "@/server/codeforces/cf-headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contestId = parseInt(id, 10);
  const handle = req.nextUrl.searchParams.get("handle")?.trim() || "";

  if (isNaN(contestId)) {
    return NextResponse.json({ error: "Invalid contest ID" }, { status: 400 });
  }

  // 1. Try Live Codeforces API if handle is provided
  if (handle) {
    try {
      const [ratingRes, statusRes] = await Promise.allSettled([
        fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`, {
          headers: CODEFORCES_REQUEST_HEADERS,
          next: { revalidate: 300 },
        }).then((r) => r.json()),
        fetch(
          `https://codeforces.com/api/contest.status?contestId=${contestId}&handle=${encodeURIComponent(handle)}&from=1&count=100`,
          {
            headers: CODEFORCES_REQUEST_HEADERS,
            next: { revalidate: 300 },
          }
        ).then((r) => r.json()),
      ]);

      const ratingData = ratingRes.status === "fulfilled" && ratingRes.value?.status === "OK" ? ratingRes.value.result : [];
      const statusData = statusRes.status === "fulfilled" && statusRes.value?.status === "OK" ? statusRes.value.result : [];

      const contestRatingEntry = Array.isArray(ratingData)
        ? ratingData.find((r: any) => r.contestId === contestId)
        : null;

      if (contestRatingEntry || (Array.isArray(statusData) && statusData.length > 0)) {
        // Collect problems from submissions
        const problemsMap = new Map<string, { index: string; name: string; rating?: number; tags: string[] }>();
        const submissions = (statusData || []).map((sub: any) => {
          if (sub.problem && !problemsMap.has(sub.problem.index)) {
            problemsMap.set(sub.problem.index, {
              index: sub.problem.index,
              name: sub.problem.name || `Problem ${sub.problem.index}`,
              rating: sub.problem.rating,
              tags: sub.problem.tags || [],
            });
          }

          return {
            id: String(sub.id),
            problemIndex: sub.problem?.index || "A",
            problemName: sub.problem?.name || "Problem",
            creationTimeSeconds: sub.creationTimeSeconds,
            relativeTimeSeconds: sub.relativeTimeSeconds,
            verdict: sub.verdict || "UNKNOWN",
            passedTestCount: sub.passedTestCount || 0,
          };
        });

        const contestName = contestRatingEntry?.contestName || `Codeforces Round #${contestId}`;
        const rank = contestRatingEntry?.rank || 5000;
        const oldRating = contestRatingEntry?.oldRating ?? 1000;
        const newRating = contestRatingEntry?.newRating ?? 1000;
        const ratingChange = newRating - oldRating;

        // Auto-generate insights based on real submissions
        const okSubs = submissions.filter((s: any) => s.verdict === "OK");
        const failedSubs = submissions.filter((s: any) => s.verdict !== "OK");

        const wentWell: string[] = [];
        if (okSubs.length > 0) {
          wentWell.push(`Solved ${okSubs.length} problem${okSubs.length > 1 ? "s" : ""} during the official round window.`);
          wentWell.push(`Earned official rank #${rank.toLocaleString()} with ${ratingChange >= 0 ? `+${ratingChange}` : ratingChange} rating change.`);
        } else {
          wentWell.push(`Participated in official round #${contestId} and gained contest experience.`);
        }

        const wentWrong: string[] = [];
        if (failedSubs.length > 0) {
          wentWrong.push(`Accumulated ${failedSubs.length} non-accepted verdict${failedSubs.length > 1 ? "s" : ""} causing submission penalties.`);
        }
        if (ratingChange < 0) {
          wentWrong.push(`Rating dipped by ${Math.abs(ratingChange)} points due to unattempted later problems.`);
        } else if (okSubs.length <= 1) {
          wentWrong.push("Early speed bottleneck prevented unlocking problem C/D during the contest.");
        }

        const actionItems: string[] = [
          `Upsolve the next uncompleted problem from Round #${contestId} on Codeforces.`,
          "Review test case edge boundaries to avoid initial WA verdicts.",
          "Benchmark your implementation speed in Virtual Arena mode before the next live round.",
        ];

        const contestMetrics = analyzeContestPerformance({
          contest: {
            id: contestId,
            name: contestName,
            durationSeconds: 7200,
            startTimeSeconds: contestRatingEntry?.ratingUpdateTimeSeconds ? contestRatingEntry.ratingUpdateTimeSeconds - 7200 : 1763000000,
          },
          participation: {
            rank,
            oldRating,
            newRating,
            ratingChange,
          },
          contestProblems: Array.from(problemsMap.values()),
          submissions,
        });

        return NextResponse.json({
          success: true,
          contest: contestMetrics,
          insights: {
            wentWell,
            wentWrong,
            actionItems,
          },
        });
      }
    } catch (err) {
      console.warn("Live Codeforces contest lookup fallback:", err);
    }
  }

  // 2. Try Database if available
  try {
    const contest = await ContestRepository.findByCodeforcesId(contestId);

    if (contest) {
      const metrics = analyzeContestPerformance({
        contest: {
          id: contest.codeforcesContestId,
          name: contest.name,
          durationSeconds: contest.durationSeconds,
          startTimeSeconds: contest.startTimeSeconds,
        },
        participation: null,
        contestProblems: contest.problems.map((p) => ({
          index: p.index,
          name: p.name,
          rating: p.rating,
          tags: [],
        })),
        submissions: [],
      });

      return NextResponse.json({ success: true, contest: metrics });
    }
  } catch {
    // Database connection fallback
  }

  // 3. Fallback to rich structured analysis for educational contest 970 / mock contest
  const mockMetrics = analyzeContestPerformance({
    contest: {
      id: contestId || 970,
      name: `Codeforces Round #${contestId || 970} (Educational Analysis)`,
      durationSeconds: 7200,
      startTimeSeconds: 1763000000,
    },
    participation: {
      rank: 2890,
      oldRating: 1795,
      newRating: 1748,
      ratingChange: -47,
    },
    contestProblems: [
      { index: "A", name: "Closest Point", rating: 800, tags: ["implementation"] },
      { index: "B", name: "Game with Doors", rating: 1100, tags: ["implementation", "math"] },
      { index: "C", name: "Splitting Items", rating: 1300, tags: ["greedy", "sortings"] },
      { index: "D", name: "Colored Portals", rating: 1600, tags: ["binary search", "graphs"] },
      { index: "E", name: "Not a Nim Problem", rating: 1800, tags: ["games", "math", "number theory"] },
      { index: "F", name: "Expected Median", rating: 2100, tags: ["combinatorics", "math"] },
    ],
    submissions: [
      {
        id: "sub-1",
        problemIndex: "A",
        problemName: "Closest Point",
        creationTimeSeconds: 1763000211,
        relativeTimeSeconds: 211,
        verdict: "OK",
        passedTestCount: 15,
      },
      {
        id: "sub-2",
        problemIndex: "B",
        problemName: "Game with Doors",
        creationTimeSeconds: 1763000950,
        relativeTimeSeconds: 950,
        verdict: "OK",
        passedTestCount: 22,
      },
      {
        id: "sub-3",
        problemIndex: "C",
        problemName: "Splitting Items",
        creationTimeSeconds: 1763001800,
        relativeTimeSeconds: 1800,
        verdict: "OK",
        passedTestCount: 30,
      },
      {
        id: "sub-4",
        problemIndex: "D",
        problemName: "Colored Portals",
        creationTimeSeconds: 1763003400,
        relativeTimeSeconds: 3400,
        verdict: "TIME_LIMIT_EXCEEDED",
        passedTestCount: 12,
      },
      {
        id: "sub-5",
        problemIndex: "D",
        problemName: "Colored Portals",
        creationTimeSeconds: 1763004200,
        relativeTimeSeconds: 4200,
        verdict: "TIME_LIMIT_EXCEEDED",
        passedTestCount: 18,
      },
      {
        id: "sub-6",
        problemIndex: "D",
        problemName: "Colored Portals",
        creationTimeSeconds: 1763005800,
        relativeTimeSeconds: 5800,
        verdict: "TIME_LIMIT_EXCEEDED",
        passedTestCount: 24,
      },
    ],
  });

  return NextResponse.json({
    success: true,
    contest: mockMetrics,
    insights: MOCK_CONTEST_AUTOPSY.insights,
  });
}
