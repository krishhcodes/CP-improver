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

      if (!res.ok || data.error) {
        setFormError(data.error || "Authentication failed");
      } else {
        setSuccessMessage(
          mode === "REGISTER"
            ? "Account created successfully! Redirecting..."
            : "Signed in successfully! Redirecting..."
        );
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      }
    } catch {
      setFormError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const rankInfo = verifiedUser ? getCodeforcesRank(verifiedUser.rating) : null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand / Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/20 mx-auto">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === "LOGIN" ? "Welcome Back to CP Intelligence" : "Create Intelligence Account"}
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {mode === "LOGIN"
              ? "Access your synchronized contest history, topic models, and personalized problem recommendations."
              : "Connect your Codeforces handle to unlock automated contest diagnostics and adaptive training plans."}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1 text-xs font-bold shadow-xs">
          <button
            type="button"
            onClick={() => {
              setMode("LOGIN");
              setFormError(null);
            }}
            className={cn(
              "py-2 rounded-lg transition-all",
              mode === "LOGIN"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
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
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Create Account
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl glass-panel p-6 border border-slate-200 bg-white shadow-lg relative overflow-hidden">
          {/* Status Banners */}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. coder_pro"
                  className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Email (Optional in Register) */}
            {mode === "REGISTER" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white outline-none transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* Codeforces Handle (Register Only) */}
            {mode === "REGISTER" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Codeforces Handle</label>
                  {verifyingHandle && (
                    <span className="text-[10px] text-sky-600 flex items-center gap-1 font-bold">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      <span>Verifying on Codeforces...</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    CF
                  </span>
                  <input
                    type="text"
                    required
                    value={codeforcesHandle}
                    onChange={(e) => setCodeforcesHandle(e.target.value)}
                    placeholder="e.g. tourist, Benq, or your handle"
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white outline-none transition-all font-medium"
                  />
                </div>

                {/* Live Handle Verification Preview Card */}
                {verifiedUser && rankInfo && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between animate-in fade-in-50 duration-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-800">
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
                        <span className={cn("text-xs font-black", rankInfo.textColor)}>
                          {verifiedUser.handle}
                        </span>
                        <p className="text-[10px] text-slate-500 font-medium">{rankInfo.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-bold border shadow-xs",
                          rankInfo.bgColor,
                          rankInfo.borderColor,
                          rankInfo.textColor
                        )}
                      >
                        {verifiedUser.rating}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                )}

                {handleError && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1 pt-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>{handleError}</span>
                  </p>
                )}
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
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
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="text-xs text-sky-600 hover:text-sky-700 font-bold inline-flex items-center gap-1 transition-colors"
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
