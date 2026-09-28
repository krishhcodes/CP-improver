"use client";

import Link from "next/link";
import { TopicWeakness } from "@/types";
import { Target, AlertCircle, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

interface SkillProficiencyOverviewProps {
  topics: TopicWeakness[];
}

export function SkillProficiencyOverview({ topics }: SkillProficiencyOverviewProps) {
  // Sort by lowest proficiency first to highlight weaknesses
  const sortedTopics = [...topics].sort((a, b) => a.proficiencyScore - b.proficiencyScore);
  const criticalCount = topics.filter((t) => t.status === "CRITICAL").length;

  return (
    <div className="rounded-2xl glass-panel p-6 border border-white/[0.08] flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">Estimated Skill Vector</h2>
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {criticalCount} Acute Weaknesses
              </span>
            )}
          </div>
          <Link
            href="/topics"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors"
          >
            <span>Full Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="text-xs text-zinc-400 mt-0.5">
          Model-derived training proficiency across core Codeforces tags [0 - 100].
        </p>
      </div>

      {/* Topic Bars */}
      <div className="space-y-3.5 my-4">
        {sortedTopics.slice(0, 5).map((topic) => {
          const isCritical = topic.status === "CRITICAL";
          const isNeedsWork = topic.status === "NEEDS_WORK";

          const barColor = isCritical
            ? "bg-rose-500"
            : isNeedsWork
            ? "bg-amber-500"
            : topic.proficiencyScore >= 75
            ? "bg-emerald-500"
            : "bg-indigo-500";

          const statusBadge = isCritical ? (
            <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Needs Drill</span>
            </span>
          ) : isNeedsWork ? (
            <span className="text-[10px] font-bold text-amber-400">Moderate</span>
          ) : (
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Proficient</span>
            </span>
          );

          return (
            <div key={topic.tag} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white capitalize">{topic.tag}</span>
                  <span className="text-[10px] text-zinc-500">
                    ({topic.solvedCount} solved / {topic.failedCount} failed)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge}
                  <span className="font-extrabold text-white text-xs">{topic.proficiencyScore}%</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${topic.proficiencyScore}%` }}
                />
              </div>

              {isCritical && (
                <p className="text-[11px] text-zinc-400 italic pt-0.5 line-clamp-1">
                  💡 {topic.actionRecommendation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommendation Callout */}
      {(() => {
        const weakest = sortedTopics[0];
        const targetTag = weakest?.tag ? weakest.tag : "greedy";
        const targetRating = weakest?.avgRating
          ? Math.max(800, Math.round(weakest.avgRating / 100) * 100)
          : 1000;

        return (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Algorithm Recommendation: </span>
              <span>
                Practice 3 targeted problems on <strong className="capitalize text-white">{targetTag}</strong> (Rating {targetRating}–{targetRating + 100}) to accelerate your rating climb.
              </span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
