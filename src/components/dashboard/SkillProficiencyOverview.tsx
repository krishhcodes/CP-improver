"use client";

import Link from "next/link";
import { TopicWeakness } from "@/types";
import { Target, AlertCircle, CheckCircle2, ChevronRight, Sparkles, BookOpen } from "lucide-react";
import { findCurriculumGuideForTopic } from "@/server/knowledge/curriculum-links";

interface SkillProficiencyOverviewProps {
  topics: TopicWeakness[];
}

export function SkillProficiencyOverview({ topics }: SkillProficiencyOverviewProps) {
  // Sort by lowest proficiency first to highlight weaknesses
  const sortedTopics = [...topics].sort((a, b) => a.proficiencyScore - b.proficiencyScore);
  const criticalCount = topics.filter((t) => t.status === "CRITICAL").length;

  return (
    <div className="rounded-2xl glass-panel p-6 border border-slate-200/90 flex flex-col justify-between h-full bg-white shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Estimated Skill Vector</h2>
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800 border border-rose-200 shadow-sm">
                {criticalCount} Acute Weaknesses
              </span>
            )}
          </div>
          <Link
            href="/topics"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5 transition-colors"
          >
            <span>Full Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
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
            : "bg-sky-500";

          const statusBadge = isCritical ? (
            <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Needs Drill</span>
            </span>
          ) : isNeedsWork ? (
            <span className="text-[10px] font-bold text-amber-600">Moderate</span>
          ) : (
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Proficient</span>
            </span>
          );

          return (
            <div key={topic.tag} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 capitalize">{topic.tag}</span>
                  <span className="text-[10px] text-slate-400">
                    ({topic.solvedCount} solved / {topic.failedCount} failed)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge}
                  <span className="font-black text-slate-900 text-xs">{topic.proficiencyScore}%</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full h-2 rounded-full bg-slate-100 border border-slate-200/80 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${topic.proficiencyScore}%` }}
                />
              </div>

              {isCritical && (
                <p className="text-[11px] text-slate-500 italic pt-0.5 line-clamp-1">
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
        const guide = findCurriculumGuideForTopic(targetTag);

        return (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50/40 to-slate-50 border border-sky-200 text-xs text-slate-700 space-y-2 shadow-sm">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Algorithm Recommendation: </span>
                <span>
                  Practice 3 targeted problems on <strong className="capitalize text-sky-800 font-bold">{targetTag}</strong> (Rating {targetRating}–{targetRating + 100}) to accelerate your rating climb.
                </span>
              </div>
            </div>

            {guide && (
              <div className="pt-2 border-t border-sky-200/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600 truncate">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">Textbook: {guide.name} ({guide.primaryBookCitation})</span>
                </div>
                <Link
                  href={`/learn/${guide.slug}`}
                  className="text-sky-600 hover:text-sky-800 font-bold underline underline-offset-2 shrink-0 ml-2"
                >
                  Read Guide &rarr;
                </Link>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
