import { NextRequest, NextResponse } from "next/server";
import { getRevisionQueue } from "@/server/knowledge/revision-service";

export async function GET(request: NextRequest) {
  try {
    const queue = getRevisionQueue();
    return NextResponse.json({
      success: true,
      ...queue,
    });
  } catch (error: any) {
    console.error("Error retrieving revision queue:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
