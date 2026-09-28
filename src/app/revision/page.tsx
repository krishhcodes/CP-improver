"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Repeat,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Flame,
  Award,
  Zap,
  HelpCircle,
  Eye,
  Check,
  RotateCcw,
} from "lucide-react";
import { RevisionCard, RevisionQueueSummary } from "@/server/knowledge/revision-service";

export default function RevisionPage() {
  const [queue, setQueue] = useState<RevisionQueueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDrillIndex, setActiveDrillIndex] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"ALL" | "DUE" | "UPCOMING">("DUE");

  async function loadQueue() {
    try {
      const res = await fetch("/api/revision");
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch (err) {
      console.error("Error loading revision queue:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueue();
  }, []);

  const handleReviewSubmission = async (cardId: string, quality: number) => {
    try {
      const res = await fetch(`/api/revision/${cardId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quality }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.feedbackMessage);

        // Reload queue data
        await loadQueue();

        // Advance to next due card or finish drill mode
        setTimeout(() => {
          setFeedback(null);
          setShowAnswer(false);
          if (activeDrillIndex !== null && queue && activeDrillIndex < queue.dueCards.length - 1) {
            setActiveDrillIndex(activeDrillIndex + 1);
          } else {
            setActiveDrillIndex(null);
          }
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  const activeDrillCard: RevisionCard | undefined =
    activeDrillIndex !== null && queue?.dueCards
      ? queue.dueCards[activeDrillIndex]
      : undefined;

  const displayedCards =
    filterTab === "DUE"
      ? queue?.dueCards ?? []
      : filterTab === "UPCOMING"
      ? queue?.upcomingCards ?? []
      : queue?.allCards ?? [];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Spaced Revision Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SM-2 Algorithm
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Active recall problem scheduler engineered to counteract the Ebbinghaus forgetting curve through calibrated spaced repetitions.
          </p>
        </div>

        {queue && queue.dueCards.length > 0 && activeDrillIndex === null && (
          <button
            onClick={() => {
              setActiveDrillIndex(0);
              setShowAnswer(false);
              setFeedback(null);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-amber-600/25 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Active Recall Session ({queue.dueCards.length} Due)</span>
          </button>
        )}
      </div>

      {/* Metric Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl glass-panel border border-amber-500/20 bg-amber-500/[0.02]">
          <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Due for Drill Today</span>
          </span>
          <p className="text-2xl font-black text-amber-300 mt-1">
            {queue?.dueTodayCount ?? 3}
          </p>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Requires active recall</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-indigo-500/20 bg-indigo-500/[0.02]">
          <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Repeat className="w-3.5 h-3.5" />
            <span>Upcoming in 7 Days</span>
          </span>
          <p className="text-2xl font-black text-indigo-300 mt-1">
            {queue?.upcomingWeekCount ?? 2}
          </p>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">On spaced track</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-500/[0.02]">
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>Mastered Archetypes</span>
          </span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {queue?.masteredCardsCount ?? 2}
          </p>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">&gt;= 4 consecutive passes</span>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-white/[0.08]">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
            Retention Stability
          </span>
          <p className="text-2xl font-black text-white mt-1">
            {queue?.retentionRate ?? 91}%
          </p>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">
            Avg EF: {queue?.averageEaseFactor ?? 2.55}
          </span>
        </div>
      </div>

      {/* Active Recall Drill Card Modal / Mode */}
      {activeDrillCard && (
        <div className="p-6 rounded-2xl glass-panel border-2 border-amber-500/40 bg-amber-500/[0.03] space-y-5 shadow-2xl shadow-amber-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                ACTIVE RECALL CARD #{(activeDrillIndex ?? 0) + 1} OF {queue?.dueCards.length}
              </span>
              <span className="text-xs font-bold text-white">{activeDrillCard.conceptName}</span>
            </div>

            <button
              onClick={() => setActiveDrillIndex(null)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Exit Drill
            </button>
          </div>

          {/* Question / Prompt */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <HelpCircle className="w-4 h-4" />
              <span>Problem Archetype: {activeDrillCard.problemName}</span>
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {activeDrillCard.questionPrompt}
            </p>
          </div>

          {/* Reveal / Flip Button */}
          {!showAnswer && (
            <div className="pt-2">
              <button
                onClick={() => setShowAnswer(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.1] transition-all flex items-center gap-2"
              >
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Show Solution Invariant & Takeaway</span>
              </button>
            </div>
          )}

          {/* Answer Key & Grading Options */}
          {showAnswer && (
            <div className="space-y-4 pt-2 animate-in fade-in-50 duration-200">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                  Core Invariant & Pattern
                </span>
                <p className="text-xs text-zinc-200 whitespace-pre-line leading-relaxed font-mono">
                  {activeDrillCard.answerKey}
                </p>
              </div>

              {/* Feedback Alert if submitted */}
              {feedback ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{feedback}</span>
                </div>
              ) : (
                /* SM-2 Recall Feedback Buttons */
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">
                    How well did you recall this solution pattern?
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleReviewSubmission(activeDrillCard.id, 1)}
                      className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-left transition-all group"
                    >
                      <span className="text-xs font-extrabold block">Again</span>
                      <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300">
                        Forgot / 1 day
                      </span>
                    </button>

                    <button
                      onClick={() => handleReviewSubmission(activeDrillCard.id, 3)}
                      className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-left transition-all group"
                    >
                      <span className="text-xs font-extrabold block">Hard</span>
                      <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300">
                        Strained recall
                      </span>
                    </button>

                    <button
                      onClick={() => handleReviewSubmission(activeDrillCard.id, 4)}
                      className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-left transition-all group"
                    >
                      <span className="text-xs font-extrabold block">Good</span>
                      <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300">
                        Smooth recall
                      </span>
                    </button>

                    <button
                      onClick={() => handleReviewSubmission(activeDrillCard.id, 5)}
                      className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-left transition-all group"
                    >
                      <span className="text-xs font-extrabold block">Easy</span>
                      <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300">
                        Instant mastery
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel border border-white/[0.08] self-start">
        {[
          { key: "DUE", label: `Due Today (${queue?.dueTodayCount ?? 0})` },
          { key: "UPCOMING", label: `Upcoming (${queue?.upcomingWeekCount ?? 0})` },
          { key: "ALL", label: `All Cards (${queue?.totalCardsCount ?? 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key as any)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterTab === tab.key
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {displayedCards.map((item) => {
          const isDue = item.status === "DUE";

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl glass-panel border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isDue
                  ? "border-amber-500/30 bg-amber-500/[0.02]"
                  : "border-white/[0.08] hover:border-white/[0.15]"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">{item.conceptName}</span>
                  {isDue ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      DUE FOR DRILL
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-white/[0.06]">
                      Next in {item.intervalDays}d
                    </span>
                  )}
                </div>

                <p className="text-sm text-indigo-300 font-semibold">{item.problemName}</p>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {item.questionPrompt}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                  <span>
                    Current Interval: <strong className="text-zinc-300">{item.intervalDays} days</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Ease Factor: <strong className="text-zinc-300">{item.easeFactor}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Reps: <strong className="text-zinc-300">{item.repetitions}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                <button
                  onClick={() => {
                    const dueIndex = queue?.dueCards.findIndex((c) => c.id === item.id) ?? -1;
                    if (dueIndex !== -1) {
                      setActiveDrillIndex(dueIndex);
                    } else {
                      // Allow review even if upcoming
                      setActiveDrillIndex(0);
                    }
                    setShowAnswer(false);
                    setFeedback(null);
                    window.scrollTo({ top: 120, behavior: "smooth" });
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isDue
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20"
                      : "bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08]"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isDue ? "Active Recall" : "Review Early"}</span>
                </button>

                <a
                  href={item.problemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] transition-all flex items-center gap-1"
                >
                  <span>Codeforces</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
