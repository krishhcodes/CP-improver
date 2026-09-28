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
  Compass,
  Layers,
  GraduationCap,
  Target,
  CheckCircle2,
  Zap,
} from "lucide-react";

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

  const getPlatformInfo = (url: string) => {
    if (url.includes("cses.fi")) {
      return { name: "CSES", badge: "bg-amber-50 text-amber-800 border-amber-200" };
    }
    if (url.includes("atcoder.jp")) {
      return { name: "AtCoder", badge: "bg-purple-50 text-purple-800 border-purple-200" };
    }
    return { name: "Codeforces", badge: "bg-sky-50 text-sky-800 border-sky-200" };
  };

  const getRatingBadge = (rating: number) => {
    if (rating < 1400) return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (rating < 1700) return "bg-sky-50 text-sky-800 border-sky-200";
    if (rating < 2000) return "bg-purple-50 text-purple-800 border-purple-200";
    return "bg-rose-50 text-rose-800 border-rose-200";
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-sky-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading comprehensive competitive programming curriculum chapter...</p>
      </div>
    );
  }

  if (!concept) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-slate-600">Concept not found</p>
        <Link href="/learn" className="text-xs text-sky-600 font-bold hover:underline">
          Return to Knowledge Base
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in-50 duration-300 pb-20">
      {/* Back Link & Header */}
      <div className="space-y-4">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-sky-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Knowledge Graph</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200 shadow-xs">
                {concept.category}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
                {concept.difficulty}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>USACO & Textbook Standard</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
              {concept.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {concept.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl glass-panel border border-slate-200 bg-white text-xs flex items-center gap-2 shadow-sm">
              <Clock className="w-4 h-4 text-sky-600" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase">Time Complexity</p>
                <p className="font-mono text-slate-900 font-bold">{concept.timeComplexity}</p>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl glass-panel border border-slate-200 bg-white text-xs flex items-center gap-2 shadow-sm">
              <HardDrive className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase">Space Complexity</p>
                <p className="font-mono text-slate-900 font-bold">{concept.spaceComplexity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick-Jump Section Navigation Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 border border-slate-200 overflow-x-auto text-[11px] font-semibold text-slate-600 shadow-xs scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 shrink-0">Jump To:</span>
          {concept.literatureReferences?.length > 0 && (
            <a href="#citations" className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-sky-700 transition-colors whitespace-nowrap">
              Citations
            </a>
          )}
          {concept.conceptualTheory && (
            <a href="#theory" className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-sky-700 transition-colors whitespace-nowrap">
              Math Invariants
            </a>
          )}
          {concept.variations?.length > 0 && (
            <a href="#variations" className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-sky-700 transition-colors whitespace-nowrap">
              Variations
            </a>
          )}
          {concept.recognitionSignals?.length > 0 && (
            <a href="#signals" className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-sky-700 transition-colors whitespace-nowrap">
              Recognition
            </a>
          )}
          {concept.stepByStepStrategy?.length > 0 && (
            <a href="#protocol" className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-sky-700 transition-colors whitespace-nowrap">
              Contest Protocol
            </a>
          )}
          {concept.codeTemplate && (
            <a href="#template" className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-sky-700 transition-colors whitespace-nowrap">
              C++20 Template
            </a>
          )}
          {concept.pitfalls?.length > 0 && (
            <a href="#pitfalls" className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-sky-700 transition-colors whitespace-nowrap">
              Traps
            </a>
          )}
          {concept.practiceProblems?.length > 0 && (
            <a href="#ladder" className="px-2.5 py-1 rounded-lg hover:bg-white hover:text-sky-700 transition-colors whitespace-nowrap text-sky-700 font-bold">
              Practice Ladder
            </a>
          )}
        </div>
      </div>

      {/* DAG Prerequisites & Dependents Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Prerequisites */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-200 bg-white shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-sky-600" />
            <span>Direct Prerequisites</span>
          </span>
          {concept.prerequisiteDetails?.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {concept.prerequisiteDetails.map((p: any) => (
                <Link
                  key={p.slug}
                  href={`/learn/${p.slug}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span>{p.name}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">None (Foundational core concept)</p>
          )}
        </div>

        {/* Dependents (Unlocks) */}
        <div className="p-4 rounded-2xl glass-panel border border-slate-200 bg-white shadow-sm space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Unlocks Next Concepts</span>
          </span>
          {concept.dependentDetails?.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {concept.dependentDetails.map((d: any) => (
                <Link
                  key={d.slug}
                  href={`/learn/${d.slug}`}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span>{d.name}</span>
                  <ArrowRight className="w-3 h-3 text-sky-600" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Terminal node in DAG</p>
          )}
        </div>
      </div>

      {/* Literature & Curriculum Citations (USACO Guide + Top 5 CP Books) */}
      {concept.literatureReferences && concept.literatureReferences.length > 0 && (
        <div id="citations" className="space-y-3 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Library className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Literature & Global CP Curriculum References
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">
              Sourced from USACO Guide, CPH (CSES), CP4, CLRS, & Sannemo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {concept.literatureReferences.map((ref: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-panel border border-slate-200 bg-white hover:border-sky-300 transition-all flex flex-col justify-between space-y-2 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-sky-800">
                      {ref.source}
                    </span>
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-sky-600 hover:text-sky-700 flex items-center gap-1 font-bold"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {ref.section}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    &ldquo;{ref.keyInsight}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep-Dive Theory & Mathematical Foundations */}
      {concept.conceptualTheory && (
        <div id="theory" className="p-6 rounded-2xl glass-panel border border-slate-200 bg-white shadow-sm space-y-4 scroll-mt-20">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              Mathematical Theory, Invariants & Mental Models
            </h2>
          </div>

          <div className="prose max-w-none text-xs leading-relaxed text-slate-700 space-y-3">
            {concept.conceptualTheory.split("\n\n").map((paragraph: string, idx: number) => {
              if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={idx} className="text-sm font-extrabold text-slate-900 pt-2">
                    {paragraph.replace("### ", "")}
                  </h3>
                );
              }
              if (paragraph.startsWith("#### ")) {
                return (
                  <h4 key={idx} className="text-xs font-bold text-sky-700 pt-1 uppercase tracking-wide">
                    {paragraph.replace("#### ", "")}
                  </h4>
                );
              }
              if (paragraph.startsWith("```")) {
                const code = paragraph.replace(/```[a-z]*\n?/g, "").trim();
                return (
                  <pre
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-sky-200 overflow-x-auto leading-relaxed my-2 shadow-xs"
                  >
                    <code>{code}</code>
                  </pre>
                );
              }
              return (
                <p key={idx} className="text-slate-700 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Core Variations & Problem Archetypes */}
      {concept.variations && concept.variations.length > 0 && (
        <div id="variations" className="space-y-3 scroll-mt-20">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Core Variations & Classical Archetypes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {concept.variations.map((v: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-panel border border-slate-200 bg-white shadow-sm space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shadow-xs">
                    {idx + 1}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">{v.title}</h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {v.explanation}
                </p>

                {v.formula && (
                  <div className="p-2 rounded-lg bg-purple-50/60 border border-purple-200 font-mono text-[11px] text-purple-900">
                    <span className="text-purple-600 text-[10px] font-bold">Formula: </span>
                    {v.formula}
                  </div>
                )}

                {v.codeSnippet && (
                  <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-sky-300 overflow-x-auto">
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
          <div id="signals" className="p-5 rounded-2xl glass-panel border border-slate-200 bg-white shadow-sm space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2 text-sky-800 font-bold text-xs uppercase tracking-wide">
              <Compass className="w-4 h-4 text-sky-600" />
              <span>Contest Recognition Signals</span>
            </div>

            <div className="space-y-2.5">
              {concept.recognitionSignals.map((sig: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                >
                  <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                    {sig.triggerConstraint}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {sig.cue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step-by-Step Strategy */}
        {concept.stepByStepStrategy && concept.stepByStepStrategy.length > 0 && (
          <div id="protocol" className="p-5 rounded-2xl glass-panel border border-slate-200 bg-white shadow-sm space-y-3 scroll-mt-20">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Contest Execution Protocol</span>
            </div>

            <ul className="space-y-2">
              {concept.stepByStepStrategy.map((step: string, idx: number) => (
                <li
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
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
        <div id="template" className="rounded-2xl glass-panel border border-slate-200 overflow-hidden shadow-lg bg-white scroll-mt-20">
          <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Code2 className="w-4 h-4 text-sky-600" />
              <span>Production C++20 Competitive Programming Template</span>
            </div>
            <button
              onClick={copyCode}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Template</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-5 font-mono text-xs text-slate-100 overflow-x-auto bg-slate-950 leading-relaxed">
            <code>{concept.codeTemplate}</code>
          </pre>
        </div>
      )}

      {/* Common Pitfalls & Traps */}
      {concept.pitfalls && concept.pitfalls.length > 0 && (
        <div id="pitfalls" className="p-5 rounded-2xl glass-panel border border-amber-200 bg-amber-50/60 space-y-3 shadow-sm scroll-mt-20">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Common Implementation Traps & WA/TLE Pitfalls</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-800 pl-4 list-disc marker:text-amber-600">
            {concept.pitfalls.map((pitfall: string, i: number) => (
              <li key={i} className="leading-relaxed pl-1">{pitfall}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Practice Ladder */}
      {concept.practiceProblems && concept.practiceProblems.length > 0 && (
        <div id="ladder" className="p-6 rounded-2xl glass-panel border border-slate-200 bg-white shadow-sm space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Target className="w-4 h-4 text-sky-600" />
              <span>Calibrated Problem Practice Ladder</span>
            </div>
            <span className="text-xs text-slate-500">
              {concept.practiceProblems.length} Curated Tasks (USACO, CSES, Codeforces)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {concept.practiceProblems.map((prob: any, idx: number) => {
              const platform = getPlatformInfo(prob.url);
              const ratingBadge = getRatingBadge(prob.rating);

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-sky-300 transition-all group shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.2 rounded text-[9px] font-bold border ${platform.badge}`}>
                        {platform.name}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-bold border ${ratingBadge}`}>
                        ★ {prob.rating}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {prob.name}
                    </h4>
                    {prob.hint && (
                      <p className="text-[11px] text-slate-500 leading-relaxed italic bg-white/70 p-2 rounded-lg border border-slate-200/60 mt-1">
                        <span className="font-semibold text-sky-800 not-italic">Strategy Hint: </span>
                        {prob.hint}
                      </p>
                    )}
                  </div>

                  <a
                    href={prob.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                  >
                    <span>Solve</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Diagnostic Assessment Footer Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-sky-200 bg-sky-50/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
            <Zap className="w-4 h-4 text-sky-600" />
            <span>Verify Your Understanding of {concept.name}</span>
          </div>
          <p className="text-xs text-slate-600 max-w-xl">
            Test yourself against theoretical verification questions, eliminate hidden invariant blindspots, and calibrate your weekly training plan.
          </p>
        </div>

        <Link
          href="/training"
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>Take Knowledge Test</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
