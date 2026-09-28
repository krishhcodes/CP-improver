import { describe, it, expect } from "vitest";
import {
  CFUserSchema,
  CFRatingChangeSchema,
  CFProblemSchema,
  CFSubmissionSchema,
  CFContestSchema,
  createCFResponseSchema,
} from "@/server/codeforces/cf-schemas";
import { mapCFVerdictToEnum } from "@/server/codeforces/cf-sync-service";
import { SubmissionVerdict } from "@prisma/client";

describe("Codeforces Zod Schemas Validation", () => {
  it("successfully parses valid Codeforces User profile", () => {
    const rawUser = {
      handle: "tourist",
      rating: 3894,
      maxRating: 3979,
      rank: "legendary grandmaster",
      maxRank: "legendary grandmaster",
      contribution: 154,
      avatar: "https://userpic.codeforces.org/no-avatar.jpg",
    };

    const parsed = CFUserSchema.parse(rawUser);
    expect(parsed.handle).toBe("tourist");
    expect(parsed.rating).toBe(3894);
    expect(parsed.rank).toBe("legendary grandmaster");
    expect(parsed.contribution).toBe(154);
  });

  it("successfully parses valid RatingChange payload", () => {
    const rawRating = {
      contestId: 970,
      contestName: "Educational Codeforces Round 169",
      handle: "tourist",
      rank: 1,
      ratingUpdateTimeSeconds: 1763000000,
      oldRating: 3870,
      newRating: 3894,
    };

    const parsed = CFRatingChangeSchema.parse(rawRating);
    expect(parsed.contestId).toBe(970);
    expect(parsed.newRating - parsed.oldRating).toBe(24);
  });

  it("successfully parses Problem with tags and rating", () => {
    const rawProblem = {
      contestId: 970,
      index: "D",
      name: "Colored Portals",
      type: "PROGRAMMING",
      rating: 1600,
      tags: ["binary search", "graphs"],
    };

    const parsed = CFProblemSchema.parse(rawProblem);
    expect(parsed.index).toBe("D");
    expect(parsed.rating).toBe(1600);
    expect(parsed.tags).toContain("binary search");
  });

  it("successfully parses Submission payload with verdict", () => {
    const rawSubmission = {
      id: 278912340,
      contestId: 970,
      creationTimeSeconds: 1763004200,
      problem: {
        contestId: 970,
        index: "D",
        name: "Colored Portals",
        type: "PROGRAMMING",
        rating: 1600,
        tags: ["binary search", "graphs"],
      },
      programmingLanguage: "GNU C++20 (64)",
      verdict: "OK",
      passedTestCount: 45,
      timeConsumedMillis: 140,
      memoryConsumedBytes: 4200000,
    };

    const parsed = CFSubmissionSchema.parse(rawSubmission);
    expect(parsed.id).toBe(278912340);
    expect(parsed.verdict).toBe("OK");
    expect(parsed.passedTestCount).toBe(45);
  });

  it("rejects malformed API response envelope", () => {
    const Envelope = createCFResponseSchema(CFUserSchema);
    const malformed = {
      status: "INVALID_STATUS",
      comment: "Something failed",
    };

    const result = Envelope.safeParse(malformed);
    expect(result.success).toBe(false);
  });
});

describe("Verdict Enum Mapper", () => {
  it("correctly maps standard Codeforces verdicts to Prisma enum", () => {
    expect(mapCFVerdictToEnum("OK")).toBe(SubmissionVerdict.OK);
    expect(mapCFVerdictToEnum("WRONG_ANSWER")).toBe(SubmissionVerdict.WRONG_ANSWER);
    expect(mapCFVerdictToEnum("TIME_LIMIT_EXCEEDED")).toBe(SubmissionVerdict.TIME_LIMIT_EXCEEDED);
    expect(mapCFVerdictToEnum("MEMORY_LIMIT_EXCEEDED")).toBe(SubmissionVerdict.MEMORY_LIMIT_EXCEEDED);
    expect(mapCFVerdictToEnum("RUNTIME_ERROR")).toBe(SubmissionVerdict.RUNTIME_ERROR);
    expect(mapCFVerdictToEnum("COMPILATION_ERROR")).toBe(SubmissionVerdict.COMPILATION_ERROR);
    expect(mapCFVerdictToEnum("CHALLENGED")).toBe(SubmissionVerdict.CHALLENGED);
    expect(mapCFVerdictToEnum("SKIPPED")).toBe(SubmissionVerdict.SKIPPED);
  });

  it("handles null or unrecognized verdicts safely", () => {
    expect(mapCFVerdictToEnum(null)).toBe(SubmissionVerdict.OTHER);
    expect(mapCFVerdictToEnum(undefined)).toBe(SubmissionVerdict.OTHER);
    expect(mapCFVerdictToEnum("PARTIAL_SOLVE")).toBe(SubmissionVerdict.OTHER);
  });
});
