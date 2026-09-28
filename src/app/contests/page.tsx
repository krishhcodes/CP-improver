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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contest Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">Loading contest history...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200 animate-pulse shadow-sm" />
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contest Intelligence</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200 shadow-xs">
              {profile.handle}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical contest performance, submission timelines, rating deltas, and diagnostic autopsies ({ratingHistory.length} total contests).
          </p>
        </div>
      </div>

      {/* Contests List */}
      <div className="space-y-3">
        {reversedContests.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 shadow-sm">
            No official rated contests recorded yet for this profile.
          </div>
        ) : (
          reversedContests.map((contest) => {
            const delta = formatRatingDelta(contest.ratingChange);
            return (
              <div
                key={contest.contestId}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      Round #{contest.contestId}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{contest.date}</span>
                    </span>
                  </div>
                  <Link
                    href={`/contests/${contest.contestId}`}
                    className="block text-base font-extrabold text-slate-900 hover:text-sky-600 transition-colors"
                  >
                    {contest.contestName}
                  </Link>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>
                      Rank: <strong className="text-slate-900 font-bold">#{contest.rank}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      New Rating: <strong className="text-slate-900 font-bold">{contest.rating}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-xs font-black border shadow-xs ${
                        delta.isPositive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {delta.text}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Delta</p>
                  </div>

                  <Link
                    href={`/contests/${contest.contestId}`}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Autopsy & Timeline</span>
                  </Link>

                  <a
                    href={`https://codeforces.com/contest/${contest.contestId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Codeforces</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
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
