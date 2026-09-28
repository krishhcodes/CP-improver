"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import {
  Sparkles,
  ArrowRight,
  Target,
  Flame,
  RefreshCw,
  Zap,
  TrendingUp,
  Shield,
  Layers,
  ExternalLink,
  Award,
  CheckCircle2,
  BookOpen,
  Bot,
} from "lucide-react";
import {
  RecommendationCategory,
  ScoredRecommendation,
} from "@/server/recommendations/recommendation-engine";
import { getCodeforcesRank } from "@/lib/utils";

const CATEGORIES: Array<{
  key: "ALL" | RecommendationCategory;
  label: string;
  desc: string;
  badgeBg: string;
}> = [
  {
    key: "ALL",
    label: "All Recommendations",
    desc: "Complete balanced mix across all 5 tactical practice pillars",
    badgeBg: "bg-sky-100 text-sky-800 border-sky-200",
  },
  {
    key: "STRENGTHENING",
    label: "Strengthening",
    desc: "Reinforce high-failure weak topics with rating-calibrated foundations",
    badgeBg: "bg-rose-100 text-rose-800 border-rose-300",
  },
  {
    key: "PROGRESSION",
    label: "Progression",
    desc: "Boundary push (+50 to +250 rating) in topics where you have solid basics",
    badgeBg: "bg-sky-100 text-sky-800 border-sky-300",
  },
  {
    key: "REVISION",
    label: "Spaced Revision",
    desc: "Scheduled review problems to prevent concept atrophy and maintain speed",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
  },
  {
    key: "CONTEST_PREPARATION",
    label: "Contest Prep",
    desc: "Div. 2 Problem C/D observation drills under realistic time pressure",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  {
    key: "UPSOLVE",
    label: "Upsolve Queue",
    desc: "High-yield problems missed during recent official contest rounds",
    badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-300",
  },
];

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading recommendations...</p>
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}

function RecommendationsContent() {
  const { profile } = useUser();
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") ?? "";

  const [activeCategory, setActiveCategory] = useState<"ALL" | RecommendationCategory>("ALL");
  const [topicFilter, setTopicFilter] = useState<string>(initialTopic);
  const [recommendations, setRecommendations] = useState<ScoredRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(profile.rating || 1000);

  useEffect(() => {
    async function fetchRecs() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (activeCategory !== "ALL") queryParams.set("category", activeCategory);
        if (topicFilter) queryParams.set("topic", topicFilter);
        queryParams.set("handle", profile.handle);
        queryParams.set("rating", String(profile.rating || 1000));

        const res = await fetch(`/api/recommend?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.recommendations)) {
            setRecommendations(data.recommendations);
            if (data.userRating) setUserRating(data.userRating);
          }
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecs();
  }, [activeCategory, topicFilter, profile.handle, profile.rating]);

  const currentCategoryMeta = CATEGORIES.find((c) => c.key === activeCategory)!;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Explainable Recommendations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200 shadow-xs">
              User Rating: {userRating}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Every candidate problem is mathematically scored against your topic weaknesses, rating fit, and quality factor.
          </p>
        </div>

        <Link
          href="/training"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <span>View 7-Day Training Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 overflow-x-auto shadow-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeCategory === cat.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Active Category Overview Pill */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border shadow-xs ${currentCategoryMeta.badgeBg}`}>
            {currentCategoryMeta.label}
          </span>
          <p className="text-xs text-slate-600 font-medium">{currentCategoryMeta.desc}</p>
        </div>

        {topicFilter && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Filtered by topic: <strong className="text-sky-700 uppercase font-bold">#{topicFilter}</strong>
            </span>
            <button
              onClick={() => setTopicFilter("")}
              className="text-xs text-rose-600 font-bold hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-sky-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Calculating explainable problem recommendations...</p>
        </div>
      )}

      {/* Recommendations Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const rank = getCodeforcesRank(rec.rating);
            const catMeta = CATEGORIES.find((c) => c.key === rec.category) ?? CATEGORIES[0];

            return (
              <div
                key={rec.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shadow-xs ${catMeta.badgeBg}`}>
                          {rec.category.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border shadow-xs ${rank.bgColor} ${rank.borderColor} ${rank.textColor}`}
                        >
                          ★ {rec.rating}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors pt-1">
                        {rec.problemName}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 shadow-xs">
                        <Zap className="w-3 h-3 text-sky-600" />
                        <span className="text-xs font-black">{rec.score}%</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Match</p>
                    </div>
                  </div>

                  {/* Explainable Rationale Callout */}
                  <div className="mt-3.5 p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                      Why Recommended (Audit Trail)
                    </span>
                    <p className="text-slate-700 leading-relaxed font-medium">{rec.reason}</p>
                  </div>

                  {/* Prerequisite Textbook Theory Callout */}
                  {rec.prerequisiteGuide && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 text-[11px] min-w-0">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">
                          Prerequisite: <strong className="text-slate-900 font-bold">{rec.prerequisiteGuide.name}</strong> ({rec.prerequisiteGuide.bookCitation})
                        </span>
                      </div>
                      <Link
                        href={`/learn/${rec.prerequisiteGuide.slug}`}
                        className="text-indigo-700 hover:text-indigo-800 font-bold text-[11px] underline underline-offset-2 shrink-0 flex items-center gap-0.5 ml-2"
                      >
                        <span>Study</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {rec.tags.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTopicFilter(t)}
                        className="px-2 py-0.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-[10px] font-medium border border-slate-200 transition-colors"
                      >
                        #{t}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/mentor?problem=${encodeURIComponent(rec.url)}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all flex items-center gap-1.5 shadow-xs"
                      title="Open problem in AI Mentor Studio"
                    >
                      <Bot className="w-3 h-3 text-sky-600" />
                      <span>Mentor</span>
                    </Link>
                    <a
                      href={rec.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Practice</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
