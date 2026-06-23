"use client";

import { useMemo, useState } from "react";
import { TeamFlag } from "./TeamFlag";
import { useTheme } from "./ThemeProvider";

interface EloTeam {
  id: string;
  name: string;
  location: string;
  shortCode: string;
  primaryColor: string;
  secondaryColor: string;
  powerRank: number;
  currentElo: number;
}

interface EloSnapshot {
  index: number;
  season: number;
  round: number;
  label: string;
  kickoff: string | null;
  ratings: Record<string, number>;
}

export interface EloHistoryData {
  season: number;
  model: {
    gamesProcessed: number;
    historicalSeasons: string;
    currentSeasonIncluded: boolean;
    snapshots: number;
  };
  teams: EloTeam[];
  snapshots: EloSnapshot[];
}

const CHART = {
  width: 900,
  height: 420,
  left: 54,
  right: 70,
  top: 24,
  bottom: 46,
};

function teamColor(team: EloTeam, fallback: string): string {
  if (team.primaryColor.toLowerCase() === "#000000") return team.secondaryColor || fallback;
  if (team.primaryColor.toLowerCase() === "#ffffff") return fallback;
  return team.primaryColor;
}

function fullTeamName(team: EloTeam): string {
  return `${team.location} ${team.name}`;
}

export function EloGraph({ data }: { data: EloHistoryData }) {
  const { palette } = useTheme();
  const defaultTeamIds = useMemo(
    () => data.teams.slice().sort((a, b) => a.powerRank - b.powerRank).slice(0, 6).map((team) => team.id),
    [data.teams]
  );
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(defaultTeamIds);

  const teamsById = useMemo(
    () => new Map(data.teams.map((team) => [team.id, team])),
    [data.teams]
  );
  const selectedTeams = selectedTeamIds
    .map((teamId) => teamsById.get(teamId))
    .filter((team): team is EloTeam => Boolean(team));
  const visibleRatings = data.snapshots.flatMap((snapshot) =>
    selectedTeamIds.map((teamId) => snapshot.ratings[teamId] ?? 1500)
  );
  const minRating = Math.floor((Math.min(...visibleRatings, 1450) - 20) / 25) * 25;
  const maxRating = Math.ceil((Math.max(...visibleRatings, 1550) + 20) / 25) * 25;
  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const lastIndex = Math.max(1, data.snapshots.length - 1);

  const xFor = (index: number) => CHART.left + (index / lastIndex) * plotWidth;
  const yFor = (rating: number) =>
    CHART.top + ((maxRating - rating) / Math.max(1, maxRating - minRating)) * plotHeight;
  const gridValues = Array.from(
    { length: Math.floor((maxRating - minRating) / 50) + 1 },
    (_, index) => minRating + index * 50
  ).filter((value) => value <= maxRating);
  const seasonMarkers = data.snapshots.filter(
    (snapshot, index) => index === 0 || data.snapshots[index - 1].season !== snapshot.season
  );

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds((current) => {
      if (current.includes(teamId)) return current.filter((candidate) => candidate !== teamId);
      return [...current, teamId];
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-3 sm:p-4" style={{ borderColor: palette.border }}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold" style={{ color: palette.accent }}>
              Elo Graph
            </h2>
            <div className="text-xs" style={{ color: palette.textMuted }}>
              {data.model.historicalSeasons} plus current season · {data.model.gamesProcessed} games
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedTeamIds(defaultTeamIds)}
            className="rounded-md px-3 py-1.5 text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.08)", color: palette.text }}
          >
            Top 6
          </button>
        </div>

        <div
          className="overflow-x-auto overflow-y-clip"
          style={{
            overscrollBehaviorX: "contain",
            touchAction: "pan-y",
          }}
        >
          <svg
            role="img"
            aria-label="Elo ratings over time"
            viewBox={`0 0 ${CHART.width} ${CHART.height}`}
            className="h-auto w-full min-w-[680px] md:min-w-[760px]"
          >
            <rect width={CHART.width} height={CHART.height} fill="transparent" />
            {gridValues.map((value) => {
              const y = yFor(value);
              return (
                <g key={value}>
                  <line
                    x1={CHART.left}
                    x2={CHART.width - CHART.right}
                    y1={y}
                    y2={y}
                    stroke="rgba(255,255,255,0.12)"
                  />
                  <text x={CHART.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill={palette.textMuted}>
                    {value}
                  </text>
                </g>
              );
            })}
            {seasonMarkers.map((snapshot) => {
              const x = xFor(snapshot.index);
              return (
                <g key={`${snapshot.season}-${snapshot.round}`}>
                  <line
                    x1={x}
                    x2={x}
                    y1={CHART.top}
                    y2={CHART.height - CHART.bottom}
                    stroke="rgba(255,255,255,0.08)"
                  />
                  <text x={x + 4} y={CHART.height - 16} fontSize="12" fill={palette.textMuted}>
                    {snapshot.season}
                  </text>
                </g>
              );
            })}
            <line
              x1={CHART.left}
              x2={CHART.width - CHART.right}
              y1={yFor(1500)}
              y2={yFor(1500)}
              stroke="rgba(255,255,255,0.26)"
              strokeDasharray="6 6"
            />
            {selectedTeams.map((team) => {
              const color = teamColor(team, palette.accent);
              const path = data.snapshots
                .map((snapshot, index) => {
                  const command = index === 0 ? "M" : "L";
                  return `${command}${xFor(snapshot.index).toFixed(1)},${yFor(snapshot.ratings[team.id] ?? 1500).toFixed(1)}`;
                })
                .join(" ");
              const lastSnapshot = data.snapshots[data.snapshots.length - 1];
              const lastY = yFor(lastSnapshot?.ratings[team.id] ?? 1500);
              return (
                <g key={team.id}>
                  <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                  <circle cx={CHART.width - CHART.right} cy={lastY} r="4" fill={color} />
                  <text x={CHART.width - CHART.right + 9} y={lastY + 4} fontSize="12" fill={color}>
                    {team.shortCode}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.teams
          .slice()
          .sort((a, b) => a.powerRank - b.powerRank)
          .map((team) => {
            const active = selectedTeamIds.includes(team.id);
            const color = teamColor(team, palette.accent);
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => toggleTeam(team.id)}
                className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition"
                style={{
                  borderColor: active ? color : palette.border,
                  background: active ? `${color}22` : "rgba(255,255,255,0.04)",
                  color: palette.text,
                }}
                title={fullTeamName(team)}
              >
                <TeamFlag teamId={team.id} size={14} />
                <span>{team.shortCode}</span>
                <span className="font-mono" style={{ color: active ? color : palette.textMuted }}>
                  {team.currentElo}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
