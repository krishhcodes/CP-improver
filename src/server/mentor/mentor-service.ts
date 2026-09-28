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
import {
  findCurriculumGuideForTopic,
  findCurriculumGuideForProblem,
} from "../knowledge/curriculum-links";

/**
 * Deterministic Socratic fallback generator when external LLM APIs are offline or unconfigured.
 * Grounded in the USACO Guide, CPH, CP4, CLRS, and Sannemo curriculum.
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
      return `Look at your loop bounds. In competitive programming, you get roughly $10^8$ basic operations per second (**CPH Chapter 2**). If $N = 2 \\cdot 10^5$ and you wrote nested loops, that's $4 \\cdot 10^{10}$ operations—which takes 40 seconds, not 2.0s!\n\nRead our textbook chapter on [Two Pointers & Sliding Window](/learn/two-pointers) or [Segment Trees](/learn/segment-tree) to drop the inner loop from $O(N)$ to $O(1)$ or $O(\\log N)$. What monotonic invariant can eliminate your inner traversal?`;
    }
    return `### ⏱️ Time Complexity Diagnosis (CPH Ch 2 & USACO Guide)\n\nWhen encountering Time Limit Exceeded (TLE), consider three critical factors from the competitive programming literature:\n\n1. **Operation Budget**: On Codeforces, a 2.0s limit permits approximately $2 \\cdot 10^8$ operations. If $N \\ge 10^5$, an $O(N^2)$ algorithm is mathematically impossible to pass.\n2. **Fast I/O**: Did you include \`ios::sync_with_stdio(false); cin.tie(nullptr);\`? Standard stream synchronization adds 0.4s to 0.9s on $2 \\cdot 10^5$ integers (**CP4 Book 1 Sec 1.3**).\n3. **Bottleneck Reduction**: Transform the search space using our verified curriculum guides:\n   - [Two Pointers & Sliding Window](/learn/two-pointers) (for monotonic window boundaries in $O(N)$)\n   - [Binary Search on Answer](/learn/binary-search-answer) (for monotonic verification predicates in $O(N \\log M)$)\n   - [Prefix Sums](/learn/prefix-sums) (for static range queries in $O(1)$)\n   - [Segment Trees](/learn/segment-tree) (for dynamic point updates and range queries in $O(\\log N)$)`;
  }

  // 2. WA / Wrong Answer / Overflow questions
  if (
    queryLower.includes("wa") ||
    queryLower.includes("wrong answer") ||
    queryLower.includes("overflow") ||
    queryLower.includes("negative")
  ) {
    if (persona === "STRICT_COACH") {
      return `Stop resubmitting blind guesses! Check your types: are you multiplying two 32-bit integers before taking modulo? Did you test $N=1$? Did you test the maximum constraint bounds where intermediate sums exceed $2 \\cdot 10^9$? If you're accumulating sums, \`int\` is an automatic Wrong Answer (**CP4 Book 1 Sec 1.3**). Switch to \`long long\`, review [Prefix Sums & Range Queries](/learn/prefix-sums), and stress test locally.`;
    }
    return `### 🔍 Wrong Answer (WA) Checklist (CP4 Book 1 & Sannemo Ch 1)\n\nBefore submitting again, investigate these common competitive programming traps:\n\n1. **Integer Overflow**: Does any intermediate sum or multiplication exceed $2 \\cdot 10^9$? Remember that \`(a * b) % MOD\` overflows if \`a\` and \`b\` are 32-bit \`int\`! Use \`1LL * a * b\` (**CPH Chapter 2**).\n2. **Extreme Edge Cases**:\n   - $N = 1$ or $K = 0$.\n   - All elements are identical or array is strictly descending.\n   - Negative coordinate / balance offsets.\n3. **Monotonicity Assumptions**: Are you sure the greedy choice holds in all cases, or does a counter-example exist? Read [Two Pointers](/learn/two-pointers) or [1D Dynamic Programming](/learn/1d-dp) to verify your invariants.`;
  }

  // 3. Hint requests for problems
  if (queryLower.includes("hint") || queryLower.includes("stuck") || queryLower.includes("approach")) {
    const prob = context.currentProblem;
    const probName = prob ? prob.name : "the problem";
    const probRating = prob ? prob.rating : 1400;
    const guide = prob?.tags ? findCurriculumGuideForProblem(prob.tags) : null;

    let guideText = "";
    if (guide) {
      guideText = `\n\n📖 **Related Curriculum Chapter**: [${guide.name}](/learn/${guide.slug}) (${guide.primaryBookCitation})\n*Key Invariant*: ${guide.keyInvariant}`;
    }

    return `### 💡 Socratic Guidance for ${probName} (${probRating} Rating)\n\nInstead of jumping straight to implementation, let's break down the mathematical invariants:\n\n1. **Observation**: What happens when you simulate the smallest nontrivial test case ($N=2$ or $N=3$)?\n2. **Invariance**: Does the operation preserve any property (e.g. parity of sum, total elements, connected components)?\n3. **Decision Direction**: Can you invert the question? Instead of finding the construction, can you verify whether a target answer $X$ is reachable?${guideText}\n\n*Would you like a Tier 1 (Observation) or Tier 2 (Algorithm Selection) hint?*`;
  }

  // 4. Topic Weakness / Training guidance
  if (queryLower.includes("train") || queryLower.includes("weakness") || queryLower.includes("improve")) {
    const weakest = context.weakestTopics[0]?.topic || "Dynamic Programming";
    const guide = findCurriculumGuideForTopic(weakest);

    let guideNotice = "";
    if (guide) {
      guideNotice = `\n\n📖 **Required Reading**: Study our comprehensive guide [${guide.name}](/learn/${guide.slug}) (${guide.primaryBookCitation}, ${guide.chapter}). Focus on: *${guide.keyInvariant}*.`;
    }

    return `### 🎯 Strategic Training Assessment for ${context.handle} (Rating: ${context.rating})\n\nBased on your historical submission telemetry:\n\n- **Primary Blindspot**: **${weakest}** (estimated proficiency below target rating).\n- **Prescription**: Focus your next 3 training sessions on problems rated **${context.rating - 100} to ${context.rating + 100}** tagged with \`${weakest.toLowerCase()}\`.\n- **Tactical Rule**: Do not look at editorials before 30 minutes of active scratchpad derivation. If stuck, request Tier 1 hints rather than full code solutions.${guideNotice}`;
  }

  // 5. Concept & Theory Teaching (e.g. "teach two pointer method", "explain binary search", "how does DSU work")
  if (
    queryLower.includes("two pointer") ||
    queryLower.includes("sliding window")
  ) {
    return `### 🎯 Two Pointers & Sliding Window Method (USACO Guide Silver & CPH Ch 8)

The **Two Pointers technique** optimizes brute-force $O(N^2)$ nested subarray searches down to **$O(N)$ linear time** by exploiting **monotonicity**.

#### 🔑 The Core Invariant
If advancing the right pointer $r$ strictly increases a condition (e.g., subarray sum of non-negative integers), then when the window violates the constraint, advancing the left pointer $l$ is strictly guaranteed to restore validity. Because $l$ and $r$ only advance forward and never move backward, each element is visited at most twice ($2N$ operations total).

#### 🛠️ Standard Monotonic Window Pattern
\`\`\`cpp
int l = 0, currentSum = 0, maxLen = 0;
for (int r = 0; r < n; r++) {
    currentSum += a[r]; // 1. Expand right boundary
    
    // 2. Shrink left boundary while invariant is violated
    while (currentSum > target && l <= r) {
        currentSum -= a[l];
        l++;
    }
    
    // 3. Update answer with valid window [l, r]
    maxLen = max(maxLen, r - l + 1);
}
\`\`\`

#### 📚 Textbook References & Practice
- **Curriculum Guide**: [Interactive Two Pointers & Sliding Window Chapter](/learn/two-pointers)
- **Literature**: *Competitive Programmer's Handbook (CPH)* Chapter 8; *USACO Guide Silver*.
- **Classic Problems**: [CF 279B: Books](https://codeforces.com/contest/279/problem/B), [CF 371C: Hamburgers](https://codeforces.com/contest/371/problem/C).`;
  }

  if (queryLower.includes("binary search")) {
    return `### 🎯 Binary Search on Answer / Monotonic Predicates (Sannemo Ch 5 & USACO Guide)

When directly computing an optimal value is difficult, check if you can verify feasibility in polynomial time: **Can we achieve value $X$?**

#### 🔑 The Monotonic Predicate Invariant
A predicate $P(X)$ is monotonic if $P(X) = \\text{true}$ implies $P(X') = \\text{true}$ for all $X' \\le X$ (or vice versa). This reduces an optimization problem into logarithmic decision steps.

#### 🛠️ Canonical Binary Search Template
\`\`\`cpp
long long low = 1, high = 1e14, best = -1;
while (low <= high) {
    long long mid = low + (high - low) / 2; // Guard against 32-bit overflow!
    if (checkFeasible(mid)) {
        best = mid;
        low = mid + 1; // Try to achieve larger answer
    } else {
        high = mid - 1;
    }
}
\`\`\`

#### 📚 Textbook References
- **Curriculum Guide**: [Interactive Binary Search on Answer Chapter](/learn/binary-search-answer)
- **Literature**: *Principles of Algorithmic Problem Solving (Sannemo)* Chapter 5; *CPH* Chapter 3.`;
  }

  // Default Socratic conversational response
  if (persona === "STRICT_COACH") {
    return `Competitive programming rewards precision and algorithmic discipline, ${context.handle}. What specific problem or submission are we analyzing? State the constraints ($N$, time limit), your current theoretical hypothesis, and which [Curriculum Guide](/learn) you are referencing.`;
  }

  return `Hello ${context.handle}! I am your AI Competitive Programming Grandmaster Coach. I have our complete competitive programming textbook library inside me, spanning the **USACO Guide**, **Competitive Programmer's Handbook (CPH)**, **Competitive Programming 4 (CP4)**, **CLRS**, and **Sannemo's Principles of Algorithmic Problem Solving**.\n\nI can help you with:\n\n- **Progressive Socratic Hints** (Tier 1 Observation to Tier 4 Edge Cases without spoilers).\n- **Code Review & Bug Diagnostics** (detecting 32-bit overflow, $O(N^2)$ TLE traps, missing Fast I/O).\n- **Textbook Invariant Grounding** (connecting problems to our [Interactive Theory Guides](/learn)).\n- **Post-Contest Strategy** (overcoming time sink traps and managing contest clock pressure).\n\nWhat algorithmic problem or concept are we working on right now?`;
}

/**
 * Builds the comprehensive Competitive Programming System Prompt.
 */
function buildSystemInstruction(
  context: UserMentorContext,
  persona: MentorPersona
): string {
  const personaPrompt =
    persona === "STRICT_COACH"
      ? "You are a world-class ICPC Coach. Be concise, rigorous, demanding, and uncompromising on time/space complexity and submission discipline. Never write full code solutions unless explicitly requested. Always cite standard competitive programming literature (USACO Guide, CPH, CP4, CLRS, Sannemo) and direct users to internal guides like [Prefix Sums](/learn/prefix-sums), [Two Pointers](/learn/two-pointers), [Binary Search](/learn/binary-search-answer), [1D DP](/learn/1d-dp), [Segment Tree](/learn/segment-tree), [DSU](/learn/dsu), [Dijkstra](/learn/dijkstra)."
      : persona === "DIAGNOSTICIAN"
      ? "You are an expert CP Algorithm Diagnostician. Methodically break down complexity proofs, mathematical invariants, and error vectors. Cross-reference concepts with internal textbook guides at /learn/<slug> and standard literature (CPH, CP4, CLRS, USACO Guide)."
      : "You are a Socratic Competitive Programming Mentor. Guide the user step-by-step with thoughtful leading questions, invariant hints, and nudge them to discover the algorithmic solution on their own. NEVER dump the final answer or full code upfront. When teaching a method or topic, explain the core invariant, provide clear templates, and cite relevant literature and internal guides at /learn/<slug>.";

  return `${personaPrompt}

Platform Knowledge Base Context:
You have a complete algorithmic textbook curriculum inside you:
1. Prefix Sums & Range Queries (/learn/prefix-sums - USACO Guide Bronze, CPH Ch 9)
2. Two Pointers & Sliding Window (/learn/two-pointers - USACO Guide Silver, CPH Ch 8)
3. Binary Search on Answer (/learn/binary-search-answer - USACO Guide Silver, Sannemo Ch 5)
4. 1D Dynamic Programming (/learn/1d-dp - USACO Guide Silver, CPH Ch 7)
5. Knapsack DP Variants (/learn/knapsack - CLRS Ch 16, CP4 Book 1 Sec 3.5)
6. Bitmask DP (/learn/bitmask-dp - CPH Ch 10, Sannemo Ch 10)
7. Graph Traversals BFS/DFS (/learn/bfs-dfs - USACO Guide Silver, CPH Ch 11-12)
8. Disjoint Set Union DSU (/learn/dsu - CPH Ch 15, CLRS Ch 21)
9. Dijkstra Shortest Paths (/learn/dijkstra - CLRS Ch 24, CPH Ch 13)
10. Kruskal MST (/learn/mst-kruskal - CLRS Ch 23, CPH Ch 15)
11. Segment Tree (/learn/segment-tree - CP4 Book 1 Sec 2.4, CLRS Ch 14)
12. Lazy Propagation (/learn/lazy-propagation - CP4 Book 1 Sec 2.4, CPH Ch 28)

User Context:
- Codeforces Handle: ${context.handle}
- Current Rating: ${context.rating}
- Weakest Topics: ${context.weakestTopics.map((w) => `${w.topic} (${w.score}/100)`).join(", ")}
${context.currentProblem ? `- Active Problem in Focus: ${context.currentProblem.name} (${context.currentProblem.rating} rating, tags: ${context.currentProblem.tags.join(", ")})` : ""}
`;
}

/**
 * Calls Google Gemini API (supporting gemini-2.0-flash and gemini-1.5-flash)
 */
async function callGeminiAPI(
  apiKey: string,
  systemInstruction: string,
  messages: MentorChatMessage[]
): Promise<string | null> {
  const models = [
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
  ];

  const recent = messages.filter((m) => m.role === "user" || m.role === "assistant").slice(-10);
  const formattedContents = recent.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  if (formattedContents.length === 0) {
    const lastUserMsg = messages.filter((m) => m.role === "user").pop()?.content || "Hello!";
    formattedContents.push({
      role: "user",
      parts: [{ text: lastUserMsg }],
    });
  }

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: formattedContents,
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 1800,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) return text;
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn(`[Gemini API] ${model} returned HTTP ${res.status}:`, errJson);
      }
    } catch (err) {
      console.warn(`[Gemini API] Request error with ${model}:`, err);
    }
  }

  return null;
}

/**
 * Calls OpenAI-compatible API (OpenAI, Groq, OpenRouter)
 */
async function callOpenAICompatibleAPI(
  endpoint: string,
  apiKey: string,
  model: string,
  systemInstruction: string,
  messages: MentorChatMessage[]
): Promise<string | null> {
  const recent = messages.filter((m) => m.role === "user" || m.role === "assistant").slice(-10);
  const chatMessages = [
    { role: "system", content: systemInstruction },
    ...recent.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature: 0.35,
        max_tokens: 1800,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text && text.trim()) return text;
    } else {
      const errJson = await res.json().catch(() => ({}));
      console.warn(`[OpenAI Compatible API] ${model} returned HTTP ${res.status}:`, errJson);
    }
  } catch (err) {
    console.warn(`[OpenAI Compatible API] Request error with ${model}:`, err);
  }

  return null;
}

/**
 * Dispatches query to Real AI API if key is present (Gemini, OpenAI, Groq, OpenRouter),
 * or gracefully falls back to deterministic CP mentor engine.
 */
export async function generateMentorResponse(
  messages: MentorChatMessage[],
  context: UserMentorContext,
  persona: MentorPersona = "SOCRATIC",
  customApiKey?: string
): Promise<string> {
  const geminiKey =
    customApiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  const latestUserMessage =
    messages.filter((m) => m.role === "user").pop()?.content || "Hello mentor!";

  const systemInstruction = buildSystemInstruction(context, persona);

  // 1. Google Gemini (Primary Real AI)
  if (geminiKey) {
    const reply = await callGeminiAPI(geminiKey, systemInstruction, messages);
    if (reply) return reply;
  }

  // 2. OpenAI (GPT-4o-mini)
  if (openaiKey) {
    const reply = await callOpenAICompatibleAPI(
      "https://api.openai.com/v1/chat/completions",
      openaiKey,
      "gpt-4o-mini",
      systemInstruction,
      messages
    );
    if (reply) return reply;
  }

  // 3. Groq (Llama 3.3 70B)
  if (groqKey) {
    const reply = await callOpenAICompatibleAPI(
      "https://api.groq.com/openai/v1/chat/completions",
      groqKey,
      "llama-3.3-70b-versatile",
      systemInstruction,
      messages
    );
    if (reply) return reply;
  }

  // 4. OpenRouter
  if (openrouterKey) {
    const reply = await callOpenAICompatibleAPI(
      "https://openrouter.ai/api/v1/chat/completions",
      openrouterKey,
      "google/gemini-2.0-flash-001",
      systemInstruction,
      messages
    );
    if (reply) return reply;
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
