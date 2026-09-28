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
  Search,
  Layers,
  GraduationCap,
  Code2,
  Target,
  Compass,
  Zap,
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
  literatureReferences?: Array<{ source: string; section: string; keyInsight: string }>;
  codeTemplate?: string;
}

interface CurriculumTrack {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  slugs: string[];
}

const CURRICULUM_TRACKS: CurriculumTrack[] = [
  {
    id: "data-structures",
    name: "Range Queries & Foundations",
    subtitle: "USACO Bronze → Silver",
    description: "Prefix sums, two pointers, binary search on answers, and segment trees.",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    slugs: ["prefix-sums", "two-pointers", "binary-search-answer", "segment-tree", "lazy-propagation"],
  },
  {
    id: "dp",
    name: "Dynamic Programming Mastery",
    subtitle: "USACO Silver → Platinum",
    description: "DAG topological orders, knapsack optimizations, bitmask states, and tree rerooting.",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    slugs: ["1d-dp", "knapsack", "bitmask-dp", "tree-dp"],
  },
  {
    id: "graphs",
    name: "Graph Algorithms & Connectivity",
    subtitle: "USACO Silver → Gold",
    description: "BFS/DFS spanning forests, DSU cycle invariants, Kruskal's MST, and Dijkstra.",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    slugs: ["bfs-dfs", "dsu", "mst-kruskal", "dijkstra"],
  },
  {
    id: "trees-strings",
    name: "Trees, Math & String Hashing",
    subtitle: "USACO Gold → Platinum",
    description: "Rerooting DP, Binary Lifting LCA, Fermat modular inverse, double hashing, and XOR trie.",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    slugs: ["tree-dp", "binary-lifting-lca", "modular-arithmetic", "string-hashing", "trie"],
  },
];

export default function KnowledgeBasePage() {
  const [concepts, setConcepts] = useState<ConceptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTrackId, setActiveTrackId] = useState<string>("data-structures");
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
      c.slug.includes(searchQuery.toLowerCase()) ||
      (c.literatureReferences && c.literatureReferences.some(r => r.source.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const activeTrack = CURRICULUM_TRACKS.find((t) => t.id === activeTrackId) || CURRICULUM_TRACKS[0];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              CP Knowledge Base & Prerequisite DAG
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
              17 Textbook Chapters
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative curriculum sourced from USACO Guide, CPH, CP4, CLRS, and Sannemo with mathematical proofs, C++20 templates, and practice ladders.
          </p>
        </div>

        <Link
          href="/training"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Take 15-Topic Diagnostic Test</span>
        </Link>
      </div>

      {/* Progress Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl glass-panel border border-slate-200 bg-white shadow-sm">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Total Concepts
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{concepts.length || 17}</p>
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

      {/* Interactive Curriculum Multi-Track Navigator */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-sky-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Structured Curriculum Tracks & Learning Pipelines
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Select a track to inspect prerequisite progressions
          </span>
        </div>

        {/* Track Selection Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CURRICULUM_TRACKS.map((t) => {
            const isActive = t.id === activeTrackId;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTrackId(t.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isActive
                    ? "bg-sky-50/80 border-sky-300 ring-2 ring-sky-500/20 shadow-xs"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                }`}
              >
                <div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${t.badge}`}>
                    {t.subtitle}
                  </span>
                  <p className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">{t.name}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">
                  {t.slugs.length} Modules
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Track Step-by-Step Flow */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">{activeTrack.name} Path</span>
            <span className="text-[11px] text-slate-500">{activeTrack.description}</span>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap pt-1">
            {activeTrack.slugs.map((slug, idx) => {
              const concept = concepts.find((c) => c.slug === slug);
              const isLast = idx === activeTrack.slugs.length - 1;
              const isMastered = concept?.status === "MASTERED";
              const isUnlocked = concept?.status === "UNLOCKED";

              return (
                <div key={slug} className="flex items-center gap-2">
                  <Link
                    href={`/learn/${slug}`}
                    className={`px-3 py-1.5 rounded-xl border font-semibold transition-all flex items-center gap-1.5 shadow-xs ${
                      isMastered
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        : isUnlocked
                        ? "bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {isMastered && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {isUnlocked && <Sparkles className="w-3 h-3 text-sky-600" />}
                    <span>{concept?.name ?? slug}</span>
                  </Link>
                  {!isLast && <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                </div>
              );
            })}
          </div>
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
            placeholder="Search concepts by name, literature source, or slug..."
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

            const primaryRef = c.literatureReferences?.[0]?.source;
            const maxProblemRating = c.practiceProblems && c.practiceProblems.length > 0
              ? Math.max(...c.practiceProblems.map((p) => p.rating))
              : 0;

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

                  {/* Primary Literature Citation */}
                  {primaryRef && (
                    <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-500">
                      <GraduationCap className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">{primaryRef}</span>
                    </div>
                  )}

                  {/* Complexity Chips */}
                  <div className="grid grid-cols-2 gap-2 mt-3.5 text-[11px] text-slate-600">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 uppercase block font-semibold">Time</span>
                      <strong className="text-slate-900 font-mono text-[10px] truncate block">{c.timeComplexity}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 uppercase block font-semibold">Space</span>
                      <strong className="text-slate-900 font-mono text-[10px] truncate block">{c.spaceComplexity}</strong>
                    </div>
                  </div>

                  {/* Feature Badges: Proofs • C++20 • Practice */}
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 text-[10px] font-medium border border-sky-200">
                      Proofs & Invariants
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200 flex items-center gap-1">
                      <Code2 className="w-3 h-3" />
                      <span>C++20</span>
                    </span>
                    {maxProblemRating > 0 && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-medium border border-purple-200 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>Up to {maxProblemRating}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {c.practiceProblems?.length ?? 2} curated tasks
                  </span>

                  <Link
                    href={`/learn/${c.slug}`}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white border border-sky-200 transition-all flex items-center gap-1 shadow-xs"
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
