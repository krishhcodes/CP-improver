import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AppProviders } from "@/components/providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CP Intelligence Platform — Competitive Programming Analytics & Learning",
  description:
    "Production-grade platform combining Codeforces synchronization, contest and submission analytics, upsolve intelligence, topic weakness modeling, explainable recommendations, and adaptive training plans.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0e17] text-slate-100 selection:bg-cyan-400 selection:text-slate-950 relative">
        {/* Subtle Ambient Colorful Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/[0.08] rounded-full blur-[128px] animate-float-slow" />
          <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-500/[0.07] rounded-full blur-[140px] animate-float-reverse" />
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-amber-500/[0.06] rounded-full blur-[130px] animate-float-slow" />
          <div className="absolute -bottom-20 right-1/3 w-80 h-80 bg-rose-500/[0.06] rounded-full blur-[130px] animate-float-reverse" />
        </div>

        <AppProviders>
          {/* Fixed Left Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="pl-64 flex flex-col min-h-screen relative z-10">
            <Navbar />
            <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
              {children}
            </main>
            <footer className="px-8 py-6 border-t border-white/[0.06] text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/20 backdrop-blur-sm">
              <p>© 2026 CP Intelligence Platform. Personalized for your Codeforces journey.</p>
              <div className="flex items-center gap-4 text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Codeforces Live API Synchronized</span>
                </span>
                <span>•</span>
                <span className="text-zinc-500">Deterministic Intelligence Engine</span>
              </div>
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
