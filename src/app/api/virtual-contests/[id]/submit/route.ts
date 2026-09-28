import { NextRequest, NextResponse } from "next/server";
import { submitVirtualContestSolution } from "@/server/virtual/virtual-contest-service";
import { SubmissionVerdict } from "@/server/virtual/types";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await req.json().catch(() => ({}));
    const problemIndex = String(body.problemIndex || "").toUpperCase();
    const verdict = (body.verdict as SubmissionVerdict) || "OK";
    const language = body.language || "GNU C++20";

    if (!problemIndex) {
      return NextResponse.json({ error: "problemIndex is required." }, { status: 400 });
    }

    const result = submitVirtualContestSolution(id, problemIndex, verdict, language);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
