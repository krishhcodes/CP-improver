import { describe, it, expect, vi } from "vitest";
import { CodeforcesClient, CodeforcesAPIError } from "@/server/codeforces/cf-client";
import { z } from "zod";

describe("CodeforcesClient Architecture", () => {
  it("initializes with default options and rate-limiting interval", () => {
    const client = new CodeforcesClient();
    expect(client).toBeDefined();
    expect(typeof client.getUserInfo).toBe("function");
    expect(typeof client.getUserRating).toBe("function");
    expect(typeof client.getUserStatus).toBe("function");
    expect(typeof client.getContestList).toBe("function");
    expect(typeof client.getProblemset).toBe("function");
  });

  it("handles CodeforcesAPIError with status code and comment", () => {
    const error = new CodeforcesAPIError("Handle not found", 404, "user not found");
    expect(error.name).toBe("CodeforcesAPIError");
    expect(error.message).toBe("Handle not found");
    expect(error.statusCode).toBe(404);
    expect(error.comment).toBe("user not found");
  });

  it("parses valid API envelope and returns data", async () => {
    const mockClient = new CodeforcesClient({ minIntervalMs: 0 });

    // Mock global fetch
    const dummyUser = { handle: "tourist", contribution: 100 };
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        status: "OK",
        result: [dummyUser],
      }),
    } as any);

    try {
      const result = await mockClient.request(
        "user.info",
        { handles: "tourist" },
        z.array(z.object({ handle: z.string(), contribution: z.number() }))
      );

      expect(result).toHaveLength(1);
      expect(result[0].handle).toBe("tourist");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("throws CodeforcesAPIError when Codeforces returns status FAILED", async () => {
    const mockClient = new CodeforcesClient({ minIntervalMs: 0, maxRetries: 0 });

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        status: "FAILED",
        comment: "handles: User with such handle not found",
      }),
    } as any);

    try {
      await expect(
        mockClient.request("user.info", { handles: "invalid_handle_999" }, z.any())
      ).rejects.toThrow("User with such handle not found");
    } finally {
      global.fetch = originalFetch;
    }
  });
});
