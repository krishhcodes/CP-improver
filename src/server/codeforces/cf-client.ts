import { z } from "zod";
import {
  createCFResponseSchema,
  CFUserSchema,
  CFUser,
  CFRatingChangeSchema,
  CFRatingChange,
  CFSubmissionSchema,
  CFSubmission,
  CFContestSchema,
  CFContest,
  CFProblemSchema,
  CFProblem,
} from "./cf-schemas";

export class CodeforcesAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public comment?: string
  ) {
    super(message);
    this.name = "CodeforcesAPIError";
  }
}

export interface CFClientOptions {
  baseUrl?: string;
  minIntervalMs?: number; // Minimum ms between successive requests (Token Bucket)
  maxRetries?: number;
  timeoutMs?: number;
}

export class CodeforcesClient {
  private baseUrl: string;
  private minIntervalMs: number;
  private maxRetries: number;
  private timeoutMs: number;
  private lastRequestTime = 0;
  private queue: Promise<void> = Promise.resolve();

  constructor(options: CFClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "https://codeforces.com/api";
    this.minIntervalMs = options.minIntervalMs ?? 1200; // >= 1.2s between calls for rate limiting
    this.maxRetries = options.maxRetries ?? 3;
    this.timeoutMs = options.timeoutMs ?? 12000;
  }

  /**
   * Token Bucket Rate Limiter:
   * Chains calls sequentially to guarantee minimum spacing between API invocations.
   */
  private async throttle(): Promise<void> {
    this.queue = this.queue.then(async () => {
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      if (elapsed < this.minIntervalMs) {
        const delay = this.minIntervalMs - elapsed;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      this.lastRequestTime = Date.now();
    });

    return this.queue;
  }

  /**
   * Resilient HTTP Fetcher with Exponential Backoff and Jitter
   */
  public async request<T>(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined> = {},
    schema: z.ZodType<T>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) {
        url.searchParams.set(key, String(val));
      }
    });

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= this.maxRetries) {
      try {
        await this.throttle();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url.toString(), {
          headers: {
            "User-Agent": "CP-Intelligence-Platform/1.0 (+https://github.com/cp-intelligence)",
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          throw new CodeforcesAPIError("Codeforces API Rate Limit Exceeded (429)", 429);
        }

        if (response.status >= 500) {
          throw new CodeforcesAPIError(
            `Codeforces API Server Error (${response.status})`,
            response.status
          );
        }

        const rawJson = await response.json();
        const envelopeSchema = createCFResponseSchema(schema);
        const parsed = envelopeSchema.safeParse(rawJson);

        if (!parsed.success) {
          throw new CodeforcesAPIError(
            `Malformed Codeforces API response: ${parsed.error.message}`
          );
        }

        if (parsed.data.status !== "OK") {
          throw new CodeforcesAPIError(
            parsed.data.comment ?? "Codeforces API returned FAILED status",
            response.status,
            parsed.data.comment
          );
        }

        return parsed.data.result as T;
      } catch (err: any) {
        lastError = err;
        attempt++;

        if (attempt > this.maxRetries) {
          break;
        }

        // Exponential backoff with jitter: (1.5^attempt * 1000) + random(0-500ms)
        const baseDelay = Math.pow(1.5, attempt) * 1000;
        const jitter = Math.random() * 500;
        const backoffDelay = baseDelay + jitter;

        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }

    throw (
      lastError ??
      new CodeforcesAPIError(`Request failed after ${this.maxRetries} attempts`)
    );
  }

  // -------------------------------------------------------------
  // Public Endpoint Methods
  // -------------------------------------------------------------

  /**
   * Fetch Codeforces user profile (user.info)
   */
  async getUserInfo(handles: string[]): Promise<CFUser[]> {
    if (handles.length === 0) return [];
    return this.request(
      "user.info",
      { handles: handles.join(";") },
      z.array(CFUserSchema)
    );
  }

  /**
   * Fetch Codeforces user rating change history (user.rating)
   */
  async getUserRating(handle: string): Promise<CFRatingChange[]> {
    return this.request(
      "user.rating",
      { handle },
      z.array(CFRatingChangeSchema)
    );
  }

  /**
   * Fetch Codeforces user submissions (user.status)
   */
  async getUserStatus(
    handle: string,
    from = 1,
    count = 1000
  ): Promise<CFSubmission[]> {
    return this.request(
      "user.status",
      { handle, from, count },
      z.array(CFSubmissionSchema)
    );
  }

  /**
   * Fetch Codeforces contests list (contest.list)
   */
  async getContestList(gym = false): Promise<CFContest[]> {
    return this.request("contest.list", { gym }, z.array(CFContestSchema));
  }

  /**
   * Fetch Codeforces problems list (problemset.problems)
   */
  async getProblemset(tags?: string[]): Promise<{
    problems: CFProblem[];
    problemStatistics: Array<{
      contestId?: number;
      index: string;
      solvedCount: number;
    }>;
  }> {
    const ProblemsetResultSchema = z.object({
      problems: z.array(CFProblemSchema),
      problemStatistics: z.array(
        z.object({
          contestId: z.number().optional(),
          index: z.string(),
          solvedCount: z.number().default(0),
        })
      ),
    });

    return this.request(
      "problemset.problems",
      { tags: tags?.join(";") },
      ProblemsetResultSchema
    );
  }
}

// Export singleton instance with standard settings
export const cfClient = new CodeforcesClient();
