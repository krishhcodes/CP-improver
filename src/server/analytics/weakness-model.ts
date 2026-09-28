import { findCurriculumGuideForTopic, CurriculumGuideLink } from "../knowledge/curriculum-links";

export type TopicStatus =
  | "CRITICAL_WEAKNESS"
  | "NEEDS_WORK"
  | "PROFICIENT"
  | "MASTERED"
  | "NEEDS_DATA";

export interface TopicSubmission {
  id: string;
  problemId: string;
  problemName: string;
  rating?: number | null;
  tags: string[];
  verdict: string; // "OK", "WRONG_ANSWER", etc.
  creationTimeSeconds: number;
}

export interface TopicCurriculumRef {
  slug: string;
  name: string;
  bookCitation: string;
  chapter: string;
  keyInvariant: string;
}

export interface TopicSkillMetric {
  tag: string;
  totalSubmissions: number;
  solvedCount: number;
  failedCount: number;
  successRate: number; // 0 - 100 %
  avgSolvedRating: number;
  maxSolvedRating: number;
  weaknessScore: number; // 0 - 100 (100 = acute deficiency)
  proficiencyScore: number; // 0 - 100 (100 = mastered)
  confidence: number; // 0.0 - 1.0 (based on sample size)
  status: TopicStatus;
  actionRecommendation: string;
  curriculumRef?: TopicCurriculumRef;
}

export interface SkillVectorSummary {
  totalTopicsTracked: number;
  criticalWeaknesses: TopicSkillMetric[];
  needsWorkTopics: TopicSkillMetric[];
  proficientTopics: TopicSkillMetric[];
  radarSkills: Array<{
    subject: string;
    proficiency: number;
    fullMark: number;
  }>;
}

/**
 * Calculates difficulty weight for a failed problem.
 * Failing a problem near or below current rating yields the strongest weakness signal.
 */
export function calculateFailureWeight(problemRating: number, userRating: number): number {
  const diff = problemRating - userRating;
  // If problem is far below user rating (e.g. -400), weight increases up to 2.0
  // If problem is far above user rating (e.g. +600), weight decreases to 0.5
  const normalized = 1.0 - diff / 600;
  return Math.max(0.5, Math.min(2.0, normalized));
}

/**
 * Calculates reward weight for a solved problem.
 * Solving problems above current rating offsets weakness and boosts proficiency.
 */
export function calculateSolveReward(problemRating: number, userRating: number): number {
  if (userRating <= 0) return 1.0;
  const ratio = problemRating / userRating;
  return Math.max(0.4, Math.min(2.0, ratio));
}

/**
 * Exponential recency decay with a 60-day half-life.
 */
export function calculateRecencyWeight(
  submissionTimeSeconds: number,
  nowSeconds: number
): number {
  const diffSeconds = Math.max(0, nowSeconds - submissionTimeSeconds);
  const diffDays = diffSeconds / 86400;
  // Half life of 60 days
  return Math.pow(0.5, diffDays / 60);
}

/**
 * Mathematical Topic Weakness Score for a single topic.
 * Returns a normalized score in [0, 100].
 */
export function calculateTopicWeakness(params: {
  submissions: Array<{
    rating?: number | null;
    verdict: string;
    creationTimeSeconds: number;
  }>;
  userRating: number;
  nowSeconds?: number;
}): {
  weaknessScore: number;
  solvedCount: number;
  failedCount: number;
  avgSolvedRating: number;
  maxSolvedRating: number;
} {
  const { submissions, userRating, nowSeconds = Math.floor(Date.now() / 1000) } = params;

  if (submissions.length === 0) {
    return {
      weaknessScore: 50,
      solvedCount: 0,
      failedCount: 0,
      avgSolvedRating: 0,
      maxSolvedRating: 0,
    };
  }

  let totalFailPenalty = 0;
  let totalSolveReward = 0;
  let solvedCount = 0;
  let failedCount = 0;
  let solvedRatingSum = 0;
  let maxSolvedRating = 0;

  for (const sub of submissions) {
    const rating = sub.rating ?? userRating;
    const recency = calculateRecencyWeight(sub.creationTimeSeconds, nowSeconds);

    if (sub.verdict === "OK") {
      solvedCount++;
      solvedRatingSum += rating;
      if (rating > maxSolvedRating) maxSolvedRating = rating;

      const reward = calculateSolveReward(rating, userRating);
      totalSolveReward += reward * recency;
    } else {
      failedCount++;
      const penalty = calculateFailureWeight(rating, userRating);
      totalFailPenalty += penalty * recency;
    }
  }

  const totalAttempts = solvedCount + failedCount;
  const avgSolvedRating = solvedCount > 0 ? Math.round(solvedRatingSum / solvedCount) : 0;

  // Raw weakness balance: fail penalties minus solve rewards normalized by attempts
  const rawBalance = (totalFailPenalty * 1.5 - totalSolveReward) / Math.sqrt(totalAttempts + 1);

  // Map raw balance smoothly into [0, 100] using hyperbolic tangent
  // tanh(0) = 0 -> 50, tanh(1) ~ 0.76 -> 88, tanh(-1) ~ -0.76 -> 12
  const scaled = 50 + 50 * Math.tanh(rawBalance);
  const weaknessScore = Math.round(Math.max(0, Math.min(100, scaled)));

  return {
    weaknessScore,
    solvedCount,
    failedCount,
    avgSolvedRating,
    maxSolvedRating,
  };
}

/**
 * Generates explainable action recommendation string based on weakness & proficiency
 */
export function generateTopicRecommendation(
  tag: string,
  status: TopicStatus,
  weaknessScore: number,
  avgSolvedRating: number,
  userRating: number,
  failedCount: number,
  guide?: CurriculumGuideLink | null
): string {
  const targetRating = Math.max(800, userRating - 100);
  const stretchRating = userRating + 100;
  const bookNotice = guide ? ` [Study Guide: ${guide.primaryBookCitation} — ${guide.name}]` : "";

  switch (status) {
    case "CRITICAL_WEAKNESS":
      return `Critical weakness detected in ${tag} (score: ${weaknessScore}/100, ${failedCount} failures). Review foundational theory${bookNotice} and drill problems rated ${targetRating}–${userRating}.`;
    case "NEEDS_WORK":
      return `Moderate failure rate in ${tag}. Strengthen invariant recognition${guide ? ` using ${guide.primaryBookCitation}` : ""} and practice 5–8 targeted problems rated around ${userRating}.`;
    case "PROFICIENT":
      return `Solid execution in ${tag} (avg solve: ${avgSolvedRating}). Ready to push into advanced variations (${guide?.chapter || "higher tiers"}) rated ${stretchRating}+.`;
    case "MASTERED":
      return `High mastery in ${tag}. Maintained consistent success up to rating ${avgSolvedRating}. Keep fresh with occasional contest-level reviews.`;
    case "NEEDS_DATA":
    default:
      return `Insufficient submission history in ${tag} to form high-confidence diagnostic. Solve 3–5 benchmark problems to calibrate your skill level.`;
  }
}

/**
 * Computes full Skill Vector Model across all Codeforces tags
 */
export function computeSkillVector(params: {
  submissions: TopicSubmission[];
  userRating: number;
  nowSeconds?: number;
}): {
  skillVector: TopicSkillMetric[];
  summary: SkillVectorSummary;
} {
  const { submissions, userRating, nowSeconds = Math.floor(Date.now() / 1000) } = params;

  // Group submissions by tag
  const tagSubmissions = new Map<string, TopicSubmission[]>();

  for (const sub of submissions) {
    for (const tag of sub.tags) {
      const normalizedTag = tag.trim().toLowerCase();
      if (!normalizedTag) continue;

      let list = tagSubmissions.get(normalizedTag);
      if (!list) {
        list = [];
        tagSubmissions.set(normalizedTag, list);
      }
      list.push(sub);
    }
  }

  const skillVector: TopicSkillMetric[] = [];

  for (const [tag, subs] of tagSubmissions.entries()) {
    const { weaknessScore, solvedCount, failedCount, avgSolvedRating, maxSolvedRating } =
      calculateTopicWeakness({
        submissions: subs,
        userRating,
        nowSeconds,
      });

    const totalSubmissions = solvedCount + failedCount;
    const successRate = totalSubmissions > 0 ? Math.round((solvedCount / totalSubmissions) * 100) : 0;
    const confidence = Math.min(1.0, totalSubmissions / 10);

    // Compute proficiency score [0, 100]
    // Considers difficulty ratio + inverse weakness, damped by confidence
    let baseProficiency = 50;
    if (userRating > 0 && avgSolvedRating > 0) {
      baseProficiency = (avgSolvedRating / userRating) * 60 + (100 - weaknessScore) * 0.4;
    } else {
      baseProficiency = (100 - weaknessScore) * 0.8;
    }

    const proficiencyScore = Math.round(
      Math.max(0, Math.min(100, baseProficiency * (0.4 + 0.6 * confidence)))
    );

    // Determine status
    let status: TopicStatus;
    if (totalSubmissions < 3) {
      status = "NEEDS_DATA";
    } else if (weaknessScore >= 65) {
      status = "CRITICAL_WEAKNESS";
    } else if (weaknessScore >= 45 || successRate < 50) {
      status = "NEEDS_WORK";
    } else if (proficiencyScore >= 80 && successRate >= 75) {
      status = "MASTERED";
    } else {
      status = "PROFICIENT";
    }

    const guide = findCurriculumGuideForTopic(tag);

    const actionRecommendation = generateTopicRecommendation(
      tag,
      status,
      weaknessScore,
      avgSolvedRating,
      userRating,
      failedCount,
      guide
    );

    skillVector.push({
      tag,
      totalSubmissions,
      solvedCount,
      failedCount,
      successRate,
      avgSolvedRating,
      maxSolvedRating,
      weaknessScore,
      proficiencyScore,
      confidence,
      status,
      actionRecommendation,
      curriculumRef: guide
        ? {
            slug: guide.slug,
            name: guide.name,
            bookCitation: guide.primaryBookCitation,
            chapter: guide.chapter,
            keyInvariant: guide.keyInvariant,
          }
        : undefined,
    });
  }

  // Sort by priority: CRITICAL_WEAKNESS first, then NEEDS_WORK, then lowest proficiency
  const statusPriority: Record<TopicStatus, number> = {
    CRITICAL_WEAKNESS: 4,
    NEEDS_WORK: 3,
    NEEDS_DATA: 2,
    PROFICIENT: 1,
    MASTERED: 0,
  };

  skillVector.sort((a, b) => {
    const pDiff = statusPriority[b.status] - statusPriority[a.status];
    if (pDiff !== 0) return pDiff;
    return b.weaknessScore - a.weaknessScore;
  });

  // Extract Summary
  const criticalWeaknesses = skillVector.filter((t) => t.status === "CRITICAL_WEAKNESS");
  const needsWorkTopics = skillVector.filter((t) => t.status === "NEEDS_WORK");
  const proficientTopics = skillVector.filter(
    (t) => t.status === "PROFICIENT" || t.status === "MASTERED"
  );

  // Standard radar pillars for competitive programming
  const standardRadarTopics = [
    { label: "DP", match: ["dp", "dynamic programming"] },
    { label: "Graphs", match: ["graphs", "graph", "dfs and similar", "shortest paths"] },
    { label: "Greedy", match: ["greedy"] },
    { label: "Math", match: ["math", "number theory", "combinatorics"] },
    { label: "Data Structures", match: ["data structures", "trees", "dsu"] },
    { label: "Strings", match: ["strings", "string suffix structures"] },
    { label: "Binary Search", match: ["binary search", "two pointers"] },
    { label: "Constructive", match: ["constructive algorithms"] },
  ];

  const radarSkills = standardRadarTopics.map((pillar) => {
    const matches = skillVector.filter((item) =>
      pillar.match.some((m) => item.tag.includes(m))
    );

    let score = 50; // default baseline
    if (matches.length > 0) {
      const sum = matches.reduce((acc, cur) => acc + cur.proficiencyScore, 0);
      score = Math.round(sum / matches.length);
    }

    return {
      subject: pillar.label,
      proficiency: score,
      fullMark: 100,
    };
  });

  return {
    skillVector,
    summary: {
      totalTopicsTracked: skillVector.length,
      criticalWeaknesses,
      needsWorkTopics,
      proficientTopics,
      radarSkills,
    },
  };
}
