import { describe, it, expect } from "vitest";
import {
  getCodeforcesRank,
  formatRatingDelta,
  getVerdictStyle,
  formatTimeAgo,
} from "@/lib/utils";

describe("Codeforces Rank Helper", () => {
  it("correctly identifies Legendary Grandmaster", () => {
    const rank = getCodeforcesRank(3150);
    expect(rank.name).toBe("Legendary Grandmaster");
    expect(rank.textColor).toContain("text-red-500");
  });

  it("correctly identifies Grandmaster", () => {
    const rank = getCodeforcesRank(2450);
    expect(rank.name).toBe("Grandmaster");
    expect(rank.textColor).toContain("text-red-500");
  });

  it("correctly identifies Candidate Master", () => {
    const rank = getCodeforcesRank(1950);
    expect(rank.name).toBe("Candidate Master");
    expect(rank.textColor).toContain("text-purple-400");
  });

  it("correctly identifies Expert", () => {
    const rank = getCodeforcesRank(1750);
    expect(rank.name).toBe("Expert");
    expect(rank.textColor).toContain("text-blue-400");
  });

  it("correctly identifies Specialist", () => {
    const rank = getCodeforcesRank(1450);
    expect(rank.name).toBe("Specialist");
    expect(rank.textColor).toContain("text-cyan-400");
  });

  it("correctly identifies Pupil", () => {
    const rank = getCodeforcesRank(1250);
    expect(rank.name).toBe("Pupil");
    expect(rank.textColor).toContain("text-emerald-400");
  });

  it("correctly handles unrated and edge cases", () => {
    expect(getCodeforcesRank(null).name).toBe("Unrated");
    expect(getCodeforcesRank(undefined).name).toBe("Unrated");
    expect(getCodeforcesRank(0).name).toBe("Unrated");
    expect(getCodeforcesRank(1000).name).toBe("Newbie");
  });
});

describe("Rating Delta Formatter", () => {
  it("formats positive delta with + prefix", () => {
    const delta = formatRatingDelta(85);
    expect(delta.text).toBe("+85");
    expect(delta.isPositive).toBe(true);
    expect(delta.isZero).toBe(false);
  });

  it("formats negative delta without extra signs", () => {
    const delta = formatRatingDelta(-45);
    expect(delta.text).toBe("-45");
    expect(delta.isPositive).toBe(false);
    expect(delta.isZero).toBe(false);
  });

  it("formats zero delta cleanly", () => {
    const delta = formatRatingDelta(0);
    expect(delta.text).toBe("0");
    expect(delta.isZero).toBe(true);
  });
});

describe("Verdict Style Helper", () => {
  it("returns Accepted for OK verdict", () => {
    const style = getVerdictStyle("OK");
    expect(style.label).toBe("Accepted");
    expect(style.shortLabel).toBe("AC");
    expect(style.textColor).toContain("text-emerald-400");
  });

  it("returns Wrong Answer for WRONG_ANSWER", () => {
    const style = getVerdictStyle("WRONG_ANSWER");
    expect(style.label).toBe("Wrong Answer");
    expect(style.shortLabel).toBe("WA");
    expect(style.textColor).toContain("text-rose-400");
  });

  it("returns TLE for TIME_LIMIT_EXCEEDED", () => {
    const style = getVerdictStyle("TIME_LIMIT_EXCEEDED");
    expect(style.shortLabel).toBe("TLE");
    expect(style.textColor).toContain("text-amber-400");
  });
});

describe("Time Ago Formatter", () => {
  it("formats recent timestamp correctly", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(formatTimeAgo(now - 30)).toBe("Just now");
    expect(formatTimeAgo(now - 120)).toBe("2m ago");
    expect(formatTimeAgo(now - 7200)).toBe("2h ago");
    expect(formatTimeAgo(now - 172800)).toBe("2d ago");
  });
});
