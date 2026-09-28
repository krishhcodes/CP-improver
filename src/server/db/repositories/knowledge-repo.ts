import { prisma } from "@/lib/db";
import { DifficultyLevel } from "@prisma/client";

export interface UpsertConceptInput {
  slug: string;
  name: string;
  description: string;
  difficulty?: DifficultyLevel;
  category: string;
  contentPath?: string | null;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
}

export class KnowledgeRepository {
  static async upsertConcept(data: UpsertConceptInput) {
    return prisma.concept.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        description: data.description,
        difficulty: data.difficulty ?? "BEGINNER",
        category: data.category,
        contentPath: data.contentPath,
        timeComplexity: data.timeComplexity,
        spaceComplexity: data.spaceComplexity,
      },
      create: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        difficulty: data.difficulty ?? "BEGINNER",
        category: data.category,
        contentPath: data.contentPath,
        timeComplexity: data.timeComplexity,
        spaceComplexity: data.spaceComplexity,
      },
    });
  }

  static async linkPrerequisite(prerequisiteSlug: string, dependentSlug: string) {
    const prereq = await prisma.concept.findUnique({ where: { slug: prerequisiteSlug } });
    const dep = await prisma.concept.findUnique({ where: { slug: dependentSlug } });

    if (!prereq || !dep) {
      throw new Error(`Concepts not found: ${prerequisiteSlug} or ${dependentSlug}`);
    }

    return prisma.conceptDependency.upsert({
      where: {
        prerequisiteConceptId_dependentConceptId: {
          prerequisiteConceptId: prereq.id,
          dependentConceptId: dep.id,
        },
      },
      update: {},
      create: {
        prerequisiteConceptId: prereq.id,
        dependentConceptId: dep.id,
      },
    });
  }

  static async getAllConceptsWithDependencies() {
    return prisma.concept.findMany({
      include: {
        prerequisites: {
          include: {
            prerequisiteConcept: true,
          },
        },
        dependents: {
          include: {
            dependentConcept: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async getConceptBySlug(slug: string) {
    return prisma.concept.findUnique({
      where: { slug },
      include: {
        prerequisites: {
          include: {
            prerequisiteConcept: true,
          },
        },
        dependents: {
          include: {
            dependentConcept: true,
          },
        },
      },
    });
  }
}
