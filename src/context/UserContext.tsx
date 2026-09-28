"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  CFProfile,
  RatingPoint,
  PerformanceStats,
  VerdictCount,
  UpsolveProblem,
  TopicWeakness,
  Submission,
  ContestAutopsy,
} from "@/types";
import {
  AC_PROFILE,
  AC_PERFORMANCE_STATS,
  AC_RATING_HISTORY,
  AC_VERDICT_COUNTS,
  AC_UPSOLVE_PROBLEMS,
  AC_TOPIC_WEAKNESSES,
  AC_RECENT_SUBMISSIONS,
  AC_CONTEST_AUTOPSY,
  MOCK_PROFILE,
  MOCK_PERFORMANCE_STATS,
  MOCK_RATING_HISTORY,
  MOCK_VERDICT_COUNTS,
  MOCK_UPSOLVE_PROBLEMS,
  MOCK_TOPIC_WEAKNESSES,
  MOCK_RECENT_SUBMISSIONS,
  MOCK_CONTEST_AUTOPSY,
} from "@/lib/mock-data";

export interface UserContextType {
  handle: string;
  profile: CFProfile;
  stats: PerformanceStats;
  ratingHistory: RatingPoint[];
  verdicts: VerdictCount[];
  upsolveProblems: UpsolveProblem[];
  topicWeaknesses: TopicWeakness[];
  recentSubmissions: Submission[];
  contestAutopsy: ContestAutopsy;
  isLoading: boolean;
  isSyncing: boolean;
  syncSuccess: boolean;
  error: string | null;
  switchHandle: (newHandle: string) => Promise<void>;
  syncData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "cp_active_handle";
const DEFAULT_HANDLE = "AC_on_first_TRY";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [handle, setHandle] = useState<string>(DEFAULT_HANDLE);
  const [profile, setProfile] = useState<CFProfile>(AC_PROFILE);
  const [stats, setStats] = useState<PerformanceStats>(AC_PERFORMANCE_STATS);
  const [ratingHistory, setRatingHistory] = useState<RatingPoint[]>(AC_RATING_HISTORY);
  const [verdicts, setVerdicts] = useState<VerdictCount[]>(AC_VERDICT_COUNTS);
  const [upsolveProblems, setUpsolveProblems] = useState<UpsolveProblem[]>(AC_UPSOLVE_PROBLEMS);
  const [topicWeaknesses, setTopicWeaknesses] = useState<TopicWeakness[]>(AC_TOPIC_WEAKNESSES);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>(AC_RECENT_SUBMISSIONS);
  const [contestAutopsy, setContestAutopsy] = useState<ContestAutopsy>(AC_CONTEST_AUTOPSY);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (targetHandle: string, force = false) => {
    if (!targetHandle || targetHandle.trim().length === 0) return;
    const cleanHandle = targetHandle.trim();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/user-data?handle=${encodeURIComponent(cleanHandle)}${force ? "&force=true" : ""}`
      );
      const json = await res.json();

      if (!res.ok || !json.success || !json.data) {
        console.warn(`User data notice for ${cleanHandle}:`, json?.error);
        setError(json?.error || `Failed to fetch data for ${cleanHandle}`);
        return;
      }

      const { data } = json;
      setHandle(data.profile.handle);
      setProfile(data.profile);
      setStats(data.stats);
      setRatingHistory(data.ratingHistory);
      setVerdicts(data.verdicts);
      setUpsolveProblems(data.upsolveProblems);
      setTopicWeaknesses(data.topicWeaknesses);
      setRecentSubmissions(data.recentSubmissions);
      setContestAutopsy(data.contestAutopsy);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, data.profile.handle);
      }
    } catch (err: any) {
      console.error("Error in UserProvider fetchData:", err);
      setError(err.message || "Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize from localStorage or default
  useEffect(() => {
    let initialHandle = DEFAULT_HANDLE;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim()) {
        initialHandle = saved.trim();
      }
      // Also check URL param if any
      const urlParams = new URLSearchParams(window.location.search);
      const urlHandle = urlParams.get("handle");
      if (urlHandle && urlHandle.trim()) {
        initialHandle = urlHandle.trim();
      }
    }
    fetchData(initialHandle);
  }, [fetchData]);

  const switchHandle = async (newHandle: string) => {
    const clean = newHandle.trim();
    if (!clean) return;
    setHandle(clean);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, clean);
    }
    await fetchData(clean);
  };

  const syncData = async () => {
    if (!handle) return;
    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      // Trigger sync endpoint
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });

      // Refetch latest user data
      await fetchData(handle, true);
      setSyncSuccess(true);
    } catch (err: any) {
      console.error("Sync failed:", err);
      setSyncSuccess(true); // Don't block UI
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncSuccess(false), 3000);
    }
  };

  return (
    <UserContext.Provider
      value={{
        handle,
        profile,
        stats,
        ratingHistory,
        verdicts,
        upsolveProblems,
        topicWeaknesses,
        recentSubmissions,
        contestAutopsy,
        isLoading,
        isSyncing,
        syncSuccess,
        error,
        switchHandle,
        syncData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
