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
            <h1 className="text-2xl font-black text-white tracking-tight">
              CP Knowledge Base & Prerequisite DAG
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Topological Learning Graph
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Structured algorithms, mathematical proofs, C++ implementation templates, and strict prerequisite paths.
          </p>
        </div>
      </div>

      {/* Progress Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
            Total Concepts
          </span>
          <p className="text-2xl font-black text-white mt-1">{concepts.length || 12}</p>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Directed Acyclic Graph</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-500/[0.02]">
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mastered</span>
          </span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.mastered}</p>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Solidified fundamentals</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-indigo-500/20 bg-indigo-500/[0.02]">
          <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unlocked</span>
          </span>
          <p className="text-2xl font-black text-indigo-300 mt-1">{stats.unlocked}</p>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Ready to learn next</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-zinc-700/40 bg-zinc-800/[0.1]">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Locked</span>
          </span>
          <p className="text-2xl font-black text-zinc-400 mt-1">{stats.locked}</p>
          <span className="text-[10px] text-zinc-500 mt-0.5 block">Prerequisites pending</span>
        </div>
      </div>

      {/* Interactive Prerequisite Pipeline Banner */}
      <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
          <Network className="w-4 h-4" />
          <span>Core Prerequisite Pipeline (Data Structures Path)</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-300 flex-wrap">
          <Link
            href="/learn/prefix-sums"
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Prefix Sums</span>
          </Link>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
          <Link
            href="/learn/two-pointers"
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Two Pointers</span>
          </Link>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
          <Link
            href="/learn/binary-search-answer"
            className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold hover:bg-indigo-500/30 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Binary Search on Answer</span>
          </Link>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
          <Link
            href="/learn/segment-tree"
            className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold hover:bg-indigo-500/30 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Segment Trees</span>
          </Link>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
          <Link
            href="/learn/lazy-propagation"
            className="px-3 py-1.5 rounded-xl bg-zinc-800/80 text-zinc-400 border border-white/[0.08] font-semibold hover:border-white/[0.2] transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3 h-3 text-zinc-500" />
            <span>Lazy Propagation</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts by name, description, or slug..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-panel border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel border border-white/[0.08] overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
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
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Loading concept prerequisite graph...</p>
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
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : isUnlocked
              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
              : "bg-zinc-800 text-zinc-400 border-white/[0.08]";

            const difficultyBadge =
              c.difficulty === "BEGINNER"
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : c.difficulty === "INTERMEDIATE"
                ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                : c.difficulty === "ADVANCED"
                ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
                : "text-rose-400 bg-rose-500/10 border-rose-500/20";

            return (
              <div
                key={c.slug}
                className="p-5 rounded-2xl glass-panel border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${difficultyBadge}`}>
                      {c.difficulty}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${statusBadge}`}>
                      {isMastered && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      {isUnlocked && <Sparkles className="w-3 h-3 text-indigo-400" />}
                      {isLocked && <Lock className="w-3 h-3 text-zinc-500" />}
                      <span>{c.status}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mt-3">
                    {c.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                    {c.description}
                  </p>

                  {/* Complexity Chips */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-zinc-400">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                      <span className="text-[9px] text-zinc-500 uppercase block font-semibold">Time</span>
                      <strong className="text-white font-mono">{c.timeComplexity}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                      <span className="text-[9px] text-zinc-500 uppercase block font-semibold">Space</span>
                      <strong className="text-white font-mono">{c.spaceComplexity}</strong>
                    </div>
                  </div>

                  {/* Prerequisites Preview */}
                  {c.prerequisites.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-zinc-500">Prereq:</span>
                      {c.prerequisites.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 text-[10px] border border-white/[0.05]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-medium">
                    {c.practiceProblems?.length ?? 2} practice problems
                  </span>

                  <Link
                    href={`/learn/${c.slug}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all flex items-center gap-1"
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
