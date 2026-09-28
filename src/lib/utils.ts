import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CFRankInfo {
  name: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  minRating: number;
}

export function getCodeforcesRank(rating: number | null | undefined): CFRankInfo {
  if (rating === null || rating === undefined || rating <= 0) {
    return {
      name: "Unrated",
      textColor: "text-zinc-400",
      bgColor: "bg-zinc-500/10",
      borderColor: "border-zinc-500/20",
      glowColor: "rgba(161, 161, 170, 0.2)",
      minRating: 0,
    };
  }

  if (rating >= 3000) {
    return {
      name: "Legendary Grandmaster",
      textColor: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      glowColor: "rgba(239, 68, 68, 0.4)",
      minRating: 3000,
    };
  }
  if (rating >= 2600) {
    return {
      name: "International Grandmaster",
      textColor: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/25",
      glowColor: "rgba(239, 68, 68, 0.3)",
      minRating: 2600,
    };
  }
  if (rating >= 2400) {
    return {
      name: "Grandmaster",
      textColor: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/25",
      glowColor: "rgba(239, 68, 68, 0.25)",
      minRating: 2400,
    };
  }
  if (rating >= 2300) {
    return {
      name: "International Master",
      textColor: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/25",
      glowColor: "rgba(245, 158, 11, 0.25)",
      minRating: 2300,
    };
  }
  if (rating >= 2100) {
    return {
      name: "Master",
      textColor: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      glowColor: "rgba(245, 158, 11, 0.2)",
      minRating: 2100,
    };
  }
  if (rating >= 1900) {
    return {
      name: "Candidate Master",
      textColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/25",
      glowColor: "rgba(192, 132, 252, 0.25)",
      minRating: 1900,
    };
  }
  if (rating >= 1600) {
    return {
      name: "Expert",
      textColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/25",
      glowColor: "rgba(96, 165, 250, 0.25)",
      minRating: 1600,
    };
  }
  if (rating >= 1400) {
    return {
      name: "Specialist",
      textColor: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      glowColor: "rgba(34, 211, 238, 0.2)",
      minRating: 1400,
    };
  }
  if (rating >= 1200) {
    return {
      name: "Pupil",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      glowColor: "rgba(52, 211, 153, 0.2)",
      minRating: 1200,
    };
  }
  return {
    name: "Newbie",
    textColor: "text-zinc-400",
    bgColor: "bg-zinc-500/10",
    borderColor: "border-zinc-500/20",
    glowColor: "rgba(161, 161, 170, 0.15)",
    minRating: 0,
  };
}

export function formatRatingDelta(delta: number | null | undefined): { text: string; isPositive: boolean; isZero: boolean } {
  if (delta === null || delta === undefined) {
    return { text: "0", isPositive: false, isZero: true };
  }
  if (delta > 0) {
    return { text: `+${delta}`, isPositive: true, isZero: false };
  }
  if (delta < 0) {
    return { text: `${delta}`, isPositive: false, isZero: false };
  }
  return { text: "0", isPositive: false, isZero: true };
}

export interface VerdictStyle {
  label: string;
  shortLabel: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

export function getVerdictStyle(verdict: string): VerdictStyle {
  switch (verdict.toUpperCase()) {
    case "OK":
      return {
        label: "Accepted",
        shortLabel: "AC",
        textColor: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
      };
    case "WRONG_ANSWER":
      return {
        label: "Wrong Answer",
        shortLabel: "WA",
        textColor: "text-rose-400",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-500/30",
      };
    case "TIME_LIMIT_EXCEEDED":
      return {
        label: "Time Limit Exceeded",
        shortLabel: "TLE",
        textColor: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
      };
    case "MEMORY_LIMIT_EXCEEDED":
      return {
        label: "Memory Limit Exceeded",
        shortLabel: "MLE",
        textColor: "text-sky-400",
        bgColor: "bg-sky-500/10",
        borderColor: "border-sky-500/30",
      };
    case "RUNTIME_ERROR":
      return {
        label: "Runtime Error",
        shortLabel: "RE",
        textColor: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
      };
    case "COMPILATION_ERROR":
      return {
        label: "Compilation Error",
        shortLabel: "CE",
        textColor: "text-zinc-400",
        bgColor: "bg-zinc-500/10",
        borderColor: "border-zinc-500/30",
      };
    case "CHALLENGED":
      return {
        label: "Hacked",
        shortLabel: "HACK",
        textColor: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
      };
    default:
      return {
        label: verdict.replace(/_/g, " "),
        shortLabel: "OTH",
        textColor: "text-zinc-400",
        bgColor: "bg-zinc-500/10",
        borderColor: "border-zinc-500/30",
      };
  }
}

export function formatTimeAgo(timestampSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - timestampSeconds);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}
