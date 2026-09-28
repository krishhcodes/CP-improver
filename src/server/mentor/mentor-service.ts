import { analyzeCPCode } from "./code-analyzer";
import { getProgressiveHint } from "./progressive-hints";
import {
  CodeReviewReport,
  HintTierLevel,
  MentorChatMessage,
  MentorPersona,
  ProgressiveHint,
  UserMentorContext,
} from "./types";

/**
 * Deterministic Socratic fallback generator when external LLM APIs are offline or unconfigured.
 */
function generateDeterministicMentorReply(
  userQuery: string,
  context: UserMentorContext,
  persona: MentorPersona
): string {
  const queryLower = userQuery.toLowerCase();

  // 1. TLE / Time Complexity questions
  if (queryLower.includes("tle") || queryLower.includes("time limit") || queryLower.includes("slow")) {
    if (persona === "STRICT_COACH") {
      return `Look at your loop bounds. In competitive programming, you get roughly $10^8$ basic operations per second. If $N = 2 \\cdot 10^5$ and you wrote nested loops, that's $4 \\cdot 10^{10}$ operations—which takes 40 seconds, not 2.0s! What monotonic property or data structure reduces your inner loop from $O(N)$ to $O(\\log N)$ or $O(1)$?`;
    }
    return `### ⏱️ Time Complexity Diagnosis\n\nWhen encountering Time Limit Exceeded (TLE), consider three critical factors:\n\n1. **Operation Budget**: On Codeforces, a 2.0s limit permits approximately $2 \\cdot 10^8$ operations. If $N \\ge 10^5$, an $O(N^2)$ algorithm is mathematically impossible to pass.\n2. **Fast I/O**: Did you include \`ios::sync_with_stdio(false); cin.tie(nullptr);\`? Standard stream synchronization can add up to 0.8s on $2 \\cdot 10^5$ integers.\n3. **Bottleneck Reduction**: Can the search space be reduced using:\n   - **Two Pointers** (if the window condition is monotonic)?\n   - **Binary Search on Answer**?\n   - **Prefix Sums / Frequency Arrays**?`;
  }

  // 2. WA / Wrong Answer / Overflow questions
  if (
    queryLower.includes("wa") ||
    queryLower.includes("wrong answer") ||
    queryLower.includes("overflow") ||
    queryLower.includes("negative")
  ) {
    if (persona === "STRICT_COACH") {
      return `Stop resubmitting blind guesses! Check your types: are you multiplying two 32-bit integers before taking modulo? Did you test $N=1$? Did you test the maximum constraint bounds where intermediate sums exceed $2 \\cdot 10^9$? If you're accumulating sums, \`int\` is an automatic Wrong Answer. Switch to \`long long\` and stress test locally.`;
    }
    return `### 🔍 Wrong Answer (WA) Checklist\n\nBefore submitting again, investigate these common competitive programming traps:\n\n1. **Integer Overflow**: Does any intermediate sum or multiplication exceed $2 \\cdot 10^9$? Remember that \`(a * b) % MOD\` overflows if \`a\` and \`b\` are 32-bit \`int\`! Use \`1LL * a * b\`.\n2. **Extreme Edge Cases**:\n   - $N = 1$ or $K = 0$.\n   - All elements are identical or array is strictly descending.\n   - Negative coordinate / balance offsets.\n3. **Monotonicity Assumptions**: Are you sure the greedy choice holds in all cases, or does a counter-example exist?`;
  }

  // 3. Hint requests for problems
  if (queryLower.includes("hint") || queryLower.includes("stuck") || queryLower.includes("approach")) {
    const prob = context.currentProblem;
    const probName = prob ? prob.name : "the problem";
    const probRating = prob ? prob.rating : 1400;

    return `### 💡 Socratic Guidance for ${probName} (${probRating} Rating)\n\nInstead of jumping straight to implementation, let's break down the mathematical invariants:\n\n1. **Observation**: What happens when you simulate the smallest nontrivial test case ($N=2$ or $N=3$)?\n2. **Invariance**: Does the operation preserve any property (e.g. parity of sum, total elements, connected components)?\n3. **Decision Direction**: Can you invert the question? Instead of finding the construction, can you verify whether a target answer $X$ is reachable?\n\n*Would you like a Tier 1 (Observation) or Tier 2 (Algorithm Selection) hint?*`;
  }

  // 4. Topic Weakness / Training guidance
  if (queryLower.includes("train") || queryLower.includes("weakness") || queryLower.includes("improve")) {
    const weakest = context.weakestTopics[0]?.topic || "Dynamic Programming";
    return `### 🎯 Strategic Training Assessment for ${context.handle} (Rating: ${context.rating})\n\nBased on your historical submission telemetry:\n\n- **Primary Blindspot**: **${weakest}** (estimated proficiency below target rating).\n- **Prescription**: Focus your next 3 training sessions on problems rated **${context.rating - 100} to ${context.rating + 100}** tagged with \`${weakest.toLowerCase()}\`.\n- **Tactical Rule**: Do not look at editorials before 30 minutes of active scratchpad derivation. If stuck, request Tier 1 hints rather than full code solutions.`;
  }

  // Default Socratic conversational response
  if (persona === "STRICT_COACH") {
    return `Competitive programming rewards precision and algorithmic discipline, ${context.handle}. What specific problem or submission are we analyzing? State the constraints ($N$, time limit) and your current theoretical hypothesis.`;
  }

  return `Hello ${context.handle}! I am your AI Competitive Programming Mentor. I can help you with:\n\n- **Progressive Socratic Hints** (Tier 1 Observation to Tier 4 Edge Cases without spoilers).\n- **Code Review & Bug Diagnostics** (detecting 32-bit overflow, $O(N^2)$ TLE traps, missing Fast I/O).\n- **Post-Contest Strategy** (overcoming time sink traps and managing contest clock pressure).\n\nWhat algorithmic problem or concept are we working on right now?`;
}

/**
 * Dispatches query to Gemini Generative AI API if key is present,
 * or gracefully falls back to deterministic CP mentor engine.
 */
export async function generateMentorResponse(
  messages: MentorChatMessage[],
  context: UserMentorContext,
  persona: MentorPersona = "SOCRATIC"
): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const latestUserMessage =
    messages.filter((m) => m.role === "user").pop()?.content || "Hello mentor!";

  // Live Gemini API path
  if (apiKey) {
    try {
      const personaPrompt =
        persona === "STRICT_COACH"
          ? "You are a world-class ICPC Coach. Be concise, rigorous, demanding, and uncompromising on time/space complexity and submission discipline. Never write full code solutions unless explicitly requested."
          : persona === "DIAGNOSTICIAN"
          ? "You are an expert CP Algorithm Diagnostician. Methodically break down complexity proofs, mathematical invariants, and error vectors."
          : "You are a Socratic Competitive Programming Mentor. Guide the user step-by-step with thoughtful leading questions, invariant hints, and nudge them to discover the algorithmic solution on their own. NEVER dump the final answer or full code.";

      const systemInstruction = `${personaPrompt}
User Context:
- Codeforces Handle: ${context.handle}
- Current Rating: ${context.rating}
- Weakest Topics: ${context.weakestTopics.map((w) => `${w.topic} (${w.score}/100)`).join(", ")}
${context.currentProblem ? `- Active Problem: ${context.currentProblem.name} (${context.currentProblem.rating} rating, tags: ${context.currentProblem.tags.join(", ")})` : ""}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemInstruction}\n\nUser Question: ${latestUserMessage}` }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn("Live Gemini API call failed or timed out. Falling back to Socratic engine.", err);
    }
  }

  // Deterministic Offline Resilient Socratic Fallback
  return generateDeterministicMentorReply(latestUserMessage, context, persona);
}

/**
 * Retrieves progressive tiered hint for a given problem
 */
export function getProblemHint(
  problemKey: string,
  tier: HintTierLevel,
  tags?: string[]
): ProgressiveHint {
  return getProgressiveHint(problemKey, tier, tags);
}

/**
 * Analyzes competitive programming code for bugs, complexity traps, and anti-patterns
 */
export function reviewSubmissionCode(
  sourceCode: string,
  problemRating?: number,
  expectedN?: number
): CodeReviewReport {
  return analyzeCPCode(sourceCode, { rating: problemRating, expectedN });
}
