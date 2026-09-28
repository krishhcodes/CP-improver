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
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  {
    key: "STRENGTHENING",
    label: "Strengthening",
    desc: "Reinforce high-failure weak topics with rating-calibrated foundations",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  {
    key: "PROGRESSION",
    label: "Progression",
    desc: "Boundary push (+50 to +250 rating) in topics where you have solid basics",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  {
    key: "REVISION",
    label: "Spaced Revision",
    desc: "Scheduled review problems to prevent concept atrophy and maintain speed",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    key: "CONTEST_PREPARATION",
    label: "Contest Prep",
    desc: "Div. 2 Problem C/D observation drills under realistic time pressure",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    key: "UPSOLVE",
    label: "Upsolve Queue",
    desc: "High-yield problems missed during recent official contest rounds",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
];

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Loading recommendations...</p>
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
            <h1 className="text-2xl font-black text-white tracking-tight">
              Explainable Recommendations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              User Rating: {userRating}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Every candidate problem is mathematically scored against your topic weaknesses, rating fit, and quality factor.
          </p>
        </div>

        <Link
          href="/training"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/25 self-start sm:self-auto"
        >
          <span>View 7-Day Training Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-white/[0.08] overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeCategory === cat.key
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Active Category Overview Pill */}
      <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${currentCategoryMeta.badgeBg}`}>
            {currentCategoryMeta.label}
          </span>
          <p className="text-xs text-zinc-300">{currentCategoryMeta.desc}</p>
        </div>

        {topicFilter && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              Filtered by topic: <strong className="text-indigo-300 uppercase font-bold">#{topicFilter}</strong>
            </span>
            <button
              onClick={() => setTopicFilter("")}
              className="text-xs text-rose-400 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Calculating explainable problem recommendations...</p>
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
                className="p-5 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${catMeta.badgeBg}`}>
                          {rec.category.replace(/_/g, " ")}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rank.bgColor} ${rank.borderColor} ${rank.textColor}`}
                        >
                          ★ {rec.rating}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors pt-1">
                        {rec.problemName}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                        <Zap className="w-3 h-3 text-indigo-400" />
                        <span className="text-xs font-black">{rec.score}%</span>
                      </div>
                      <p className="text-[9px] text-zinc-500 font-semibold uppercase mt-0.5">Match</p>
                    </div>
                  </div>

                  {/* Explainable Rationale Callout */}
                  <div className="mt-3.5 p-3.5 rounded-xl bg-slate-900/70 border border-white/[0.04] text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                      Why Recommended (Audit Trail)
                    </span>
                    <p className="text-zinc-300 leading-relaxed">{rec.reason}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {rec.tags.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTopicFilter(t)}
                        className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white text-[10px] border border-white/[0.05] transition-colors"
                      >
                        #{t}
                      </button>
                    ))}
                  </div>

                  <a
                    href={rec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <span>Practice</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
