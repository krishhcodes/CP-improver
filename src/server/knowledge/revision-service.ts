import {
  calculateSM2,
  classifyRevisionStatus,
  formatIntervalDays,
  ReviewQuality,
  SM2Result,
} from "./sm2";

export interface RevisionCard {
  id: string;
  conceptSlug: string;
  conceptName: string;
  problemName: string;
  problemRating: number;
  problemUrl: string;
  questionPrompt: string;
  answerKey: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAtSeconds: number;
  lastReviewedAtSeconds?: number;
  status: "DUE" | "UPCOMING" | "FUTURE";
}

export interface RevisionQueueSummary {
  dueTodayCount: number;
  upcomingWeekCount: number;
  totalCardsCount: number;
  masteredCardsCount: number;
  averageEaseFactor: number;
  retentionRate: number; // e.g. 88%
  dueCards: RevisionCard[];
  upcomingCards: RevisionCard[];
  allCards: RevisionCard[];
}

const now = Math.floor(Date.now() / 1000);

export const DEFAULT_REVISION_CARDS: RevisionCard[] = [
  {
    id: "rev-1",
    conceptSlug: "binary-search-answer",
    conceptName: "Binary Search on Answer",
    problemName: "Hamburgers (Rating 1400)",
    problemRating: 1400,
    problemUrl: "https://codeforces.com/problemset/problem/371/C",
    questionPrompt:
      "When binary searching for the maximum number of hamburgers we can cook with budget R, what is the monotonic invariant and search ceiling?",
    answerKey:
      "Invariant: canCook(X) is monotonic (true for X <= ans, false for X > ans). Cost increases monotonically. Upper bound is (currentCount + R / cheapest_ingredient_cost) ~ 1e12 + 100. Use 64-bit int.",
    intervalDays: 7,
    easeFactor: 2.6,
    repetitions: 3,
    nextReviewAtSeconds: now - 3600, // Due now
    status: "DUE",
  },
  {
    id: "rev-2",
    conceptSlug: "dsu",
    conceptName: "Disjoint Set Union (DSU)",
    problemName: "Mocha and Diana (Easy Version)",
    problemRating: 1400,
    problemUrl: "https://codeforces.com/problemset/problem/1559/D1",
    questionPrompt:
      "How do we maintain two simultaneous forests Diana and Mocha without forming cycles when adding an edge (u, v)?",
    answerKey:
      "Maintain two independent DSU instances D1 and D2. An edge (u, v) can be added if and only if find(u) != find(v) in BOTH D1 and D2. If true, unite in both and output (u, v).",
    intervalDays: 14,
    easeFactor: 2.7,
    repetitions: 4,
    nextReviewAtSeconds: now - 1800, // Due now
    status: "DUE",
  },
  {
    id: "rev-3",
    conceptSlug: "two-pointers",
    conceptName: "Two Pointers Technique",
    problemName: "Books (Rating 1400)",
    problemRating: 1400,
    problemUrl: "https://codeforces.com/problemset/problem/279/B",
    questionPrompt:
      "How do we find the maximum consecutive books to read in time T in O(N) using sliding window?",
    answerKey:
      "Monotonic window: add a[r] to currentSum. While currentSum > T, subtract a[l] and advance l++. Track max(max_len, r - l + 1). Both l and r traverse array at most once.",
    intervalDays: 3,
    easeFactor: 2.4,
    repetitions: 2,
    nextReviewAtSeconds: now - 7200, // Due now
    status: "DUE",
  },
  {
    id: "rev-4",
    conceptSlug: "bfs-dfs",
    conceptName: "BFS / Tree Diameters",
    problemName: "Circumference of a Tree",
    problemRating: 1600,
    problemUrl: "https://codeforces.com/problemset/problem/1404/B",
    questionPrompt:
      "What is the two-BFS algorithm to find the diameter (longest path) of an unweighted tree in O(V + E)?",
    answerKey:
      "1. Run BFS from an arbitrary node u to find the farthest node v.\n2. Run a second BFS starting from node v to find the farthest node w.\n3. The distance dist(v, w) is the exact diameter of the tree.",
    intervalDays: 21,
    easeFactor: 2.8,
    repetitions: 5,
    nextReviewAtSeconds: now + 3 * 86400, // In 3 days
    status: "UPCOMING",
  },
  {
    id: "rev-5",
    conceptSlug: "knapsack",
    conceptName: "Knapsack DP (0/1)",
    problemName: "Dima and Salad",
    problemRating: 1600,
    problemUrl: "https://codeforces.com/problemset/problem/366/C",
    questionPrompt:
      "How do we transform the ratio condition Σ taste / Σ cal = K into an additive subset-sum DP?",
    answerKey:
      "Rearrange equation to Σ (taste_i - K * cal_i) = 0. Define balance weight w_i = taste_i - K * cal_i. Shift balances with offset +100000 to avoid negative array indices. Maximize taste subject to final balance = 0.",
    intervalDays: 10,
    easeFactor: 2.5,
    repetitions: 3,
    nextReviewAtSeconds: now + 5 * 86400, // In 5 days
    status: "UPCOMING",
  },
  {
    id: "rev-6",
    conceptSlug: "segment-tree",
    conceptName: "Segment Tree Point Updates",
    problemName: "Distinct Characters Queries",
    problemRating: 1600,
    problemUrl: "https://codeforces.com/problemset/problem/1234/D",
    questionPrompt:
      "How do we support dynamic range distinct character count queries efficiently in O(log N)?",
    answerKey:
      "Maintain 26 separate bitsets or Segment Trees (or 1 segment tree where each node stores a 26-bit bitmask). Point update flips character bits. Range query merges bitmasks with bitwise OR: popcount(merged_mask) is the distinct count in O(log N).",
    intervalDays: 1,
    easeFactor: 2.3,
    repetitions: 1,
    nextReviewAtSeconds: now - 100, // Due now
    status: "DUE",
  },
];

// In-memory session store to allow live SM-2 reviews during testing and dev
const memoryStore = new Map<string, RevisionCard>();
for (const card of DEFAULT_REVISION_CARDS) {
  memoryStore.set(card.id, { ...card });
}

/**
 * Retrieves the full revision queue with SM-2 metrics
 */
export function getRevisionQueue(): RevisionQueueSummary {
  const cards = Array.from(memoryStore.values());
  const currentNow = Math.floor(Date.now() / 1000);

  // Update status dynamically based on current time
  const updatedCards = cards.map((c) => ({
    ...c,
    status: classifyRevisionStatus(c.nextReviewAtSeconds, currentNow),
  }));

  const dueCards = updatedCards.filter((c) => c.status === "DUE");
  const upcomingCards = updatedCards.filter((c) => c.status === "UPCOMING");
  const masteredCards = updatedCards.filter((c) => c.repetitions >= 4);

  const avgEase =
    cards.length > 0
      ? Math.round((cards.reduce((acc, c) => acc + c.easeFactor, 0) / cards.length) * 100) / 100
      : 2.5;

  return {
    dueTodayCount: dueCards.length,
    upcomingWeekCount: upcomingCards.length,
    totalCardsCount: cards.length,
    masteredCardsCount: masteredCards.length,
    averageEaseFactor: avgEase,
    retentionRate: 91, // Standard estimated retention benchmark for SM-2
    dueCards,
    upcomingCards,
    allCards: updatedCards,
  };
}

/**
 * Submits a user review rating for an active recall card
 */
export function processCardReview(
  cardId: string,
  quality: ReviewQuality
): { card: RevisionCard; sm2: SM2Result; feedbackMessage: string } {
  let card = memoryStore.get(cardId);
  if (!card) {
    const fallback = DEFAULT_REVISION_CARDS.find((c) => c.id === cardId);
    if (!fallback) {
      throw new Error(`Revision card with id '${cardId}' not found.`);
    }
    card = { ...fallback };
  }

  const sm2Result = calculateSM2({
    quality,
    repetitions: card.repetitions,
    easeFactor: card.easeFactor,
    intervalDays: card.intervalDays,
  });

  const updatedCard: RevisionCard = {
    ...card,
    repetitions: sm2Result.repetitions,
    easeFactor: sm2Result.easeFactor,
    intervalDays: sm2Result.intervalDays,
    nextReviewAtSeconds: sm2Result.nextReviewAtSeconds,
    lastReviewedAtSeconds: Math.floor(Date.now() / 1000),
    status: "UPCOMING",
  };

  memoryStore.set(cardId, updatedCard);

  let feedbackMessage = "";
  if (quality >= 4) {
    feedbackMessage = `Excellent recall! Next interval extended to ${sm2Result.intervalFormatted}.`;
  } else if (quality === 3) {
    feedbackMessage = `Pass with difficulty. Next interval set to ${sm2Result.intervalFormatted}.`;
  } else {
    feedbackMessage = `Reset back to day 1 for immediate consolidation tomorrow.`;
  }

  return {
    card: updatedCard,
    sm2: sm2Result,
    feedbackMessage,
  };
}
