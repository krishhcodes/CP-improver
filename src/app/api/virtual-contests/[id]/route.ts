import { NextRequest, NextResponse } from "next/server";
import {
  getVirtualContestSession,
  tickVirtualContest,
} from "@/server/virtual/virtual-contest-service";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const session = getVirtualContestSession(id);
    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await req.json().catch(() => ({}));
    const elapsedSeconds = Number(body.elapsedSeconds);

    if (isNaN(elapsedSeconds)) {
      return NextResponse.json(
        { error: "elapsedSeconds must be a valid number." },
        { status: 400 }
      );
    }

    const updated = tickVirtualContest(id, elapsedSeconds);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
