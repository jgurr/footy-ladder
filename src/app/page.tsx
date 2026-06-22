import { LadderTable } from "@/components/LadderTable";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LiveScoreStrip } from "@/components/LiveScoreStrip";
import { getBootstrapData } from "@/lib/bootstrap";
import { getLiveSummary } from "@/lib/live-summary";

export const revalidate = 60;

const CURRENT_SEASON = 2026;

export default async function Home() {
  const [initialData, liveSummary] = await Promise.all([
    getBootstrapData(CURRENT_SEASON),
    getLiveSummary(CURRENT_SEASON),
  ]);

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <LiveScoreStrip
          initialSummary={liveSummary}
          season={CURRENT_SEASON}
        />
        <LadderTable
          initialLadder={initialData.ladder}
          initialRound={initialData.latestRound}
          initialRounds={initialData.rounds}
          initialSeason={initialData.season}
        />
      </div>
      <Footer initialStatus={initialData.status} />
    </main>
  );
}
