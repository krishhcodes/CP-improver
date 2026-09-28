import { CodeforcesClient, cfClient } from "./cf-client";
import { UserRepository } from "@/server/db/repositories/user-repo";
import { ContestRepository } from "@/server/db/repositories/contest-repo";
import { ProblemRepository } from "@/server/db/repositories/problem-repo";
import { SubmissionRepository } from "@/server/db/repositories/submission-repo";
import { SubmissionVerdict } from "@prisma/client";
import { CFSubmission } from "./cf-schemas";

export function mapCFVerdictToEnum(cfVerdict?: string | null): SubmissionVerdict {
  if (!cfVerdict) return SubmissionVerdict.OTHER;

  switch (cfVerdict.toUpperCase()) {
    case "OK":
      return SubmissionVerdict.OK;
    case "WRONG_ANSWER":
      return SubmissionVerdict.WRONG_ANSWER;
    case "TIME_LIMIT_EXCEEDED":
      return SubmissionVerdict.TIME_LIMIT_EXCEEDED;
    case "MEMORY_LIMIT_EXCEEDED":
      return SubmissionVerdict.MEMORY_LIMIT_EXCEEDED;
    case "RUNTIME_ERROR":
      return SubmissionVerdict.RUNTIME_ERROR;
    case "COMPILATION_ERROR":
      return SubmissionVerdict.COMPILATION_ERROR;
    case "CHALLENGED":
      return SubmissionVerdict.CHALLENGED;
    case "SKIPPED":
      return SubmissionVerdict.SKIPPED;
    default:
      return SubmissionVerdict.OTHER;
  }
}

export interface SyncStats {
  handle: string;
  userId: string;
  profileUpdated: boolean;
  contestsImported: number;
  submissionsImported: number;
  problemsImported: number;
  durationMs: number;
}

export class CodeforcesSyncService {
  constructor(private client: CodeforcesClient = cfClient) {}

  /**
   * Synchronize Codeforces User Profile
   */
  async syncUserProfile(handle: string, userId: string) {
    const users = await this.client.getUserInfo([handle]);
    if (!users || users.length === 0) {
      throw new Error(`Codeforces handle "${handle}" not found.`);
    }

    const cfUser = users[0];
    const profile = await UserRepository.upsertCodeforcesProfile(userId, {
      handle: cfUser.handle,
      rating: cfUser.rating ?? null,
      maxRating: cfUser.maxRating ?? null,
      rank: cfUser.rank ?? null,
      maxRank: cfUser.maxRank ?? null,
      contribution: cfUser.contribution ?? 0,
      avatar: cfUser.avatar ?? null,
      titlePhoto: cfUser.titlePhoto ?? null,
    });

    return profile;
  }

  /**
   * Synchronize Contest Participations and Contests
   */
  async syncUserRatingHistory(handle: string, userId: string): Promise<number> {
    const ratingChanges = await this.client.getUserRating(handle);
    let count = 0;

    for (const change of ratingChanges) {
      // 1. Ensure Contest exists
      const contest = await ContestRepository.upsertContest({
        codeforcesContestId: change.contestId,
        name: change.contestName,
        type: "CF",
        phase: "FINISHED",
        startTimeSeconds: change.ratingUpdateTimeSeconds - 7200, // Estimated duration
        durationSeconds: 7200,
        ratingChangesAvailable: true,
      });

      // 2. Upsert User Participation
      await ContestRepository.upsertParticipation({
        userId,
        contestId: contest.id,
        rank: change.rank,
        oldRating: change.oldRating,
        newRating: change.newRating,
        ratingChange: change.newRating - change.oldRating,
        participatedAt: new Date(change.ratingUpdateTimeSeconds * 1000),
      });

      count++;
    }

    return count;
  }

  /**
   * Synchronize Submissions and Problems
   */
  async syncUserSubmissions(
    handle: string,
    userId: string,
    maxSubmissions = 2000
  ): Promise<{ submissionsImported: number; problemsImported: number }> {
    let from = 1;
    const batchSize = 500;
    let submissionsImported = 0;
    const problemMap = new Set<string>();

    while (submissionsImported < maxSubmissions) {
      const submissions = await this.client.getUserStatus(handle, from, batchSize);
      if (!submissions || submissions.length === 0) {
        break;
      }

      for (const sub of submissions) {
        // 1. Upsert Problem
        const problemKey = `${sub.problem.contestId ?? 0}-${sub.problem.index}`;
        const problem = await ProblemRepository.upsertProblemWithTags({
          codeforcesContestId: sub.problem.contestId ?? null,
          index: sub.problem.index,
          name: sub.problem.name,
          type: sub.problem.type,
          rating: sub.problem.rating ?? null,
          points: sub.problem.points ?? null,
          tags: sub.problem.tags ?? [],
        });
        problemMap.add(problemKey);

        // 2. Resolve contest record if contestId exists
        let dbContestId: string | null = null;
        if (sub.contestId) {
          const contest = await ContestRepository.findByCodeforcesId(sub.contestId);
          dbContestId = contest ? contest.id : null;
        }

        // 3. Upsert Submission
        await SubmissionRepository.upsertSubmission({
          codeforcesSubmissionId: BigInt(sub.id),
          userId,
          problemId: problem.id,
          contestId: dbContestId,
          verdict: mapCFVerdictToEnum(sub.verdict),
          language: sub.programmingLanguage,
          creationTimeSeconds: sub.creationTimeSeconds,
          relativeTimeSeconds: sub.relativeTimeSeconds ?? null,
          passedTestCount: sub.passedTestCount,
          timeConsumedMillis: sub.timeConsumedMillis,
          memoryConsumedBytes: BigInt(sub.memoryConsumedBytes),
          points: sub.points ?? null,
        });

        submissionsImported++;
      }

      if (submissions.length < batchSize) {
        break; // Reached end of submission history
      }

      from += batchSize;
    }

    return {
      submissionsImported,
      problemsImported: problemMap.size,
    };
  }

  /**
   * Master Full Synchronizer
   */
  async syncAll(handle: string, userId: string): Promise<SyncStats> {
    const startTime = Date.now();

    await UserRepository.updateSyncStatus(handle, "SYNCING");

    try {
      // 1. Profile
      await this.syncUserProfile(handle, userId);

      // 2. Contests
      const contestsImported = await this.syncUserRatingHistory(handle, userId);

      // 3. Submissions & Problems
      const { submissionsImported, problemsImported } = await this.syncUserSubmissions(
        handle,
        userId
      );

      await UserRepository.updateSyncStatus(handle, "COMPLETED");

      const durationMs = Date.now() - startTime;

      return {
        handle,
        userId,
        profileUpdated: true,
        contestsImported,
        submissionsImported,
        problemsImported,
        durationMs,
      };
    } catch (error: any) {
      await UserRepository.updateSyncStatus(handle, "FAILED", error?.message ?? "Unknown error");
      throw error;
    }
  }
}

export const cfSyncService = new CodeforcesSyncService();
