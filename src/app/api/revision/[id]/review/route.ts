import { NextRequest, NextResponse } from "next/server";
import { processCardReview } from "@/server/knowledge/revision-service";
import { ReviewQuality } from "@/server/knowledge/sm2";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const quality = Number(body.quality);

    if (isNaN(quality) || quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: "Quality must be an integer between 0 and 5" },
        { status: 400 }
      );
    }

    const result = processCardReview(id, quality as ReviewQuality);

    return NextResponse.json({
      success: true,
      card: result.card,
      sm2: result.sm2,
      feedbackMessage: result.feedbackMessage,
    });
  } catch (error: any) {
    console.error("Error submitting card review:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
