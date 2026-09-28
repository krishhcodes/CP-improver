import { NextRequest, NextResponse } from "next/server";
import {
  listPresetContests,
  startVirtualContest,
  getVirtualContestSession,
} from "@/server/virtual/virtual-contest-service";

export async function GET() {
  try {
    const presets = listPresetContests();
    let demoSession = null;
    try {
      demoSession = getVirtualContestSession("demo-session-970");
    } catch {
      // ignore
    }

    return NextResponse.json({
      presets: presets.map((p) => ({
        id: p.id,
        title: p.title,
        division: p.division,
        durationMinutes: p.durationMinutes,
        problemCount: p.problems.length,
        competitorCount: p.botCompetitors.length + 1,
        problems: p.problems.map((pr) => ({
          index: pr.index,
          name: pr.name,
          rating: pr.rating,
          tags: pr.tags,
          points: pr.points,
        })),
      })),
      activeSession: demoSession,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const contestId = Number(body.contestId) || 970;
    const userHandle = body.userHandle || "Alex_Algo";
    const userRating = Number(body.userRating) || 1540;
    const scoringMode = body.scoringMode === "CF" ? "CF" : "ICPC";

    const session = startVirtualContest(contestId, userHandle, userRating, scoringMode);

    return NextResponse.json(session, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
