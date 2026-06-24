"use client";

import type { MonteCarloData, MonteCarloTeamResult } from "@/lib/monte-carlo";
import { TeamFlag } from "./TeamFlag";
import { useTheme } from "./ThemeProvider";

function fullTeamName(team: { location: string; name: string }): string {
  return `${team.location} ${team.name}`;
}

function teamColor(team: MonteCarloTeamResult["team"], fallback: string): string {
  if (team.primaryColor.toLowerCase() === "#000000") return team.secondaryColor || fallback;
  if (team.primaryColor.toLowerCase() === "#ffffff") return fallback;
  return team.primaryColor;
}

function formatProbability(value: number): string {
  if (value === 0) return "0";
  if (value < 1) return "<1";
  return value.toFixed(value >= 10 ? 0 : 1);
}

function Histogram({ team }: { team: MonteCarloTeamResult }) {
  const { palette } = useTheme();
  const color = teamColor(team.team, palette.accent);
  const maxProbability = Math.max(
    1,
    ...team.positionBuckets.map((bucket) => bucket.probability)
  );

  return (
    <div className="min-w-[520px]">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "repeat(17, minmax(0, 1fr))" }}
      >
        {team.positionBuckets.map((bucket) => {
          const height = Math.max(4, (bucket.probability / maxProbability) * 42);
          const finals = bucket.position <= 8;
          const probabilityLabel =
            bucket.probability > 0 ? `${formatProbability(bucket.probability)}%` : "";
          return (
            <div key={bucket.position} className="flex flex-col items-center gap-1">
              <div
                className="h-4 max-w-full overflow-hidden text-center font-mono text-[10px] leading-4 tabular-nums"
                style={{ color: bucket.probability > 0 ? palette.text : "transparent" }}
                title={
                  bucket.probability > 0
                    ? `Finish ${bucket.position}: ${bucket.probability}%`
                    : undefined
                }
              >
                {probabilityLabel}
              </div>
              <div
                className="flex h-12 w-full items-end rounded-sm"
                style={{
                  background: finals ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.025)",
                }}
                title={`Finish ${bucket.position}: ${bucket.probability}%`}
              >
                <div
                  className="w-full rounded-sm"
                  style={{
                    height,
                    background: bucket.probability > 0 ? color : "transparent",
                    opacity: finals ? 0.95 : 0.55,
                  }}
                />
              </div>
              <div className="font-mono text-[10px]" style={{ color: palette.textMuted }}>
                {bucket.position}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MonteCarloTable({ data }: { data: MonteCarloData }) {
  const { palette } = useTheme();

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-3" style={{ borderColor: palette.border }}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold" style={{ color: palette.accent }}>
              Ladder Simulation
            </h2>
            <div className="text-xs" style={{ color: palette.textMuted }}>
              {data.iterations.toLocaleString()} runs · {data.remainingGames} remaining games · seeded #{data.seed}
            </div>
          </div>
          <div className="text-right text-xs" style={{ color: palette.textMuted }}>
            Sorted by average final place
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.teams.map((team) => (
          <div
            key={team.team.id}
            className="rounded-lg border p-3"
            style={{ borderColor: palette.border }}
          >
            <div className="grid gap-3 lg:grid-cols-[13rem_minmax(0,1fr)]">
              <div>
                <div className="flex items-center gap-2">
                  <TeamFlag teamId={team.team.id} size={20} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold sm:hidden">{team.team.shortCode}</div>
                    <div className="hidden text-sm font-semibold sm:block">
                      {fullTeamName(team.team)}
                    </div>
                    <div className="text-xs" style={{ color: palette.textMuted }}>
                      Current #{team.currentPosition}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div style={{ color: palette.textMuted }}>Avg finish</div>
                    <div className="font-mono text-base font-bold tabular-nums">
                      {team.averagePosition.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: palette.textMuted }}>Median</div>
                    <div className="font-mono text-base font-bold tabular-nums">
                      #{team.medianPosition}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: palette.textMuted }}>Top 4</div>
                    <div className="font-mono text-base font-bold tabular-nums">
                      {formatProbability(team.top4Probability)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ color: palette.textMuted }}>Top 8</div>
                    <div className="font-mono text-base font-bold tabular-nums">
                      {formatProbability(team.top8Probability)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto overflow-y-hidden pb-4">
                <Histogram team={team} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs" style={{ color: palette.textMuted }}>
        <span>Bars show probability of finishing in each ladder position.</span>
        <span>{data.model.tiebreakers}</span>
        <span>{data.model.scoring}</span>
      </div>
    </div>
  );
}
