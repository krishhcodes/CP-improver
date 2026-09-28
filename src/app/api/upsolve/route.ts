import { NextRequest, NextResponse } from "next/server";
import { generateUpsolveQueue } from "@/server/analytics/upsolve-detector";
import { MOCK_UPSOLVE_PROBLEMS } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const ratingParam = searchParams.get("rating");
  const userRating = ratingParam ? parseInt(ratingParam, 10) : 1748;

  // Generate queue using algorithm
  const queue = generateUpsolveQueue({
    recentContests: [
      { id: 970, name: "Educational Codeforces Round 169" },
      { id: 962, name: "Codeforces Round 962 (Div. 3)" },
      { id: 955, name: "Codeforces Round 955 (Div. 2)" },
    ],
    contestProblems: [
      {
        id: "970-D",
        contestId: 970,
        index: "D",
        name: "Colored Portals",
        rating: 1600,
        tags: ["binary search", "data structures", "graphs"],
      },
      {
        id: "970-E",
        contestId: 970,
        index: "E",
        name: "Not a Nim Problem",
        rating: 1800,
        tags: ["games", "math", "number theory"],
      },
      {
        id: "962-E",
        contestId: 962,
        index: "E",
        name: "Decode",
        rating: 1500,
        tags: ["combinatorics", "dp", "math"],
      },
      {
        id: "955-D",
        contestId: 955,
        index: "D",
        name: "Beauty of the mountains",
        rating: 1900,
        tags: ["2-sat", "math", "matrices"],
      },
      {
        id: "955-E",
        contestId: 955,
        index: "E",
        name: "Number of Simple Paths",
        rating: 2000,
        tags: ["dfs and similar", "graphs", "trees"],
      },
    ],
    userSubmissions: [
      {
        problemId: "970-A",
        contestId: 970,
        problemIndex: "A",
        verdict: "OK",
      },
      {
        problemId: "970-B",
        contestId: 970,
        problemIndex: "B",
        verdict: "OK",
      },
      {
        problemId: "970-C",
        contestId: 970,
        problemIndex: "C",
        verdict: "OK",
      },
      {
        problemId: "970-D",
        contestId: 970,
        problemIndex: "D",
        verdict: "TIME_LIMIT_EXCEEDED",
      },
      {
        problemId: "962-E",
        contestId: 962,
        problemIndex: "E",
        verdict: "WRONG_ANSWER",
      },
    ],
    userCurrentRating: userRating,
  });

  return NextResponse.json({
    success: true,
    count: queue.length,
    upsolveQueue: queue,
  });
}
