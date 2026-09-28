import { NextRequest, NextResponse } from "next/server";
import { getPostContestAutopsyService } from "@/server/virtual/virtual-contest-service";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const autopsy = getPostContestAutopsyService(id);
    return NextResponse.json(autopsy);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}
