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

  if (loading && !plan) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-zinc-400">Calibrating your adaptive week #{currentWeek} training curriculum...</p>
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Week #{currentWeek} of 4
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
              <CalendarCheck className="w-3 h-3" />
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
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>{diagnosticResult ? "Retake Calibration Test" : "Take Skill Calibration Test"}</span>
          </button>

          <div className="text-right pl-2 border-l border-white/[0.08]">
            <span className="text-[11px] text-zinc-400 block">Target Benchmark</span>
            <p className="text-xs font-extrabold text-white">{plan?.targetTier ?? "Specialist (1400)"}</p>
          </div>
        </div>
      </div>

      {/* Diagnostic Assessment Banner (If already calibrated) */}
      {diagnosticResult && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/40 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>DIAGNOSTIC CALIBRATED</span>
              </span>
              <span className="text-xs font-bold text-white">
                Verification Score: <span className="text-emerald-400">{diagnosticResult.score}%</span>
              </span>
              <span className="text-xs text-zinc-400">•</span>
              <span className="text-xs text-zinc-300">
                {diagnosticResult.verifiedTopicIds.length} Verified Topics
              </span>
              {diagnosticResult.blindspotTopicIds.length > 0 && (
                <>
                  <span className="text-xs text-zinc-400">•</span>
                  <span className="text-xs text-amber-400 font-semibold">
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
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.1] transition-colors flex items-center gap-1.5 shrink-0 self-start md:self-auto"
          >
            <span>View Diagnostic Report</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Week Selector Tab Bar (From Start to Finish Week by Week) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-indigo-400" />
            <span>Curriculum Roadmap (Weeks 1 to 4)</span>
          </span>
          <span className="text-xs text-zinc-500">
            Selected: <strong className="text-indigo-400">Week #{currentWeek}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {plan?.availableWeeks.map((week) => {
            const isSelected = week.weekNumber === currentWeek;
            return (
              <button
                key={week.weekNumber}
                onClick={() => setCurrentWeek(week.weekNumber)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-600/10 text-white"
                    : "bg-slate-900/50 border-white/[0.06] hover:border-white/[0.15] text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-xs font-black px-2 py-0.5 rounded ${isSelected ? "bg-indigo-500 text-white" : "bg-white/[0.06] text-zinc-400"}`}>
                    W{week.weekNumber}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-white line-clamp-1">{week.title.replace(/^Week \d+:\s*/, "")}</p>
                <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{week.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress & Focus Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Week #{currentWeek} Focus Objective</span>
            </span>
            <p className="text-sm font-semibold text-white">
              {plan?.focusOverview}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-2xl font-black text-white">{currentCompletedCount}</span>
              <span className="text-zinc-500 text-xs">/ {totalTasks} Tasks</span>
            </div>
            <span className="text-xs font-bold text-indigo-400">{progressPercent}% Completed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-white/[0.04]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
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
              className={`p-5 rounded-2xl glass-panel border transition-all ${
                isCurrent
                  ? "border-indigo-500/40 bg-indigo-500/[0.04] shadow-xl shadow-indigo-500/10"
                  : allDayTasksDone
                  ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                  : "border-white/[0.08] hover:border-white/[0.15]"
              }`}
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-black text-xs flex items-center justify-center border border-indigo-500/30">
                    D{day.dayNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-white">{day.dayName}: {day.theme}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse">
                          TODAY&apos;S MISSION
                        </span>
                      )}
                      {allDayTasksDone && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>All Done</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-400 self-end sm:self-auto">
                  <span>Target: <strong className="text-white">{day.targetRatingRange}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{day.estimatedMinutes}m</span>
                  </span>
                </div>
              </div>

              {/* Day Theory Study Banner */}
              {day.theoryModule && (
                <div className="mt-3.5 p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-indigo-400" />
                        <span>Curriculum Invariant</span>
                      </span>
                      <span className="text-xs font-bold text-white">{day.theoryModule.title}</span>
                    </div>
                    <p className="text-[11px] text-zinc-300">
                      Literature: <strong className="text-zinc-200">{day.theoryModule.bookCitation}</strong> ({day.theoryModule.chapter})
                    </p>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 italic">
                      Invariant: &ldquo;{day.theoryModule.keyInvariant}&rdquo;
                    </p>
                  </div>

                  <Link
                    href={`/learn/${day.theoryModule.slug}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-md shadow-indigo-600/20"
                  >
                    <span>Read Theory Guide ({day.theoryModule.estimatedMinutes}m)</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Day Problem Tasks */}
              <div className="pt-3 space-y-2.5">
                {day.tasks.map((task) => {
                  const isChecked = completedTaskIds.has(task.id);
                  const isInternalLink = task.url.startsWith("/");

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl transition-all flex items-start sm:items-center justify-between gap-3 ${
                        isChecked
                          ? "bg-emerald-500/[0.04] border border-emerald-500/20 text-zinc-400"
                          : task.isTheory
                          ? "bg-indigo-950/20 border border-indigo-500/30 text-zinc-200"
                          : "bg-slate-900/60 border border-white/[0.04] hover:border-white/[0.1] text-zinc-200"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="mt-0.5 sm:mt-0 text-zinc-500 hover:text-indigo-400 transition-colors"
                          title={isChecked ? "Mark as uncompleted" : "Mark as completed"}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-600 hover:text-zinc-400" />
                          )}
                        </button>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold ${isChecked ? "line-through text-zinc-500" : "text-white"}`}>
                              {task.name}
                            </span>
                            {!task.isTheory && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white/[0.05] text-zinc-400 border border-white/[0.08]">
                                ★ {task.rating}
                              </span>
                            )}
                            {task.isTheory && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
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
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 transition-colors flex items-center gap-1 shrink-0"
                        >
                          <span>{task.isTheory ? "Study" : "Open"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <a
                          href={task.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] transition-colors flex items-center gap-1 shrink-0"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0b101b] border border-white/[0.12] shadow-2xl shadow-indigo-500/20 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <GraduationCap className="w-4 h-4" />
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
                  <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs text-zinc-300">
                      Tick the algorithmic paradigms and patterns you have solved or implemented before. In Phase 2, we will present theoretical verification questions on key invariants to mathematically confirm your mastery.
                    </p>
                    <button
                      onClick={selectAllFoundations}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 transition-all shrink-0 self-start sm:self-auto"
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
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                            isChecked
                              ? "bg-indigo-600/10 border-indigo-500/40 text-white"
                              : "bg-slate-900/40 border-white/[0.06] hover:border-white/[0.12] text-zinc-400"
                          }`}
                        >
                          <div className="mt-0.5">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-indigo-400" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-600" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-white">{topic.name}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                topic.difficulty === "FOUNDATIONAL"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : topic.difficulty === "INTERMEDIATE"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
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
                  <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between text-xs">
                    <span className="text-zinc-300">
                      Answer these 8 multiple-choice theoretical questions grounded in CLRS, CPH, CP4, and USACO Guide to confirm your invariant comprehension.
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 shrink-0">
                      {Object.keys(testAnswers).length} / {VERIFICATION_QUESTIONS.length} Answered
                    </span>
                  </div>

                  <div className="space-y-5">
                    {VERIFICATION_QUESTIONS.map((q, qIdx) => {
                      const selectedOption = testAnswers[q.id];
                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-xs font-black text-indigo-400">
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
                                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                                    isPicked
                                      ? "bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/10"
                                      : "bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1] text-zinc-300 hover:text-white"
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded-full border text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                    isPicked ? "border-indigo-400 bg-indigo-500 text-white" : "border-zinc-600 text-zinc-400"
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
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                        Diagnostic Assessment Results
                      </span>
                      <h3 className="text-lg font-black text-white">{diagnosticResult.milestoneTitle}</h3>
                      <p className="text-xs text-zinc-300 max-w-lg">{diagnosticResult.milestoneDescription}</p>
                    </div>

                    <div className="text-center sm:text-right shrink-0 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Theory Score</span>
                      <span className="text-2xl font-black text-emerald-400">{diagnosticResult.score}%</span>
                      <span className="text-[10px] text-zinc-500 block">calibrated with CLRS/CPH</span>
                    </div>
                  </div>

                  {/* 3 Categories Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Verified Concepts */}
                    <div className="p-4 rounded-2xl bg-emerald-950/10 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-extrabold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Concepts ({diagnosticResult.verifiedTopicIds.length})</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Paradigms you know and mathematically verified invariants.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {diagnosticResult.verifiedTopicIds.map((tid) => (
                          <span key={tid} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            {DIAGNOSTIC_TOPICS.find((t) => t.id === tid)?.name ?? tid}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Theoretical Blindspots */}
                    <div className="p-4 rounded-2xl bg-amber-950/10 border border-amber-500/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
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
                            <span key={tid} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              {DIAGNOSTIC_TOPICS.find((t) => t.id === tid)?.name ?? tid}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Unlearned Paradigms */}
                    <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08] space-y-2">
                      <div className="flex items-center gap-1.5 text-zinc-300 font-extrabold text-xs">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
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
                    <strong className="text-white">{tickedTopics.size}</strong> topics selected
                  </span>
                  <button
                    onClick={() => setDiagnosticStep("VERIFICATION_TEST")}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
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
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 transition-colors"
                  >
                    ← Back to Self-Audit
                  </button>
                  <button
                    disabled={isEvaluating}
                    onClick={submitDiagnosticAssessment}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  >
                    <span>{isEvaluating ? "Analyzing Invariants..." : "Submit & Generate Report →"}</span>
                  </button>
                </>
              )}

              {diagnosticStep === "REPORT_CARD" && diagnosticResult && (
                <>
                  <button
                    onClick={() => setDiagnosticStep("VERIFICATION_TEST")}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 transition-colors"
                  >
                    ← Retake Quiz
                  </button>
                  <button
                    onClick={() => applyCalibratedCurriculum(diagnosticResult.recommendedStartingWeek)}
                    className="px-6 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-emerald-500 hover:opacity-90 text-white transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
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
