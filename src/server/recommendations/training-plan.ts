import {
  ProblemCandidate,
  RecommendationCategory,
} from "./recommendation-engine";
import { findCurriculumGuideForTopic } from "../knowledge/curriculum-links";

export interface TrainingTask {
  id: string;
  name: string;
  rating: number;
  tags: string[];
  url: string;
  goal: string;
  completed: boolean;
  isTheory?: boolean;
}

export interface TrainingDayTheoryModule {
  slug: string;
  title: string;
  bookCitation: string;
  chapter: string;
  keyInvariant: string;
  estimatedMinutes: number;
}

export interface TrainingDay {
  dayNumber: number; // 1 to 7
  dayName: string; // e.g. "Monday (Today)", "Tuesday", etc.
  theme: string;
  focusTopic: string;
  targetRatingRange: string;
  estimatedMinutes: number;
  category: RecommendationCategory;
  theoryModule?: TrainingDayTheoryModule;
  tasks: TrainingTask[];
  status: "COMPLETED" | "CURRENT" | "UPCOMING";
}

export interface WeekOverview {
  weekNumber: number;
  title: string;
  subtitle: string;
  description: string;
  focusTopics: string[];
  isCurrent: boolean;
}

export interface TrainingPlan {
  weekNumber: number;
  totalWeeks: number;
  targetTier: string;
  focusOverview: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  availableWeeks: WeekOverview[];
  days: TrainingDay[];
}

export interface GeneratePlanOptions {
  userRating: number;
  weekNumber?: number; // 1 to 4 (defaults to 1)
  startDate?: Date; // defaults to new Date()
  criticalWeaknesses?: string[];
  strongTopics?: string[];
  candidateProblems?: ProblemCandidate[];
  userSolvedKeys?: Set<string>;
  currentDayIndex?: number;
  diagnosticResult?: {
    verifiedTopicIds?: string[];
    blindspotTopicIds?: string[];
    unlearnedTopicIds?: string[];
    score?: number;
  };
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Curated library of benchmark Codeforces drill problems by category & tier
const CURATED_DRILLS: Record<string, { name: string; contestId: number; index: string; rating: number; tags: string[]; goal: string }[]> = {
  "prefix-sums": [
    { name: "Kuriyama Mirai's Stones", contestId: 433, index: "B", rating: 1100, tags: ["prefix sums", "sortings"], goal: "Compute 1D range queries on both raw and sorted configurations in O(1)." },
    { name: "Ilya and Queries", contestId: 313, index: "B", rating: 1100, tags: ["prefix sums", "dp"], goal: "Precompute adjacent match indicator prefix sums to answer Q queries in O(Q)." },
    { name: "Fence", contestId: 363, index: "B", rating: 1000, tags: ["prefix sums", "sliding window"], goal: "Find minimal sum subarray of fixed length K using sliding sum or prefix subtraction." },
    { name: "Nikita and string", contestId: 877, index: "B", rating: 1300, tags: ["prefix sums", "dp"], goal: "Partition string into a's and b's using two-split prefix count balance." },
  ],
  "two-pointers": [
    { name: "Sereja and Dima", contestId: 381, index: "A", rating: 800, tags: ["two pointers", "greedy"], goal: "Simulate greedy choices from outer array ends inward in amortized O(N)." },
    { name: "Books", contestId: 279, index: "B", rating: 1400, tags: ["two pointers", "binary search"], goal: "Maintain maximal contiguous window with sum <= T using advancing pointers." },
    { name: "They Are Everywhere", contestId: 701, index: "C", rating: 1400, tags: ["two pointers", "strings"], goal: "Find minimal window containing all distinct character types in O(N)." },
    { name: "Points on Line", contestId: 251, index: "A", rating: 1300, tags: ["two pointers", "combinatorics"], goal: "Count valid triplets using two pointers to bound max - min <= D in O(N)." },
  ],
  "binary-search-answer": [
    { name: "Interesting drink", contestId: 706, index: "B", rating: 1100, tags: ["binary search", "sortings"], goal: "Upper-bound query predicate on sorted coin prices in O(Q log N)." },
    { name: "Poisoned Dagger", contestId: 1613, index: "C", rating: 1200, tags: ["binary search", "greedy"], goal: "Binary search on poison duration k verifying total damage >= H in O(N log H)." },
    { name: "Hamburgers", contestId: 371, index: "C", rating: 1400, tags: ["binary search", "greedy"], goal: "Binary search on maximum burgers achievable within budget constraint." },
    { name: "K-th Not Divisible by n", contestId: 1352, index: "C", rating: 1200, tags: ["binary search", "math"], goal: "Invert modulo-count formula to find exact k-th skipped integer in O(1) or O(log N)." },
  ],
  "graphs": [
    { name: "Two Buttons", contestId: 520, index: "B", rating: 1400, tags: ["graphs", "bfs", "greedy"], goal: "Explore unweighted state transitions (x-1, 2x) via BFS for shortest path." },
    { name: "The Lakes", contestId: 1829, index: "E", rating: 1100, tags: ["graphs", "dfs"], goal: "Sum connected component grid lake volumes with standard DFS/BFS." },
    { name: "News Distribution", contestId: 1167, index: "C", rating: 1200, tags: ["graphs", "dsu", "dfs"], goal: "Count connected component sizes across shared user groups." },
    { name: "Badge", contestId: 1020, index: "B", rating: 1000, tags: ["graphs", "dfs"], goal: "Detect functional graph cycle entry points via visited tracking." },
  ],
  "dp": [
    { name: "Hit the Lottery", contestId: 996, index: "A", rating: 800, tags: ["dp", "greedy"], goal: "Greedy/DP coin denomination change invariant." },
    { name: "Cut Ribbon", contestId: 189, index: "A", rating: 1300, tags: ["dp", "knapsack"], goal: "1D knapsack variation maximizing piece count under exact length constraint." },
    { name: "Kefa and First Steps", contestId: 580, index: "A", rating: 900, tags: ["dp", "greedy"], goal: "Find longest non-decreasing contiguous subsegment in O(N)." },
    { name: "Woodcutters", contestId: 545, index: "C", rating: 1400, tags: ["dp", "greedy"], goal: "Formulate DP state for tree felling directions without overlap." },
  ],
  "dsu": [
    { name: "Mocha and Diana (Easy Version)", contestId: 1559, index: "D1", rating: 1400, tags: ["dsu", "graphs", "greedy"], goal: "Simultaneously maintain DSU forests across two graphs without introducing cycles." },
    { name: "Roads not only in Berland", contestId: 25, index: "D", rating: 1600, tags: ["dsu", "graphs"], goal: "Identify redundant cycle-forming edges with DSU and reassign them to connect components." },
    { name: "Learning Languages", contestId: 277, index: "A", rating: 1400, tags: ["dsu", "dfs", "graphs"], goal: "Determine minimal bridges to union all non-isolated employee components." },
  ],
  "dijkstra": [
    { name: "Dijkstra?", contestId: 20, index: "C", rating: 1900, tags: ["graphs", "shortest paths"], goal: "Classic single-source shortest path reconstruction with priority queue." },
    { name: "Jzzhu and Cities", contestId: 449, index: "B", rating: 2000, tags: ["graphs", "shortest paths"], goal: "Identify redundant train routes using Dijkstra distance tie-breaking." },
  ],
  "segment-tree": [
    { name: "Segment Tree for the Sum", contestId: 273168, index: "A", rating: 1400, tags: ["data structures"], goal: "Point update and range associative sum query in O(log N)." },
    { name: "Segment Tree for the Minimum", contestId: 273168, index: "B", rating: 1400, tags: ["data structures"], goal: "Range minimum query with neutral element +INF in O(log N)." },
  ],
};

function getTargetTier(userRating: number): {
  tier: string;
  minProbRating: number;
  maxProbRating: number;
} {
  if (userRating < 1200) {
    return {
      tier: "Pupil (1200) → Specialist (1400)",
      minProbRating: Math.max(800, userRating - 150),
      maxProbRating: Math.min(1300, userRating + 250),
    };
  } else if (userRating < 1400) {
    return {
      tier: "Specialist (1400) → Expert (1600)",
      minProbRating: Math.max(900, userRating - 150),
      maxProbRating: Math.min(1500, userRating + 200),
    };
  } else if (userRating < 1600) {
    return {
      tier: "Expert (1600) → Candidate Master (1900)",
      minProbRating: Math.max(1100, userRating - 150),
      maxProbRating: Math.min(1800, userRating + 250),
    };
  } else {
    return {
      tier: "Candidate Master (1900) → Master (2100+)",
      minProbRating: Math.max(1400, userRating - 100),
      maxProbRating: Math.min(2300, userRating + 350),
    };
  }
}

/**
 * Pure computational engine for generating an adaptive multi-week training curriculum.
 * Week starts TODAY (Day 1) with 0 days and 0 tasks pre-completed.
 */
export function generateAdaptiveTrainingPlan(options: GeneratePlanOptions): TrainingPlan {
  const {
    userRating,
    weekNumber = 1,
    startDate = new Date(),
    candidateProblems = [],
    userSolvedKeys = new Set<string>(),
  } = options;

  const { tier, minProbRating, maxProbRating } = getTargetTier(userRating);

  // Define 4 cohesive curriculum weeks
  const availableWeeks: WeekOverview[] = [
    {
      weekNumber: 1,
      title: "Week 1: Algorithmic Invariants & Monotonic Foundations",
      subtitle: "Range queries, sliding windows, and monotonic binary search predicates.",
      description: "Eliminating implementation WA on Div 2 A/B problems and establishing sub-15-minute speed.",
      focusTopics: ["prefix-sums", "two-pointers", "binary-search-answer"],
      isCurrent: weekNumber === 1,
    },
    {
      weekNumber: 2,
      title: "Week 2: Graph Traversals & Connected Components",
      subtitle: "BFS/DFS traversals, tree invariants, and Disjoint Set Union.",
      description: "Mastering graph representations, unweighted shortest paths, and dynamic connectivity.",
      focusTopics: ["graphs", "bfs-dfs", "dsu", "trees"],
      isCurrent: weekNumber === 2,
    },
    {
      weekNumber: 3,
      title: "Week 3: Dynamic Programming & State Formulation",
      subtitle: "1D DP DAGs, Knapsack space reduction, and grid transition invariants.",
      description: "Internalizing optimal substructure and formulation without lookahead pitfalls.",
      focusTopics: ["1d-dp", "knapsack", "dp", "grid-dp"],
      isCurrent: weekNumber === 3,
    },
    {
      weekNumber: 4,
      title: "Week 4: Advanced Structures & Contest Speed Mastery",
      subtitle: "Dijkstra, Segment Trees, Bitmask DP, and official contest simulation.",
      description: "Stretching rating boundary to +150 points with strict contest discipline and autopsy.",
      focusTopics: ["dijkstra", "segment-tree", "bitmask-dp", "contest"],
      isCurrent: weekNumber === 4,
    },
  ];

  // Helper to select calibrated problems for a topic
  const getProblemsForTopic = (
    topicKey: string,
    minR: number,
    maxR: number,
    count = 2
  ): TrainingTask[] => {
    // 1. Try candidateProblems from DB
    const matchingFromDb = candidateProblems.filter((p) => {
      const key = `${p.contestId ?? 0}-${p.index}`;
      if (userSolvedKeys.has(key) || userSolvedKeys.has(p.id)) return false;
      const r = p.rating ?? 1000;
      const ratingMatch = r >= minR && r <= maxR;
      const topicMatch = p.tags.some((t) => t.toLowerCase().includes(topicKey.toLowerCase()));
      return ratingMatch && topicMatch;
    });

    if (matchingFromDb.length >= count) {
      return matchingFromDb.slice(0, count).map((p, idx) => ({
        id: `task-${topicKey}-${p.id || idx}`,
        name: p.name,
        rating: p.rating ?? minR,
        tags: p.tags,
        url: p.contestId
          ? `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`
          : "https://codeforces.com/problemset",
        goal: `Solve under time constraint and analyze boundary invariants.`,
        completed: false, // ALWAYS START CLEAN: 0 completed!
      }));
    }

    // 2. Fall back to curated drills
    const curated = CURATED_DRILLS[topicKey] ?? CURATED_DRILLS["prefix-sums"];
    return curated.slice(0, count).map((p, idx) => ({
      id: `task-${topicKey}-${p.contestId}-${p.index}-${idx}`,
      name: p.name,
      rating: Math.min(maxR, Math.max(minR, p.rating)),
      tags: p.tags,
      url: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`,
      goal: p.goal,
      completed: false, // ALWAYS START CLEAN
    }));
  };

  // Generate 7 days starting from startDate (TODAY is Day 1)
  const days: TrainingDay[] = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + dayOffset);
    const dayOfWeekName = DAY_NAMES[dayDate.getDay()];
    const dayNumber = dayOffset + 1;
    const isToday = dayOffset === 0;
    const dayLabel = isToday ? `${dayOfWeekName} (Today)` : dayOfWeekName;

    let theme = "";
    let focusTopic = "";
    let targetRange = `${minProbRating}–${maxProbRating}`;
    let category: RecommendationCategory = "STRENGTHENING";
    let theorySlug = "prefix-sums";
    let tasks: TrainingTask[] = [];

    if (weekNumber === 1) {
      // WEEK 1: Foundations & Monotonic Invariants
      switch (dayNumber) {
        case 1:
          theme = "Prefix Sums & 2D Range Accumulation";
          focusTopic = "prefix-sums";
          theorySlug = "prefix-sums";
          category = "STRENGTHENING";
          targetRange = `${minProbRating}–${Math.min(maxProbRating, minProbRating + 200)}`;
          tasks = getProblemsForTopic("prefix-sums", minProbRating, minProbRating + 200);
          break;
        case 2:
          theme = "Two Pointers & Sliding Window Monotonicity";
          focusTopic = "two-pointers";
          theorySlug = "two-pointers";
          category = "STRENGTHENING";
          targetRange = `${minProbRating}–${Math.min(maxProbRating, minProbRating + 250)}`;
          tasks = getProblemsForTopic("two-pointers", minProbRating, minProbRating + 250);
          break;
        case 3:
          theme = "Binary Search on Answer & Predicate Inversion";
          focusTopic = "binary-search-answer";
          theorySlug = "binary-search-answer";
          category = "STRENGTHENING";
          targetRange = `${minProbRating + 50}–${maxProbRating}`;
          tasks = getProblemsForTopic("binary-search-answer", minProbRating + 50, maxProbRating);
          break;
        case 4:
          theme = "Greedy Exchange Arguments & Sorting Invariants";
          focusTopic = "two-pointers";
          theorySlug = "two-pointers";
          category = "PROGRESSION";
          targetRange = `${minProbRating + 100}–${maxProbRating}`;
          tasks = getProblemsForTopic("two-pointers", minProbRating + 100, maxProbRating);
          break;
        case 5:
          theme = "Div. 2 Problem A & B Rapid Speed Sprint (< 15 mins)";
          focusTopic = "prefix-sums";
          theorySlug = "prefix-sums";
          category = "CONTEST_PREPARATION";
          targetRange = `${minProbRating}–${userRating}`;
          tasks = [
            {
              id: "task-w1-d5-1",
              name: "Problem A One-Shot Implementation Sprint",
              rating: Math.max(800, userRating - 100),
              tags: ["implementation", "math"],
              url: "https://codeforces.com/problemset?tags=800-900",
              goal: "Achieve AC within 8 minutes without preliminary test failures.",
              completed: false,
            },
            {
              id: "task-w1-d5-2",
              name: "Problem B Monotonicity Observation Sprint",
              rating: Math.max(800, userRating),
              tags: ["greedy", "two pointers"],
              url: "https://codeforces.com/problemset?tags=1000-1100",
              goal: "Accurately formulate pointer invariants within 15 minutes.",
              completed: false,
            },
          ];
          break;
        case 6:
          theme = "Virtual Contest Simulation (Full 2-Hour Window)";
          focusTopic = "contest";
          theorySlug = "binary-search-answer";
          category = "CONTEST_PREPARATION";
          targetRange = `${minProbRating}–${maxProbRating}`;
          tasks = [
            {
              id: "task-w1-d6-1",
              name: "Simulate Official Div. 2 Round Under Real Timer",
              rating: userRating,
              tags: ["contest simulation"],
              url: "https://codeforces.com/contests",
              goal: "Enforce strict 25-minute problem pivot rule; catalog all test verdicts.",
              completed: false,
            },
            {
              id: "task-w1-d6-2",
              name: "Immediate Diagnostic Autopsy",
              rating: userRating,
              tags: ["autopsy"],
              url: "/virtual",
              goal: "Log root causes of all wrong submissions and time spent per problem.",
              completed: false,
            },
          ];
          break;
        case 7:
        default:
          theme = "Weekly Retrospective & Spaced Invariant Flashcards";
          focusTopic = "revision";
          theorySlug = "prefix-sums";
          category = "REVISION";
          targetRange = `${minProbRating}–${userRating}`;
          tasks = [
            {
              id: "task-w1-d7-1",
              name: "Re-solve 2 Flashcard Problems from Week 1",
              rating: Math.max(800, userRating - 100),
              tags: ["revision"],
              url: "/revision",
              goal: "Verify algorithmic retention without viewing hints or editorials.",
              completed: false,
            },
            {
              id: "task-w1-d7-2",
              name: "Skill Vector & Invariant Audit",
              rating: userRating,
              tags: ["knowledge"],
              url: "/topics",
              goal: "Verify mastery of monotonic boundaries before unlocking Week 2.",
              completed: false,
            },
          ];
          break;
      }
    } else if (weekNumber === 2) {
      // WEEK 2: Graph Traversals & Connected Components
      switch (dayNumber) {
        case 1:
          theme = "Breadth-First Search (BFS) & Shortest Path Invariant";
          focusTopic = "bfs-dfs";
          theorySlug = "bfs-dfs";
          category = "STRENGTHENING";
          targetRange = `${minProbRating}–${Math.min(maxProbRating, minProbRating + 200)}`;
          tasks = getProblemsForTopic("graphs", minProbRating, minProbRating + 200);
          break;
        case 2:
          theme = "Depth-First Search (DFS) & Connected Components";
          focusTopic = "bfs-dfs";
          theorySlug = "bfs-dfs";
          category = "STRENGTHENING";
          targetRange = `${minProbRating}–${Math.min(maxProbRating, minProbRating + 250)}`;
          tasks = getProblemsForTopic("graphs", minProbRating, minProbRating + 250);
          break;
        case 3:
          theme = "Tree Invariants, Subtree Sizes & Tree Diameter";
          focusTopic = "graphs";
          theorySlug = "bfs-dfs";
          category = "STRENGTHENING";
          targetRange = `${minProbRating + 50}–${maxProbRating}`;
          tasks = getProblemsForTopic("graphs", minProbRating + 50, maxProbRating);
          break;
        case 4:
          theme = "Disjoint Set Union (DSU) & Dynamic Connectivity";
          focusTopic = "dsu";
          theorySlug = "dsu";
          category = "PROGRESSION";
          targetRange = `${minProbRating + 100}–${maxProbRating}`;
          tasks = getProblemsForTopic("dsu", minProbRating + 100, maxProbRating);
          break;
        case 5:
          theme = "Timed Sprint: Div. 2 Problem B & C (< 25 mins)";
          focusTopic = "graphs";
          theorySlug = "bfs-dfs";
          category = "CONTEST_PREPARATION";
          targetRange = `${minProbRating}–${userRating + 100}`;
          tasks = [
            {
              id: "task-w2-d5-1",
              name: "Graph Component Count Speed Drill",
              rating: Math.max(900, userRating - 50),
              tags: ["dfs and similar", "graphs"],
              url: "https://codeforces.com/problemset?tags=graphs,1000-1200",
              goal: "Implement flood fill / DFS visitor array within 12 minutes.",
              completed: false,
            },
            {
              id: "task-w2-d5-2",
              name: "Tree Traversal Implementation Cleanliness",
              rating: userRating + 50,
              tags: ["trees", "dfs and similar"],
              url: "https://codeforces.com/problemset?tags=trees,1200-1400",
              goal: "Handle 1-based indexing and root parent tracking cleanly.",
              completed: false,
            },
          ];
          break;
        case 6:
          theme = "Virtual Contest Simulation (Full 2-Hour Window)";
          focusTopic = "contest";
          theorySlug = "dsu";
          category = "CONTEST_PREPARATION";
          targetRange = `${minProbRating}–${maxProbRating}`;
          tasks = [
            {
              id: "task-w2-d6-1",
              name: "Simulate Official Div. 2 Round Under Real Timer",
              rating: userRating,
              tags: ["contest simulation"],
              url: "https://codeforces.com/contests",
              goal: "Target 3 problems solved (A, B, C) with zero penalty WA on problem A.",
              completed: false,
            },
            {
              id: "task-w2-d6-2",
              name: "Immediate Diagnostic Autopsy",
              rating: userRating,
              tags: ["autopsy"],
              url: "/virtual",
              goal: "Review graph modeling decisions and runtime bottlenecks.",
              completed: false,
            },
          ];
          break;
        case 7:
        default:
          theme = "Graph Retrospective & Spaced Revision Drill";
          focusTopic = "revision";
          theorySlug = "dsu";
          category = "REVISION";
          targetRange = `${minProbRating}–${userRating}`;
          tasks = [
            {
              id: "task-w2-d7-1",
              name: "Re-solve 2 DSU & BFS Problems from Week 2",
              rating: Math.max(900, userRating - 50),
              tags: ["revision"],
              url: "/revision",
              goal: "Verify path compression and union by rank without code templates.",
              completed: false,
            },
            {
              id: "task-w2-d7-2",
              name: "Graph Invariant Retrospective",
              rating: userRating,
              tags: ["knowledge"],
              url: "/topics",
              goal: "Ensure graph node connectivity mastery before tackling DP.",
              completed: false,
            },
          ];
          break;
      }
    } else if (weekNumber === 3) {
      // WEEK 3: Dynamic Programming & State Formulation
      switch (dayNumber) {
        case 1:
          theme = "1D Dynamic Programming & DAG Topological Order";
          focusTopic = "1d-dp";
          theorySlug = "1d-dp";
          category = "STRENGTHENING";
          targetRange = `${minProbRating}–${Math.min(maxProbRating, minProbRating + 200)}`;
          tasks = getProblemsForTopic("dp", minProbRating, minProbRating + 200);
          break;
        case 2:
          theme = "0/1 Knapsack & Reverse Loop Space Compression";
          focusTopic = "knapsack";
          theorySlug = "knapsack";
          category = "STRENGTHENING";
          targetRange = `${minProbRating}–${Math.min(maxProbRating, minProbRating + 250)}`;
          tasks = getProblemsForTopic("dp", minProbRating, minProbRating + 250);
          break;
        case 3:
          theme = "Unbounded Knapsack & Coin Change Transition Trees";
          focusTopic = "knapsack";
          theorySlug = "knapsack";
          category = "STRENGTHENING";
          targetRange = `${minProbRating + 50}–${maxProbRating}`;
          tasks = getProblemsForTopic("dp", minProbRating + 50, maxProbRating);
          break;
        case 4:
          theme = "2D Grid DP & Corner Boundary Conditioning";
          focusTopic = "1d-dp";
          theorySlug = "1d-dp";
          category = "PROGRESSION";
          targetRange = `${minProbRating + 100}–${maxProbRating}`;
          tasks = getProblemsForTopic("dp", minProbRating + 100, maxProbRating);
          break;
        case 5:
          theme = "Timed Sprint: Div. 2 Problem C Optimization Drill (< 35 mins)";
          focusTopic = "dp";
          theorySlug = "1d-dp";
          category = "CONTEST_PREPARATION";
          targetRange = `${minProbRating + 50}–${userRating + 150}`;
          tasks = [
            {
              id: "task-w3-d5-1",
              name: "DP State Recurrence Rapid Formulation",
              rating: userRating + 50,
              tags: ["dp"],
              url: "https://codeforces.com/problemset?tags=dp,1200-1400",
              goal: "Draft base case and transition recurrence on scratchpad before typing code.",
              completed: false,
            },
            {
              id: "task-w3-d5-2",
              name: "Space Reduction Memory Optimization",
              rating: userRating + 100,
              tags: ["dp"],
              url: "https://codeforces.com/problemset?tags=dp,1300-1500",
              goal: "Compress O(N*W) state matrix into 1D rolling array O(W).",
              completed: false,
            },
          ];
          break;
        case 6:
          theme = "Virtual Contest Simulation (Full 2-Hour Window)";
          focusTopic = "contest";
          theorySlug = "knapsack";
          category = "CONTEST_PREPARATION";
          targetRange = `${minProbRating}–${maxProbRating}`;
          tasks = [
            {
              id: "task-w3-d6-1",
              name: "Simulate Official Div. 2 Round Under Real Timer",
              rating: userRating,
              tags: ["contest simulation"],
              url: "https://codeforces.com/contests",
              goal: "Execute flawless Problem A/B speed; allocate 50 minutes to Problem C.",
              completed: false,
            },
            {
              id: "task-w3-d6-2",
              name: "Post-Contest Autopsy & Upsolving",
              rating: userRating,
              tags: ["autopsy"],
              url: "/virtual",
              goal: "Upsolve Problem C or D within 24 hours of contest finish.",
              completed: false,
            },
          ];
          break;
        case 7:
        default:
          theme = "Algorithmic Memory Retrospective & Flashcard Drill";
          focusTopic = "revision";
          theorySlug = "1d-dp";
          category = "REVISION";
          targetRange = `${minProbRating}–${userRating}`;
          tasks = [
            {
              id: "task-w3-d7-1",
              name: "Re-solve 2 DP Problems from Week 3",
              rating: userRating,
              tags: ["revision"],
              url: "/revision",
              goal: "Re-derive optimal substructure proof from scratch without hints.",
              completed: false,
            },
            {
              id: "task-w3-d7-2",
              name: "Review Concept Graph DP Weak Spots",
              rating: userRating,
              tags: ["knowledge"],
              url: "/topics",
              goal: "Verify state space comprehension before entering Week 4.",
              completed: false,
            },
          ];
          break;
      }
    } else {
      // WEEK 4: Advanced Structures & Contest Speed Mastery
      switch (dayNumber) {
        case 1:
          theme = "Dijkstra's Single-Source Shortest Paths";
          focusTopic = "dijkstra";
          theorySlug = "dijkstra";
          category = "STRENGTHENING";
          targetRange = `${minProbRating + 50}–${maxProbRating}`;
          tasks = getProblemsForTopic("dijkstra", minProbRating + 50, maxProbRating);
          break;
        case 2:
          theme = "Segment Trees & Range Associative Monoid Queries";
          focusTopic = "segment-tree";
          theorySlug = "segment-tree";
          category = "STRENGTHENING";
          targetRange = `${minProbRating + 100}–${maxProbRating}`;
          tasks = getProblemsForTopic("segment-tree", minProbRating + 100, maxProbRating);
          break;
        case 3:
          theme = "Bitmask DP & State Compression (N <= 20)";
          focusTopic = "bitmask-dp";
          theorySlug = "bitmask-dp";
          category = "STRENGTHENING";
          targetRange = `${minProbRating + 100}–${maxProbRating + 100}`;
          tasks = getProblemsForTopic("dp", minProbRating + 100, maxProbRating + 100);
          break;
        case 4:
          theme = "High-Tier Boundary Conditioning (+150 Rating Stretch)";
          focusTopic = "graphs";
          theorySlug = "dijkstra";
          category = "PROGRESSION";
          targetRange = `${userRating + 50}–${userRating + 250}`;
          tasks = getProblemsForTopic("dsu", userRating + 50, userRating + 250);
          break;
        case 5:
          theme = "Full Mock Speed Contest Simulation (Div 2 Problem A–D Sprint)";
          focusTopic = "contest";
          theorySlug = "segment-tree";
          category = "CONTEST_PREPARATION";
          targetRange = `${minProbRating}–${maxProbRating}`;
          tasks = [
            {
              id: "task-w4-d5-1",
              name: "Sub-45 Minute Sprint for Problems A, B, C",
              rating: userRating,
              tags: ["speed drill"],
              url: "https://codeforces.com/problemset",
              goal: "Achieve clean AC on problems A, B, and C with zero debug penality.",
              completed: false,
            },
            {
              id: "task-w4-d5-2",
              name: "Problem D Mathematical Reduction Exploration",
              rating: userRating + 200,
              tags: ["hard observation"],
              url: "https://codeforces.com/problemset",
              goal: "Write concrete invariants and sample reductions for 35 minutes.",
              completed: false,
            },
          ];
          break;
        case 6:
          theme = "Official Rated Contest Simulation (2-Hour Clock)";
          focusTopic = "contest";
          theorySlug = "bitmask-dp";
          category = "CONTEST_PREPARATION";
          targetRange = `${minProbRating}–${maxProbRating + 200}`;
          tasks = [
            {
              id: "task-w4-d6-1",
              name: "Simulate Official Div. 2 Round Under Real Timer",
              rating: userRating,
              tags: ["contest simulation"],
              url: "https://codeforces.com/contests",
              goal: "Execute strict contest management; pivot when stuck > 25 mins.",
              completed: false,
            },
            {
              id: "task-w4-d6-2",
              name: "Immediate Diagnostic Autopsy",
              rating: userRating,
              tags: ["autopsy"],
              url: "/virtual",
              goal: "Identify the exact bottleneck preventing next-tier rating promotion.",
              completed: false,
            },
          ];
          break;
        case 7:
        default:
          theme = "Curriculum Graduation & Milestone Vector Calibration";
          focusTopic = "revision";
          theorySlug = "segment-tree";
          category = "REVISION";
          targetRange = `${minProbRating}–${maxProbRating}`;
          tasks = [
            {
              id: "task-w4-d7-1",
              name: "Curriculum Spaced Retention Mastery Drill",
              rating: userRating,
              tags: ["revision"],
              url: "/revision",
              goal: "Verify recall across all 10 core algorithmic paradigms.",
              completed: false,
            },
            {
              id: "task-w4-d7-2",
              name: "Milestone Skill Vector Calibration",
              rating: userRating,
              tags: ["knowledge"],
              url: "/topics",
              goal: "Compare starting vs final radar graph; lock in new baseline tier.",
              completed: false,
            },
          ];
          break;
      }
    }

    // Theory guide link lookup
    const guide = findCurriculumGuideForTopic(theorySlug);
    const theoryModule: TrainingDayTheoryModule | undefined = guide
      ? {
          slug: guide.slug,
          title: guide.name,
          bookCitation: guide.primaryBookCitation,
          chapter: guide.chapter,
          keyInvariant: guide.keyInvariant,
          estimatedMinutes: 20,
        }
      : undefined;

    // Day theory study task
    const theoryTask: TrainingTask = {
      id: `task-w${weekNumber}-d${dayNumber}-theory`,
      name: `📖 Theory Study: ${guide?.name ?? focusTopic.toUpperCase()}`,
      rating: userRating,
      tags: [focusTopic, "theory"],
      url: `/learn/${guide?.slug ?? theorySlug}`,
      goal: `Internalize ${guide?.primaryBookCitation ?? "Curriculum Guide"} (${guide?.chapter ?? "Theory"}). Invariant: "${guide?.keyInvariant ?? "Mathematical Proof"}"`,
      completed: false, // ALWAYS START CLEAN
      isTheory: true,
    };

    const combinedTasks = [theoryTask, ...tasks];

    days.push({
      dayNumber,
      dayName: dayLabel,
      theme,
      focusTopic,
      targetRatingRange: targetRange,
      estimatedMinutes: 80,
      category,
      theoryModule,
      tasks: combinedTasks,
      status: isToday ? "CURRENT" : "UPCOMING",
    });
  }

  // Count tasks
  let totalTasks = 0;
  let completedTasks = 0;
  for (const d of days) {
    for (const t of d.tasks) {
      totalTasks++;
      if (t.completed) completedTasks++;
    }
  }

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const currentWeekMeta = availableWeeks.find((w) => w.weekNumber === weekNumber) ?? availableWeeks[0];

  return {
    weekNumber,
    totalWeeks: 4,
    targetTier: tier,
    focusOverview: currentWeekMeta.description,
    totalTasks,
    completedTasks,
    completionPercentage,
    availableWeeks,
    days,
  };
}
