import { prisma } from "@/lib/db";
import { ParticipationType } from "@prisma/client";

export interface UpsertContestInput {
  codeforcesContestId: number;
  name: string;
  type?: string;
  phase?: string;
  startTimeSeconds: number;
  durationSeconds: number;
  ratingChangesAvailable?: boolean;
}

export interface UpsertParticipationInput {
  userId: string;
  contestId: string;
  rank?: number | null;
  oldRating?: number | null;
  newRating?: number | null;
  ratingChange?: number | null;
  participationType?: ParticipationType;
  participatedAt: Date;
}

export class ContestRepository {
  static async upsertContest(data: UpsertContestInput) {
    return prisma.contest.upsert({
      where: { codeforcesContestId: data.codeforcesContestId },
      update: {
        name: data.name,
        type: data.type ?? "CF",
        phase: data.phase ?? "FINISHED",
        startTimeSeconds: data.startTimeSeconds,
        durationSeconds: data.durationSeconds,
        ratingChangesAvailable: data.ratingChangesAvailable ?? true,
        lastSyncedAt: new Date(),
      },
      create: {
        codeforcesContestId: data.codeforcesContestId,
        name: data.name,
        type: data.type ?? "CF",
        phase: data.phase ?? "FINISHED",
        startTimeSeconds: data.startTimeSeconds,
        durationSeconds: data.durationSeconds,
        ratingChangesAvailable: data.ratingChangesAvailable ?? true,
        lastSyncedAt: new Date(),
      },
    });
  }

  static async upsertParticipation(data: UpsertParticipationInput) {
    return prisma.contestParticipation.upsert({
      where: {
        userId_contestId: {
          userId: data.userId,
          contestId: data.contestId,
        },
      },
      update: {
        rank: data.rank,
        oldRating: data.oldRating,
        newRating: data.newRating,
        ratingChange: data.ratingChange,
        participationType: data.participationType ?? "CONTESTANT",
        participatedAt: data.participatedAt,
      },
      create: {
        userId: data.userId,
        contestId: data.contestId,
        rank: data.rank,
        oldRating: data.oldRating,
        newRating: data.newRating,
        ratingChange: data.ratingChange,
        participationType: data.participationType ?? "CONTESTANT",
        participatedAt: data.participatedAt,
      },
    });
  }

  static async getUserContestHistory(userId: string) {
    return prisma.contestParticipation.findMany({
      where: { userId },
      include: {
        contest: true,
      },
      orderBy: {
        participatedAt: "desc",
      },
    });
  }

  static async findByCodeforcesId(cfContestId: number) {
    return prisma.contest.findUnique({
      where: { codeforcesContestId: cfContestId },
      include: {
        problems: true,
      },
    });
  }
}
