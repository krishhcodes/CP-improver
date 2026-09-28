import {
  ProblemCandidate,
  RecommendationCategory,
} from "./recommendation-engine";
import { findCurriculumGuideForTopic, CurriculumGuideLink } from "../knowledge/curriculum-links";

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
  dayName: string; // "Monday", "Tuesday", etc.
  theme: string;
  focusTopic: string;
  targetRatingRange: string;
  estimatedMinutes: number;
  category: RecommendationCategory;
  theoryModule?: TrainingDayTheoryModule;
  tasks: TrainingTask[];
  status: "COMPLETED" | "CURRENT" | "UPCOMING";
}

export interface TrainingPlan {
  weekNumber: number;
  targetTier: string;
  focusOverview: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  days: TrainingDay[];
}

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * Pure computational engine for generating an adaptive 7-day training curriculum.
 */
export function generateAdaptiveTrainingPlan(params: {
  userRating: number;
  criticalWeaknesses?: string[];
  strongTopics?: string[];
  candidateProblems?: ProblemCandidate[];
  userSolvedKeys?: Set<string>;
  currentDayIndex?: number; // 0 for Mon, 1 for Tue, etc.
}): TrainingPlan {
  const {
    userRating,
    criticalWeaknesses = ["dp", "strings"],
    strongTopics = ["graphs", "greedy"],
    candidateProblems = [],
    userSolvedKeys = new Set<string>(),
    currentDayIndex = 2, // Default Wednesday for demo
  } = params;

  const primaryWeakness = criticalWeaknesses[0] ?? "dp";
  const secondaryWeakness = criticalWeaknesses[1] ?? "strings";
  const primaryStrength = strongTopics[0] ?? "graphs";

  // Helper to find matching candidate problems for a topic and rating range
  const findProblemsForDay = (
    topic: string,
    minRating: number,
    maxRating: number,
    count = 2
  ): ProblemCandidate[] => {
    return candidateProblems
      .filter((p) => {
        const key = `${p.contestId ?? 0}-${p.index}`;
        if (userSolvedKeys.has(key) || userSolvedKeys.has(p.id)) return false;
        const r = p.rating ?? 1400;
        const ratingMatch = r >= minRating && r <= maxRating;
        const topicMatch = p.tags.some((t) => t.toLowerCase().includes(topic.toLowerCase()));
        return ratingMatch && topicMatch;
      })
      .slice(0, count);
  };

  const days: TrainingDay[] = [];

  // Day 1: Primary Weakness Strengthening
  const day1Probs = findProblemsForDay(primaryWeakness, userRating - 200, userRating);
  const d1Guide = findCurriculumGuideForTopic(primaryWeakness);
  days.push({
    dayNumber: 1,
    dayName: "Monday",
    theme: `${primaryWeakness.toUpperCase()} Foundations & State Transitions`,
    focusTopic: primaryWeakness,
    targetRatingRange: `${userRating - 200}–${userRating}`,
    estimatedMinutes: 90,
    category: "STRENGTHENING",
    theoryModule: d1Guide
      ? {
          slug: d1Guide.slug,
          title: d1Guide.name,
          bookCitation: d1Guide.primaryBookCitation,
          chapter: d1Guide.chapter,
          keyInvariant: d1Guide.keyInvariant,
          estimatedMinutes: 20,
        }
      : undefined,
    status: currentDayIndex > 0 ? "COMPLETED" : currentDayIndex === 0 ? "CURRENT" : "UPCOMING",
    tasks: [
      {
        id: "task-mon-theory",
        name: `📖 Theory Study: ${d1Guide?.name ?? primaryWeakness.toUpperCase()}`,
        rating: userRating,
        tags: [primaryWeakness, "theory"],
        url: `/learn/${d1Guide?.slug ?? "1d-dp"}`,
        goal: `Internalize ${d1Guide?.primaryBookCitation ?? "standard curriculum"} (${d1Guide?.chapter ?? "Theory"}). Invariant: ${d1Guide?.keyInvariant ?? "State formulation"}`,
        completed: currentDayIndex > 0,
        isTheory: true,
      },
      {
        id: day1Probs[0]?.id ?? "task-mon-1",
        name: day1Probs[0]?.name ?? `${primaryWeakness.toUpperCase()} Core Pattern Drill`,
        rating: day1Probs[0]?.rating ?? Math.max(800, userRating - 150),
        tags: [primaryWeakness],
        url: day1Probs[0]?.contestId
          ? `https://codeforces.com/contest/${day1Probs[0].contestId}/problem/${day1Probs[0].index}`
          : "https://codeforces.com/problemset",
        goal: `Master transition recurrence without lookahead pitfalls.`,
        completed: currentDayIndex > 0,
      },
      {
        id: day1Probs[1]?.id ?? "task-mon-2",
        name: day1Probs[1]?.name ?? `${primaryWeakness.toUpperCase()} Boundary Conditioning`,
        rating: day1Probs[1]?.rating ?? Math.max(800, userRating - 50),
        tags: [primaryWeakness],
        url: day1Probs[1]?.contestId
          ? `https://codeforces.com/contest/${day1Probs[1].contestId}/problem/${day1Probs[1].index}`
          : "https://codeforces.com/problemset",
        goal: `Identify base cases and optimal sub-structure.`,
        completed: currentDayIndex > 0,
      },
    ],
  });

  // Day 2: Secondary Weakness Deep Dive
  const day2Probs = findProblemsForDay(secondaryWeakness, userRating - 150, userRating + 50);
  const d2Guide = findCurriculumGuideForTopic(secondaryWeakness);
  days.push({
    dayNumber: 2,
    dayName: "Tuesday",
    theme: `${secondaryWeakness.toUpperCase()} Pattern Drill & Invariants`,
    focusTopic: secondaryWeakness,
    targetRatingRange: `${userRating - 150}–${userRating + 50}`,
    estimatedMinutes: 80,
    category: "STRENGTHENING",
    theoryModule: d2Guide
      ? {
          slug: d2Guide.slug,
          title: d2Guide.name,
          bookCitation: d2Guide.primaryBookCitation,
          chapter: d2Guide.chapter,
          keyInvariant: d2Guide.keyInvariant,
          estimatedMinutes: 20,
        }
      : undefined,
    status: currentDayIndex > 1 ? "COMPLETED" : currentDayIndex === 1 ? "CURRENT" : "UPCOMING",
    tasks: [
      {
        id: "task-tue-theory",
        name: `📖 Theory Study: ${d2Guide?.name ?? secondaryWeakness.toUpperCase()}`,
        rating: userRating,
        tags: [secondaryWeakness, "theory"],
        url: `/learn/${d2Guide?.slug ?? "two-pointers"}`,
        goal: `Read ${d2Guide?.primaryBookCitation ?? "Curriculum Guide"} on ${d2Guide?.chapter ?? "Invariants"}.`,
        completed: currentDayIndex > 1,
        isTheory: true,
      },
      {
        id: day2Probs[0]?.id ?? "task-tue-1",
        name: day2Probs[0]?.name ?? `${secondaryWeakness.toUpperCase()} Invariant Analysis`,
        rating: day2Probs[0]?.rating ?? Math.max(800, userRating - 100),
        tags: [secondaryWeakness],
        url: day2Probs[0]?.contestId
          ? `https://codeforces.com/contest/${day2Probs[0].contestId}/problem/${day2Probs[0].index}`
          : "https://codeforces.com/problemset",
        goal: `Strengthen implementation speed and corner-case handling.`,
        completed: currentDayIndex > 1,
      },
      {
        id: day2Probs[1]?.id ?? "task-tue-2",
        name: day2Probs[1]?.name ?? `${secondaryWeakness.toUpperCase()} Advanced Variant`,
        rating: day2Probs[1]?.rating ?? userRating,
        tags: [secondaryWeakness],
        url: day2Probs[1]?.contestId
          ? `https://codeforces.com/contest/${day2Probs[1].contestId}/problem/${day2Probs[1].index}`
          : "https://codeforces.com/problemset",
        goal: `Eliminate off-by-one errors under time constraint.`,
        completed: currentDayIndex > 1,
      },
    ],
  });

  // Day 3: Active Upsolving & Contest Diagnosis
  const d3Guide = findCurriculumGuideForTopic("binary search");
  days.push({
    dayNumber: 3,
    dayName: "Wednesday",
    theme: "Active Contest Upsolving & Autopsy Review",
    focusTopic: "upsolve",
    targetRatingRange: `${userRating}–${userRating + 150}`,
    estimatedMinutes: 90,
    category: "UPSOLVE",
    theoryModule: d3Guide
      ? {
          slug: d3Guide.slug,
          title: d3Guide.name,
          bookCitation: d3Guide.primaryBookCitation,
          chapter: d3Guide.chapter,
          keyInvariant: d3Guide.keyInvariant,
          estimatedMinutes: 15,
        }
      : undefined,
    status: currentDayIndex > 2 ? "COMPLETED" : currentDayIndex === 2 ? "CURRENT" : "UPCOMING",
    tasks: [
      {
        id: "task-wed-theory",
        name: `📖 Theory Study: ${d3Guide?.name ?? "Binary Search on Answer"}`,
        rating: userRating + 50,
        tags: ["binary search", "theory"],
        url: `/learn/${d3Guide?.slug ?? "binary-search-answer"}`,
        goal: `Verify monotonic predicate verification invariants before upsolving.`,
        completed: false,
        isTheory: true,
      },
      {
        id: "task-wed-1",
        name: "Educational Round 169 Problem D: Colored Portals",
        rating: Math.min(2400, userRating + 50),
        tags: ["graphs", "binary search"],
        url: "https://codeforces.com/contest/970/problem/D",
        goal: "Resolve contest TLE bottleneck with coordinate compression.",
        completed: false,
      },
      {
        id: "task-wed-2",
        name: "Educational Round 169 Problem E: Not a Nim Problem",
        rating: Math.min(2400, userRating + 150),
        tags: ["games", "math"],
        url: "https://codeforces.com/contest/970/problem/E",
        goal: "Analyze prime factorization Grundy value patterns.",
        completed: false,
      },
    ],
  });

  // Day 4: Progression & Boundary Push
  const day4Probs = findProblemsForDay(primaryStrength, userRating + 50, userRating + 250);
  const d4Guide = findCurriculumGuideForTopic(primaryStrength);
  days.push({
    dayNumber: 4,
    dayName: "Thursday",
    theme: `${primaryStrength.toUpperCase()} Boundary Push (+150 Rating)`,
    focusTopic: primaryStrength,
    targetRatingRange: `${userRating + 50}–${userRating + 250}`,
    estimatedMinutes: 100,
    category: "PROGRESSION",
    theoryModule: d4Guide
      ? {
          slug: d4Guide.slug,
          title: d4Guide.name,
          bookCitation: d4Guide.primaryBookCitation,
          chapter: d4Guide.chapter,
          keyInvariant: d4Guide.keyInvariant,
          estimatedMinutes: 20,
        }
      : undefined,
    status: currentDayIndex > 3 ? "COMPLETED" : currentDayIndex === 3 ? "CURRENT" : "UPCOMING",
    tasks: [
      {
        id: "task-thu-theory",
        name: `📖 Advanced Theory: ${d4Guide?.name ?? primaryStrength.toUpperCase()}`,
        rating: userRating + 100,
        tags: [primaryStrength, "theory"],
        url: `/learn/${d4Guide?.slug ?? "bfs-dfs"}`,
        goal: `Master high-tier variations from ${d4Guide?.primaryBookCitation ?? "Textbook Guide"}.`,
        completed: false,
        isTheory: true,
      },
      {
        id: day4Probs[0]?.id ?? "task-thu-1",
        name: day4Probs[0]?.name ?? `${primaryStrength.toUpperCase()} Hard Observation`,
        rating: day4Probs[0]?.rating ?? userRating + 100,
        tags: [primaryStrength],
        url: day4Probs[0]?.contestId
          ? `https://codeforces.com/contest/${day4Probs[0].contestId}/problem/${day4Probs[0].index}`
          : "https://codeforces.com/problemset",
        goal: `Stretch strategic thinking into next rating tier.`,
        completed: false,
      },
      {
        id: day4Probs[1]?.id ?? "task-thu-2",
        name: day4Probs[1]?.name ?? `${primaryStrength.toUpperCase()} Complex Construction`,
        rating: day4Probs[1]?.rating ?? userRating + 200,
        tags: [primaryStrength],
        url: day4Probs[1]?.contestId
          ? `https://codeforces.com/contest/${day4Probs[1].contestId}/problem/${day4Probs[1].index}`
          : "https://codeforces.com/problemset",
        goal: `Develop rigorous proof for non-trivial edge cases.`,
        completed: false,
      },
    ],
  });

  // Day 5: Timed Speed Simulation
  const d5Guide = findCurriculumGuideForTopic("two-pointers");
  days.push({
    dayNumber: 5,
    dayName: "Friday",
    theme: "Timed Speed Drill: Div. 2 Problem B & C",
    focusTopic: "greedy",
    targetRatingRange: `${userRating - 300}–${userRating}`,
    estimatedMinutes: 60,
    category: "CONTEST_PREPARATION",
    theoryModule: d5Guide
      ? {
          slug: d5Guide.slug,
          title: d5Guide.name,
          bookCitation: d5Guide.primaryBookCitation,
          chapter: d5Guide.chapter,
          keyInvariant: d5Guide.keyInvariant,
          estimatedMinutes: 15,
        }
      : undefined,
    status: currentDayIndex > 4 ? "COMPLETED" : currentDayIndex === 4 ? "CURRENT" : "UPCOMING",
    tasks: [
      {
        id: "task-fri-1",
        name: "Problem B Rapid Observation Sprint (< 12 mins)",
        rating: Math.max(800, userRating - 250),
        tags: ["greedy", "math"],
        url: "https://codeforces.com/problemset",
        goal: "One-shot implementation without preliminary test fails.",
        completed: false,
      },
      {
        id: "task-fri-2",
        name: "Problem C Implementation Cleanliness Sprint (< 25 mins)",
        rating: userRating - 50,
        tags: ["constructive algorithms"],
        url: "https://codeforces.com/problemset",
        goal: "Prevent late-contest submission panics and debug time leaks.",
        completed: false,
      },
    ],
  });

  // Day 6: Virtual Contest Prep
  days.push({
    dayNumber: 6,
    dayName: "Saturday",
    theme: "Virtual Contest Simulation (Full 2-Hour Window)",
    focusTopic: "contest",
    targetRatingRange: `${userRating - 200}–${userRating + 300}`,
    estimatedMinutes: 130,
    category: "CONTEST_PREPARATION",
    theoryModule: {
      slug: "two-pointers",
      title: "Contest Clock Discipline & 25-Minute Pivot Rule",
      bookCitation: "Principles of Algorithmic Problem Solving (Sannemo Ch 2)",
      chapter: "Contest Strategy & Opportunity Cost Management",
      keyInvariant: "Never remain stuck > 25 mins without an invariant proof; pivot to inspect easier unattempted problems.",
      estimatedMinutes: 15,
    },
    status: currentDayIndex > 5 ? "COMPLETED" : currentDayIndex === 5 ? "CURRENT" : "UPCOMING",
    tasks: [
      {
        id: "task-sat-1",
        name: "Simulate Official Div. 2 Round Under Real Timer",
        rating: userRating,
        tags: ["contest simulation"],
        url: "https://codeforces.com/contests",
        goal: "Maintain strict penalty discipline and problem-hopping rule.",
        completed: false,
      },
      {
        id: "task-sat-2",
        name: "Immediate Diagnostic Autopsy",
        rating: userRating,
        tags: ["autopsy"],
        url: "/virtual",
        goal: "Catalog exact time of first AC, rejected attempts, and skipped problems.",
        completed: false,
      },
    ],
  });

  // Day 7: Spaced Revision & Retrospective
  const d7Guide = findCurriculumGuideForTopic("dsu");
  days.push({
    dayNumber: 7,
    dayName: "Sunday",
    theme: "Spaced Revision & Algorithmic Retrospective",
    focusTopic: "revision",
    targetRatingRange: `${userRating - 200}–${userRating + 100}`,
    estimatedMinutes: 60,
    category: "REVISION",
    theoryModule: d7Guide
      ? {
          slug: d7Guide.slug,
          title: d7Guide.name,
          bookCitation: d7Guide.primaryBookCitation,
          chapter: d7Guide.chapter,
          keyInvariant: d7Guide.keyInvariant,
          estimatedMinutes: 20,
        }
      : undefined,
    status: currentDayIndex > 6 ? "COMPLETED" : currentDayIndex === 6 ? "CURRENT" : "UPCOMING",
    tasks: [
      {
        id: "task-sun-1",
        name: "Re-solve 2 Flashcard Problems from Previous Week",
        rating: userRating - 100,
        tags: ["revision"],
        url: "/revision",
        goal: "Verify algorithmic retention without looking at editorials.",
        completed: false,
      },
      {
        id: "task-sun-2",
        name: "Review Concept Graph Weak Spots",
        rating: userRating,
        tags: ["knowledge"],
        url: "/topics",
        goal: "Ensure skill vector shows positive delta in targeted weak topics.",
        completed: false,
      },
    ],
  });

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

  return {
    weekNumber: 4,
    targetTier: "Candidate Master (1900)",
    focusOverview: `Targeting critical deficiency in ${primaryWeakness.toUpperCase()} and ${secondaryWeakness.toUpperCase()} while stretching ${primaryStrength.toUpperCase()} to +150 rating points.`,
    totalTasks,
    completedTasks,
    completionPercentage,
    days,
  };
}
