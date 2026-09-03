import { getGamesBySeason, getLadder, getLatestLadderRound } from "./queries";
import { getSeasonStatus } from "./status";
import type { Game, LadderEntry, Team } from "./types";
import {
  FINALS_FIRST_ROUND,
  FINALS_LAST_ROUND,
  REGULAR_SEASON_LAST_ROUND,
} from "./season";

export {
  FINALS_FIRST_ROUND,
  FINALS_LAST_ROUND,
  REGULAR_SEASON_LAST_ROUND,
} from "./season";

export type FinalsMatchId =
  | "qf1"
  | "qf2"
  | "ef1"
  | "ef2"
  | "sf1"
  | "sf2"
  | "pf1"
  | "pf2"
  | "gf";

export type FinalsStage = "week1" | "semis" | "prelims" | "grandFinal";

export interface FinalsTeam extends Team {
  seed: number;
}

export interface FinalsSlot {
  team: FinalsTeam | null;
  source: string;
  score: number | null;
  winner: boolean;
}

export interface FinalsMatch {
  id: FinalsMatchId;
  round: number;
  stage: FinalsStage;
  title: string;
  subtitle: string;
  slots: [FinalsSlot, FinalsSlot];
  status: Game["status"] | "tbd";
  kickoff: string | null;
  venue: string | null;
  gameId: string | null;
}

export interface FinalsData {
  season: number;
  mode: "projected" | "official";
  regularSeasonComplete: boolean;
  lastSyncedAt: string | null;
  matches: Record<FinalsMatchId, FinalsMatch>;
}

interface MatchTemplate {
  id: FinalsMatchId;
  round: number;
  stage: FinalsStage;
  title: string;
  subtitle: string;
}

const MATCH_TEMPLATES: Record<FinalsMatchId, MatchTemplate> = {
  qf1: { id: "qf1", round: 28, stage: "week1", title: "Qualifying Final 1", subtitle: "1 v 4 · double chance" },
  qf2: { id: "qf2", round: 28, stage: "week1", title: "Qualifying Final 2", subtitle: "2 v 3 · double chance" },
  ef1: { id: "ef1", round: 28, stage: "week1", title: "Elimination Final 1", subtitle: "5 v 8 · elimination" },
  ef2: { id: "ef2", round: 28, stage: "week1", title: "Elimination Final 2", subtitle: "6 v 7 · elimination" },
  sf1: { id: "sf1", round: 29, stage: "semis", title: "Semi Final 1", subtitle: "elimination" },
  sf2: { id: "sf2", round: 29, stage: "semis", title: "Semi Final 2", subtitle: "elimination" },
  pf1: { id: "pf1", round: 30, stage: "prelims", title: "Preliminary Final 1", subtitle: "winner to Grand Final" },
  pf2: { id: "pf2", round: 30, stage: "prelims", title: "Preliminary Final 2", subtitle: "winner to Grand Final" },
  gf: { id: "gf", round: 31, stage: "grandFinal", title: "Grand Final", subtitle: "winner: NRL premiers" },
};

function teamSlot(team: FinalsTeam | undefined, source: string): FinalsSlot {
  return {
    team: team || null,
    source,
    score: null,
    winner: false,
  };
}

function participantIds(slots: [FinalsSlot, FinalsSlot]): string[] {
  return slots
    .map((slot) => slot.team?.id)
    .filter((teamId): teamId is string => Boolean(teamId))
    .sort();
}

function findMatchingGame(
  games: Game[],
  round: number,
  slots: [FinalsSlot, FinalsSlot]
): Game | undefined {
  const expected = participantIds(slots);
  if (expected.length !== 2) return undefined;

  return games.find((game) => {
    if (game.round !== round) return false;
    return [game.homeTeamId, game.awayTeamId].sort().every(
      (teamId, index) => teamId === expected[index]
    );
  });
}

function hydrateMatch(
  id: FinalsMatchId,
  slots: [FinalsSlot, FinalsSlot],
  games: Game[]
): FinalsMatch {
  const template = MATCH_TEMPLATES[id];
  const game = findMatchingGame(games, template.round, slots);

  if (!game) {
    return {
      ...template,
      slots,
      status: "tbd",
      kickoff: null,
      venue: null,
      gameId: null,
    };
  }

  const scores = new Map([
    [game.homeTeamId, game.homeScore],
    [game.awayTeamId, game.awayScore],
  ]);
  const hasWinner =
    game.status === "final" &&
    game.homeScore !== null &&
    game.awayScore !== null &&
    game.homeScore !== game.awayScore;
  const winningTeamId = hasWinner
    ? game.homeScore! > game.awayScore!
      ? game.homeTeamId
      : game.awayTeamId
    : null;

  return {
    ...template,
    slots: slots.map((slot) => ({
      ...slot,
      score: slot.team ? scores.get(slot.team.id) ?? null : null,
      winner: slot.team?.id === winningTeamId,
    })) as [FinalsSlot, FinalsSlot],
    status: game.status,
    kickoff: game.kickoff,
    venue: game.venue,
    gameId: game.id,
  };
}

function outcomeSlot(
  match: FinalsMatch,
  outcome: "winner" | "loser",
  source: string
): FinalsSlot {
  if (match.status !== "final") return teamSlot(undefined, source);

  const winningSlot = match.slots.find((slot) => slot.winner);
  const selected =
    outcome === "winner"
      ? winningSlot
      : match.slots.find((slot) => slot.team && slot !== winningSlot);

  return teamSlot(selected?.team || undefined, source);
}

export function buildFinalsData(
  season: number,
  ladder: LadderEntry[],
  games: Game[],
  options: { regularSeasonComplete: boolean; lastSyncedAt?: string | null }
): FinalsData {
  const seededTeams = [...ladder]
    .sort((a, b) => a.position - b.position)
    .slice(0, 8)
    .map((entry, index) => ({ ...entry.team, seed: index + 1 }));
  const seed = (position: number) => seededTeams[position - 1];

  const qf1 = hydrateMatch(
    "qf1",
    [teamSlot(seed(1), "Seed 1"), teamSlot(seed(4), "Seed 4")],
    games
  );
  const qf2 = hydrateMatch(
    "qf2",
    [teamSlot(seed(2), "Seed 2"), teamSlot(seed(3), "Seed 3")],
    games
  );
  const ef1 = hydrateMatch(
    "ef1",
    [teamSlot(seed(5), "Seed 5"), teamSlot(seed(8), "Seed 8")],
    games
  );
  const ef2 = hydrateMatch(
    "ef2",
    [teamSlot(seed(6), "Seed 6"), teamSlot(seed(7), "Seed 7")],
    games
  );

  const sf1 = hydrateMatch(
    "sf1",
    [outcomeSlot(qf1, "loser", "Loser QF1"), outcomeSlot(ef1, "winner", "Winner EF1")],
    games
  );
  const sf2 = hydrateMatch(
    "sf2",
    [outcomeSlot(qf2, "loser", "Loser QF2"), outcomeSlot(ef2, "winner", "Winner EF2")],
    games
  );
  const pf1 = hydrateMatch(
    "pf1",
    [outcomeSlot(qf1, "winner", "Winner QF1"), outcomeSlot(sf2, "winner", "Winner SF2")],
    games
  );
  const pf2 = hydrateMatch(
    "pf2",
    [outcomeSlot(qf2, "winner", "Winner QF2"), outcomeSlot(sf1, "winner", "Winner SF1")],
    games
  );
  const gf = hydrateMatch(
    "gf",
    [outcomeSlot(pf1, "winner", "Winner PF1"), outcomeSlot(pf2, "winner", "Winner PF2")],
    games
  );

  const finalsGamesExist = games.some(
    (game) => game.round >= FINALS_FIRST_ROUND && game.round <= FINALS_LAST_ROUND
  );

  return {
    season,
    mode: options.regularSeasonComplete || finalsGamesExist ? "official" : "projected",
    regularSeasonComplete: options.regularSeasonComplete,
    lastSyncedAt: options.lastSyncedAt || null,
    matches: { qf1, qf2, ef1, ef2, sf1, sf2, pf1, pf2, gf },
  };
}

export async function getFinalsData(season: number): Promise<FinalsData> {
  const [games, latestRound, status] = await Promise.all([
    getGamesBySeason(season),
    getLatestLadderRound(season),
    getSeasonStatus(season),
  ]);
  const ladder = await getLadder(
    season,
    Math.min(latestRound, REGULAR_SEASON_LAST_ROUND)
  );

  return buildFinalsData(season, ladder, games, {
    regularSeasonComplete: status.regularSeasonComplete,
    lastSyncedAt: status.lastSyncedAt,
  });
}
