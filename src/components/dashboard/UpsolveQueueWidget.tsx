"use client";

import Link from "next/link";
import { UpsolveProblem } from "@/types";
import { getCodeforcesRank } from "@/lib/utils";
import { Flame, ExternalLink, ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";

interface UpsolveQueueWidgetProps {
  problems: UpsolveProblem[];
}

export function UpsolveQueueWidget({ problems }: UpsolveQueueWidgetProps) {
  return (
    <div className="rounded-2xl glass-panel p-6 border border-white/[0.08] flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">Active Upsolve Queue</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>{problems.length} High Yield</span>
            </span>
          </div>
          <Link
            href="/upsolve"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">
          Contest problems you missed or failed, ranked by learning impact and rating fit.
        </p>
      </div>

      {/* Problems List */}
      <div className="space-y-3 my-4">
        {problems.length === 0 ? (
          <div className="py-8 px-4 text-center glass-panel-subtle rounded-xl border border-white/[0.04] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-semibold text-white">Queue Cleared!</p>
            <p className="text-[11px] text-zinc-400">
              No unresolved contest problems detected in your recent participation history.
            </p>
          </div>
        ) : (
          problems.slice(0, 3).map((problem) => {
          const rankInfo = getCodeforcesRank(problem.rating);
          const isHighPriority = problem.priority === "HIGH";

          return (
            <div
              key={problem.id}
              className="p-3.5 rounded-xl glass-panel-subtle border border-white/[0.06] hover:border-white/[0.15] transition-all space-y-2 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-extrabold text-xs flex items-center justify-center">
                    {problem.index}
                  </span>
                  <div>
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-white hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                    >
                      <span>{problem.name}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-indigo-300 transition-colors" />
                    </a>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">
                      {problem.contestName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${rankInfo.bgColor} ${rankInfo.borderColor} ${rankInfo.textColor}`}
                  >
                    ★ {problem.rating}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isHighPriority
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {problem.priority}
                  </span>
                </div>
              </div>

              {/* Reason Explainer */}
              <div className="p-2 rounded-lg bg-slate-900/60 border border-white/[0.04] text-[11px] text-zinc-400">
                <span className="text-zinc-500 font-medium">Why upsolve: </span>
                <span className="text-zinc-300">{problem.reason}</span>
              </div>

              {/* Tags & Attempts */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex items-center gap-1 flex-wrap">
                  {problem.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-400 text-[10px] border border-white/[0.05]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {problem.failedAttempts > 0 && (
                  <span className="text-[10px] font-semibold text-rose-400">
                    {problem.failedAttempts} failed attempts
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
      </div>

      <div className="pt-2 text-center">
        <Link
          href="/upsolve"
          className="w-full inline-flex items-center justify-center py-2 px-4 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] transition-all"
        >
          Explore All Missed Contest Problems
        </Link>
      </div>
    </div>
  );
}
