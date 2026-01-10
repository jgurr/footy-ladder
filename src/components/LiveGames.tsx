"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { TEAM_COLORS } from "@/lib/theme";

interface Team {
  id: string;
  name: string;
  shortCode: string;
}

interface LiveGame {
  id: string;
  round: number;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: "scheduled" | "live" | "final" | "postponed";
  minute: number | null;
  venue: string;
  kickoff: string;
}

interface LiveUpdate {
  type: string;
  season: number;
  round: number;
  games: LiveGame[];
  timestamp: string;
}

interface LiveGamesProps {
  season?: number;
  round?: number;
}

export function LiveGames({ season = 2026, round }: LiveGamesProps) {
  const { palette } = useTheme();
  const [games, setGames] = useState<LiveGame[]>([]);
  const [currentRound, setCurrentRound] = useState(round || 1);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ season: String(season) });
    if (round) params.set("round", String(round));

    const eventSource = new EventSource(`/api/live?${params}`);

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: LiveUpdate = JSON.parse(event.data);
        if (data.type === "games") {
          setGames(data.games);
          setCurrentRound(data.round);
          setLastUpdate(data.timestamp);
        }
      } catch (error) {
        console.error("Failed to parse SSE data:", error);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      // EventSource will automatically reconnect
    };

    return () => {
      eventSource.close();
    };
  }, [season, round]);

  const formatKickoff = (kickoff: string) => {
    const date = new Date(kickoff);
    return date.toLocaleString("en-AU", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "#ef4444"; // Red for live
      case "final":
        return palette.textMuted;
      default:
        return palette.accent;
    }
  };

  const getStatusText = (game: LiveGame) => {
    switch (game.status) {
      case "live":
        return game.minute ? `${game.minute}'` : "LIVE";
      case "final":
        return "FT";
      case "postponed":
        return "PPD";
      default:
        return formatKickoff(game.kickoff);
    }
  };

  if (games.length === 0) {
    return (
      <div
        className="rounded-lg border p-6 text-center"
        style={{ borderColor: palette.border }}
      >
        <p style={{ color: palette.textMuted }}>Loading games...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Round {currentRound}</h2>
          <p className="text-xs" style={{ color: palette.textMuted }}>
            {games.filter((g) => g.status === "live").length > 0
              ? "Live games in progress"
              : games.every((g) => g.status === "final")
              ? "All games completed"
              : "Upcoming games"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${connected ? "animate-pulse" : ""}`}
            style={{ background: connected ? "#22c55e" : "#ef4444" }}
          />
          <span style={{ color: palette.textMuted }}>
            {connected ? "Live" : "Reconnecting..."}
          </span>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => {
          const homeColors = TEAM_COLORS[game.homeTeam.id];
          const awayColors = TEAM_COLORS[game.awayTeam.id];
          const isLive = game.status === "live";
          const isFinal = game.status === "final";

          return (
            <div
              key={game.id}
              className={`relative overflow-hidden rounded-lg border transition ${
                isLive ? "ring-2 ring-red-500/50" : ""
              }`}
              style={{ borderColor: palette.border }}
            >
              {/* Live indicator */}
              {isLive && (
                <div className="absolute right-2 top-2">
                  <span className="flex items-center gap-1 rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    {game.minute ? `${game.minute}'` : "LIVE"}
                  </span>
                </div>
              )}

              <div className="p-3">
                {/* Home Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{
                        background: homeColors
                          ? `linear-gradient(135deg, ${homeColors.primary} 50%, ${homeColors.secondary} 50%)`
                          : palette.accent,
                      }}
                    />
                    <span className="font-medium">{game.homeTeam.shortCode}</span>
                  </div>
                  <span
                    className={`font-mono text-lg font-bold ${
                      isFinal && game.homeScore! > game.awayScore!
                        ? ""
                        : "opacity-70"
                    }`}
                    style={{
                      color:
                        isFinal && game.homeScore! > game.awayScore!
                          ? palette.accent
                          : undefined,
                    }}
                  >
                    {game.homeScore ?? "-"}
                  </span>
                </div>

                {/* Away Team */}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-full"
                      style={{
                        background: awayColors
                          ? `linear-gradient(135deg, ${awayColors.primary} 50%, ${awayColors.secondary} 50%)`
                          : palette.accent,
                      }}
                    />
                    <span className="font-medium">{game.awayTeam.shortCode}</span>
                  </div>
                  <span
                    className={`font-mono text-lg font-bold ${
                      isFinal && game.awayScore! > game.homeScore!
                        ? ""
                        : "opacity-70"
                    }`}
                    style={{
                      color:
                        isFinal && game.awayScore! > game.homeScore!
                          ? palette.accent
                          : undefined,
                    }}
                  >
                    {game.awayScore ?? "-"}
                  </span>
                </div>

                {/* Status / Kickoff */}
                {!isLive && (
                  <div
                    className="mt-3 border-t pt-2 text-center text-xs"
                    style={{
                      borderColor: palette.border,
                      color: getStatusColor(game.status),
                    }}
                  >
                    {getStatusText(game)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <p className="mt-4 text-center text-xs" style={{ color: palette.textMuted }}>
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
