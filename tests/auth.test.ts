import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSessionToken, verifySessionToken } from "@/server/auth/session";
import { RegisterInputSchema, LoginInputSchema } from "@/server/auth/auth-service";

describe("Password Hashing & Verification (Scrypt)", () => {
  it("generates salted hash and verifies matching password", async () => {
    const password = "SuperSecretPassword123!";
    const hash = await hashPassword(password);

    expect(hash).toContain(":");
    const parts = hash.split(":");
    expect(parts).toHaveLength(2);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("rejects incorrect password", async () => {
    const password = "CorrectPassword123";
    const wrongPassword = "WrongPassword456";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });

  it("handles malformed hash string gracefully", async () => {
    const isValid = await verifyPassword("pass", "malformed_hash_without_colon");
    expect(isValid).toBe(false);
  });
});

describe("JWT Session Tokens (Jose)", () => {
  it("creates and verifies signed session token", async () => {
    const payload = {
      userId: "usr_12345",
      username: "alex_coder",
      handle: "Alex_Algo",
      role: "USER",
    };

    const token = await createSessionToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // Standard JWT header.payload.sig

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.username).toBe(payload.username);
    expect(verified?.handle).toBe(payload.handle);
    expect(verified?.role).toBe(payload.role);
  });

  it("returns null for tampered or invalid token", async () => {
    const tampered = "invalid.token.signature";
    const verified = await verifySessionToken(tampered);
    expect(verified).toBeNull();
  });
});

describe("Auth Validation Schemas", () => {
  it("accepts valid registration input", () => {
    const valid = {
      username: "valid_user_1",
      password: "password123",
      email: "user@example.com",
      codeforcesHandle: "tourist",
    };

    const result = RegisterInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 6 characters", () => {
    const invalid = {
      username: "valid_user",
      password: "123",
      codeforcesHandle: "tourist",
    };

    const result = RegisterInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects invalid Codeforces handle characters", () => {
    const invalid = {
      username: "valid_user",
      password: "password123",
      codeforcesHandle: "invalid handle with spaces!",
    };

    const result = RegisterInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates login input schema", () => {
    expect(LoginInputSchema.safeParse({ username: "alex", password: "pwd" }).success).toBe(true);
    expect(LoginInputSchema.safeParse({ username: "", password: "pwd" }).success).toBe(false);
    expect(LoginInputSchema.safeParse({ username: "alex", password: "" }).success).toBe(false);
  });
});
