import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaInstance(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const dbUrl =
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/cp_intelligence?schema=public";

    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaInstance();
    const value = Reflect.get(client as unknown as Record<string | symbol, unknown>, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;

