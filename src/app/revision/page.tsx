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
  BookOpen,
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Spaced Revision Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
              SM-2 Algorithm
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
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
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Active Recall Session ({queue.dueCards.length} Due)</span>
          </button>
        )}
      </div>

      {/* Metric Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-sm">
          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Due for Drill Today</span>
          </span>
          <p className="text-2xl font-black text-amber-800 mt-1">
            {queue?.dueTodayCount ?? 3}
          </p>
          <span className="text-[10px] text-amber-700/80 mt-0.5 block font-medium">Requires active recall</span>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 shadow-sm">
          <span className="text-[10px] text-sky-800 font-bold uppercase tracking-wider flex items-center gap-1">
            <Repeat className="w-3.5 h-3.5 text-sky-600" />
            <span>Upcoming in 7 Days</span>
          </span>
          <p className="text-2xl font-black text-sky-800 mt-1">
            {queue?.upcomingWeekCount ?? 2}
          </p>
          <span className="text-[10px] text-sky-600/80 mt-0.5 block font-medium">On spaced track</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-sm">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mastered Archetypes</span>
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {queue?.masteredCardsCount ?? 2}
          </p>
          <span className="text-[10px] text-emerald-600/80 mt-0.5 block font-medium">&gt;= 4 consecutive passes</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Retention Stability
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {queue?.retentionRate ?? 91}%
          </p>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
            Avg EF: {queue?.averageEaseFactor ?? 2.55}
          </span>
        </div>
      </div>

      {/* Active Recall Drill Card Modal / Mode */}
      {activeDrillCard && (
        <div className="p-6 rounded-2xl bg-white border-2 border-amber-400 shadow-md space-y-5 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                ACTIVE RECALL CARD #{(activeDrillIndex ?? 0) + 1} OF {queue?.dueCards.length}
              </span>
              <span className="text-xs font-bold text-slate-900">{activeDrillCard.conceptName}</span>
            </div>

            <button
              onClick={() => setActiveDrillIndex(null)}
              className="text-xs text-slate-400 hover:text-slate-800 font-bold"
            >
              Exit Drill
            </button>
          </div>

          {/* Question / Prompt */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>Problem Archetype: {activeDrillCard.problemName}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              {activeDrillCard.questionPrompt}
            </p>
          </div>

          {/* Reveal / Flip Button */}
          {!showAnswer && (
            <div className="pt-2">
              <button
                onClick={() => setShowAnswer(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all flex items-center gap-2 shadow-xs"
              >
                <Eye className="w-4 h-4 text-sky-600" />
                <span>Show Solution Invariant & Takeaway</span>
              </button>
            </div>
          )}

          {/* Answer Key & Grading Options */}
          {showAnswer && (
            <div className="space-y-4 pt-2 animate-in fade-in-50 duration-200">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                  Core Invariant & Pattern
                </span>
                <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-mono">
                  {activeDrillCard.answerKey}
                </p>
              </div>

              {/* Textbook Chapter Link */}
              {activeDrillCard.textbookCitation && (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-[11px]">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Textbook Source: {activeDrillCard.textbookCitation.book}</span>
                    </div>
                    <p className="text-[10px] text-slate-600">
                      Chapter: <strong className="text-slate-800">{activeDrillCard.textbookCitation.chapter}</strong>
                    </p>
                  </div>
                  <Link
                    href={`/learn/${activeDrillCard.textbookCitation.learnSlug}`}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border border-indigo-300 flex items-center gap-1 shrink-0 self-start sm:self-auto transition-colors"
                  >
                    <span>Read Theory Chapter</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Feedback Alert if submitted */}
              {feedback ? (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xs">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{feedback}</span>
                </div>
              ) : (
                /* SM-2 Recall Feedback Buttons */
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    How well did you recall this solution pattern?
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleReviewSubmission(activeDrillCard.id, 1)}
                      className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-left transition-all group shadow-xs"
                    >
                      <span className="text-xs font-extrabold block">Again</span>
                      <span className="text-[10px] text-rose-600/80">
                        Forgot / 1 day
                      </span>
                    </button>

                    <button
                      onClick={() => handleReviewSubmission(activeDrillCard.id, 3)}
                      className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-left transition-all group shadow-xs"
                    >
                      <span className="text-xs font-extrabold block">Hard</span>
                      <span className="text-[10px] text-amber-600/80">
                        Strained recall
                      </span>
                    </button>

                    <button
                      onClick={() => handleReviewSubmission(activeDrillCard.id, 4)}
                      className="p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-left transition-all group shadow-xs"
                    >
                      <span className="text-xs font-extrabold block">Good</span>
                      <span className="text-[10px] text-sky-600/80">
                        Smooth recall
                      </span>
                    </button>

                    <button
                      onClick={() => handleReviewSubmission(activeDrillCard.id, 5)}
                      className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-left transition-all group shadow-xs"
                    >
                      <span className="text-xs font-extrabold block">Easy</span>
                      <span className="text-[10px] text-emerald-600/80">
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
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start shadow-xs">
        {[
          { key: "DUE", label: `Due Today (${queue?.dueTodayCount ?? 0})` },
          { key: "UPCOMING", label: `Upcoming (${queue?.upcomingWeekCount ?? 0})` },
          { key: "ALL", label: `All Cards (${queue?.totalCardsCount ?? 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key as any)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filterTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
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
              className={`p-5 rounded-2xl bg-white border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                isDue
                  ? "border-amber-300 hover:border-amber-400 bg-amber-50/20"
                  : "border-slate-200/90 hover:border-sky-300"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-slate-900">{item.conceptName}</span>
                  {isDue ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                      DUE FOR DRILL
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      Next in {item.intervalDays}d
                    </span>
                  )}
                </div>

                <p className="text-sm text-sky-700 font-bold">{item.problemName}</p>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-medium">
                  {item.questionPrompt}
                </p>

                {item.textbookCitation && (
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{item.textbookCitation.book}</span>
                    <Link
                      href={`/learn/${item.textbookCitation.learnSlug}`}
                      className="text-sky-700 hover:text-sky-800 font-bold underline underline-offset-2 ml-1"
                    >
                      Read Guide
                    </Link>
                  </div>
                )}

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-medium">
                  <span>
                    Current Interval: <strong className="text-slate-700">{item.intervalDays} days</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Ease Factor: <strong className="text-slate-700">{item.easeFactor}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Reps: <strong className="text-slate-700">{item.repetitions}</strong>
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
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isDue ? "Active Recall" : "Review Early"}</span>
                </button>

                <a
                  href={item.problemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all flex items-center gap-1 shadow-xs"
                >
                  <span>Codeforces</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
