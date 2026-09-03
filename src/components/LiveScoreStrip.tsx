"use client";

import { Radio, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { TeamFlag } from "./TeamFlag";
import { useTheme } from "./ThemeProvider";
import type { LiveSummary } from "@/lib/live-summary";

interface LiveScoreStripProps {
  initialSummary?: LiveSummary;
  season?: number;
}

function formatSyncTime(value: string | null): string {
  if (!value) return "sync pending";

  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function LiveScoreStrip({
  initialSummary,
  season = 2026,
}: LiveScoreStripProps) {
  const { palette } = useTheme();
  const [summary, setSummary] = useState<LiveSummary | null>(initialSummary || null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSummary() {
      try {
        const response = await fetch(`/api/live-summary?season=${season}&t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (isMounted) {
          setSummary(data);
        }
      } catch (error) {
        console.error("Failed to fetch live summary:", error);
      }
    }

    const timeout = window.setTimeout(fetchSummary, 5_000);
    const interval = window.setInterval(fetchSummary, 30_000);

    return () => {
      isMounted = false;
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [season]);

  const liveGames = summary?.liveGames || [];

  if (liveGames.length === 0) {
    return null;
  }

  return (
    <section
      className="mb-4 overflow-hidden rounded-lg border"
      style={{
        borderColor: "#ef4444",
        background: "rgba(239,68,68,0.08)",
      }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2"
        style={{ borderColor: "rgba(239,68,68,0.35)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1 rounded px-2 py-1 font-mono text-[11px] font-bold uppercase"
            style={{ background: "#ef4444", color: "#ffffff" }}
          >
            <Radio size={12} />
            Live
          </span>
          <span className="text-sm font-semibold">
            {liveGames.length === 1 ? "Game in progress" : "Games in progress"}
          </span>
        </div>

        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: palette.textMuted }}
        >
          <RefreshCw size={13} />
          <span>
            Official scores and ladder refresh automatically
          </span>
          <span className="hidden sm:inline">
            · Last sync {formatSyncTime(summary?.lastSyncedAt || null)}
          </span>
        </div>
      </div>

      <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
        {liveGames.map((game) => (
          <div
            key={game.id}
            className="flex items-center justify-between gap-3 px-3 py-2"
            style={{ background: "rgba(0,0,0,0.18)" }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <TeamFlag teamId={game.homeTeam.id} size={16} />
                  {game.homeTeam.shortCode}
                </span>
                <span className="font-mono text-lg font-bold tabular-nums">
                  {game.homeScore ?? "-"}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 font-medium">
                  <TeamFlag teamId={game.awayTeam.id} size={16} />
                  {game.awayTeam.shortCode}
                </span>
                <span className="font-mono text-lg font-bold tabular-nums">
                  {game.awayScore ?? "-"}
                </span>
              </div>
            </div>

            <div
              className="shrink-0 rounded border px-2 py-1 text-center font-mono text-xs font-bold uppercase"
              style={{
                borderColor: "rgba(239,68,68,0.45)",
                color: "#fecaca",
              }}
            >
              {game.minute ? `${game.minute}'` : "Live"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
