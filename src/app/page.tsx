"use client";

import { useUser } from "@/context/UserContext";
import { ProfileHeader } from "@/components/dashboard/ProfileHeader";
import { PerformanceCards } from "@/components/dashboard/PerformanceCards";
import { RatingGraph } from "@/components/dashboard/RatingGraph";
import { VerdictDistributionChart } from "@/components/dashboard/VerdictDistributionChart";
import { SkillProficiencyOverview } from "@/components/dashboard/SkillProficiencyOverview";
import { UpsolveQueueWidget } from "@/components/dashboard/UpsolveQueueWidget";
import { ContestAutopsyWidget } from "@/components/dashboard/ContestAutopsyWidget";
import { RecentSubmissionsTable } from "@/components/dashboard/RecentSubmissionsTable";
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const {
    profile,
    stats,
    ratingHistory,
    verdicts,
    upsolveProblems,
    topicWeaknesses,
    recentSubmissions,
    contestAutopsy,
    isLoading,
    error,
    switchHandle,
  } = useUser();

  if (error) {
    return (
      <div className="rounded-2xl glass-panel p-8 border border-rose-500/20 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Could not load Codeforces Profile</h2>
          <p className="text-xs text-zinc-400 mt-1">{error}</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => switchHandle("AC_on_first_TRY")}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20"
          >
            Load My ID (AC_on_first_TRY)
          </button>
          <button
            onClick={() => switchHandle("Alex_Algo")}
            className="px-4 py-2 rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs border border-white/[0.08] transition-all"
          >
            Use Demo Profile
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Profile Header Skeleton */}
        <div className="h-44 rounded-2xl glass-panel border border-white/[0.06] bg-slate-900/40 p-6 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/80" />
            <div className="space-y-2.5">
              <div className="h-7 w-48 rounded-lg bg-slate-800/80" />
              <div className="h-4 w-72 rounded-md bg-slate-800/60" />
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="h-16 w-24 rounded-xl bg-slate-800/50" />
            <div className="h-16 w-24 rounded-xl bg-slate-800/50" />
          </div>
        </div>

        {/* Performance Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl glass-panel border border-white/[0.06] bg-slate-900/30 p-5 space-y-3">
              <div className="h-4 w-28 rounded bg-slate-800/60" />
              <div className="h-8 w-16 rounded bg-slate-800/80" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl glass-panel border border-white/[0.06] bg-slate-900/30 p-6 space-y-4">
            <div className="h-5 w-40 rounded bg-slate-800/60" />
            <div className="h-72 rounded-xl bg-slate-800/30" />
          </div>
          <div className="h-96 rounded-2xl glass-panel border border-white/[0.06] bg-slate-900/30 p-6 space-y-4">
            <div className="h-5 w-36 rounded bg-slate-800/60" />
            <div className="h-60 rounded-full w-60 mx-auto bg-slate-800/30" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* 1. Profile Header */}
      <ProfileHeader profile={profile} stats={stats} />

      {/* 2. Key Metrics Grid */}
      <PerformanceCards stats={stats} />

      {/* 3. Primary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Progression Area Chart (2 Cols) */}
        <div className="lg:col-span-2">
          <RatingGraph data={ratingHistory} />
        </div>

        {/* Verdict Distribution Doughnut (1 Col) */}
        <div>
          <VerdictDistributionChart verdicts={verdicts} />
        </div>
      </div>

      {/* 4. Actionable Intelligence Section (Upsolve & Skill Vector) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Upsolve Queue */}
        <UpsolveQueueWidget problems={upsolveProblems} />

        {/* Skill Vector & Weakness Highlights */}
        <SkillProficiencyOverview topics={topicWeaknesses} />
      </div>

      {/* 5. Contest Autopsy & Submissions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Contest Diagnostic */}
        <div className="lg:col-span-1">
          <ContestAutopsyWidget autopsy={contestAutopsy} />
        </div>

        {/* Recent Submissions Feed */}
        <div className="lg:col-span-2">
          <RecentSubmissionsTable submissions={recentSubmissions} />
        </div>
      </div>
    </div>
  );
}
