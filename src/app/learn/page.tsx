"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Network,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Clock,
  HardDrive,
  ExternalLink,
  ShieldAlert,
  Search,
  Layers,
} from "lucide-react";
import { DifficultyLevel, NodeLearningStatus } from "@/server/knowledge/concept-graph";

interface ConceptItem {
  slug: string;
  name: string;
  category: string;
  difficulty: DifficultyLevel;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  prerequisites: string[];
  dependents: string[];
  status: NodeLearningStatus;
  pitfalls?: string[];
  practiceProblems?: Array<{ name: string; rating: number; url: string }>;
}

export default function KnowledgeBasePage() {
  const [concepts, setConcepts] = useState<ConceptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ mastered: 6, unlocked: 4, locked: 2 });

  useEffect(() => {
    async function loadConcepts() {
      try {
        setLoading(true);
        const res = await fetch("/api/concepts");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.nodes)) {
            setConcepts(data.nodes);
            setStats({
              mastered: data.masteredCount ?? 6,
              unlocked: data.unlockedCount ?? 4,
              locked: data.lockedCount ?? 2,
            });
          }
        }
      } catch (err) {
        console.error("Error loading concepts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConcepts();
  }, []);

  const categories = [
    "ALL",
    ...Array.from(new Set(concepts.map((c) => c.category))),
  ];

  const filteredConcepts = concepts.filter((c) => {
    const matchesCategory = selectedCategory === "ALL" || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              CP Knowledge Base & Prerequisite DAG
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
              Topological Learning Graph
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Structured algorithms, mathematical proofs, C++ implementation templates, and strict prerequisite paths.
          </p>
        </div>
      </div>

      {/* Progress Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl glass-panel border border-slate-200 bg-white shadow-sm">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Total Concepts
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{concepts.length || 12}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Directed Acyclic Graph</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-200 bg-emerald-50/50 shadow-sm">
          <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mastered</span>
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.mastered}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Solidified fundamentals</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-sky-200 bg-sky-50/50 shadow-sm">
          <span className="text-[10px] text-sky-700 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unlocked</span>
          </span>
          <p className="text-2xl font-black text-sky-800 mt-1">{stats.unlocked}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Ready to learn next</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-200 bg-slate-50/50 shadow-sm">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Locked</span>
          </span>
          <p className="text-2xl font-black text-slate-700 mt-1">{stats.locked}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Prerequisites pending</span>
        </div>
      </div>

      {/* Interactive Prerequisite Pipeline Banner */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-200 bg-white shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700">
          <Network className="w-4 h-4" />
          <span>Core Prerequisite Pipeline (Data Structures Path)</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-700 flex-wrap">
          <Link
            href="/learn/prefix-sums"
            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Prefix Sums</span>
          </Link>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href="/learn/two-pointers"
            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Two Pointers</span>
          </Link>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href="/learn/binary-search-answer"
            className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 font-semibold hover:bg-sky-100 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-sky-600" />
            <span>Binary Search on Answer</span>
          </Link>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href="/learn/segment-tree"
            className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 font-semibold hover:bg-sky-100 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-sky-600" />
            <span>Segment Trees</span>
          </Link>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href="/learn/lazy-propagation"
            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 font-semibold hover:border-slate-300 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Lazy Propagation</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts by name, description, or slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-sm transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto shadow-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-sky-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading concept prerequisite graph...</p>
        </div>
      )}

      {/* Concept Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConcepts.map((c) => {
            const isMastered = c.status === "MASTERED";
            const isUnlocked = c.status === "UNLOCKED";
            const isLocked = c.status === "LOCKED";

            const statusBadge = isMastered
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : isUnlocked
              ? "bg-sky-50 text-sky-800 border-sky-200"
              : "bg-slate-100 text-slate-600 border-slate-200";

            const difficultyBadge =
              c.difficulty === "BEGINNER"
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : c.difficulty === "INTERMEDIATE"
                ? "text-blue-700 bg-blue-50 border-blue-200"
                : c.difficulty === "ADVANCED"
                ? "text-purple-700 bg-purple-50 border-purple-200"
                : "text-rose-700 bg-rose-50 border-rose-200";

            return (
              <div
                key={c.slug}
                className="p-5 rounded-2xl glass-panel border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group bg-white shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shadow-xs ${difficultyBadge}`}>
                      {c.difficulty}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 shadow-xs ${statusBadge}`}>
                      {isMastered && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {isUnlocked && <Sparkles className="w-3 h-3 text-sky-600" />}
                      {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                      <span>{c.status}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors mt-3">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {c.description}
                  </p>

                  {/* Complexity Chips */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-600">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 uppercase block font-semibold">Time</span>
                      <strong className="text-slate-900 font-mono">{c.timeComplexity}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 uppercase block font-semibold">Space</span>
                      <strong className="text-slate-900 font-mono">{c.spaceComplexity}</strong>
                    </div>
                  </div>

                  {/* Prerequisites Preview */}
                  {c.prerequisites.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400">Prereq:</span>
                      {c.prerequisites.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] border border-slate-200"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {c.practiceProblems?.length ?? 2} practice problems
                  </span>

                  <Link
                    href={`/learn/${c.slug}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white border border-sky-200 transition-all flex items-center gap-1 shadow-xs"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
