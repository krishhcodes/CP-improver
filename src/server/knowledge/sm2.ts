export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SM2Input {
  quality: ReviewQuality; // 0 to 5
  repetitions: number; // consecutive successful reviews
  easeFactor: number; // default 2.5, min 1.3
  intervalDays: number; // previous interval in days
  nowSeconds?: number;
}

export interface SM2Result {
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAtSeconds: number;
  isSuccessful: boolean;
  intervalFormatted: string;
}

/**
 * Format interval days into human-readable string
 */
export function formatIntervalDays(days: number): string {
  if (days <= 1) return "1 day";
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
}

/**
 * Pure SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 */
export function calculateSM2(input: SM2Input): SM2Result {
  const { quality, easeFactor, repetitions, intervalDays, nowSeconds = Math.floor(Date.now() / 1000) } = input;

  const isSuccessful = quality >= 3;

  // 1. Calculate new Ease Factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const qDiff = 5 - quality;
  const newEF = Math.max(1.3, easeFactor + (0.1 - qDiff * (0.08 + qDiff * 0.02)));
  const roundedEF = Math.round(newEF * 100) / 100;

  // 2. Calculate new repetitions and interval
  let newRepetitions = 0;
  let newIntervalDays = 1;

  if (isSuccessful) {
    if (repetitions === 0) {
      newIntervalDays = 1;
      newRepetitions = 1;
    } else if (repetitions === 1) {
      newIntervalDays = 6;
      newRepetitions = 2;
    } else {
      newIntervalDays = Math.round(intervalDays * roundedEF);
      newRepetitions = repetitions + 1;
    }
  } else {
    // Failure: reset repetition streak back to 0, review again tomorrow
    newRepetitions = 0;
    newIntervalDays = 1;
  }

  const nextReviewAtSeconds = nowSeconds + newIntervalDays * 86400;

  return {
    repetitions: newRepetitions,
    easeFactor: roundedEF,
    intervalDays: newIntervalDays,
    nextReviewAtSeconds,
    isSuccessful,
    intervalFormatted: formatIntervalDays(newIntervalDays),
  };
}

/**
 * Classifies an item's review status relative to current timestamp
 */
export function classifyRevisionStatus(
  nextReviewAtSeconds: number,
  nowSeconds = Math.floor(Date.now() / 1000)
): "DUE" | "UPCOMING" | "FUTURE" {
  if (nextReviewAtSeconds <= nowSeconds) {
    return "DUE";
  }
  if (nextReviewAtSeconds <= nowSeconds + 7 * 86400) {
    return "UPCOMING";
  }
  return "FUTURE";
}
