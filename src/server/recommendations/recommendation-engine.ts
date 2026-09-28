import { findCurriculumGuideForProblem } from "../knowledge/curriculum-links";

export type RecommendationCategory =
  | "STRENGTHENING"
  | "PROGRESSION"
  | "REVISION"
  | "CONTEST_PREPARATION"
  | "UPSOLVE";

export interface ProblemCandidate {
  id: string;
  contestId?: number | null;
  index: string;
  name: string;
  rating?: number | null;
  tags: string[];
  solvedCount?: number;
}

export interface PrerequisiteGuide {
  slug: string;
  name: string;
  bookCitation: string;
  chapter: string;
}

export interface ScoredRecommendation {
  id: string;
  problemName: string;
  contestId?: number | null;
  index: string;
  rating: number;
  tags: string[];
  category: RecommendationCategory;
  score: number; // 0 - 100 match score
  reason: string;
  url: string;
  prerequisiteGuide?: PrerequisiteGuide;
}

/**
 * Gaussian bell curve calculating how closely problem rating fits a target rating.
 * Returns a value in [0.0, 1.0].
 */
export function calculateRatingFit(
  problemRating: number,
  targetRating: number,
  sigma = 180
): number {
  const diff = problemRating - targetRating;
  return Math.exp(-(diff * diff) / (2 * sigma * sigma));
}

/**
 * Computes deterministic, explainable rationale for a recommended problem.
 */
export function generateExplainableReason(params: {
  problemName: string;
  rating: number;
  tags: string[];
  category: RecommendationCategory;
  userRating: number;
  weakestTag?: string;
  weaknessScore?: number;
}): string {
  const { problemName, rating, tags, category, userRating, weakestTag, weaknessScore } = params;
  const ratingDelta = rating - userRating;
  const deltaStr = ratingDelta >= 0 ? `+${ratingDelta}` : `${ratingDelta}`;
  const tagList = tags.slice(0, 3).join(", ");

  switch (category) {
    case "STRENGTHENING":
      if (weakestTag && weaknessScore) {
        return `Recommended '${problemName}' (${rating}) because your estimated proficiency in ${weakestTag} is ${100 - weaknessScore}/100. This problem reinforces core patterns within your current comfort tier (${deltaStr} rating).`;
      }
      return `Recommended '${problemName}' (${rating}) to solidify pattern recognition in ${tagList} with problems calibrated close to your current rating (${deltaStr}).`;

    case "PROGRESSION":
      return `Targeted stretch problem (${deltaStr} rating) pushing into higher difficulty. You have demonstrated consistent fundamentals; solving '${problemName}' develops advanced insight in ${tagList}.`;

    case "REVISION":
      return `Spaced revision candidate in ${tagList}. Scheduled to prevent skill atrophy and reinforce speed on ${rating}-rated problem archetypes.`;

    case "CONTEST_PREPARATION":
      return `Educational contest simulation problem (${rating}) in ${tagList}. Calibrated for Div. 2 Problem C/D time-management and observation under contest pressure.`;

    case "UPSOLVE":
      return `High-yield missed contest problem (${rating}). Upsolving problems in ${tagList} provides 3x higher learning retention than random problemset practice.`;

    default:
      return `Recommended based on your rating profile (${userRating}) and target practice goals in ${tagList}.`;
  }
}

/**
 * Pure computational engine for multi-factor problem recommendation ranking.
 */
export function generateRecommendations(params: {
  candidateProblems: ProblemCandidate[];
  userSolvedProblemKeys: Set<string>;
  userRating: number;
  topicWeaknesses?: Map<string, number>; // tag -> weaknessScore (0-100)
  category?: RecommendationCategory;
  topicFilter?: string;
  limit?: number;
}): ScoredRecommendation[] {
  const {
    candidateProblems,
    userSolvedProblemKeys,
    userRating,
    topicWeaknesses = new Map<string, number>(),
    category,
    topicFilter,
    limit = 20,
  } = params;

  const results: ScoredRecommendation[] = [];

  for (const prob of candidateProblems) {
    const key = `${prob.contestId ?? 0}-${prob.index}`;
    // 1. Skip if already solved by user
    if (userSolvedProblemKeys.has(key) || userSolvedProblemKeys.has(prob.id)) {
      continue;
    }

    const rating = prob.rating ?? 1400;

    // 2. Filter by topic if requested
    if (topicFilter && topicFilter.toLowerCase() !== "all") {
      const match = prob.tags.some(
        (t) => t.toLowerCase() === topicFilter.toLowerCase() || t.toLowerCase().includes(topicFilter.toLowerCase())
      );
      if (!match) continue;
    }

    // 3. Find highest weakness score among problem's tags
    let maxWeakness = 40;
    let weakestTag = prob.tags[0] ?? "general";

    for (const tag of prob.tags) {
      const w = topicWeaknesses.get(tag.toLowerCase()) ?? 40;
      if (w > maxWeakness) {
        maxWeakness = w;
        weakestTag = tag;
      }
    }

    // 4. Determine target category if none explicitly specified
    let probCategory: RecommendationCategory = category ?? "STRENGTHENING";
    let targetRating = userRating;
    let categoryWeight = 1.0;

    if (!category) {
      if (maxWeakness >= 60 && rating <= userRating + 50) {
        probCategory = "STRENGTHENING";
        targetRating = userRating - 50;
      } else if (rating > userRating && rating <= userRating + 300) {
        probCategory = "PROGRESSION";
        targetRating = userRating + 150;
      } else if (rating < userRating - 100) {
        probCategory = "REVISION";
        targetRating = userRating - 200;
      } else {
        probCategory = "CONTEST_PREPARATION";
        targetRating = userRating;
      }
    } else {
      switch (category) {
        case "STRENGTHENING":
          targetRating = userRating - 50;
          // Heavily favor topics with high weakness
          categoryWeight = (maxWeakness / 100) * 1.3;
          break;
        case "PROGRESSION":
          targetRating = userRating + 150;
          // Favor problems above rating
          categoryWeight = rating > userRating ? 1.2 : 0.6;
          break;
        case "REVISION":
          targetRating = userRating - 150;
          categoryWeight = 1.0;
          break;
        case "CONTEST_PREPARATION":
          targetRating = userRating + 25;
          categoryWeight = 1.1;
          break;
        case "UPSOLVE":
          targetRating = userRating + 50;
          categoryWeight = 1.2;
          break;
      }
    }

    // 5. Compute Multi-Factor Match Score
    const ratingFit = calculateRatingFit(rating, targetRating);
    const needFactor = maxWeakness / 100;
    const qualityFactor = prob.solvedCount ? Math.min(1.0, prob.solvedCount / 5000) : 0.8;

    // Weighted composite score (0 - 100)
    const rawScore = (ratingFit * 50 + needFactor * 35 + qualityFactor * 15) * categoryWeight;
    const score = Math.round(Math.max(10, Math.min(99, rawScore)));

    const reason = generateExplainableReason({
      problemName: prob.name,
      rating,
      tags: prob.tags,
      category: probCategory,
      userRating,
      weakestTag,
      weaknessScore: maxWeakness,
    });

    const url = prob.contestId
      ? `https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`
      : `https://codeforces.com/problemset/problem/${prob.id}`;

    const guide = findCurriculumGuideForProblem(prob.tags);

    results.push({
      id: prob.id,
      problemName: prob.name,
      contestId: prob.contestId,
      index: prob.index,
      rating,
      tags: prob.tags,
      category: probCategory,
      score,
      reason,
      url,
      prerequisiteGuide: guide
        ? {
            slug: guide.slug,
            name: guide.name,
            bookCitation: guide.primaryBookCitation,
            chapter: guide.chapter,
          }
        : undefined,
    });
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}
