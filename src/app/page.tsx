"use client";

import { LadderTable } from "@/components/LadderTable";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <LadderTable />
      </div>
    </main>
  );
}
