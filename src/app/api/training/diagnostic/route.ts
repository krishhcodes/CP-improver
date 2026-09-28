import { NextRequest, NextResponse } from "next/server";
import {
  DIAGNOSTIC_TOPICS,
  VERIFICATION_QUESTIONS,
  evaluateDiagnosticAssessment,
} from "@/server/recommendations/diagnostic-service";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      topics: DIAGNOSTIC_TOPICS,
      questions: VERIFICATION_QUESTIONS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to load diagnostic curriculum questions", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tickedTopicIds = [],
      answers = {},
      userRating = 1000,
    } = body;

    const result = evaluateDiagnosticAssessment({
      tickedTopicIds,
      answers,
      userRating,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Diagnostic evaluation failed", message: error.message },
      { status: 500 }
    );
  }
}
