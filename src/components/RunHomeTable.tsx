"use client";

import type { RunHomeData } from "@/lib/run-home";
import { TeamFlag } from "./TeamFlag";
import { useTheme } from "./ThemeProvider";

function fullTeamName(team: { location: string; name: string }): string {
  return `${team.location} ${team.name}`;
}

function formatScheduleEdge(edge: number): string {
  if (edge === 0) return "0.0";
  return `${edge > 0 ? "+" : ""}${edge.toFixed(1)}`;
}

function edgeColor(edge: number, muted: string): string {
  if (edge >= 0.3) return "#22c55e";
  if (edge <= -0.3) return "#ef4444";
  return muted;
}

export function RunHomeTable({
  data,
  onSelectTeam,
}: {
  data: RunHomeData;
  onSelectTeam: (teamId: string) => void;
}) {
  const { palette } = useTheme();

  return (
    <div>
      <div className="overflow-hidden rounded-lg border" style={{ borderColor: palette.border }}>
        <table className="w-full">
          <thead>
            <tr
              className="text-xs uppercase"
              style={{ background: "rgba(255,255,255,0.03)", color: palette.textMuted }}
            >
              <th className="w-8 px-1 py-2 text-center font-mono">Run</th>
              <th className="px-1 py-2 text-left">Team</th>
              <th className="hidden px-1 py-2 text-center font-mono sm:table-cell">Lad</th>
              <th className="px-1 py-2 text-center font-mono">Rem</th>
              <th className="px-1 py-2 text-center font-mono">Edge</th>
              <th className="hidden px-1 py-2 text-center font-mono sm:table-cell">Avg W</th>
              <th className="hidden px-1 py-2 text-center font-mono md:table-cell">Team W</th>
            </tr>
          </thead>
          <tbody>
            {data.summaries.map((summary) => (
              <tr
                key={summary.team.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectTeam(summary.team.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectTeam(summary.team.id);
                  }
                }}
                className="cursor-pointer border-t transition hover:bg-white/5 focus:bg-white/5 focus:outline-none"
                style={{ borderColor: palette.border }}
              >
                <td className="px-1 py-3 text-center font-mono text-sm tabular-nums">
                  #{summary.scheduleRank}
                </td>
                <td className="px-1 py-3">
                  <div className="flex items-center gap-2">
                    <TeamFlag teamId={summary.team.id} size={18} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium sm:hidden">{summary.team.shortCode}</div>
                      <div className="hidden text-sm font-medium sm:block">
                        {fullTeamName(summary.team)}
                      </div>
                      <div className="text-xs sm:hidden" style={{ color: palette.textMuted }}>
                        Ladder #{summary.position}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-1 py-3 text-center font-mono text-sm tabular-nums sm:table-cell">
                  #{summary.position}
                </td>
                <td className="px-1 py-3 text-center font-mono text-sm tabular-nums">
                  {summary.remainingGames}
                </td>
                <td className="px-1 py-3 text-center">
                  <div
                    className="font-mono text-base font-bold tabular-nums"
                    style={{ color: edgeColor(summary.scheduleEdge, palette.textMuted) }}
                  >
                    {formatScheduleEdge(summary.scheduleEdge)}
                  </div>
                  <div className="text-xs" style={{ color: palette.accent }}>
                    {summary.scheduleEdgeLabel}
                  </div>
                </td>
                <td className="hidden px-1 py-3 text-center font-mono text-sm tabular-nums sm:table-cell">
                  {summary.averageTeamWins.toFixed(1)}
                </td>
                <td className="hidden px-1 py-3 text-center font-mono text-sm tabular-nums md:table-cell">
                  {summary.projectedWins.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs" style={{ color: palette.textMuted }}>
        <span>Run=#1 easiest remaining draw</span>
        <span>Edge=wins above/below a .500 run for a league-average team</span>
        <span>Avg W=average-team expected wins</span>
        <span>Team W=expected wins for the selected team</span>
        <span>{data.model.seasons} · finals included · {data.model.gamesProcessed} games</span>
      </div>
    </div>
  );
}
