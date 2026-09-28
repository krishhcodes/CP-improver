"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import {
  Target,
  AlertCircle,
  CheckCircle2,
  Info,
  BookOpen,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Flame,
  Award,
} from "lucide-react";
import { SkillRadarChart } from "@/components/topics/SkillRadarChart";
import { TopicSkillMetric, SkillVectorSummary } from "@/server/analytics/weakness-model";

const DEFAULT_RADAR_SKILLS = [
  { subject: "DP", proficiency: 42, fullMark: 100 },
  { subject: "Graphs", proficiency: 78, fullMark: 100 },
  { subject: "Greedy", proficiency: 81, fullMark: 100 },
  { subject: "Math", proficiency: 69, fullMark: 100 },
  { subject: "Data Structures", proficiency: 56, fullMark: 100 },
  { subject: "Strings", proficiency: 36, fullMark: 100 },
  { subject: "Binary Search", proficiency: 84, fullMark: 100 },
  { subject: "Constructive", proficiency: 72, fullMark: 100 },
];

export default function TopicsPage() {
  const { profile } = useUser();
  const [topics, setTopics] = useState<TopicSkillMetric[]>([]);
  const [summary, setSummary] = useState<SkillVectorSummary | null>(null);
  const [userRating, setUserRating] = useState<number>(profile.rating || 1000);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    async function loadTopics() {
      try {
        setLoading(true);
        const res = await fetch(`/api/analytics/topics?handle=${encodeURIComponent(profile.handle)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.skillVector) && data.skillVector.length > 0) {
            setTopics(data.skillVector);
            setSummary(data.summary ?? null);
            if (data.userRating) setUserRating(data.userRating);
          }
        }
      } catch (err) {
        console.error("Failed to load topic analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
  }, [profile.handle]);

  const filtered = topics.filter((t) => {
    const matchesSearch =
      t.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.actionRecommendation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const criticalCount = summary?.criticalWeaknesses.length ?? topics.filter((t) => t.status === "CRITICAL_WEAKNESS").length;
  const needsWorkCount = summary?.needsWorkTopics.length ?? topics.filter((t) => t.status === "NEEDS_WORK").length;
  const proficientCount = summary?.proficientTopics.length ?? topics.filter((t) => t.status === "PROFICIENT" || t.status === "MASTERED").length;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Topic Intelligence & Skill Vector
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200 shadow-xs">
              Rating Model: {userRating}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Difficulty-weighted failure modeling, recency decay, and normalized proficiency across all Competitive Programming tags.
          </p>
        </div>

        {/* Action Link to Recommendations */}
        <Link
          href="/recommend"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <span>Targeted Practice Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metric Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Topics Tracked
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{topics.length || 8}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">Categorized tags</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 shadow-sm">
          <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-600" />
            <span>Critical Weakness</span>
          </span>
          <p className="text-2xl font-black text-rose-700 mt-1">{criticalCount}</p>
          <span className="text-[10px] text-rose-500/80 mt-0.5 block font-medium">Immediate training priority</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-sm">
          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-amber-600" />
            <span>Needs Work</span>
          </span>
          <p className="text-2xl font-black text-amber-800 mt-1">{needsWorkCount}</p>
          <span className="text-[10px] text-amber-600/80 mt-0.5 block font-medium">Moderate deficiency</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-sm">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-600" />
            <span>Proficient / Strong</span>
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{proficientCount}</p>
          <span className="text-[10px] text-emerald-600/80 mt-0.5 block font-medium">High consistency</span>
        </div>
      </div>

      {/* Radar Chart & Mathematical Model Split Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-5 rounded-2xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-600" />
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Skill Dimension Radar
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Proficiency distribution across the 8 fundamental Competitive Programming pillars.
            </p>
          </div>

          <div className="my-2">
            <SkillRadarChart data={summary?.radarSkills ?? DEFAULT_RADAR_SKILLS} />
          </div>

          <p className="text-[11px] text-slate-400 text-center font-medium">
            Scores normalized on scale 0–100 based on average solved rating & failure penalties.
          </p>
        </div>

        {/* Model Architecture & Explainer */}
        <div className="lg:col-span-7 rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Mathematical Architecture: Difficulty-Adjusted Model</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Why We Avoid Simple Success Ratios
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard competitive programming dashboards simply divide solves by attempts. This produces misleading results: failing an 800-rated greedy problem reveals a fundamental pattern deficiency, while failing a 2400-rated dynamic programming problem is expected for a candidate master.
            </p>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div className="text-xs space-y-1">
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wide">
                1. Difficulty Weight Factor W(p)
              </span>
              <p className="text-slate-600 text-[11px]">
                Failing problems near or below your current rating ({userRating}) triggers an amplified penalty weight up to 2.0x, whereas failing far above rating decreases to 0.5x.
              </p>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wide">
                2. Half-Life Recency Discounting
              </span>
              <p className="text-slate-600 text-[11px]">
                Submissions decay with an exponential half-life of 60 days: mistakes made 6 months ago do not penalize your current profile once you've shown recent mastery.
              </p>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wide">
                3. Sample Confidence Damping
              </span>
              <p className="text-slate-600 text-[11px]">
                Topics with fewer than 10 recorded attempts are dampened to prevent wild statistical anomalies.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Model Version: <strong className="text-slate-800">v2.4 (Decoupled Vector)</strong></span>
            <span className="text-sky-700 font-bold">100% Deterministic Engine</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic by name (e.g. dp, graphs, trees)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-xs transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 flex-wrap shadow-xs">
          {[
            { key: "ALL", label: "All Topics" },
            { key: "CRITICAL_WEAKNESS", label: "Critical" },
            { key: "NEEDS_WORK", label: "Needs Work" },
            { key: "PROFICIENT", label: "Proficient" },
            { key: "MASTERED", label: "Mastered" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setFilterStatus(s.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterStatus === s.key
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((topic) => {
          const isCritical = topic.status === "CRITICAL_WEAKNESS";
          const isNeedsWork = topic.status === "NEEDS_WORK";
          const isMastered = topic.status === "MASTERED";
          const isProficient = topic.status === "PROFICIENT";

          const badgeBg = isCritical
            ? "bg-rose-100 text-rose-800 border-rose-300"
            : isNeedsWork
            ? "bg-amber-100 text-amber-800 border-amber-300"
            : isMastered
            ? "bg-sky-100 text-sky-800 border-sky-300"
            : "bg-emerald-100 text-emerald-800 border-emerald-300";

          const barColor = isCritical
            ? "bg-rose-500"
            : isNeedsWork
            ? "bg-amber-500"
            : isMastered
            ? "bg-sky-500"
            : "bg-emerald-500";

          return (
            <div
              key={topic.tag}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 capitalize group-hover:text-sky-600 transition-colors">
                        {topic.tag}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shadow-xs ${badgeBg}`}>
                        {topic.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Avg Solved Difficulty:{" "}
                      <strong className="text-slate-800 font-bold">
                        {topic.avgSolvedRating > 0 ? topic.avgSolvedRating : "N/A"}
                      </strong>{" "}
                      {topic.maxSolvedRating > 0 && (
                        <span>(Peak: <strong className="text-slate-900 font-bold">{topic.maxSolvedRating}</strong>)</span>
                      )}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xl font-black text-slate-900">{topic.proficiencyScore}</span>
                    <span className="text-xs text-slate-400">/100</span>
                    <p className="text-[10px] text-slate-400 font-medium">Proficiency</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 border border-slate-200/80 overflow-hidden my-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${topic.proficiencyScore}%` }}
                  />
                </div>

                {/* Weakness Indicator & Success Rate Bar */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
                  <span>
                    Weakness Index:{" "}
                    <strong
                      className={
                        topic.weaknessScore >= 60
                          ? "text-rose-600 font-bold"
                          : topic.weaknessScore >= 40
                          ? "text-amber-600 font-bold"
                          : "text-emerald-600 font-bold"
                      }
                    >
                      {topic.weaknessScore}/100
                    </strong>
                  </span>
                  <span>
                    Success Rate:{" "}
                    <strong className="text-slate-900 font-bold">{topic.successRate}%</strong>
                  </span>
                </div>

                {/* Actionable Diagnostic Callout */}
                <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 text-xs space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block mb-1">
                      Diagnostic Analysis
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium">{topic.actionRecommendation}</p>
                  </div>

                  {topic.curriculumRef && (
                    <div className="pt-2 border-t border-sky-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px]">
                          <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Literature: {topic.curriculumRef.bookCitation}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 line-clamp-1 font-medium">
                          {topic.curriculumRef.chapter} &bull; <span className="text-slate-500">{topic.curriculumRef.keyInvariant}</span>
                        </p>
                      </div>
                      <Link
                        href={`/learn/${topic.curriculumRef.slug}`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0 self-start sm:self-auto transition-all shadow-xs"
                      >
                        <span>Read Chapter</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer with CTA */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span>
                    Solved: <strong className="text-emerald-700 font-bold">{topic.solvedCount}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Failed: <strong className="text-rose-700 font-bold">{topic.failedCount}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Total: <strong className="text-slate-800 font-bold">{topic.totalSubmissions}</strong>
                  </span>
                </div>

                <Link
                  href={`/recommend?topic=${encodeURIComponent(topic.tag)}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-sky-600 hover:text-white text-slate-700 border border-slate-200 hover:border-sky-600 transition-all flex items-center gap-1 shadow-xs"
                >
                  <span>Practice</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
