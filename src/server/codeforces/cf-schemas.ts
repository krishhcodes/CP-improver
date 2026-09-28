import { z } from "zod";

// Generic Codeforces API Response Envelope
export function createCFResponseSchema<T extends z.ZodTypeAny>(resultSchema: T) {
  return z.object({
    status: z.enum(["OK", "FAILED"]),
    comment: z.string().optional(),
    result: resultSchema.optional(),
  });
}

// User Profile Schema
export const CFUserSchema = z.object({
  handle: z.string(),
  email: z.string().optional(),
  vkId: z.string().optional(),
  openId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  organization: z.string().optional(),
  contribution: z.number().default(0),
  rank: z.string().optional(),
  rating: z.number().optional(),
  maxRank: z.string().optional(),
  maxRating: z.number().optional(),
  lastOnlineTimeSeconds: z.number().optional(),
  registrationTimeSeconds: z.number().optional(),
  friendOfCount: z.number().optional(),
  avatar: z.string().optional(),
  titlePhoto: z.string().optional(),
});

export type CFUser = z.infer<typeof CFUserSchema>;

// Rating Change Schema
export const CFRatingChangeSchema = z.object({
  contestId: z.number(),
  contestName: z.string(),
  handle: z.string(),
  rank: z.number(),
  ratingUpdateTimeSeconds: z.number(),
  oldRating: z.number(),
  newRating: z.number(),
});

export type CFRatingChange = z.infer<typeof CFRatingChangeSchema>;

// Problem Schema
export const CFProblemSchema = z.object({
  contestId: z.number().optional(),
  problemsetName: z.string().optional(),
  index: z.string(),
  name: z.string(),
  type: z.string().default("PROGRAMMING"),
  points: z.number().optional(),
  rating: z.number().optional(),
  tags: z.array(z.string()).default([]),
});

export type CFProblem = z.infer<typeof CFProblemSchema>;

// Submission Schema
export const CFSubmissionSchema = z.object({
  id: z.number(),
  contestId: z.number().optional(),
  creationTimeSeconds: z.number(),
  relativeTimeSeconds: z.number().optional(),
  problem: CFProblemSchema,
  author: z
    .object({
      contestId: z.number().optional(),
      members: z.array(z.object({ handle: z.string() })).default([]),
      participantType: z.string().optional(),
      ghost: z.boolean().optional(),
      room: z.number().optional(),
      startTimeSeconds: z.number().optional(),
    })
    .optional(),
  programmingLanguage: z.string(),
  verdict: z.string().optional(),
  testset: z.string().optional(),
  passedTestCount: z.number().default(0),
  timeConsumedMillis: z.number().default(0),
  memoryConsumedBytes: z.number().default(0),
  points: z.number().optional(),
});

export type CFSubmission = z.infer<typeof CFSubmissionSchema>;

// Contest Schema
export const CFContestSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string().default("CF"),
  phase: z.string().default("FINISHED"),
  frozen: z.boolean().optional(),
  durationSeconds: z.number(),
  startTimeSeconds: z.number().optional(),
  relativeTimeSeconds: z.number().optional(),
  preparedBy: z.string().optional(),
  websiteUrl: z.string().optional(),
  description: z.string().optional(),
  difficulty: z.number().optional(),
  kind: z.string().optional(),
  icpcMegacontestId: z.number().optional(),
  adaptive: z.boolean().optional(),
});

export type CFContest = z.infer<typeof CFContestSchema>;
