import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "./password";
import { createSessionToken, SessionPayload } from "./session";
import { cfClient } from "@/server/codeforces/cf-client";
import { UserRepository } from "@/server/db/repositories/user-repo";

export const RegisterInputSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be under 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  codeforcesHandle: z
    .string()
    .min(2, "Codeforces handle must be at least 2 characters")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Invalid Codeforces handle format"),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export class AuthService {
  /**
   * Verify whether a handle exists on Codeforces and retrieve current profile
   */
  static async verifyCodeforcesHandle(handle: string) {
    const cleanHandle = handle.trim();
    try {
      const users = await cfClient.getUserInfo([cleanHandle]);
      if (!users || users.length === 0) {
        throw new Error(`Handle "${cleanHandle}" not found on Codeforces`);
      }
      return users[0];
    } catch (err: any) {
      throw new Error(`Could not verify Codeforces handle "${cleanHandle}": ${err.message}`);
    }
  }

  /**
   * Register a new user and link verified Codeforces handle
   */
  static async register(input: RegisterInput) {
    const validated = RegisterInputSchema.parse(input);

    // 1. Verify Codeforces Handle
    const cfUser = await this.verifyCodeforcesHandle(validated.codeforcesHandle);

    // 2. Check if username or handle already registered
    const existingUser = await prisma.user.findUnique({
      where: { username: validated.username },
    });
    if (existingUser) {
      throw new Error(`Username "${validated.username}" is already taken`);
    }

    const existingHandle = await prisma.codeforcesProfile.findUnique({
      where: { handle: cfUser.handle },
    });
    if (existingHandle) {
      throw new Error(`Codeforces handle "${cfUser.handle}" is already connected to another account`);
    }

    // 3. Hash password
    const passwordHash = await hashPassword(validated.password);

    // 4. Create User & Profile
    const user = await prisma.user.create({
      data: {
        username: validated.username,
        email: validated.email ? validated.email : null,
        passwordHash,
        codeforcesProfile: {
          create: {
            handle: cfUser.handle,
            rating: cfUser.rating ?? null,
            maxRating: cfUser.maxRating ?? null,
            rank: cfUser.rank ?? null,
            maxRank: cfUser.maxRank ?? null,
            contribution: cfUser.contribution ?? 0,
            avatar: cfUser.avatar ?? null,
            titlePhoto: cfUser.titlePhoto ?? null,
            lastSyncedAt: new Date(),
            syncStatus: "COMPLETED",
          },
        },
      },
      include: {
        codeforcesProfile: true,
      },
    });

    // 5. Generate Session Token
    const sessionPayload: SessionPayload = {
      userId: user.id,
      username: user.username,
      handle: user.codeforcesProfile?.handle,
      role: user.role,
    };

    const token = await createSessionToken(sessionPayload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        handle: user.codeforcesProfile?.handle,
        rating: user.codeforcesProfile?.rating,
        rank: user.codeforcesProfile?.rank,
        avatar: user.codeforcesProfile?.avatar,
      },
      token,
    };
  }

  /**
   * Authenticate user with username and password
   */
  static async login(input: LoginInput) {
    const validated = LoginInputSchema.parse(input);

    // 1. Find user by username
    const user = await prisma.user.findUnique({
      where: { username: validated.username },
      include: {
        codeforcesProfile: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new Error("Invalid username or password");
    }

    // 2. Verify password with constant-time scrypt comparison
    const isPasswordValid = await verifyPassword(validated.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid username or password");
    }

    // 3. Generate Session Token
    const sessionPayload: SessionPayload = {
      userId: user.id,
      username: user.username,
      handle: user.codeforcesProfile?.handle,
      role: user.role,
    };

    const token = await createSessionToken(sessionPayload);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        handle: user.codeforcesProfile?.handle,
        rating: user.codeforcesProfile?.rating,
        rank: user.codeforcesProfile?.rank,
        avatar: user.codeforcesProfile?.avatar,
      },
      token,
    };
  }
}
