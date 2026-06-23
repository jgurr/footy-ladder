import { sortLadder } from "./calculations";
import { buildRunHomeData } from "./run-home";
import { NRL_TEAMS } from "./teams";
import type { Game, LadderEntry, Team } from "./types";

export interface MonteCarloPositionBucket {
  position: number;
  count: number;
  probability: number;
}

export interface MonteCarloTeamResult {
  team: Team;
  currentPosition: number;
  averagePosition: number;
  medianPosition: number;
  top4Probability: number;
  top8Probability: number;
  minorPremiershipProbability: number;
  spoonProbability: number;
  positionBuckets: MonteCarloPositionBucket[];
}

export interface MonteCarloData {
  season: number;
  iterations: number;
  seed: number;
  remainingGames: number;
  model: {
    scoring: string;
    tiebreakers: string;
    source: string;
  };
  teams: MonteCarloTeamResult[];
}

interface TeamScoringProfile {
  attackPerGame: number;
  defensePerGame: number;
}

interface SimTeamState {
  entry: LadderEntry;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  pointsFor: number;
  pointsAgainst: number;
}

interface SimGame {
  id: string;
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  homeWinChance: number;
  projectedHomeScore: number;
  projectedAwayScore: number;
}

const DEFAULT_ITERATIONS = 20_000;
const MIN_ITERATIONS = 1_000;
const MAX_ITERATIONS = 50_000;
const SCORE_MARGIN_LOGIT_SCALE = 10.5;
const SCORE_MARGIN_SD = 15;
const SCORE_TOTAL_SD = 11;
const DRAW_RATE_ON_ROUNDED_TIE = 0.04;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function normalizeIterations(iterations?: number): number {
  if (!iterations || Number.isNaN(iterations)) return DEFAULT_ITERATIONS;
  return Math.round(clamp(iterations, MIN_ITERATIONS, MAX_ITERATIONS));
}

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function normalSample(random: () => number): number {
  const u1 = Math.max(random(), Number.EPSILON);
  const u2 = Math.max(random(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function logit(probability: number): number {
  const p = clamp(probability, 0.02, 0.98);
  return Math.log(p / (1 - p));
}

function buildScoringProfiles(ladder: LadderEntry[]): {
  leagueAveragePoints: number;
  profiles: Map<string, TeamScoringProfile>;
} {
  const played = ladder.reduce((total, entry) => total + entry.played, 0);
  const pointsFor = ladder.reduce((total, entry) => total + entry.pointsFor, 0);
  const leagueAveragePoints = played > 0 ? pointsFor / played : 22;
  const profiles = new Map<string, TeamScoringProfile>();

  for (const entry of ladder) {
    const sampleWeight = clamp(entry.played / 18, 0, 0.75);
    const attackPerGame =
      entry.played > 0
        ? leagueAveragePoints +
          ((entry.pointsFor / entry.played) - leagueAveragePoints) * sampleWeight
        : leagueAveragePoints;
    const defensePerGame =
      entry.played > 0
        ? leagueAveragePoints +
          ((entry.pointsAgainst / entry.played) - leagueAveragePoints) * sampleWeight
        : leagueAveragePoints;

    profiles.set(entry.team.id, { attackPerGame, defensePerGame });
  }

  return { leagueAveragePoints, profiles };
}

function expectedTotalPoints(
  homeTeamId: string,
  awayTeamId: string,
  leagueAveragePoints: number,
  profiles: Map<string, TeamScoringProfile>
): number {
  const home = profiles.get(homeTeamId);
  const away = profiles.get(awayTeamId);

  const projectedHome =
    leagueAveragePoints +
    ((home?.attackPerGame ?? leagueAveragePoints) - leagueAveragePoints) * 0.55 +
    ((away?.defensePerGame ?? leagueAveragePoints) - leagueAveragePoints) * 0.45;
  const projectedAway =
    leagueAveragePoints +
    ((away?.attackPerGame ?? leagueAveragePoints) - leagueAveragePoints) * 0.55 +
    ((home?.defensePerGame ?? leagueAveragePoints) - leagueAveragePoints) * 0.45;

  return clamp(projectedHome + projectedAway, 28, 64);
}

function projectedScores(
  homeTeamId: string,
  awayTeamId: string,
  homeWinChance: number,
  leagueAveragePoints: number,
  profiles: Map<string, TeamScoringProfile>
): { projectedHomeScore: number; projectedAwayScore: number } {
  const total = expectedTotalPoints(homeTeamId, awayTeamId, leagueAveragePoints, profiles);
  const margin = logit(homeWinChance / 100) * SCORE_MARGIN_LOGIT_SCALE;
  const homeScore = Math.max(0, Math.round((total + margin) / 2));
  const awayScore = Math.max(0, Math.round((total - margin) / 2));

  return { projectedHomeScore: homeScore, projectedAwayScore: awayScore };
}

function buildSimGames(
  season: number,
  ladder: LadderEntry[],
  seasonGames: Game[]
): SimGame[] {
  const runHome = buildRunHomeData(season, ladder, seasonGames);
  const { leagueAveragePoints, profiles } = buildScoringProfiles(ladder);
  const futureGames = seasonGames
    .filter((game) => game.status !== "final" && game.status !== "postponed")
    .sort((a, b) => a.round - b.round || String(a.kickoff).localeCompare(String(b.kickoff)));

  return futureGames.map((game) => {
    const homeFixture = runHome.fixtures[game.homeTeamId]?.find(
      (fixture) => fixture.gameId === game.id
    );
    const awayFixture = runHome.fixtures[game.awayTeamId]?.find(
      (fixture) => fixture.gameId === game.id
    );
    const homeWinChance = homeFixture
      ? homeFixture.winChance
      : awayFixture
        ? 100 - awayFixture.winChance
        : 50;
    const projection = projectedScores(
      game.homeTeamId,
      game.awayTeamId,
      homeWinChance,
      leagueAveragePoints,
      profiles
    );

    return {
      id: game.id,
      round: game.round,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      homeWinChance,
      ...projection,
    };
  });
}

function emptyPositionBuckets(): number[] {
  return Array.from({ length: NRL_TEAMS.length }, () => 0);
}

function initialState(ladder: LadderEntry[]): Map<string, SimTeamState> {
  return new Map(
    ladder.map((entry) => [
      entry.team.id,
      {
        entry,
        played: entry.played,
        wins: entry.wins,
        losses: entry.losses,
        draws: entry.draws,
        pointsFor: entry.pointsFor,
        pointsAgainst: entry.pointsAgainst,
      },
    ])
  );
}

function simulateScore(game: SimGame, random: () => number): { homeScore: number; awayScore: number } {
  const projectedTotal = game.projectedHomeScore + game.projectedAwayScore;
  const projectedMargin = game.projectedHomeScore - game.projectedAwayScore;
  const margin = projectedMargin + normalSample(random) * SCORE_MARGIN_SD;
  const total = Math.max(Math.abs(margin) + 2, projectedTotal + normalSample(random) * SCORE_TOTAL_SD);

  let homeScore = Math.max(0, Math.round((total + margin) / 2));
  let awayScore = Math.max(0, Math.round((total - margin) / 2));

  if (homeScore === awayScore && random() > DRAW_RATE_ON_ROUNDED_TIE) {
    if (random() < game.homeWinChance / 100) homeScore += 1;
    else awayScore += 1;
  }

  return { homeScore, awayScore };
}

function addGameResult(
  states: Map<string, SimTeamState>,
  game: SimGame,
  homeScore: number,
  awayScore: number
) {
  const home = states.get(game.homeTeamId);
  const away = states.get(game.awayTeamId);
  if (!home || !away) return;

  home.played += 1;
  away.played += 1;
  home.pointsFor += homeScore;
  home.pointsAgainst += awayScore;
  away.pointsFor += awayScore;
  away.pointsAgainst += homeScore;

  if (homeScore > awayScore) {
    home.wins += 1;
    away.losses += 1;
  } else if (awayScore > homeScore) {
    away.wins += 1;
    home.losses += 1;
  } else {
    home.draws += 1;
    away.draws += 1;
  }
}

function stateToLadderEntries(states: Map<string, SimTeamState>): LadderEntry[] {
  return Array.from(states.values()).map((state) => {
    const differential = state.pointsFor - state.pointsAgainst;
    const nrlPoints = state.wins * 2 + state.draws;
    const winPct =
      state.played > 0 ? ((state.wins + state.draws * 0.5) / state.played) * 100 : 0;

    return {
      ...state.entry,
      played: state.played,
      wins: state.wins,
      losses: state.losses,
      draws: state.draws,
      pointsFor: state.pointsFor,
      pointsAgainst: state.pointsAgainst,
      differential,
      nrlPoints,
      winPct,
    };
  });
}

function medianPosition(counts: number[], iterations: number): number {
  let cumulative = 0;
  const midpoint = iterations / 2;
  for (let index = 0; index < counts.length; index++) {
    cumulative += counts[index];
    if (cumulative >= midpoint) return index + 1;
  }
  return counts.length;
}

export function buildMonteCarloData(
  season: number,
  ladder: LadderEntry[],
  seasonGames: Game[],
  requestedIterations?: number
): MonteCarloData {
  const iterations = normalizeIterations(requestedIterations);
  const simGames = buildSimGames(season, ladder, seasonGames);
  const seed = hashSeed(
    `${season}:${iterations}:${ladder.map((entry) => `${entry.team.id}:${entry.wins}:${entry.losses}:${entry.draws}:${entry.differential}`).join("|")}:${simGames.map((game) => `${game.id}:${game.homeWinChance}:${game.projectedHomeScore}-${game.projectedAwayScore}`).join("|")}`
  );
  const random = mulberry32(seed);
  const counts = new Map(NRL_TEAMS.map((team) => [team.id, emptyPositionBuckets()]));

  for (let iteration = 0; iteration < iterations; iteration++) {
    const states = initialState(ladder);

    for (const game of simGames) {
      const { homeScore, awayScore } = simulateScore(game, random);
      addGameResult(states, game, homeScore, awayScore);
    }

    const finalLadder = sortLadder(stateToLadderEntries(states));
    finalLadder.forEach((entry, index) => {
      counts.get(entry.team.id)![index] += 1;
    });
  }

  const currentPositions = new Map(ladder.map((entry) => [entry.team.id, entry.position]));
  const teams = NRL_TEAMS.map((team) => {
    const teamCounts = counts.get(team.id) || emptyPositionBuckets();
    const weightedPosition = teamCounts.reduce(
      (total, count, index) => total + count * (index + 1),
      0
    );
    const averagePosition = weightedPosition / iterations;
    const probability = (position: number) => teamCounts[position - 1] / iterations;
    const topProbability = (maxPosition: number) =>
      teamCounts.slice(0, maxPosition).reduce((total, count) => total + count, 0) / iterations;

    return {
      team,
      currentPosition: currentPositions.get(team.id) || NRL_TEAMS.length,
      averagePosition: Math.round(averagePosition * 10) / 10,
      medianPosition: medianPosition(teamCounts, iterations),
      top4Probability: Math.round(topProbability(4) * 1000) / 10,
      top8Probability: Math.round(topProbability(8) * 1000) / 10,
      minorPremiershipProbability: Math.round(probability(1) * 1000) / 10,
      spoonProbability: Math.round(probability(NRL_TEAMS.length) * 1000) / 10,
      positionBuckets: teamCounts.map((count, index) => ({
        position: index + 1,
        count,
        probability: Math.round((count / iterations) * 1000) / 10,
      })),
    };
  }).sort(
    (a, b) =>
      a.averagePosition - b.averagePosition ||
      b.top8Probability - a.top8Probability ||
      a.currentPosition - b.currentPosition
  );

  return {
    season,
    iterations,
    seed,
    remainingGames: simGames.length,
    model: {
      scoring:
        "Projected scores use current attack/defense rates for total points and Elo/context win chance for margin.",
      tiebreakers: "Final ladder sorted by win %, NRL points, projected final PD, then projected PF.",
      source: "Completed ladder plus remaining official draw and run-home Elo probabilities.",
    },
    teams,
  };
}
