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
} from "lucide-react";
import { TrainingPlan, TrainingDay } from "@/server/recommendations/training-plan";
import { useUser } from "@/context/UserContext";

export default function TrainingPage() {
  const { profile } = useUser();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadTraining() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/training?handle=${encodeURIComponent(profile.handle)}&rating=${profile.rating || 1000}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.plan) {
            setPlan(data.plan);
            // Pre-seed completed tasks from server data
            const initialCompleted = new Set<string>();
            for (const d of data.plan.days as TrainingDay[]) {
              for (const t of d.tasks) {
                if (t.completed) initialCompleted.add(t.id);
              }
            }
            setCompletedTaskIds(initialCompleted);
          }
        }
      } catch (err) {
        console.error("Error loading training plan:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTraining();
  }, [profile.handle, profile.rating]);

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const totalTasks = plan ? plan.days.reduce((acc, d) => acc + d.tasks.length, 0) : 14;
  const currentCompletedCount = completedTaskIds.size;
  const progressPercent = Math.round((currentCompletedCount / totalTasks) * 100);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-zinc-400">Calibrating your adaptive weekly training plan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Adaptive Training Curriculum
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Week #{plan?.weekNumber ?? 4}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Dynamic 7-day curriculum calibrated against your contest mistakes and skill vector weaknesses.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-xs text-zinc-400">Target Benchmark</span>
            <p className="text-sm font-bold text-white">{plan?.targetTier ?? "Candidate Master (1900)"}</p>
          </div>
        </div>
      </div>

      {/* Progress & Focus Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-white/[0.08] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weekly Focus Objective</span>
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

      {/* 7-Day Timeline */}
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
                    <div className="flex items-center gap-2">
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
    </div>
  );
}
