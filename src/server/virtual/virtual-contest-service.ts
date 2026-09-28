import {
  advanceContestClock,
  initVirtualContestSession,
  submitProblem,
} from "./virtual-contest-engine";
import { generatePostContestAutopsy } from "./post-contest-autopsy";
import { PRESET_CONTESTS, PresetContestDefinition } from "./preset-contests";
import { SubmissionVerdict, VirtualContestSession } from "./types";
import { PostContestAutopsy } from "./autopsy-types";

// In-memory store for active virtual contest sessions
const sessionStore = new Map<string, VirtualContestSession>();
const autopsyStore = new Map<string, PostContestAutopsy>();

// Initialize a demo session for instant inspection
const demoSession = initVirtualContestSession(970, "Alex_Algo", 1540);
// Simulate 45 minutes elapsed with 2 solves
let activeDemo = advanceContestClock(demoSession, 45 * 60);
const subA = submitProblem(activeDemo, { problemIndex: "A", verdict: "OK" });
const subB = submitProblem(subA.session, { problemIndex: "B", verdict: "OK" });
const subC = submitProblem(subB.session, { problemIndex: "C", verdict: "WRONG_ANSWER" });
activeDemo = subC.session;

sessionStore.set("demo-session-970", {
  ...activeDemo,
  id: "demo-session-970",
});

export function listPresetContests(): PresetContestDefinition[] {
  return PRESET_CONTESTS;
}

export function startVirtualContest(
  contestId: number,
  userHandle = "Alex_Algo",
  userRating = 1540,
  scoringMode: "ICPC" | "CF" = "ICPC"
): VirtualContestSession {
  const session = initVirtualContestSession(contestId, userHandle, userRating, scoringMode);
  sessionStore.set(session.id, session);
  return session;
}

export function getVirtualContestSession(sessionId: string): VirtualContestSession {
  const session = sessionStore.get(sessionId);
  if (!session) {
    if (sessionId === "demo" || sessionId === "demo-session-970") {
      return sessionStore.get("demo-session-970")!;
    }
    throw new Error(`Virtual contest session with id '${sessionId}' not found.`);
  }
  return session;
}

export function tickVirtualContest(
  sessionId: string,
  elapsedSeconds: number
): VirtualContestSession {
  const session = getVirtualContestSession(sessionId);
  if (session.status === "COMPLETED") {
    return session;
  }

  const updated = advanceContestClock(session, elapsedSeconds);
  sessionStore.set(sessionId, updated);
  return updated;
}

export function submitVirtualContestSolution(
  sessionId: string,
  problemIndex: string,
  verdict: SubmissionVerdict,
  language = "GNU C++20"
): { session: VirtualContestSession; submission: any } {
  const session = getVirtualContestSession(sessionId);
  const result = submitProblem(session, { problemIndex, verdict, language });
  sessionStore.set(sessionId, result.session);
  return result;
}

export function finishVirtualContest(sessionId: string): {
  session: VirtualContestSession;
  autopsy: PostContestAutopsy;
} {
  const session = getVirtualContestSession(sessionId);
  const completedSession: VirtualContestSession = {
    ...session,
    status: "COMPLETED",
  };
  sessionStore.set(sessionId, completedSession);

  const autopsy = generatePostContestAutopsy(completedSession, 1540);
  autopsyStore.set(sessionId, autopsy);

  return { session: completedSession, autopsy };
}

export function getPostContestAutopsyService(sessionId: string): PostContestAutopsy {
  const existing = autopsyStore.get(sessionId);
  if (existing) {
    return existing;
  }

  const session = getVirtualContestSession(sessionId);
  const autopsy = generatePostContestAutopsy(session, 1540);
  autopsyStore.set(sessionId, autopsy);
  return autopsy;
}
