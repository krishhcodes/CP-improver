"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Target,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  ExternalLink,
  Flame,
  Award,
  Zap,
  ArrowRight,
  TrendingUp,
  BookOpen,
  CheckSquare,
  Square,
  RotateCcw,
  HelpCircle,
  AlertCircle,
  X,
  ChevronRight,
  ListChecks,
  GraduationCap,
} from "lucide-react";
import { TrainingPlan, TrainingDay, WeekOverview } from "@/server/recommendations/training-plan";
import {
  DIAGNOSTIC_TOPICS,
  VERIFICATION_QUESTIONS,
  DiagnosticResult,
  DiagnosticTopic,
  VerificationQuestion,
} from "@/server/recommendations/diagnostic-service";
import { useUser } from "@/context/UserContext";

const WEEK_THEMES: Record<number, { accent: string; border: string; bg: string; badge: string; text: string }> = {
  1: {
    accent: "text-cyan-400",
    border: "border-cyan-500/40",
    bg: "from-cyan-500/15 via-sky-500/10 to-transparent",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    text: "text-cyan-300",
  },
  2: {
    accent: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "from-emerald-500/15 via-teal-500/10 to-transparent",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    text: "text-emerald-300",
  },
  3: {
    accent: "text-amber-400",
    border: "border-amber-500/40",
    bg: "from-amber-500/15 via-orange-500/10 to-transparent",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    text: "text-amber-300",
  },
  4: {
    accent: "text-rose-400",
    border: "border-rose-500/40",
    bg: "from-rose-500/15 via-pink-500/10 to-transparent",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    text: "text-rose-300",
  },
};

export default function TrainingPage() {
  const { profile } = useUser();
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  // Diagnostic Test Modal State
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(false);
  const [diagnosticStep, setDiagnosticStep] = useState<"TICK_KNOWLEDGE" | "VERIFICATION_TEST" | "REPORT_CARD">("TICK_KNOWLEDGE");
  const [tickedTopics, setTickedTopics] = useState<Set<string>>(new Set(["prefix-sums", "two-pointers", "binary-search-answer"]));
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Load saved diagnostic result and task completions from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedDiag = localStorage.getItem(`cp_diagnostic_${profile.handle}`);
        if (savedDiag) {
          const parsed = JSON.parse(savedDiag);
          setDiagnosticResult(parsed);
          if (parsed.recommendedStartingWeek && parsed.recommendedStartingWeek >= 1 && parsed.recommendedStartingWeek <= 4) {
            setCurrentWeek(parsed.recommendedStartingWeek);
          }
        }

        const savedCompleted = localStorage.getItem(`cp_training_completed_${profile.handle}_w${currentWeek}`);
        if (savedCompleted) {
          const arr = JSON.parse(savedCompleted);
          setCompletedTaskIds(new Set(arr));
        } else {
          setCompletedTaskIds(new Set());
        }
      } catch (e) {
        console.error("Error reading localStorage:", e);
      }
    }
  }, [profile.handle, currentWeek]);

  // Load Training Plan from API for currentWeek
  useEffect(() => {
    async function loadTraining() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/training?handle=${encodeURIComponent(profile.handle)}&rating=${profile.rating || 1000}&week=${currentWeek}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.plan) {
            setPlan(data.plan);

            // Read existing completed task IDs for this week
            const savedCompleted = localStorage.getItem(`cp_training_completed_${profile.handle}_w${currentWeek}`);
            if (savedCompleted) {
              try {
                const arr = JSON.parse(savedCompleted);
                setCompletedTaskIds(new Set(arr));
              } catch {
                setCompletedTaskIds(new Set());
              }
            } else {
              setCompletedTaskIds(new Set()); // clean start at 0%!
            }
          }
        }
      } catch (err) {
        console.error("Error loading training plan:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTraining();
  }, [profile.handle, profile.rating, currentWeek]);

  // Toggle individual task completion and persist in localStorage
  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      try {
        localStorage.setItem(
          `cp_training_completed_${profile.handle}_w${currentWeek}`,
          JSON.stringify(Array.from(next))
        );
      } catch (e) {
        console.error("Error saving completed tasks to localStorage:", e);
      }
      return next;
    });
  };

  // Diagnostic Test Helpers
  const toggleTickedTopic = (topicId: string) => {
    setTickedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const selectAllFoundations = () => {
    const foundations = DIAGNOSTIC_TOPICS.filter((t) => t.difficulty === "FOUNDATIONAL").map((t) => t.id);
    setTickedTopics((prev) => new Set([...Array.from(prev), ...foundations]));
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setTestAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const submitDiagnosticAssessment = async () => {
    try {
      setIsEvaluating(true);
      const res = await fetch("/api/training/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tickedTopicIds: Array.from(tickedTopics),
          answers: testAnswers,
          userRating: profile.rating || 1000,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setDiagnosticResult(data.result);
          try {
            localStorage.setItem(`cp_diagnostic_${profile.handle}`, JSON.stringify(data.result));
          } catch (e) {
            console.error("Error storing diagnostic to localStorage:", e);
          }
          setDiagnosticStep("REPORT_CARD");
        }
      }
    } catch (e) {
      console.error("Diagnostic submission failed:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const applyCalibratedCurriculum = (startingWeek: number) => {
    setCurrentWeek(startingWeek);
    setShowDiagnosticModal(false);
    setDiagnosticStep("TICK_KNOWLEDGE");
  };

  const totalTasks = plan ? plan.days.reduce((acc, d) => acc + d.tasks.length, 0) : 14;
  const currentCompletedCount = completedTaskIds.size;
  const progressPercent = totalTasks > 0 ? Math.round((currentCompletedCount / totalTasks) * 100) : 0;
  const activeTheme = WEEK_THEMES[currentWeek] || WEEK_THEMES[1];

  if (loading && !plan) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto shadow-lg shadow-cyan-500/20" />
        <p className="text-xs font-semibold text-zinc-400">Calibrating your adaptive week #{currentWeek} training curriculum...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Adaptive Training Curriculum
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all duration-300 ${activeTheme.badge}`}>
              Week #{currentWeek} of 4
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Starts Today</span>
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Grounded 4-week algorithmic mastery roadmap, calibrated by diagnostic theory verification and textbook invariants.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              setShowDiagnosticModal(true);
              setDiagnosticStep("TICK_KNOWLEDGE");
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500/20 via-emerald-500/15 to-teal-500/20 hover:from-cyan-500 hover:to-emerald-500 text-cyan-200 hover:text-slate-950 border border-cyan-500/35 transition-all duration-300 flex items-center gap-1.5 shadow-md shadow-cyan-500/10 hover:scale-103 active:scale-98"
          >
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span>{diagnosticResult ? "Retake Calibration Test" : "Take Skill Calibration Test"}</span>
          </button>

          <div className="text-right pl-3 border-l border-white/[0.08]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Target Benchmark</span>
            <p className="text-xs font-black text-white">{plan?.targetTier ?? "Specialist (1400)"}</p>
          </div>
        </div>
      </div>

      {/* Diagnostic Assessment Banner (If already calibrated) */}
      {diagnosticResult && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-emerald-950/15 to-slate-900/40 border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-cyan-500/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>DIAGNOSTIC CALIBRATED</span>
              </span>
              <span className="text-xs font-bold text-white">
                Verification Score: <span className="text-emerald-400 font-extrabold">{diagnosticResult.score}%</span>
              </span>
              <span className="text-xs text-zinc-500">•</span>
              <span className="text-xs text-zinc-300 font-medium">
                {diagnosticResult.verifiedTopicIds.length} Verified Topics
              </span>
              {diagnosticResult.blindspotTopicIds.length > 0 && (
                <>
                  <span className="text-xs text-zinc-500">•</span>
                  <span className="text-xs text-amber-400 font-bold">
                    {diagnosticResult.blindspotTopicIds.length} Blindspots Targeted
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-zinc-300">
              <strong className="text-white">{diagnosticResult.milestoneTitle}:</strong> {diagnosticResult.milestoneDescription}
            </p>
          </div>

          <button
            onClick={() => {
              setShowDiagnosticModal(true);
              setDiagnosticStep("REPORT_CARD");
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-white/[0.1] text-zinc-200 hover:text-white border border-white/[0.08] transition-all flex items-center gap-1.5 shrink-0 self-start md:self-auto hover:scale-102"
          >
            <span>View Diagnostic Report</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      )}

      {/* Week Selector Tab Bar (From Start to Finish Week by Week) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-cyan-400" />
            <span>Curriculum Roadmap (Weeks 1 to 4)</span>
          </span>
          <span className="text-xs text-zinc-400">
            Selected: <strong className={activeTheme.accent}>Week #{currentWeek}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {plan?.availableWeeks.map((week) => {
            const isSelected = week.weekNumber === currentWeek;
            const weekTheme = WEEK_THEMES[week.weekNumber] || WEEK_THEMES[1];
            return (
              <button
                key={week.weekNumber}
                onClick={() => setCurrentWeek(week.weekNumber)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 group ${
                  isSelected
                    ? `bg-gradient-to-br ${weekTheme.bg} ${weekTheme.border} shadow-lg shadow-cyan-500/5 text-white -translate-y-0.5`
                    : "bg-[#0d121c]/70 border-white/[0.06] hover:border-white/[0.16] hover:bg-[#111827]/80 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                    isSelected ? "bg-white text-slate-950 font-black shadow-sm" : "bg-white/[0.06] text-zinc-400"
                  }`}>
                    W{week.weekNumber}
                  </span>
                  {isSelected && (
                    <span className={`text-[10px] font-black uppercase tracking-wider ${weekTheme.text} flex items-center gap-1`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                  {week.title.replace(/^Week \d+:\s*/, "")}
                </p>
                <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{week.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress & Focus Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-white/[0.07] space-y-4 shadow-xl shadow-black/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${activeTheme.accent}`}>
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Week #{currentWeek} Focus Objective</span>
            </span>
            <p className="text-sm font-bold text-white">
              {plan?.focusOverview}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-2xl font-black text-white">{currentCompletedCount}</span>
              <span className="text-zinc-500 text-xs">/ {totalTasks} Tasks</span>
            </div>
            <span className="text-xs font-bold text-cyan-400">{progressPercent}% Completed</span>
          </div>
        </div>

        {/* Dynamic Animated Gradient Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-white/[0.05] p-[1px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 via-amber-400 to-rose-400 animate-shimmer transition-all duration-500 shadow-md shadow-cyan-500/20"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 7-Day Timeline (Starts Today) */}
      <div className="space-y-4">
        {plan?.days.map((day) => {
          const isCurrent = day.status === "CURRENT";
          const allDayTasksDone = day.tasks.every((t) => completedTaskIds.has(t.id));

          return (
            <div
              key={day.dayNumber}
              className={`p-5 rounded-2xl glass-panel border transition-all duration-300 ${
                isCurrent
                  ? "border-cyan-500/40 bg-cyan-500/[0.03] shadow-xl shadow-cyan-500/5 -translate-y-0.5"
                  : allDayTasksDone
                  ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                  : "border-white/[0.07] hover:border-white/[0.16] hover:bg-[#0e1422]/60"
              }`}
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center border shadow-sm ${
                    isCurrent
                      ? "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white border-cyan-400/50 shadow-cyan-500/20"
                      : allDayTasksDone
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-white/[0.05] text-zinc-300 border-white/[0.08]"
                  }`}>
                    D{day.dayNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-white">{day.dayName}: {day.theme}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse flex items-center gap-1 shadow-sm shadow-cyan-500/10">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <span>TODAY&apos;S MISSION</span>
                        </span>
                      )}
                      {allDayTasksDone && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm shadow-emerald-500/10">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 animate-check-pop" />
                          <span>All Done</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-400 self-end sm:self-auto">
                  <span>Target: <strong className="text-white font-bold">{day.targetRatingRange}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{day.estimatedMinutes}m</span>
                  </span>
                </div>
              </div>

              {/* Day Theory Study Banner (Vibrant Sunburst Amber / Invariant) */}
              {day.theoryModule && (
                <div className="mt-3.5 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/[0.08] via-orange-500/[0.04] to-transparent border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        <span>Curriculum Invariant</span>
                      </span>
                      <span className="text-xs font-bold text-white">{day.theoryModule.title}</span>
                    </div>
                    <p className="text-[11px] text-zinc-300">
                      Literature: <strong className="text-amber-200">{day.theoryModule.bookCitation}</strong> ({day.theoryModule.chapter})
                    </p>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 italic">
                      Invariant: &ldquo;{day.theoryModule.keyInvariant}&rdquo;
                    </p>
                  </div>

                  <Link
                    href={`/learn/${day.theoryModule.slug}`}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-md shadow-amber-500/20 hover:scale-102"
                  >
                    <span>Read Theory Guide ({day.theoryModule.estimatedMinutes}m)</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Day Problem Tasks */}
              <div className="pt-3 space-y-2">
                {day.tasks.map((task) => {
                  const isChecked = completedTaskIds.has(task.id);
                  const isInternalLink = task.url.startsWith("/");

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl transition-all duration-200 flex items-start sm:items-center justify-between gap-3 ${
                        isChecked
                          ? "bg-emerald-500/[0.04] border border-emerald-500/25 text-zinc-400"
                          : task.isTheory
                          ? "bg-amber-500/[0.03] border border-amber-500/20 text-zinc-200 hover:border-amber-500/35"
                          : "bg-slate-900/50 border border-white/[0.05] hover:border-white/[0.15] hover:bg-slate-900/80 text-zinc-200 hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="mt-0.5 sm:mt-0 text-zinc-500 hover:text-cyan-400 transition-colors p-0.5"
                          title={isChecked ? "Mark as uncompleted" : "Mark as completed"}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-check-pop" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-600 hover:text-cyan-400 transition-colors" />
                          )}
                        </button>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold ${isChecked ? "line-through text-zinc-500" : "text-white"}`}>
                              {task.name}
                            </span>
                            {!task.isTheory && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                ★ {task.rating}
                              </span>
                            )}
                            {task.isTheory && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Theory
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400">{task.goal}</p>
                        </div>
                      </div>

                      {isInternalLink ? (
                        <Link
                          href={task.url}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/30 transition-all flex items-center gap-1 shrink-0 shadow-sm hover:scale-102"
                        >
                          <span>{task.isTheory ? "Study" : "Open"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <a
                          href={task.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-200 border border-white/[0.08] hover:border-cyan-500/30 transition-all flex items-center gap-1 shrink-0 hover:scale-102"
                        >
                          <span>Solve</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Skill Calibration & Diagnostic Assessment Modal */}
      {showDiagnosticModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0a0f19] border border-white/[0.12] shadow-2xl shadow-cyan-500/10 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-emerald-400 to-amber-400 p-[1px] flex items-center justify-center shadow-lg shadow-cyan-500/10">
                  <div className="w-full h-full bg-[#0a0f19] rounded-[11px] flex items-center justify-center text-cyan-300">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Skill Calibration & Diagnostic Assessment</h2>
                  <p className="text-[11px] text-zinc-400">
                    {diagnosticStep === "TICK_KNOWLEDGE" && "Phase 1: Concept & Paradigm Self-Audit (Tick what you know)"}
                    {diagnosticStep === "VERIFICATION_TEST" && "Phase 2: Theoretical Verification Quiz (Confirm Invariants)"}
                    {diagnosticStep === "REPORT_CARD" && "Phase 3: Diagnostic Report & Curriculum Blueprint"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDiagnosticModal(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* STEP 1: TICK WHAT YOU KNOW */}
              {diagnosticStep === "TICK_KNOWLEDGE" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <p className="text-xs text-zinc-300">
                      Tick the algorithmic paradigms and patterns you have solved or implemented before. In Phase 2, we will present theoretical verification questions on key invariants to mathematically confirm your mastery.
                    </p>
                    <button
                      onClick={selectAllFoundations}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/35 transition-all shrink-0 self-start sm:self-auto shadow-sm hover:scale-102"
                    >
                      + Tick All Foundations
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DIAGNOSTIC_TOPICS.map((topic) => {
                      const isChecked = tickedTopics.has(topic.id);
                      return (
                        <div
                          key={topic.id}
                          onClick={() => toggleTickedTopic(topic.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                            isChecked
                              ? "bg-cyan-500/[0.06] border-cyan-500/50 text-white shadow-sm shadow-cyan-500/5 -translate-y-0.5"
                              : "bg-slate-900/40 border-white/[0.06] hover:border-white/[0.14] text-zinc-400 hover:bg-slate-900/70"
                          }`}
                        >
                          <div className="mt-0.5">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-cyan-400 animate-check-pop" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-600" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-xs text-white">{topic.name}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                topic.difficulty === "FOUNDATIONAL"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : topic.difficulty === "INTERMEDIATE"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}>
                                {topic.difficulty}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{topic.description}</p>
                            <span className="text-[10px] text-zinc-500 italic block">
                              Ref: {topic.bookCitation}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: THEORETICAL VERIFICATION TEST */}
              {diagnosticStep === "VERIFICATION_TEST" && (
                <div className="space-y-6">
                  <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/25 flex items-center justify-between text-xs shadow-sm">
                    <span className="text-zinc-300">
                      Answer these 8 multiple-choice theoretical questions grounded in CLRS, CPH, CP4, and USACO Guide to confirm your invariant comprehension.
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shrink-0">
                      {Object.keys(testAnswers).length} / {VERIFICATION_QUESTIONS.length} Answered
                    </span>
                  </div>

                  <div className="space-y-4">
                    {VERIFICATION_QUESTIONS.map((q, qIdx) => {
                      const selectedOption = testAnswers[q.id];
                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.07] space-y-3 transition-all hover:border-white/[0.12]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-xs font-black text-cyan-400">
                              Q{qIdx + 1}. [{q.topicName}]
                            </span>
                            <span className="text-[10px] text-zinc-500 italic">
                              {q.bookCitation}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-white leading-relaxed">
                            {q.question}
                          </p>

                          <div className="space-y-2 pt-1">
                            {q.options.map((opt, optIdx) => {
                              const isPicked = selectedOption === optIdx;
                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectAnswer(q.id, optIdx)}
                                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all duration-150 flex items-start gap-2.5 ${
                                    isPicked
                                      ? "bg-cyan-500/20 border-cyan-500 text-white font-bold shadow-md shadow-cyan-500/10"
                                      : "bg-white/[0.02] border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.05] text-zinc-300 hover:text-white"
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded-full border text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                    isPicked ? "border-cyan-400 bg-cyan-500 text-slate-950 font-black" : "border-zinc-600 text-zinc-400"
                                  }`}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: DIAGNOSTIC REPORT CARD */}
              {diagnosticStep === "REPORT_CARD" && diagnosticResult && (
                <div className="space-y-6">
                  {/* Score & Tier Calibration Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-emerald-950/20 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-cyan-500/5">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                        Diagnostic Assessment Results
                      </span>
                      <h3 className="text-lg font-black text-white">{diagnosticResult.milestoneTitle}</h3>
                      <p className="text-xs text-zinc-300 max-w-lg">{diagnosticResult.milestoneDescription}</p>
                    </div>

                    <div className="text-center sm:text-right shrink-0 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-sm">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Theory Score</span>
                      <span className="text-2xl font-black text-emerald-400">{diagnosticResult.score}%</span>
                      <span className="text-[10px] text-zinc-500 block">calibrated with CLRS/CPH</span>
                    </div>
                  </div>

                  {/* 3 Categories Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Verified Concepts */}
                    <div className="p-4 rounded-2xl bg-emerald-950/15 border border-emerald-500/25 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-extrabold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-check-pop" />
                        <span>Verified Concepts ({diagnosticResult.verifiedTopicIds.length})</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Paradigms you know and mathematically verified invariants.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {diagnosticResult.verifiedTopicIds.map((tid) => (
                          <span key={tid} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            {DIAGNOSTIC_TOPICS.find((t) => t.id === tid)?.name ?? tid}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Theoretical Blindspots */}
                    <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-500/25 space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Theoretical Blindspots ({diagnosticResult.blindspotTopicIds.length})</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Identified invariant misconceptions. Prioritized for theory study!
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {diagnosticResult.blindspotTopicIds.length === 0 ? (
                          <span className="text-[11px] text-zinc-500 italic">No blindspots detected!</span>
                        ) : (
                          diagnosticResult.blindspotTopicIds.map((tid) => (
                            <span key={tid} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {DIAGNOSTIC_TOPICS.find((t) => t.id === tid)?.name ?? tid}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Unlearned Paradigms */}
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-2">
                      <div className="flex items-center gap-1.5 text-zinc-300 font-extrabold text-xs">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Unlearned Paradigms ({diagnosticResult.unlearnedTopicIds.length})</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Scheduled for structured foundations in subsequent weeks.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {diagnosticResult.unlearnedTopicIds.map((tid) => (
                          <span key={tid} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                            {DIAGNOSTIC_TOPICS.find((t) => t.id === tid)?.name ?? tid}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              {diagnosticStep === "TICK_KNOWLEDGE" && (
                <>
                  <span className="text-xs text-zinc-400">
                    <strong className="text-cyan-400 font-bold">{tickedTopics.size}</strong> topics selected
                  </span>
                  <button
                    onClick={() => setDiagnosticStep("VERIFICATION_TEST")}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 hover:scale-102"
                  >
                    <span>Proceed to Verification Quiz (Step 2 of 2)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {diagnosticStep === "VERIFICATION_TEST" && (
                <>
                  <button
                    onClick={() => setDiagnosticStep("TICK_KNOWLEDGE")}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 transition-colors"
                  >
                    ← Back to Self-Audit
                  </button>
                  <button
                    disabled={isEvaluating}
                    onClick={submitDiagnosticAssessment}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 text-slate-950 font-black transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50 hover:scale-102"
                  >
                    <span>{isEvaluating ? "Analyzing Invariants..." : "Submit & Generate Report →"}</span>
                  </button>
                </>
              )}

              {diagnosticStep === "REPORT_CARD" && diagnosticResult && (
                <>
                  <button
                    onClick={() => setDiagnosticStep("VERIFICATION_TEST")}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 transition-colors"
                  >
                    ← Retake Quiz
                  </button>
                  <button
                    onClick={() => applyCalibratedCurriculum(diagnosticResult.recommendedStartingWeek)}
                    className="px-6 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 hover:opacity-95 text-slate-950 transition-all flex items-center gap-2 shadow-xl shadow-cyan-500/20 hover:scale-102"
                  >
                    <span>Load My Calibrated Week #{diagnosticResult.recommendedStartingWeek} Curriculum</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
