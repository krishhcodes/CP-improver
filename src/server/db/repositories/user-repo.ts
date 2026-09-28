import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface UpsertProfileInput {
  handle: string;
  rating?: number | null;
  maxRating?: number | null;
  rank?: string | null;
  maxRank?: string | null;
  contribution?: number;
  avatar?: string | null;
  titlePhoto?: string | null;
}

export class UserRepository {
  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        codeforcesProfile: true,
      },
    });
  }

  static async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      include: {
        codeforcesProfile: true,
      },
    });
  }

  static async findByHandle(handle: string) {
    return prisma.codeforcesProfile.findUnique({
      where: { handle },
      include: {
        user: true,
      },
    });
  }

  static async createUser(data: {
    username: string;
    email?: string | null;
    passwordHash?: string | null;
  }) {
    return prisma.user.create({
      data: {
        username: data.username,
        email: data.email ?? undefined,
        passwordHash: data.passwordHash ?? undefined,
      },
    });
  }

  static async upsertCodeforcesProfile(userId: string, data: UpsertProfileInput) {
    return prisma.codeforcesProfile.upsert({
      where: { userId },
      update: {
        handle: data.handle,
        rating: data.rating,
        maxRating: data.maxRating,
        rank: data.rank,
        maxRank: data.maxRank,
        contribution: data.contribution ?? 0,
        avatar: data.avatar,
        titlePhoto: data.titlePhoto,
        lastSyncedAt: new Date(),
        syncStatus: "COMPLETED",
        syncError: null,
      },
      create: {
        userId,
        handle: data.handle,
        rating: data.rating,
        maxRating: data.maxRating,
        rank: data.rank,
        maxRank: data.maxRank,
        contribution: data.contribution ?? 0,
        avatar: data.avatar,
        titlePhoto: data.titlePhoto,
        lastSyncedAt: new Date(),
        syncStatus: "COMPLETED",
      },
    });
  }

  static async updateSyncStatus(
    handle: string,
    status: "IDLE" | "SYNCING" | "COMPLETED" | "FAILED",
    error?: string
  ) {
    return prisma.codeforcesProfile.update({
      where: { handle },
      data: {
        syncStatus: status,
        syncError: error ?? null,
        ...(status === "COMPLETED" ? { lastSyncedAt: new Date() } : {}),
      },
    });
  }
}
