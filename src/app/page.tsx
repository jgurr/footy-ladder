"use client";

import { LadderTable } from "@/components/LadderTable";
import { LiveGames } from "@/components/LiveGames";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Live Games - shows current round games with real-time updates */}
        <div className="mb-8">
          <LiveGames season={2026} />
        </div>

        {/* Ladder Table */}
        <LadderTable />
      </div>
    </main>
  );
}
