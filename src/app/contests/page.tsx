"use client";

import { useUser } from "@/context/UserContext";
import { formatRatingDelta } from "@/lib/utils";
import { Trophy, Calendar, ArrowUpRight, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function ContestsPage() {
  const { profile, ratingHistory, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Contest Intelligence</h1>
          <p className="text-xs text-zinc-400 mt-1">Loading contest history...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl glass-panel border border-white/[0.06] bg-slate-900/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const reversedContests = ratingHistory.slice().reverse();

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Contest Intelligence</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {profile.handle}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Historical contest performance, submission timelines, rating deltas, and diagnostic autopsies ({ratingHistory.length} total contests).
          </p>
        </div>
      </div>

      {/* Contests List */}
      <div className="space-y-3">
        {reversedContests.length === 0 ? (
          <div className="p-8 text-center glass-panel rounded-2xl text-xs text-zinc-400">
            No official rated contests recorded yet for this profile.
          </div>
        ) : (
          reversedContests.map((contest) => {
            const delta = formatRatingDelta(contest.ratingChange);
            return (
              <div
                key={contest.contestId}
                className="p-5 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Round #{contest.contestId}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>{contest.date}</span>
                    </span>
                  </div>
                  <Link
                    href={`/contests/${contest.contestId}`}
                    className="block text-base font-bold text-white hover:text-indigo-300 transition-colors"
                  >
                    {contest.contestName}
                  </Link>
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span>
                      Rank: <strong className="text-white">#{contest.rank}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      New Rating: <strong className="text-white">{contest.rating}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-xs font-black ${
                        delta.isPositive
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {delta.text}
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-1">Delta</p>
                  </div>

                  <Link
                    href={`/contests/${contest.contestId}`}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 transition-all flex items-center gap-1.5"
                  >
                    <span>Autopsy & Timeline</span>
                  </Link>

                  <a
                    href={`https://codeforces.com/contest/${contest.contestId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] transition-all flex items-center gap-1.5"
                  >
                    <span>Codeforces</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
