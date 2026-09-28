import { NextRequest, NextResponse } from "next/server";
import { generateMentorResponse } from "@/server/mentor/mentor-service";
import { MentorChatMessage, MentorPersona, UserMentorContext } from "@/server/mentor/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages: MentorChatMessage[] = body.messages || [];
    const persona: MentorPersona = body.persona || "SOCRATIC";

    // User context fallback
    const userContext: UserMentorContext = body.context || {
      handle: "Alex_Algo",
      rating: 1540,
      weakestTopics: [
        { topic: "Dynamic Programming", score: 68 },
        { topic: "Segment Trees", score: 62 },
        { topic: "Constructive Algorithms", score: 48 },
      ],
      recentSubmissions: [
        { problemName: "Alternating String", verdict: "WRONG_ANSWER", rating: 1400 },
        { problemName: "Square or Not", verdict: "OK", rating: 900 },
      ],
      currentProblem: body.currentProblem || {
        index: "E",
        name: "Alternating String",
        rating: 1400,
        tags: ["greedy", "strings"],
        timeLimitSeconds: 2.0,
      },
    };

    const apiKey = req.headers.get("x-ai-api-key") || body.apiKey || undefined;
    const reply = await generateMentorResponse(messages, userContext, persona, apiKey);

    return NextResponse.json({
      reply,
      timestamp: Math.floor(Date.now() / 1000),
      persona,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
