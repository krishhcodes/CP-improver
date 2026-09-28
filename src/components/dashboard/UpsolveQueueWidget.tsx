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
    <div className="rounded-2xl glass-panel p-6 border border-slate-200/90 flex flex-col justify-between h-full bg-white shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Active Upsolve Queue</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3 text-rose-600" />
              <span>{problems.length} High Yield</span>
            </span>
          </div>
          <Link
            href="/upsolve"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Contest problems you missed or failed, ranked by learning impact and rating fit.
        </p>
      </div>

      {/* Problems List */}
      <div className="space-y-3 my-4">
        {problems.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-slate-900">Queue Cleared!</p>
            <p className="text-[11px] text-slate-500">
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
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-sky-300 hover:bg-white hover:shadow-md transition-all duration-200 space-y-2 group shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 text-sky-800 font-black text-xs flex items-center justify-center shadow-sm">
                    {problem.index}
                  </span>
                  <div>
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors flex items-center gap-1.5"
                    >
                      <span>{problem.name}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 transition-colors" />
                    </a>
                    <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                      {problem.contestName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border shadow-sm ${rankInfo.bgColor} ${rankInfo.borderColor} ${rankInfo.textColor}`}
                  >
                    ★ {problem.rating}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border shadow-sm ${
                      isHighPriority
                        ? "bg-rose-100 text-rose-800 border-rose-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}
                  >
                    {problem.priority}
                  </span>
                </div>
              </div>

              {/* Reason Explainer (Clean sky-tinted pill) */}
              <div className="p-2.5 rounded-lg bg-sky-50/80 border border-sky-100 text-[11px] text-slate-700 leading-relaxed">
                <span className="text-sky-800 font-bold">Why upsolve: </span>
                <span>{problem.reason}</span>
              </div>

              {/* Tags & Attempts */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {problem.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-white text-slate-600 text-[10px] font-medium border border-slate-200 shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {problem.failedAttempts > 0 && (
                  <span className="text-[10px] font-bold text-rose-600">
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
          className="w-full inline-flex items-center justify-center py-2 px-4 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
        >
          Explore All Missed Contest Problems
        </Link>
      </div>
    </div>
  );
}
