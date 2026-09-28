import { NextRequest, NextResponse } from "next/server";
import { reviewSubmissionCode } from "@/server/mentor/mentor-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = String(body.code || "");
    const problemRating = Number(body.problemRating) || 1400;
    const expectedN = Number(body.expectedN) || 200000;

    if (!code.trim()) {
      return NextResponse.json({ error: "Source code cannot be empty." }, { status: 400 });
    }

    const report = reviewSubmissionCode(code, problemRating, expectedN);
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
