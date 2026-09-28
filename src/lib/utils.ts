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
      textColor: "text-slate-600",
      bgColor: "bg-slate-100",
      borderColor: "border-slate-300",
      glowColor: "rgba(100, 116, 139, 0.15)",
      minRating: 0,
    };
  }

  if (rating >= 3000) {
    return {
      name: "Legendary Grandmaster",
      textColor: "text-rose-700",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      glowColor: "rgba(225, 29, 72, 0.2)",
      minRating: 3000,
    };
  }
  if (rating >= 2600) {
    return {
      name: "International Grandmaster",
      textColor: "text-rose-700",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      glowColor: "rgba(225, 29, 72, 0.15)",
      minRating: 2600,
    };
  }
  if (rating >= 2400) {
    return {
      name: "Grandmaster",
      textColor: "text-rose-700",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-300",
      glowColor: "rgba(225, 29, 72, 0.12)",
      minRating: 2400,
    };
  }
  if (rating >= 2300) {
    return {
      name: "International Master",
      textColor: "text-amber-800",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      glowColor: "rgba(217, 119, 6, 0.15)",
      minRating: 2300,
    };
  }
  if (rating >= 2100) {
    return {
      name: "Master",
      textColor: "text-amber-800",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-300",
      glowColor: "rgba(217, 119, 6, 0.12)",
      minRating: 2100,
    };
  }
  if (rating >= 1900) {
    return {
      name: "Candidate Master",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      glowColor: "rgba(126, 34, 206, 0.15)",
      minRating: 1900,
    };
  }
  if (rating >= 1600) {
    return {
      name: "Expert",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      glowColor: "rgba(29, 78, 216, 0.15)",
      minRating: 1600,
    };
  }
  if (rating >= 1400) {
    return {
      name: "Specialist",
      textColor: "text-teal-700",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-300",
      glowColor: "rgba(15, 118, 110, 0.15)",
      minRating: 1400,
    };
  }
  if (rating >= 1200) {
    return {
      name: "Pupil",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-300",
      glowColor: "rgba(4, 120, 87, 0.15)",
      minRating: 1200,
    };
  }
  return {
    name: "Newbie",
    textColor: "text-slate-600",
    bgColor: "bg-slate-100",
    borderColor: "border-slate-300",
    glowColor: "rgba(100, 116, 139, 0.1)",
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
        textColor: "text-emerald-700",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-300",
      };
    case "WRONG_ANSWER":
      return {
        label: "Wrong Answer",
        shortLabel: "WA",
        textColor: "text-rose-700",
        bgColor: "bg-rose-50",
        borderColor: "border-rose-300",
      };
    case "TIME_LIMIT_EXCEEDED":
      return {
        label: "Time Limit Exceeded",
        shortLabel: "TLE",
        textColor: "text-amber-800",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-300",
      };
    case "MEMORY_LIMIT_EXCEEDED":
      return {
        label: "Memory Limit Exceeded",
        shortLabel: "MLE",
        textColor: "text-sky-700",
        bgColor: "bg-sky-50",
        borderColor: "border-sky-300",
      };
    case "RUNTIME_ERROR":
      return {
        label: "Runtime Error",
        shortLabel: "RE",
        textColor: "text-purple-700",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-300",
      };
    case "COMPILATION_ERROR":
      return {
        label: "Compilation Error",
        shortLabel: "CE",
        textColor: "text-slate-700",
        bgColor: "bg-slate-100",
        borderColor: "border-slate-300",
      };
    case "CHALLENGED":
      return {
        label: "Hacked",
        shortLabel: "HACK",
        textColor: "text-orange-700",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-300",
      };
    default:
      return {
        label: verdict.replace(/_/g, " "),
        shortLabel: "OTH",
        textColor: "text-slate-600",
        bgColor: "bg-slate-100",
        borderColor: "border-slate-300",
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
