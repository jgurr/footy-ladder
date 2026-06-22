"use client";

import type { RunHomeData } from "@/lib/run-home";
import { TeamFlag } from "./TeamFlag";
import { useTheme } from "./ThemeProvider";

function fullTeamName(team: { location: string; name: string }): string {
  return `${team.location} ${team.name}`;
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
              <th className="w-8 px-1 py-2 text-center font-mono">Pos</th>
              <th className="px-1 py-2 text-left">Team</th>
              <th className="px-1 py-2 text-center font-mono">Power</th>
              <th className="px-1 py-2 text-center font-mono">Rem</th>
              <th className="px-1 py-2 text-center font-mono">SOS</th>
              <th className="hidden px-1 py-2 text-center font-mono sm:table-cell">Rank</th>
              <th className="hidden px-1 py-2 text-center font-mono md:table-cell">Exp W</th>
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
                  {summary.position}
                </td>
                <td className="px-1 py-3">
                  <div className="flex items-center gap-2">
                    <TeamFlag teamId={summary.team.id} size={18} />
                    <span className="text-sm font-medium sm:hidden">{summary.team.shortCode}</span>
                    <span className="hidden text-sm font-medium sm:inline">
                      {fullTeamName(summary.team)}
                    </span>
                  </div>
                </td>
                <td className="px-1 py-3 text-center font-mono text-sm tabular-nums">
                  #{summary.powerRank}
                </td>
                <td className="px-1 py-3 text-center font-mono text-sm tabular-nums">
                  {summary.remainingGames}
                </td>
                <td className="px-1 py-3 text-center">
                  <div className="font-mono text-base font-bold tabular-nums">
                    {summary.scheduleDifficulty}
                  </div>
                  <div className="text-xs" style={{ color: palette.accent }}>
                    {summary.difficultyLabel}
                  </div>
                </td>
                <td className="hidden px-1 py-3 text-center font-mono text-sm tabular-nums sm:table-cell">
                  #{summary.scheduleRank}
                </td>
                <td className="hidden px-1 py-3 text-center font-mono text-sm tabular-nums md:table-cell">
                  {summary.projectedWins}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs" style={{ color: palette.textMuted }}>
        <span>SOS=Remaining schedule difficulty</span>
        <span>Power=Elo power rank</span>
        <span>Exp W=Expected remaining wins</span>
        <span>{data.model.seasons} · finals included · {data.model.gamesProcessed} games</span>
      </div>
    </div>
  );
}
