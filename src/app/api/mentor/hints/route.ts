import { NextRequest, NextResponse } from "next/server";
import { getProblemHint } from "@/server/mentor/mentor-service";
import { HintTierLevel } from "@/server/mentor/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const problemKey = String(body.problemKey || "970E").trim();
    const tier = (Number(body.tier) || 1) as HintTierLevel;
    const tags = Array.isArray(body.tags) ? body.tags : ["greedy", "strings"];

    if (tier < 1 || tier > 4) {
      return NextResponse.json(
        { error: "Tier must be an integer between 1 and 4." },
        { status: 400 }
      );
    }

    const hint = getProblemHint(problemKey, tier, tags);
    return NextResponse.json(hint);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
