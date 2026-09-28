import { prisma } from "@/lib/db";

export interface UpsertProblemInput {
  codeforcesContestId?: number | null;
  problemsetName?: string | null;
  index: string;
  name: string;
  type?: string;
  rating?: number | null;
  points?: number | null;
  tags: string[];
}

export class ProblemRepository {
  static async upsertProblemWithTags(data: UpsertProblemInput) {
    const cfContestId = data.codeforcesContestId ?? 0;
    const url = cfContestId > 0
      ? `https://codeforces.com/contest/${cfContestId}/problem/${data.index}`
      : `https://codeforces.com/problemset/problem/${data.index}`;

    // Upsert the problem record
    const problem = await prisma.problem.upsert({
      where: {
        codeforcesContestId_index: {
          codeforcesContestId: cfContestId,
          index: data.index,
        },
      },
      update: {
        name: data.name,
        type: data.type ?? "PROGRAMMING",
        rating: data.rating,
        points: data.points,
        url,
        lastSyncedAt: new Date(),
      },
      create: {
        codeforcesContestId: cfContestId,
        index: data.index,
        name: data.name,
        type: data.type ?? "PROGRAMMING",
        rating: data.rating,
        points: data.points,
        url,
        lastSyncedAt: new Date(),
      },
    });

    // Sync tags
    if (data.tags && data.tags.length > 0) {
      for (const tag of data.tags) {
        await prisma.problemTag.upsert({
          where: {
            problemId_tag: {
              problemId: problem.id,
              tag: tag.toLowerCase().trim(),
            },
          },
          update: {},
          create: {
            problemId: problem.id,
            tag: tag.toLowerCase().trim(),
          },
        });
      }
    }

    return problem;
  }

  static async findByContestAndIndex(contestId: number, index: string) {
    return prisma.problem.findUnique({
      where: {
        codeforcesContestId_index: {
          codeforcesContestId: contestId,
          index,
        },
      },
      include: {
        tags: true,
      },
    });
  }

  static async getProblemsByTopic(
    tag: string,
    minRating = 800,
    maxRating = 3500,
    limit = 20
  ) {
    return prisma.problem.findMany({
      where: {
        rating: {
          gte: minRating,
          lte: maxRating,
        },
        tags: {
          some: {
            tag: tag.toLowerCase(),
          },
        },
      },
      include: {
        tags: true,
      },
      take: limit,
      orderBy: {
        rating: "asc",
      },
    });
  }

  static async getContestProblems(contestId: number) {
    return prisma.problem.findMany({
      where: { codeforcesContestId: contestId },
      include: {
        tags: true,
      },
      orderBy: {
        index: "asc",
      },
    });
  }
}
