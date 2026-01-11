"use client";

import { useEffect, useState, useMemo } from "react";
import { useTheme } from "./ThemeProvider";
import { TeamFlag } from "./TeamFlag";

interface LadderEntry {
  team: {
    id: string;
    name: string;
    shortCode: string;
    primaryColor: string;
    secondaryColor: string;
  };
  season: number;
  round: number;
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
  byesTaken: number;
}

interface Fixture {
  round: number;
  opponentId: string | null;
  isHome: boolean;
  opponentPosition: number;
}

interface Next5Data {
  season: number;
  currentRound: number;
  roundNumbers: number[];
  totalByes: number;
  fixtures: Record<string, Fixture[]>;
}

interface Game {
  id: string;
  round: number;
  homeTeam: { id: string; shortCode: string };
  awayTeam: { id: string; shortCode: string };
  homeScore: number | null;
  awayScore: number | null;
  status: "scheduled" | "live" | "final" | "postponed";
  venue: string;
  kickoff: string;
}

interface TeamScheduleGame {
  id: string;
  round: number;
  homeTeamId: string;
  homeTeamCode: string;
  awayTeamId: string;
  awayTeamCode: string;
  homeScore: number | null;
  awayScore: number | null;
  venue: string;
  kickoff: string;
  status: string;
  isHome: boolean;
  opponentId: string;
  opponentCode: string;
  teamScore: number | null;
  opponentScore: number | null;
  result: "W" | "L" | "D" | null;
}

interface TeamScheduleData {
  season: number;
  teamId: string;
  team: { id: string; name: string; shortCode: string; primaryColor: string; secondaryColor: string };
  games: TeamScheduleGame[];
  latestRound: number;
}

type ViewType = "ladder" | "forAgainst" | "next5" | "scores" | "team";
type LadderSortKey = "winPct" | "wins" | "losses" | "draws" | "differential";
type ForAgainstSortKey = "pointsFor" | "pfPerGame" | "pointsAgainst" | "paPerGame" | "differential" | "pdPerGame";
type SortDirection = "asc" | "desc";

/**
 * Sort Options Summary:
 *
 * LADDER VIEW:
 * | Sort Key | Default Dir | Alt Dir | Top 4/8 Markers |
 * |----------|-------------|---------|-----------------|
 * | Win %    | desc (high) | asc     | Yes (default)   |
 * | Wins     | desc (most) | asc     | No              |
 * | Losses   | asc (few)   | desc    | No              |
 * | Draws    | desc (most) | asc     | No              |
 * | PD       | desc (high) | asc     | No              |
 *
 * FOR/AGAINST VIEW (no markers - doesn't represent playoff order):
 * | Sort Key | Default Dir | Alt Dir |
 * |----------|-------------|---------|
 * | PF       | desc (most) | asc     |
 * | PF/GM    | desc (high) | asc     | (default)
 * | PA       | asc (few)   | desc    |
 * | PA/GM    | asc (low)   | desc    |
 * | PD       | desc (high) | asc     |
 * | PD/GM    | desc (high) | asc     |
 *
 * Markers only show when in Ladder view with Win% desc (playoff order)
 * Column shading indicates which column is currently sorted
 */

interface SortOption<T> {
  key: T;
  label: string;
  defaultDir: SortDirection;
  lowerIsBetter?: boolean; // For display purposes
}

const LADDER_SORT_OPTIONS: SortOption<LadderSortKey>[] = [
  { key: "winPct", label: "Win %", defaultDir: "desc" },
  { key: "wins", label: "Wins", defaultDir: "desc" },
  { key: "losses", label: "Losses", defaultDir: "asc", lowerIsBetter: true },
  { key: "draws", label: "Draws", defaultDir: "desc" },
  { key: "differential", label: "PD", defaultDir: "desc" },
];

const FOR_AGAINST_SORT_OPTIONS: SortOption<ForAgainstSortKey>[] = [
  { key: "pointsFor", label: "PF", defaultDir: "desc" },
  { key: "pfPerGame", label: "PF/GM", defaultDir: "desc" },
  { key: "pointsAgainst", label: "PA", defaultDir: "asc", lowerIsBetter: true },
  { key: "paPerGame", label: "PA/GM", defaultDir: "asc", lowerIsBetter: true },
  { key: "differential", label: "PD", defaultDir: "desc" },
  { key: "pdPerGame", label: "PD/GM", defaultDir: "desc" },
];

export function LadderTable() {
  const { palette } = useTheme();
  const [ladder, setLadder] = useState<LadderEntry[]>([]);
  const [next5Data, setNext5Data] = useState<Next5Data | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [roundsLoading, setRoundsLoading] = useState(true);
  const [season, setSeason] = useState(2025);
  const [round, setRound] = useState<number>(27);
  const [availableRounds, setAvailableRounds] = useState<number[]>([]);
  const [view, setView] = useState<ViewType>("ladder");
  const [ladderSort, setLadderSort] = useState<LadderSortKey>("winPct");
  const [ladderSortDir, setLadderSortDir] = useState<SortDirection>("desc");
  const [forAgainstSort, setForAgainstSort] = useState<ForAgainstSortKey>("paPerGame");
  const [forAgainstSortDir, setForAgainstSortDir] = useState<SortDirection>("asc");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teamSchedule, setTeamSchedule] = useState<TeamScheduleData | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  // Check if we're in default sort (shows top 4/8 markers)
  // Only Ladder view with Win% desc shows playoff markers
  const isDefaultLadderSort = ladderSort === "winPct" && ladderSortDir === "desc";

  // Handle sort chip click - toggle direction if same key, otherwise set new key with default direction
  const handleLadderSortClick = (key: LadderSortKey) => {
    if (ladderSort === key) {
      setLadderSortDir(ladderSortDir === "desc" ? "asc" : "desc");
    } else {
      setLadderSort(key);
      const option = LADDER_SORT_OPTIONS.find(o => o.key === key);
      setLadderSortDir(option?.defaultDir || "desc");
    }
  };

  const handleForAgainstSortClick = (key: ForAgainstSortKey) => {
    if (forAgainstSort === key) {
      setForAgainstSortDir(forAgainstSortDir === "desc" ? "asc" : "desc");
    } else {
      setForAgainstSort(key);
      const option = FOR_AGAINST_SORT_OPTIONS.find(o => o.key === key);
      setForAgainstSortDir(option?.defaultDir || "desc");
    }
  };

  // Fetch available rounds when season changes
  useEffect(() => {
    async function fetchRounds() {
      setRoundsLoading(true);
      try {
        const res = await fetch(`/api/rounds?season=${season}`);
        const data = await res.json();
        let rounds = (data.rounds as number[]).sort((a, b) => b - a);

        if (rounds.length === 0) {
          rounds = [1];
        }

        setAvailableRounds(rounds);
        // Set to most recent round for 2025, round 1 for future seasons
        setRound(season === 2025 ? rounds[0] : 1);
      } catch (error) {
        console.error("Failed to fetch rounds:", error);
        setAvailableRounds([1]);
        setRound(1);
      } finally {
        setRoundsLoading(false);
      }
    }
    fetchRounds();
  }, [season]);

  // Fetch ladder data
  useEffect(() => {
    if (roundsLoading) return;

    async function fetchLadder() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ season: String(season) });
        params.set("round", String(round));

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
  }, [season, round, roundsLoading]);

  // Fetch next 5 data when in that view
  useEffect(() => {
    if (view !== "next5" || roundsLoading) return;

    async function fetchNext5() {
      try {
        const params = new URLSearchParams({ season: String(season) });
        params.set("round", String(round));

        const res = await fetch(`/api/schedule/next5?${params}`);
        const data = await res.json();
        setNext5Data(data);
      } catch (error) {
        console.error("Failed to fetch next 5:", error);
      }
    }
    fetchNext5();
  }, [view, season, round, roundsLoading]);

  // Fetch games when in scores view
  useEffect(() => {
    if (view !== "scores" || roundsLoading) return;

    async function fetchGames() {
      try {
        const res = await fetch(`/api/games?season=${season}&round=${round}`);
        const data = await res.json();
        // API returns array directly
        setGames(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch games:", error);
      }
    }
    fetchGames();
  }, [view, season, round, roundsLoading]);

  // Fetch team schedule when in team view
  useEffect(() => {
    if (view !== "team" || !selectedTeamId) return;

    async function fetchTeamSchedule() {
      try {
        const res = await fetch(`/api/schedule/team?season=${season}&teamId=${selectedTeamId}`);
        const data = await res.json();
        setTeamSchedule(data);
        // Set selected round to latest round or current selection
        if (!selectedRound) {
          setSelectedRound(data.latestRound || round);
        }
      } catch (error) {
        console.error("Failed to fetch team schedule:", error);
      }
    }
    fetchTeamSchedule();
  }, [view, season, selectedTeamId, selectedRound, round]);

  // Handle team click - navigate to team view
  const handleTeamClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setSelectedRound(null); // Reset to auto-select latest
    setView("team");
  };

  // Sort ladder based on current view and sort key
  const sortedLadder = useMemo(() => {
    if (view === "next5" || view === "scores") {
      return [...ladder].sort((a, b) => a.position - b.position);
    }

    const sorted = [...ladder];
    const dirMultiplier = (dir: SortDirection) => dir === "desc" ? 1 : -1;

    if (view === "ladder") {
      const mult = dirMultiplier(ladderSortDir);
      sorted.sort((a, b) => {
        switch (ladderSort) {
          case "winPct":
            return mult * (b.winPct - a.winPct) || b.differential - a.differential;
          case "wins":
            return mult * (b.wins - a.wins) || b.winPct - a.winPct;
          case "losses":
            return mult * (a.losses - b.losses) || b.winPct - a.winPct;
          case "draws":
            return mult * (b.draws - a.draws) || b.winPct - a.winPct;
          case "differential":
            return mult * (b.differential - a.differential) || b.winPct - a.winPct;
          default:
            return 0;
        }
      });
    } else if (view === "forAgainst") {
      const mult = dirMultiplier(forAgainstSortDir);
      sorted.sort((a, b) => {
        const aPfPg = a.played > 0 ? a.pointsFor / a.played : 0;
        const bPfPg = b.played > 0 ? b.pointsFor / b.played : 0;
        const aPaPg = a.played > 0 ? a.pointsAgainst / a.played : 0;
        const bPaPg = b.played > 0 ? b.pointsAgainst / b.played : 0;
        const aPdPg = a.played > 0 ? a.differential / a.played : 0;
        const bPdPg = b.played > 0 ? b.differential / b.played : 0;

        switch (forAgainstSort) {
          case "pointsFor":
            return mult * (b.pointsFor - a.pointsFor);
          case "pfPerGame":
            return mult * (bPfPg - aPfPg);
          case "pointsAgainst":
            return mult * (a.pointsAgainst - b.pointsAgainst);
          case "paPerGame":
            return mult * (aPaPg - bPaPg);
          case "differential":
            return mult * (b.differential - a.differential);
          case "pdPerGame":
            return mult * (bPdPg - aPdPg);
          default:
            return 0;
        }
      });
    }

    return sorted.map((entry, index) => ({ ...entry, position: index + 1 }));
  }, [ladder, view, ladderSort, ladderSortDir, forAgainstSort, forAgainstSortDir]);

  // Build team lookup for Next 5 view
  const teamById = useMemo(() => {
    const map = new Map<string, LadderEntry["team"]>();
    for (const entry of ladder) {
      map.set(entry.team.id, entry.team);
    }
    return map;
  }, [ladder]);

  const totalByes = next5Data?.totalByes || 3;
  const currentRound = round;

  // Format kickoff time in local timezone
  const formatKickoff = (kickoff: string) => {
    const date = new Date(kickoff);
    // Format in user's local timezone
    return date.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading || roundsLoading) {
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
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            className="rounded-lg px-3 py-2 text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: `1px solid ${palette.border}`,
              color: palette.text,
            }}
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>

          <select
            value={round}
            onChange={(e) => setRound(Number(e.target.value))}
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: `1px solid ${palette.border}`,
              color: palette.text,
            }}
          >
            {availableRounds.map((r) => (
              <option key={r} value={r}>
                Round {r}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs" style={{ color: palette.textMuted }}>
          Round {currentRound}
        </div>
      </div>

      {/* View Tabs */}
      <div
        className="mb-4 grid grid-cols-5 gap-1 rounded-lg p-1"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        {(["ladder", "forAgainst", "scores", "next5", "team"] as ViewType[]).map((v) => (
          <button
            key={v}
            onClick={() => {
              setView(v);
              // If switching to team view without a team selected, pick first team
              if (v === "team" && !selectedTeamId && ladder.length > 0) {
                setSelectedTeamId(ladder[0].team.id);
              }
            }}
            className={`rounded-md px-2 py-2 text-xs sm:text-sm font-medium transition text-center leading-tight ${
              view === v ? "" : "opacity-60 hover:opacity-100"
            }`}
            style={{
              background: view === v ? palette.accent : "transparent",
              color: view === v ? "#000" : palette.text,
            }}
          >
            {v === "ladder" ? "Ladder" : v === "forAgainst" ? <span>For/<br className="sm:hidden"/>Against</span> : v === "scores" ? "Scores" : v === "next5" ? <span>Next 5</span> : "Team"}
          </button>
        ))}
      </div>

      {/* Sort Chips */}
      {(view === "ladder" || view === "forAgainst") && (
        <div className="mb-4">
          <div className="mb-2 text-xs" style={{ color: palette.textMuted }}>
            Sort by (click to toggle direction)
          </div>
          <div className="flex flex-wrap gap-2">
            {view === "ladder" &&
              LADDER_SORT_OPTIONS.map((opt) => {
                const isActive = ladderSort === opt.key;
                const arrow = isActive ? (ladderSortDir === "desc" ? " ▼" : " ▲") : "";
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleLadderSortClick(opt.key)}
                    className="rounded-md px-3 py-1.5 text-sm font-medium transition"
                    style={{
                      background: isActive ? palette.accent : "rgba(255,255,255,0.08)",
                      color: isActive ? "#000" : palette.text,
                    }}
                  >
                    {opt.label}{arrow}
                  </button>
                );
              })}
            {view === "forAgainst" &&
              FOR_AGAINST_SORT_OPTIONS.map((opt) => {
                const isActive = forAgainstSort === opt.key;
                const arrow = isActive ? (forAgainstSortDir === "desc" ? " ▼" : " ▲") : "";
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleForAgainstSortClick(opt.key)}
                    className="rounded-md px-3 py-1.5 text-sm font-medium transition"
                    style={{
                      background: isActive ? palette.accent : "rgba(255,255,255,0.08)",
                      color: isActive ? "#000" : palette.text,
                    }}
                  >
                    {opt.label}{arrow}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Scores View */}
      {view === "scores" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {games.map((game) => {
            const isFinal = game.status === "final";
            const homeWon = isFinal && game.homeScore !== null && game.awayScore !== null && game.homeScore > game.awayScore;
            const awayWon = isFinal && game.homeScore !== null && game.awayScore !== null && game.awayScore > game.homeScore;

            return (
              <div
                key={game.id}
                className="rounded-lg border p-4"
                style={{ borderColor: palette.border }}
              >
                {/* Home Team */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => handleTeamClick(game.homeTeam.id)}
                    className="flex items-center gap-2 hover:opacity-80 transition"
                  >
                    <TeamFlag teamId={game.homeTeam.id} size={20} />
                    <span className={`font-medium ${homeWon ? "" : "opacity-70"}`}>
                      {game.homeTeam.shortCode}
                    </span>
                  </button>
                  <span
                    className={`font-mono text-xl font-bold ${homeWon ? "" : "opacity-70"}`}
                    style={{ color: homeWon ? "#22c55e" : undefined }}
                  >
                    {game.homeScore ?? "-"}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => handleTeamClick(game.awayTeam.id)}
                    className="flex items-center gap-2 hover:opacity-80 transition"
                  >
                    <TeamFlag teamId={game.awayTeam.id} size={20} />
                    <span className={`font-medium ${awayWon ? "" : "opacity-70"}`}>
                      {game.awayTeam.shortCode}
                    </span>
                  </button>
                  <span
                    className={`font-mono text-xl font-bold ${awayWon ? "" : "opacity-70"}`}
                    style={{ color: awayWon ? "#22c55e" : undefined }}
                  >
                    {game.awayScore ?? "-"}
                  </span>
                </div>

                {/* Kickoff / Venue */}
                <div
                  className="border-t pt-2 flex justify-between text-xs"
                  style={{ borderColor: palette.border, color: palette.textMuted }}
                >
                  <span>{formatKickoff(game.kickoff)}</span>
                  <span>{game.venue}</span>
                </div>
              </div>
            );
          })}
          {games.length === 0 && (
            <div
              className="col-span-2 rounded-lg border p-8 text-center"
              style={{ borderColor: palette.border, color: palette.textMuted }}
            >
              No games for this round
            </div>
          )}
        </div>
      )}

      {/* Team View */}
      {view === "team" && teamSchedule && (
        <div>
          {/* Team Header with Picker */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <TeamFlag teamId={teamSchedule.team.id} size={32} />
              <select
                value={selectedTeamId || ""}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                  setSelectedRound(null);
                }}
                className="rounded-lg px-3 py-2 text-lg font-bold"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: `1px solid ${palette.border}`,
                  color: palette.text,
                }}
              >
                {ladder
                  .sort((a, b) => a.team.name.localeCompare(b.team.name))
                  .map((entry) => (
                    <option key={entry.team.id} value={entry.team.id}>
                      {entry.team.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Schedule List */}
          <div className="space-y-2">
            {teamSchedule.games.map((game) => {
              const isCurrentRound = game.round === teamSchedule.latestRound;
              const isFinal = game.status === "final";

              return (
                <div
                  key={game.id}
                  className="rounded-lg border p-3 transition"
                  style={{
                    borderColor: isCurrentRound ? palette.accent : palette.border,
                    background: isCurrentRound ? "rgba(255,255,255,0.05)" : undefined,
                    boxShadow: isCurrentRound ? `0 0 0 2px ${palette.accent}` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Round + Opponent */}
                    <div className="flex items-center gap-3">
                      <span
                        className="rounded px-2 py-1 text-xs font-mono font-bold"
                        style={{
                          background: isCurrentRound ? palette.accent : "rgba(255,255,255,0.1)",
                          color: isCurrentRound ? "#000" : palette.text,
                        }}
                      >
                        R{game.round}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: game.isHome ? "#22c55e" : "#ef4444" }}
                      >
                        {game.isHome ? "vs" : "@"}
                      </span>
                      <button
                        onClick={() => handleTeamClick(game.opponentId)}
                        className="flex items-center gap-2 hover:opacity-80 transition"
                      >
                        <TeamFlag teamId={game.opponentId} size={20} />
                        <span className="font-medium">{game.opponentCode}</span>
                      </button>
                    </div>

                    {/* Right: Score or Time */}
                    <div className="text-right">
                      {isFinal ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded px-2 py-0.5 text-xs font-bold"
                            style={{
                              background:
                                game.result === "W"
                                  ? "#22c55e"
                                  : game.result === "L"
                                  ? "#ef4444"
                                  : "#f59e0b",
                              color: "#000",
                            }}
                          >
                            {game.result}
                          </span>
                          <span className="font-mono font-bold">
                            {game.teamScore} - {game.opponentScore}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: palette.textMuted }}>
                          {formatKickoff(game.kickoff)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Venue */}
                  <div
                    className="mt-1 text-xs"
                    style={{ color: palette.textMuted }}
                  >
                    {game.venue}
                  </div>
                </div>
              );
            })}
            {teamSchedule.games.length === 0 && (
              <div
                className="rounded-lg border p-8 text-center"
                style={{ borderColor: palette.border, color: palette.textMuted }}
              >
                No games scheduled
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table (for ladder/forAgainst/next5 views) */}
      {view !== "scores" && view !== "team" && (
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
                <th className="px-1 py-2 text-center font-mono w-6"></th>
                <th className="px-1 py-2 text-left font-sans"></th>
                {view === "ladder" && (
                  <>
                    <th className="px-1 py-2 text-center font-mono">P</th>
                    <th className="px-1 py-2 text-center font-mono">W</th>
                    <th className="px-1 py-2 text-center font-mono">L</th>
                    <th className="px-1 py-2 text-center font-mono">D</th>
                    <th className="px-1 py-2 text-center font-mono">%</th>
                    <th className="px-1 py-2 text-center font-mono">PD</th>
                    <th className="hidden sm:table-cell px-1 py-2 text-center font-mono">B</th>
                  </>
                )}
                {view === "forAgainst" && (
                  <>
                    <th className="px-0.5 py-2 text-center font-mono">PF</th>
                    <th className="px-0.5 py-2 text-center font-mono">GM</th>
                    <th className="px-0.5 py-2 text-center font-mono">PA</th>
                    <th className="px-0.5 py-2 text-center font-mono">GM</th>
                    <th className="px-0.5 py-2 text-center font-mono">PD</th>
                    <th className="px-0.5 py-2 text-center font-mono">GM</th>
                  </>
                )}
                {view === "next5" &&
                  next5Data?.roundNumbers.map((r) => (
                    <th key={r} className="px-1 py-2 text-center font-mono">
                      R{r}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {sortedLadder.map((entry) => {
                const isTop4 = entry.position <= 4;
                const isTop8 = entry.position <= 8;
                const pfPerGame = entry.played > 0 ? entry.pointsFor / entry.played : 0;
                const paPerGame = entry.played > 0 ? entry.pointsAgainst / entry.played : 0;
                const pdPerGame = entry.played > 0 ? entry.differential / entry.played : 0;
                const fixtures = next5Data?.fixtures[entry.team.id] || [];

                // Only show markers when in default sort order (playoff order)
                // For/Against view never shows markers as it doesn't represent playoff order
                const showMarkers = (view === "ladder" && isDefaultLadderSort) || view === "next5";

                return (
                  <tr
                    key={entry.team.id}
                    className="border-t transition hover:bg-white/5"
                    style={{ borderColor: palette.border }}
                  >
                    {/* Position */}
                    <td className="px-1 py-2 text-center font-mono text-sm">
                      {entry.position}
                    </td>

                    {/* Team */}
                    <td className="px-1 py-2">
                      <button
                        onClick={() => handleTeamClick(entry.team.id)}
                        className="flex items-center gap-1.5 hover:opacity-80 transition"
                      >
                        <TeamFlag teamId={entry.team.id} size={16} />
                        <span className="font-medium text-sm">{entry.team.shortCode}</span>
                      </button>
                    </td>

                    {/* Ladder View Columns */}
                    {view === "ladder" && (
                      <>
                        <td className="px-1 py-2 text-center font-mono text-sm tabular-nums">
                          {entry.played}
                        </td>
                        <td
                          className="px-1 py-2 text-center font-mono text-sm font-bold tabular-nums"
                          style={{
                            color: "#22c55e",
                            background: ladderSort === "wins" ? "rgba(255,255,255,0.1)" : undefined,
                          }}
                        >
                          {entry.wins}
                        </td>
                        <td
                          className="px-1 py-2 text-center font-mono text-sm font-bold tabular-nums"
                          style={{
                            color: "#ef4444",
                            background: ladderSort === "losses" ? "rgba(255,255,255,0.1)" : undefined,
                          }}
                        >
                          {entry.losses}
                        </td>
                        <td
                          className="px-1 py-2 text-center font-mono text-sm font-bold tabular-nums"
                          style={{
                            color: "#f59e0b",
                            background: ladderSort === "draws" ? "rgba(255,255,255,0.1)" : undefined,
                          }}
                        >
                          {entry.draws}
                        </td>
                        <td
                          className="px-1 py-2 text-center font-mono text-sm font-bold tabular-nums"
                          style={{
                            background: ladderSort === "winPct" ? "rgba(255,255,255,0.1)" : undefined,
                          }}
                        >
                          {entry.winPct.toFixed(0)}
                        </td>
                        <td
                          className="px-1 py-2 text-center font-mono text-sm tabular-nums"
                          style={{
                            color:
                              entry.differential > 0
                                ? "#22c55e"
                                : entry.differential < 0
                                ? "#ef4444"
                                : palette.textMuted,
                            background: ladderSort === "differential" ? "rgba(255,255,255,0.1)" : undefined,
                          }}
                        >
                          {entry.differential > 0 ? "+" : ""}
                          {entry.differential}
                        </td>
                        <td
                          className="hidden sm:table-cell px-1 py-2 text-center font-mono text-xs tabular-nums"
                          style={{ color: palette.textMuted }}
                        >
                          {entry.byesTaken}/{totalByes}
                        </td>
                      </>
                    )}

                    {/* For/Against View Columns */}
                    {view === "forAgainst" && (
                      <>
                        <td
                          className="px-0.5 py-2 text-center font-mono text-sm tabular-nums"
                          style={{
                            background: forAgainstSort === "pointsFor" ? "rgba(255,255,255,0.1)" : undefined,
                          }}
                        >
                          {entry.pointsFor}
                        </td>
                        <td
                          className="px-0.5 py-2 text-center font-mono text-sm tabular-nums"
                          style={{
                            background: forAgainstSort === "pfPerGame" ? "rgba(255,255,255,0.1)" : undefined,
                          }}
                        >
                          {pfPerGame.toFixed(1)}
                        </td>
                        <td
                          className="px-0.5 py-2 text-center font-mono text-sm tabular-nums"
                          style={{
                            background: forAgainstSort === "pointsAgainst" ? "rgba(255,255,255,0.1)" : undefined,
                          }}
                        >
                          {entry.pointsAgainst}
                        </td>
                        <td
                          className="px-0.5 py-2 text-center font-mono text-sm tabular-nums"
                          style={{
                            background: forAgainstSort === "paPerGame" ? "rgba(255,255,255,0.1)" : undefined,
                          }}
                        >
                          {paPerGame.toFixed(1)}
                        </td>
                        <td
                          className="px-0.5 py-2 text-center font-mono text-sm tabular-nums"
                          style={{
                            color:
                              entry.differential > 0
                                ? "#22c55e"
                                : entry.differential < 0
                                ? "#ef4444"
                                : palette.textMuted,
                            background: forAgainstSort === "differential" ? "rgba(255,255,255,0.1)" : undefined,
                          }}
                        >
                          {entry.differential > 0 ? "+" : ""}
                          {entry.differential}
                        </td>
                        <td
                          className="px-0.5 py-2 text-center font-mono text-sm tabular-nums"
                          style={{
                            color:
                              pdPerGame > 0
                                ? "#22c55e"
                                : pdPerGame < 0
                                ? "#ef4444"
                                : palette.textMuted,
                            background: forAgainstSort === "pdPerGame" ? "rgba(255,255,255,0.1)" : undefined,
                          }}
                        >
                          {pdPerGame > 0 ? "+" : ""}
                          {pdPerGame.toFixed(1)}
                        </td>
                      </>
                    )}

                    {/* Next 5 View Columns */}
                    {view === "next5" &&
                      fixtures.map((fixture, idx) => {
                        if (!fixture.opponentId) {
                          return (
                            <td key={idx} className="px-1 py-2 text-center">
                              <span
                                className="rounded px-1.5 py-0.5 text-xs font-medium"
                                style={{
                                  background: "rgba(255,255,255,0.15)",
                                  color: palette.textMuted,
                                }}
                              >
                                BYE
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={idx} className="px-1 py-2 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <TeamFlag teamId={fixture.opponentId} size={14} />
                              <span className="font-mono text-xs leading-tight">
                                {fixture.opponentPosition}
                                <span
                                  style={{
                                    color: fixture.isHome ? "#22c55e" : "#ef4444",
                                  }}
                                >
                                  {fixture.isHome ? "H" : "A"}
                                </span>
                              </span>
                            </div>
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div
        className="mt-4 flex flex-wrap items-center gap-4 text-xs"
        style={{ color: palette.textMuted }}
      >
        {view === "ladder" && (
          <>
            <span>
              <span style={{ color: "#22c55e" }}>W</span>=Wins
            </span>
            <span>
              <span style={{ color: "#ef4444" }}>L</span>=Losses
            </span>
            <span>
              <span style={{ color: "#f59e0b" }}>D</span>=Draws
            </span>
            <span>PD=Point Diff</span>
          </>
        )}
        {view === "forAgainst" && (
          <>
            <span>PF=Points For</span>
            <span>PA=Points Against</span>
            <span>GM=Per Game</span>
          </>
        )}
        {view === "next5" && (
          <>
            <span className="opacity-50">|</span>
            <span>
              <span style={{ color: "#22c55e" }}>H</span>=Home
            </span>
            <span>
              <span style={{ color: "#ef4444" }}>A</span>=Away
            </span>
            <span>#=Ladder Position</span>
          </>
        )}
        {view === "scores" && (
          <>
            <span>Times shown in your local timezone</span>
          </>
        )}
        {view === "team" && (
          <>
            <span>
              <span style={{ color: "#22c55e" }}>vs</span>=Home
            </span>
            <span>
              <span style={{ color: "#ef4444" }}>@</span>=Away
            </span>
            <span>
              <span className="rounded px-1" style={{ background: "#22c55e", color: "#000" }}>W</span>=Win
            </span>
            <span>
              <span className="rounded px-1" style={{ background: "#ef4444", color: "#000" }}>L</span>=Loss
            </span>
            <span>
              <span className="rounded px-1" style={{ background: "#f59e0b", color: "#000" }}>D</span>=Draw
            </span>
          </>
        )}
      </div>
    </div>
  );
}
