import { describe, it, expect } from "vitest";
import { UserRepository } from "@/server/db/repositories/user-repo";
import { ContestRepository } from "@/server/db/repositories/contest-repo";
import { ProblemRepository } from "@/server/db/repositories/problem-repo";
import { SubmissionRepository } from "@/server/db/repositories/submission-repo";
import { KnowledgeRepository } from "@/server/db/repositories/knowledge-repo";
import { prisma } from "@/lib/db";

describe("Database Architecture & Repository Interfaces", () => {
  it("exports Prisma client singleton with expected delegates", () => {
    expect(prisma).toBeDefined();
    expect(prisma.user).toBeDefined();
    expect(prisma.codeforcesProfile).toBeDefined();
    expect(prisma.contest).toBeDefined();
    expect(prisma.contestParticipation).toBeDefined();
    expect(prisma.problem).toBeDefined();
    expect(prisma.problemTag).toBeDefined();
    expect(prisma.submission).toBeDefined();
    expect(prisma.concept).toBeDefined();
    expect(prisma.conceptDependency).toBeDefined();
    expect(prisma.userConceptSkill).toBeDefined();
    expect(prisma.recommendation).toBeDefined();
    expect(prisma.learningSession).toBeDefined();
    expect(prisma.revisionItem).toBeDefined();
  });

  it("exposes expected methods on UserRepository", () => {
    expect(typeof UserRepository.findById).toBe("function");
    expect(typeof UserRepository.findByUsername).toBe("function");
    expect(typeof UserRepository.findByHandle).toBe("function");
    expect(typeof UserRepository.createUser).toBe("function");
    expect(typeof UserRepository.upsertCodeforcesProfile).toBe("function");
    expect(typeof UserRepository.updateSyncStatus).toBe("function");
  });

  it("exposes expected methods on ContestRepository", () => {
    expect(typeof ContestRepository.upsertContest).toBe("function");
    expect(typeof ContestRepository.upsertParticipation).toBe("function");
    expect(typeof ContestRepository.getUserContestHistory).toBe("function");
    expect(typeof ContestRepository.findByCodeforcesId).toBe("function");
  });

  it("exposes expected methods on ProblemRepository", () => {
    expect(typeof ProblemRepository.upsertProblemWithTags).toBe("function");
    expect(typeof ProblemRepository.findByContestAndIndex).toBe("function");
    expect(typeof ProblemRepository.getProblemsByTopic).toBe("function");
    expect(typeof ProblemRepository.getContestProblems).toBe("function");
  });

  it("exposes expected methods on SubmissionRepository", () => {
    expect(typeof SubmissionRepository.upsertSubmission).toBe("function");
    expect(typeof SubmissionRepository.getUserSubmissions).toBe("function");
    expect(typeof SubmissionRepository.getVerdictCounts).toBe("function");
    expect(typeof SubmissionRepository.getUserSolvedProblemIds).toBe("function");
  });

  it("exposes expected methods on KnowledgeRepository", () => {
    expect(typeof KnowledgeRepository.upsertConcept).toBe("function");
    expect(typeof KnowledgeRepository.linkPrerequisite).toBe("function");
    expect(typeof KnowledgeRepository.getAllConceptsWithDependencies).toBe("function");
    expect(typeof KnowledgeRepository.getConceptBySlug).toBe("function");
  });
});
