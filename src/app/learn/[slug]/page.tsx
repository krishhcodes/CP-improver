"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  Clock,
  HardDrive,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Network,
  Code2,
} from "lucide-react";
import { ConceptNode } from "@/server/knowledge/concept-graph";

export default function ConceptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [concept, setConcept] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadConcept() {
      try {
        setLoading(true);
        const res = await fetch(`/api/concepts/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.concept) {
            setConcept(data.concept);
          }
        }
      } catch (err) {
        console.error("Error loading concept:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConcept();
  }, [slug]);

  const copyCode = () => {
    if (!concept?.codeTemplate) return;
    navigator.clipboard.writeText(concept.codeTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-zinc-400">Loading concept tutorial and implementation template...</p>
      </div>
    );
  }

  if (!concept) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-zinc-400">Concept not found</p>
        <Link href="/learn" className="text-xs text-indigo-400 hover:underline">
          Return to Knowledge Base
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-300">
      {/* Back Link & Header */}
      <div className="space-y-3">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Knowledge Graph</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {concept.category}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                {concept.difficulty}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              {concept.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl glass-panel border border-white/[0.08] text-xs flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono text-zinc-300">{concept.timeComplexity}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl glass-panel border border-white/[0.08] text-xs flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono text-zinc-300">{concept.spaceComplexity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description Overview */}
      <div className="p-5 rounded-2xl glass-panel border border-white/[0.08]">
        <p className="text-sm text-zinc-300 leading-relaxed">
          {concept.description}
        </p>
      </div>

      {/* DAG Prerequisites & Dependents Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Prerequisites */}
        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-indigo-400" />
            <span>Direct Prerequisites</span>
          </span>
          {concept.prerequisiteDetails?.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {concept.prerequisiteDetails.map((p: any) => (
                <Link
                  key={p.slug}
                  href={`/learn/${p.slug}`}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-indigo-600/20 text-zinc-300 hover:text-indigo-300 border border-white/[0.06] text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span>{p.name}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-500" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500">None (Foundational core concept)</p>
          )}
        </div>

        {/* Dependents (Unlocks) */}
        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unlocks Next Concepts</span>
          </span>
          {concept.dependentDetails?.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {concept.dependentDetails.map((d: any) => (
                <Link
                  key={d.slug}
                  href={`/learn/${d.slug}`}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span>{d.name}</span>
                  <ArrowRight className="w-3 h-3 text-indigo-400" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Terminal node in DAG</p>
          )}
        </div>
      </div>

      {/* C++ Code Template */}
      {concept.codeTemplate && (
        <div className="rounded-2xl glass-panel border border-white/[0.08] overflow-hidden">
          <div className="p-3.5 bg-slate-900/80 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Modern C++ Competitive Programming Template</span>
            </div>
            <button
              onClick={copyCode}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] transition-all flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-5 font-mono text-xs text-zinc-200 overflow-x-auto bg-slate-950/80 leading-relaxed">
            <code>{concept.codeTemplate}</code>
          </pre>
        </div>
      )}

      {/* Common Pitfalls Callout */}
      {concept.pitfalls && concept.pitfalls.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel border border-amber-500/20 bg-amber-500/[0.02] space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Common Implementation Traps & Pitfalls</span>
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-300 pl-4 list-disc marker:text-amber-400">
            {concept.pitfalls.map((pitfall: string, i: number) => (
              <li key={i} className="leading-relaxed">{pitfall}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Practice Problems */}
      {concept.practiceProblems && concept.practiceProblems.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Calibrated Codeforces Practice Problems</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {concept.practiceProblems.map((prob: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl glass-panel-subtle border border-white/[0.04] flex items-center justify-between hover:border-white/[0.12] transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{prob.name}</h4>
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">
                    Rating: <strong className="text-indigo-300">★ {prob.rating}</strong>
                  </span>
                </div>

                <a
                  href={prob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1"
                >
                  <span>Solve</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
