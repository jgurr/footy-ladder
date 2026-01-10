"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { TEAM_COLORS } from "@/lib/theme";

interface LadderEntry {
  team: {
    id: string;
    name: string;
    shortCode: string;
    primaryColor: string;
    secondaryColor: string;
  };
  position: number;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  pointsFor: number;
  pointsAgainst: number;
  differential: number;
  winPct: number;
  nrlPoints: number;
}

export function LadderTable() {
  const { palette } = useTheme();
  const [ladder, setLadder] = useState<LadderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(2025);
  const [round, setRound] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function fetchLadder() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ season: String(season) });
        if (round) params.set("round", String(round));

        const res = await fetch(`/api/ladder?${params}`);
        const data = await res.json();
        setLadder(data);
      } catch (error) {
        console.error("Failed to fetch ladder:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLadder();
  }, [season, round]);

  if (loading) {
    return (
      <div
        className="flex h-64 items-center justify-center rounded-lg border"
        style={{ borderColor: palette.border }}
      >
        <div className="font-mono" style={{ color: palette.accent }}>
          Loading ladder...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {season} NRL Ladder
            {round && (
              <span className="ml-2 text-sm font-normal" style={{ color: palette.textMuted }}>
                After Round {round}
              </span>
            )}
          </h2>
          <p className="text-sm" style={{ color: palette.accent }}>
            Ranked by Win Percentage
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${palette.border}`,
              color: palette.text,
            }}
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>

          <select
            value={round || ""}
            onChange={(e) => setRound(e.target.value ? Number(e.target.value) : undefined)}
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `1px solid ${palette.border}`,
              color: palette.text,
            }}
          >
            <option value="">Latest</option>
            {Array.from({ length: 27 }, (_, i) => i + 1).map((r) => (
              <option key={r} value={r}>
                Round {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-lg border"
        style={{ borderColor: palette.border }}
      >
        <table className="w-full">
          <thead>
            <tr
              className="text-xs uppercase tracking-wider"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <th className="px-4 py-3 text-left font-sans">Pos</th>
              <th className="px-4 py-3 text-left font-sans">Team</th>
              <th className="px-4 py-3 text-center font-mono">P</th>
              <th className="px-4 py-3 text-center font-mono">W</th>
              <th className="px-4 py-3 text-center font-mono">L</th>
              <th className="px-4 py-3 text-center font-mono">D</th>
              <th
                className="px-4 py-3 text-right font-mono"
                style={{ color: palette.accent }}
              >
                Win%
              </th>
              <th className="hidden px-4 py-3 text-right font-mono sm:table-cell">PF</th>
              <th className="hidden px-4 py-3 text-right font-mono sm:table-cell">PA</th>
              <th className="px-4 py-3 text-right font-mono">+/-</th>
            </tr>
          </thead>
          <tbody>
            {ladder.map((entry) => {
              const teamColors = TEAM_COLORS[entry.team.id];
              const isTop4 = entry.position <= 4;
              const isTop8 = entry.position <= 8;

              return (
                <tr
                  key={entry.team.id}
                  className="border-t transition hover:bg-white/5"
                  style={{
                    borderColor: palette.border,
                    background: isTop4
                      ? `linear-gradient(90deg, ${teamColors?.primary || palette.accent}15 0%, transparent 100%)`
                      : undefined,
                  }}
                >
                  <td className="px-4 py-3 font-mono">
                    <span
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
                      style={{
                        background: isTop4 ? palette.accent : isTop8 ? palette.border : "transparent",
                        color: isTop4 ? "#000" : palette.text,
                        border: !isTop8 ? `1px solid ${palette.border}` : undefined,
                      }}
                    >
                      {entry.position}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{
                          background: teamColors
                            ? `linear-gradient(135deg, ${teamColors.primary} 50%, ${teamColors.secondary} 50%)`
                            : palette.accent,
                        }}
                      />
                      <div>
                        <div className="font-semibold">{entry.team.name}</div>
                        <div
                          className="font-mono text-xs"
                          style={{ color: palette.textMuted }}
                        >
                          {entry.team.shortCode}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums">
                    {entry.played}
                  </td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums">
                    {entry.wins}
                  </td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums">
                    {entry.losses}
                  </td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums">
                    {entry.draws}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-mono tabular-nums font-bold"
                    style={{ color: palette.accent }}
                  >
                    {entry.winPct.toFixed(2)}%
                  </td>
                  <td className="hidden px-4 py-3 text-right font-mono tabular-nums sm:table-cell">
                    {entry.pointsFor}
                  </td>
                  <td className="hidden px-4 py-3 text-right font-mono tabular-nums sm:table-cell">
                    {entry.pointsAgainst}
                  </td>
                  <td
                    className="px-4 py-3 text-right font-mono tabular-nums"
                    style={{
                      color: entry.differential > 0 ? palette.positive : entry.differential < 0 ? palette.negative : palette.textMuted,
                    }}
                  >
                    {entry.differential > 0 ? "+" : ""}
                    {entry.differential}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div
        className="mt-4 flex items-center gap-6 text-xs"
        style={{ color: palette.textMuted }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: palette.accent }}
          />
          Top 4 (Home Final)
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: palette.border }}
          />
          Top 8 (Finals)
        </div>
      </div>
    </div>
  );
}
