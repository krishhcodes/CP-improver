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
  Library,
  Lightbulb,
  Compass,
  Layers,
  GraduationCap,
  Target,
  CheckCircle2,
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
  const [activeTab, setActiveTab] = useState<"theory" | "variations" | "templates" | "practice">("theory");

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
        <p className="text-xs text-zinc-400">Loading comprehensive competitive programming curriculum...</p>
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
    <div className="space-y-8 max-w-5xl animate-in fade-in-50 duration-300 pb-16">
      {/* Back Link & Header */}
      <div className="space-y-4">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Knowledge Graph</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {concept.category}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                {concept.difficulty}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>USACO & Textbook Standard</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-2">
              {concept.name}
            </h1>
            <p className="text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              {concept.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl glass-panel border border-white/[0.08] text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-[10px] text-zinc-500 font-medium">Time Complexity</p>
                <p className="font-mono text-zinc-200 font-semibold">{concept.timeComplexity}</p>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl glass-panel border border-white/[0.08] text-xs flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-[10px] text-zinc-500 font-medium">Space Complexity</p>
                <p className="font-mono text-zinc-200 font-semibold">{concept.spaceComplexity}</p>
              </div>
            </div>
          </div>
        </div>
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

      {/* Literature & Curriculum Citations (USACO Guide + Top 5 CP Books) */}
      {concept.literatureReferences && concept.literatureReferences.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Library className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Literature & Global CP Curriculum References
              </h2>
            </div>
            <span className="text-[11px] text-zinc-500">
              Sourced from USACO Guide, CPH (CSES), CP4, CLRS, & Sannemo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {concept.literatureReferences.map((ref: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-panel border border-white/[0.08] hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-300">
                      {ref.source}
                    </span>
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                    {ref.section}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/[0.04]">
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    "{ref.keyInsight}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep-Dive Theory & Mathematical Foundations */}
      {concept.conceptualTheory && (
        <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Mathematical Theory, Invariants & Mental Models
            </h2>
          </div>

          <div className="prose prose-invert max-w-none text-xs leading-relaxed text-zinc-300 space-y-3">
            {concept.conceptualTheory.split("\n\n").map((paragraph: string, idx: number) => {
              if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-sm font-bold text-white pt-2">
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              if (paragraph.startsWith("#### ")) {
                return (
                  <h4 key={idx} className="text-xs font-bold text-indigo-300 pt-1 uppercase tracking-wide">
                    {paragraph.replace("#### ", "")}
                  </h4>
                );
              }
              if (paragraph.startsWith("```")) {
                const code = paragraph.replace(/```[a-z]*\n?/g, "").trim();
                return (
                  <pre
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/90 border border-white/[0.06] font-mono text-[11px] text-indigo-200 overflow-x-auto leading-relaxed my-2"
                  >
                    <code>{code}</code>
                  </pre>
                );
              }
              return (
                <p key={idx} className="text-zinc-300 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Core Variations & Problem Archetypes */}
      {concept.variations && concept.variations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Core Variations & Classical Archetypes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {concept.variations.map((v: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-panel border border-white/[0.08] space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="text-xs font-bold text-white">{v.title}</h3>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {v.explanation}
                </p>

                {v.formula && (
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-white/[0.05] font-mono text-[11px] text-purple-200">
                    <span className="text-zinc-500 text-[10px]">Formula: </span>
                    {v.formula}
                  </div>
                )}

                {v.codeSnippet && (
                  <pre className="p-2.5 rounded-lg bg-slate-950 border border-white/[0.05] font-mono text-[11px] text-indigo-300 overflow-x-auto">
                    <code>{v.codeSnippet}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contest Recognition Signals & Execution Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recognition Signals */}
        {concept.recognitionSignals && concept.recognitionSignals.length > 0 && (
          <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wide">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Contest Recognition Signals</span>
            </div>

            <div className="space-y-2.5">
              {concept.recognitionSignals.map((sig: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04] space-y-1"
                >
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {sig.triggerConstraint}
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {sig.cue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step-by-Step Strategy */}
        {concept.stepByStepStrategy && concept.stepByStepStrategy.length > 0 && (
          <div className="p-5 rounded-2xl glass-panel border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Contest Execution Protocol</span>
            </div>

            <ul className="space-y-2">
              {concept.stepByStepStrategy.map((step: string, idx: number) => (
                <li
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.04] text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Production C++20 Templates */}
      {concept.codeTemplate && (
        <div className="rounded-2xl glass-panel border border-white/[0.08] overflow-hidden shadow-2xl">
          <div className="p-4 bg-slate-900/90 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>Production C++20 Competitive Programming Template</span>
            </div>
            <button
              onClick={copyCode}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] transition-all flex items-center gap-1.5 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Template</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-5 font-mono text-xs text-zinc-200 overflow-x-auto bg-[#080d1a] leading-relaxed">
            <code>{concept.codeTemplate}</code>
          </pre>
        </div>
      )}

      {/* Common Pitfalls & Traps */}
      {concept.pitfalls && concept.pitfalls.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel border border-amber-500/25 bg-amber-500/[0.02] space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Common Implementation Traps & WA/TLE Pitfalls</span>
          </div>
          <ul className="space-y-2 text-xs text-zinc-300 pl-4 list-disc marker:text-amber-400">
            {concept.pitfalls.map((pitfall: string, i: number) => (
              <li key={i} className="leading-relaxed pl-1">{pitfall}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Practice Ladder */}
      {concept.practiceProblems && concept.practiceProblems.length > 0 && (
        <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>Calibrated Problem Practice Ladder</span>
            </div>
            <span className="text-xs text-zinc-400">
              {concept.practiceProblems.length} Curated Tasks (USACO & Codeforces)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {concept.practiceProblems.map((prob: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-xl glass-panel-subtle border border-white/[0.04] flex items-center justify-between hover:border-white/[0.15] transition-all group"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {prob.name}
                  </h4>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Rating / Division: <strong className="text-indigo-400">★ {prob.rating}</strong>
                  </span>
                </div>

                <a
                  href={prob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
                >
                  <span>Solve</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
