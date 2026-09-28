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
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
        <AppProviders>
          {/* Fixed Left Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="pl-64 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
              {children}
            </main>
            <footer className="px-8 py-6 border-t border-white/[0.06] text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© 2026 CP Intelligence Platform. Personalized for your Codeforces journey.</p>
              <div className="flex items-center gap-4 text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Codeforces Live API Synchronized</span>
                </span>
                <span>•</span>
                <span>Deterministic Intelligence Engine</span>
              </div>
            </footer>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
