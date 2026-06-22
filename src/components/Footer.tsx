"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface StatusData {
  lastSyncedAt: string | null;
  latestFinalRound: number;
  liveGames: number;
  nextScheduledRound: number | null;
  season: number;
}

interface FooterProps {
  initialStatus?: StatusData;
}

function formatSyncedAt(value: string | null): string {
  if (!value) return "Sync pending";

  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

export function Footer({ initialStatus }: FooterProps) {
  const { palette } = useTheme();
  const [status, setStatus] = useState<StatusData | null>(initialStatus || null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStatus() {
      try {
        const response = await fetch("/api/status?season=2026", {
          cache: "no-store",
        });
        const data = await response.json();
        if (isMounted) {
          setStatus(data);
        }
      } catch (error) {
        console.error("Failed to fetch sync status:", error);
      }
    }

    const timeout = window.setTimeout(fetchStatus, 1_500);
    const interval = window.setInterval(fetchStatus, 60_000);

    return () => {
      isMounted = false;
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  const isLive = (status?.liveGames || 0) > 0;

  return (
    <footer
      className="border-t px-4 py-4 text-xs"
      style={{
        borderColor: palette.border,
        color: palette.textMuted,
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span>Official NRL draw sync: {formatSyncedAt(status?.lastSyncedAt || null)}</span>
          <span>Latest final round: {status?.latestFinalRound || 15}</span>
          {status?.nextScheduledRound && (
            <span>Next scheduled round: {status.nextScheduledRound}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLive && (
            <span
              className="rounded px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wider"
              style={{
                background: "#22c55e",
                color: "#001a0b",
              }}
            >
              Live
            </span>
          )}
          <span>Live check every 5 min</span>
          <span>Win % ladder, no bye distortion</span>
        </div>
      </div>
    </footer>
  );
}
