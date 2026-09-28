import { prisma } from "@/lib/db";
import { SubmissionVerdict } from "@prisma/client";

export interface UpsertSubmissionInput {
  codeforcesSubmissionId: bigint;
  userId: string;
  problemId: string;
  contestId?: string | null;
  verdict: SubmissionVerdict;
  language: string;
  creationTimeSeconds: number;
  relativeTimeSeconds?: number | null;
  passedTestCount?: number;
  timeConsumedMillis?: number;
  memoryConsumedBytes?: bigint;
  points?: number | null;
}

export class SubmissionRepository {
  static async upsertSubmission(data: UpsertSubmissionInput) {
    return prisma.submission.upsert({
      where: { codeforcesSubmissionId: data.codeforcesSubmissionId },
      update: {
        verdict: data.verdict,
        passedTestCount: data.passedTestCount ?? 0,
        timeConsumedMillis: data.timeConsumedMillis ?? 0,
        memoryConsumedBytes: data.memoryConsumedBytes ?? BigInt(0),
        points: data.points,
      },
      create: {
        codeforcesSubmissionId: data.codeforcesSubmissionId,
        userId: data.userId,
        problemId: data.problemId,
        contestId: data.contestId,
        verdict: data.verdict,
        language: data.language,
        creationTimeSeconds: data.creationTimeSeconds,
        relativeTimeSeconds: data.relativeTimeSeconds,
        passedTestCount: data.passedTestCount ?? 0,
        timeConsumedMillis: data.timeConsumedMillis ?? 0,
        memoryConsumedBytes: data.memoryConsumedBytes ?? BigInt(0),
        points: data.points,
      },
    });
  }

  static async getUserSubmissions(userId: string, limit = 50) {
    return prisma.submission.findMany({
      where: { userId },
      include: {
        problem: {
          include: {
            tags: true,
          },
        },
        contest: true,
      },
      orderBy: {
        creationTimeSeconds: "desc",
      },
      take: limit,
    });
  }

  static async getVerdictCounts(userId: string) {
    const group = await prisma.submission.groupBy({
      by: ["verdict"],
      where: { userId },
      _count: {
        _all: true,
      },
    });

    return group.map((g) => ({
      verdict: g.verdict,
      count: g._count._all,
    }));
  }

  static async getUserSolvedProblemIds(userId: string): Promise<Set<string>> {
    const solved = await prisma.submission.findMany({
      where: {
        userId,
        verdict: "OK",
      },
      select: {
        problemId: true,
      },
      distinct: ["problemId"],
    });

    return new Set(solved.map((s) => s.problemId));
  }
}
