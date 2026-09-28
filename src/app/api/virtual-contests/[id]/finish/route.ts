import { NextRequest, NextResponse } from "next/server";
import { finishVirtualContest } from "@/server/virtual/virtual-contest-service";

export async function POST(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const result = finishVirtualContest(id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
