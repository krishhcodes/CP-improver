import { describe, it, expect } from "vitest";
import {
  calculateSM2,
  classifyRevisionStatus,
  formatIntervalDays,
} from "../src/server/knowledge/sm2";
import {
  getRevisionQueue,
  processCardReview,
  DEFAULT_REVISION_CARDS,
} from "../src/server/knowledge/revision-service";

describe("SM-2 Spaced Repetition Algorithm", () => {
  const fixedNow = 1700000000;

  describe("calculateSM2", () => {
    it("should award first repetition with 1 day interval on success", () => {
      const result = calculateSM2({
        quality: 4,
        repetitions: 0,
        easeFactor: 2.5,
        intervalDays: 1,
        nowSeconds: fixedNow,
      });

      expect(result.repetitions).toBe(1);
      expect(result.intervalDays).toBe(1);
      expect(result.isSuccessful).toBe(true);
      expect(result.nextReviewAtSeconds).toBe(fixedNow + 86400);
      expect(result.easeFactor).toBe(2.5); // q=4 leaves EF unchanged
    });

    it("should advance from repetition 1 to repetition 2 with a 6 day interval", () => {
      const result = calculateSM2({
        quality: 5,
        repetitions: 1,
        easeFactor: 2.5,
        intervalDays: 1,
        nowSeconds: fixedNow,
      });

      expect(result.repetitions).toBe(2);
      expect(result.intervalDays).toBe(6);
      expect(result.isSuccessful).toBe(true);
      expect(result.easeFactor).toBe(2.6); // q=5 increases EF by 0.1
      expect(result.nextReviewAtSeconds).toBe(fixedNow + 6 * 86400);
    });

    it("should multiply previous interval by ease factor for repetitions >= 2", () => {
      const result = calculateSM2({
        quality: 4,
        repetitions: 2,
        easeFactor: 2.6,
        intervalDays: 6,
        nowSeconds: fixedNow,
      });

      expect(result.repetitions).toBe(3);
      // interval = round(6 * 2.6) = 16
      expect(result.intervalDays).toBe(16);
      expect(result.isSuccessful).toBe(true);
    });

    it("should reset repetitions to 0 and interval to 1 on failure (quality < 3)", () => {
      const result = calculateSM2({
        quality: 1,
        repetitions: 5,
        easeFactor: 2.6,
        intervalDays: 30,
        nowSeconds: fixedNow,
      });

      expect(result.isSuccessful).toBe(false);
      expect(result.repetitions).toBe(0);
      expect(result.intervalDays).toBe(1);
      expect(result.nextReviewAtSeconds).toBe(fixedNow + 86400);
      expect(result.easeFactor).toBeLessThan(2.6);
    });

    it("should clamp ease factor at the minimum floor of 1.30", () => {
      let ef = 1.35;
      for (let i = 0; i < 5; i++) {
        const res = calculateSM2({
          quality: 0,
          repetitions: 1,
          easeFactor: ef,
          intervalDays: 1,
          nowSeconds: fixedNow,
        });
        ef = res.easeFactor;
      }
      expect(ef).toBe(1.3);
    });
  });

  describe("formatIntervalDays", () => {
    it("should format days into appropriate human labels", () => {
      expect(formatIntervalDays(1)).toBe("1 day");
      expect(formatIntervalDays(5)).toBe("5 days");
      expect(formatIntervalDays(30)).toBe("1 month");
      expect(formatIntervalDays(60)).toBe("2 months");
    });
  });

  describe("classifyRevisionStatus", () => {
    it("should classify overdue or current items as DUE", () => {
      expect(classifyRevisionStatus(fixedNow - 100, fixedNow)).toBe("DUE");
      expect(classifyRevisionStatus(fixedNow, fixedNow)).toBe("DUE");
    });

    it("should classify items within 7 days as UPCOMING", () => {
      expect(classifyRevisionStatus(fixedNow + 86400, fixedNow)).toBe("UPCOMING");
      expect(classifyRevisionStatus(fixedNow + 6 * 86400, fixedNow)).toBe("UPCOMING");
    });

    it("should classify items beyond 7 days as FUTURE", () => {
      expect(classifyRevisionStatus(fixedNow + 10 * 86400, fixedNow)).toBe("FUTURE");
    });
  });

  describe("Revision Service", () => {
    it("should return a revision queue summary with valid metrics", () => {
      const queue = getRevisionQueue();

      expect(queue.totalCardsCount).toBeGreaterThanOrEqual(DEFAULT_REVISION_CARDS.length);
      expect(queue.dueTodayCount).toBeGreaterThanOrEqual(1);
      expect(queue.averageEaseFactor).toBeGreaterThan(1.3);
      expect(queue.retentionRate).toBeGreaterThanOrEqual(80);
      expect(Array.isArray(queue.dueCards)).toBe(true);
      expect(Array.isArray(queue.upcomingCards)).toBe(true);
      expect(Array.isArray(queue.allCards)).toBe(true);
    });

    it("should process card review and update state in memory store", () => {
      const initialQueue = getRevisionQueue();
      const firstDue = initialQueue.dueCards[0] || initialQueue.allCards[0];
      expect(firstDue).toBeDefined();

      const response = processCardReview(firstDue.id, 5);

      expect(response.card.id).toBe(firstDue.id);
      expect(response.sm2.isSuccessful).toBe(true);
      expect(response.feedbackMessage).toContain("Excellent recall");
      expect(response.card.repetitions).toBe(firstDue.repetitions + 1);

      // Verify persistence in queue
      const updatedQueue = getRevisionQueue();
      const stored = updatedQueue.allCards.find((c) => c.id === firstDue.id);
      expect(stored?.repetitions).toBe(response.card.repetitions);
    });

    it("should throw error when reviewing a non-existent card id", () => {
      expect(() => {
        processCardReview("non-existent-id-9999", 4);
      }).toThrow();
    });
  });
});
