"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Terminal,
  Lock,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { getCodeforcesRank, cn } from "@/lib/utils";

interface CFVerifiedUser {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  avatar?: string;
  contribution: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [codeforcesHandle, setCodeforcesHandle] = useState("");

  // Live handle verification states
  const [verifyingHandle, setVerifyingHandle] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<CFVerifiedUser | null>(null);
  const [handleError, setHandleError] = useState<string | null>(null);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Debounced live handle check
  useEffect(() => {
    if (mode !== "REGISTER" || !codeforcesHandle || codeforcesHandle.trim().length < 2) {
      setVerifiedUser(null);
      setHandleError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setVerifyingHandle(true);
      setHandleError(null);
      try {
        const res = await fetch(
          `/api/auth/verify-handle?handle=${encodeURIComponent(codeforcesHandle.trim())}`
        );
        const data = await res.json();

        if (res.ok && data.valid) {
          setVerifiedUser(data.user);
          setHandleError(null);
        } else {
          setVerifiedUser(null);
          setHandleError(data.error ?? "Codeforces handle not found");
        }
      } catch {
        setVerifiedUser(null);
        setHandleError("Network error checking handle");
      } finally {
        setVerifyingHandle(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [codeforcesHandle, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const endpoint = mode === "REGISTER" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        mode === "REGISTER"
          ? { username, password, email, codeforcesHandle }
          : { username, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Authentication failed");
      }

      setSuccessMessage(
        mode === "REGISTER"
          ? "Account created and Codeforces profile linked! Redirecting..."
          : "Signed in successfully! Redirecting..."
      );

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      setFormError(err.message ?? "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const rankInfo = verifiedUser ? getCodeforcesRank(verifiedUser.rating) : null;

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1px] items-center justify-center shadow-xl shadow-indigo-500/20 mb-2">
            <div className="w-full h-full bg-[#090d16] rounded-[15px] flex items-center justify-center">
              <Terminal className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {mode === "LOGIN" ? "Welcome Back" : "Join CP Intelligence"}
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {mode === "LOGIN"
              ? "Access your synchronized contest history, topic models, and personalized problem recommendations."
              : "Connect your Codeforces handle to unlock automated contest diagnostics and adaptive training plans."}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="p-1 rounded-xl glass-panel border border-white/[0.08] grid grid-cols-2 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("LOGIN");
              setFormError(null);
            }}
            className={cn(
              "py-2 rounded-lg transition-all",
              mode === "LOGIN"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-zinc-400 hover:text-white"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("REGISTER");
              setFormError(null);
            }}
            className={cn(
              "py-2 rounded-lg transition-all",
              mode === "REGISTER"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-zinc-400 hover:text-white"
            )}
          >
            Create Account
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl glass-panel p-6 border border-white/[0.08] shadow-2xl relative overflow-hidden">
          {/* Status Banners */}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. coder_pro"
                  className="w-full h-10 pl-9 pr-3 bg-slate-900/60 border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email (Optional in Register) */}
            {mode === "REGISTER" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300">Email Address</label>
                  <span className="text-[10px] text-zinc-500">Optional</span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full h-10 pl-9 pr-3 bg-slate-900/60 border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Codeforces Handle (Register Only) */}
            {mode === "REGISTER" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300">Codeforces Handle</label>
                  {verifyingHandle && (
                    <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      <span>Verifying on Codeforces...</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">
                    CF
                  </span>
                  <input
                    type="text"
                    required
                    value={codeforcesHandle}
                    onChange={(e) => setCodeforcesHandle(e.target.value)}
                    placeholder="e.g. tourist, Benq, or your handle"
                    className="w-full h-10 pl-9 pr-3 bg-slate-900/60 border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Live Handle Verification Preview Card */}
                {verifiedUser && rankInfo && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-900/80 border border-indigo-500/30 flex items-center justify-between animate-in fade-in-50 duration-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                        {verifiedUser.avatar ? (
                          <img
                            src={verifiedUser.avatar}
                            alt={verifiedUser.handle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          verifiedUser.handle.slice(0, 2)
                        )}
                      </div>
                      <div>
                        <span className={cn("text-xs font-extrabold", rankInfo.textColor)}>
                          {verifiedUser.handle}
                        </span>
                        <p className="text-[10px] text-zinc-400">{rankInfo.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-bold border",
                          rankInfo.bgColor,
                          rankInfo.borderColor,
                          rankInfo.textColor
                        )}
                      >
                        {verifiedUser.rating}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                )}

                {handleError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 pt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{handleError}</span>
                  </p>
                )}
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-3 bg-slate-900/60 border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === "LOGIN" ? "Sign In to Platform" : "Create Account & Link Handle"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guest / Demo Explorer Callout */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>Explore Platform with Demo Profile</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
