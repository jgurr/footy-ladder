import historicalGamesJson from "@/data/elo-history.json";
import { calculateEloRatings, ELO_BASELINE, expectedWinProbability, rankEloRatings } from "./elo";
import { NRL_TEAMS, getTeamById } from "./teams";
import type { Game, LadderEntry, Team } from "./types";

interface Coordinates {
  lat: number;
  lon: number;
}

type FactorAssessment = "favourable" | "even" | "disadvantage";

export interface ScheduleFactor {
  label: string;
  detail: string;
  assessment: FactorAssessment;
}

export interface RunHomeFixture {
  gameId: string;
  round: number;
  kickoff: string | null;
  venue: string;
  teamId: string;
  opponent: Team;
  venueType: "home" | "away" | "local" | "neutral";
  difficulty: number;
  difficultyLabel: string;
  winChance: number;
  explanation: string;
  factors: {
    opponent: ScheduleFactor;
    venue: ScheduleFactor;
    rest: ScheduleFactor;
    travel: ScheduleFactor;
  };
}

export interface RunHomeSummary {
  position: number;
  team: Team;
  powerRank: number;
  remainingGames: number;
  scheduleDifficulty: number;
  difficultyLabel: string;
  scheduleRank: number;
  projectedWins: number;
}

export interface RunHomeData {
  season: number;
  model: {
    gamesProcessed: number;
    seasons: string;
    includesFinals: boolean;
  };
  summaries: RunHomeSummary[];
  fixtures: Record<string, RunHomeFixture[]>;
}

const TEAM_BASES: Record<string, Coordinates> = {
  bri: { lat: -27.465, lon: 153.009 },
  can: { lat: -35.251, lon: 149.102 },
  cby: { lat: -33.919, lon: 151.099 },
  cro: { lat: -34.038, lon: 151.141 },
  dol: { lat: -27.219, lon: 153.106 },
  gld: { lat: -28.067, lon: 153.378 },
  man: { lat: -33.798, lon: 151.288 },
  mel: { lat: -37.825, lon: 144.983 },
  new: { lat: -32.919, lon: 151.726 },
  nql: { lat: -19.316, lon: 146.711 },
  nzl: { lat: -36.919, lon: 174.812 },
  par: { lat: -33.808, lon: 150.999 },
  pen: { lat: -33.758, lon: 150.685 },
  sou: { lat: -33.94, lon: 151.239 },
  sti: { lat: -34.427, lon: 150.902 },
  syd: { lat: -33.89, lon: 151.225 },
  wst: { lat: -33.847, lon: 151.093 },
};

const VENUES: Record<string, Coordinates> = {
  "4 Pines Park": { lat: -33.798, lon: 151.288 },
  "AAMI Park": { lat: -37.825, lon: 144.983 },
  "Accor Stadium": { lat: -33.847, lon: 151.063 },
  "Allegiant Stadium": { lat: 36.091, lon: -115.184 },
  "Allianz Stadium": { lat: -33.89, lon: 151.225 },
  "Campbelltown Sports Stadium": { lat: -34.05, lon: 150.833 },
  "Carrington Park": { lat: -33.42, lon: 149.58 },
  "Cbus Super Stadium": { lat: -28.067, lon: 153.378 },
  "CommBank Stadium": { lat: -33.808, lon: 150.999 },
  "GIO Stadium": { lat: -35.251, lon: 149.102 },
  "Glen Willow Oval": { lat: -32.602, lon: 149.58 },
  "Go Media Stadium": { lat: -36.919, lon: 174.812 },
  "HBF Park": { lat: -31.946, lon: 115.87 },
  "Hnry Stadium": { lat: -41.273, lon: 174.786 },
  "Kayo Stadium": { lat: -27.219, lon: 153.106 },
  "Leichhardt Oval": { lat: -33.879, lon: 151.154 },
  "McDonald Jones Stadium": { lat: -32.919, lon: 151.726 },
  "Ocean Protect Stadium": { lat: -34.038, lon: 151.141 },
  "One NZ Stadium": { lat: -43.535, lon: 172.658 },
  "Optus Stadium": { lat: -31.951, lon: 115.889 },
  "Polytec Stadium": { lat: -34.038, lon: 151.141 },
  "Queensland Country Bank Stadium": { lat: -19.316, lon: 146.711 },
  "St George Venues Jubilee Stadium": { lat: -33.968, lon: 151.13 },
  "Suncorp Stadium": { lat: -27.465, lon: 153.009 },
  "TIO Stadium": { lat: -12.399, lon: 130.887 },
  "WIN Stadium": { lat: -34.427, lon: 150.902 },
};

const historicalGames = historicalGamesJson as Array<{
  season: number;
  round: number;
  stage: string;
  kickoff: string;
  venue: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
}>;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function distanceKm(from: Coordinates, to: Coordinates): number {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(to.lat - from.lat);
  const lonDelta = toRadians(to.lon - from.lon);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(lonDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function travelDistance(teamId: string, venue: string): number {
  const base = TEAM_BASES[teamId];
  const destination = VENUES[venue];
  if (!base || !destination) return 0;
  return distanceKm(base, destination);
}

function roundedDistance(distance: number): number {
  if (distance < 20) return Math.round(distance);
  return Math.round(distance / 10) * 10;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function difficultyLabel(score: number): string {
  if (score >= 70) return "Very hard";
  if (score >= 55) return "Hard";
  if (score >= 40) return "Even";
  return "Easier";
}

function assessDifference(value: number, threshold: number): FactorAssessment {
  if (value >= threshold) return "favourable";
  if (value <= -threshold) return "disadvantage";
  return "even";
}

function restDays(previousKickoff: string | null, kickoff: string | null): number | null {
  if (!previousKickoff || !kickoff) return null;
  return (new Date(kickoff).getTime() - new Date(previousKickoff).getTime()) / 86_400_000;
}

function formatRest(days: number | null): string {
  if (days === null) return "Season opener";
  return `${Math.round(days * 10) / 10} days`;
}

function getPreviousKickoffs(games: Game[]): Map<string, string | null> {
  const previousByTeam = new Map<string, string>();
  const result = new Map<string, string | null>();
  const sorted = [...games].sort((a, b) => String(a.kickoff).localeCompare(String(b.kickoff)));

  for (const game of sorted) {
    result.set(`${game.id}:${game.homeTeamId}`, previousByTeam.get(game.homeTeamId) || null);
    result.set(`${game.id}:${game.awayTeamId}`, previousByTeam.get(game.awayTeamId) || null);
    if (game.kickoff) {
      previousByTeam.set(game.homeTeamId, game.kickoff);
      previousByTeam.set(game.awayTeamId, game.kickoff);
    }
  }
  return result;
}

function fixtureExplanation(fixture: {
  difficultyLabel: string;
  venueType: "home" | "away" | "local" | "neutral";
  opponentRank: number;
  restAssessment: FactorAssessment;
  travelAssessment: FactorAssessment;
}): string {
  const article = fixture.difficultyLabel === "Even" || fixture.difficultyLabel === "Easier" ? "An" : "A";
  const parts = [
    `${article} ${fixture.difficultyLabel.toLowerCase()} ${fixture.venueType} fixture against the #${fixture.opponentRank} power-ranked team.`,
  ];
  if (fixture.restAssessment === "disadvantage") parts.push("They have the better recovery window.");
  if (fixture.restAssessment === "favourable") parts.push("The recovery window is in your favour.");
  if (fixture.travelAssessment === "disadvantage") parts.push("Your side carries the heavier travel load.");
  if (fixture.travelAssessment === "favourable") parts.push("The travel load favours your side.");
  return parts.join(" ");
}

export function buildRunHomeData(
  season: number,
  ladder: LadderEntry[],
  seasonGames: Game[]
): RunHomeData {
  const completedCurrentGames = seasonGames
    .filter(
      (game): game is Game & { homeScore: number; awayScore: number } =>
        game.status === "final" && game.homeScore !== null && game.awayScore !== null
    )
    .map((game) => ({ ...game, homeScore: game.homeScore, awayScore: game.awayScore }));
  const modelGames = [
    ...historicalGames,
    ...(season > 2025 ? completedCurrentGames : []),
  ];
  const { ratings, gamesProcessed } = calculateEloRatings(modelGames);
  const powerRanks = rankEloRatings(
    ratings,
    NRL_TEAMS.map((team) => team.id)
  );
  const previousKickoffs = getPreviousKickoffs(seasonGames);
  const fixtures: Record<string, RunHomeFixture[]> = Object.fromEntries(
    NRL_TEAMS.map((team) => [team.id, []])
  );

  for (const game of seasonGames.filter(
    (candidate) => candidate.status !== "final" && candidate.status !== "postponed"
  )) {
    const venue = VENUES[game.venue];
    const homeTravel = travelDistance(game.homeTeamId, game.venue);
    const awayTravel = travelDistance(game.awayTeamId, game.venue);
    const neutral =
      game.venue === "Allegiant Stadium" ||
      Boolean(venue && homeTravel > 120 && awayTravel > 120);

    for (const teamId of [game.homeTeamId, game.awayTeamId]) {
      const isHome = teamId === game.homeTeamId;
      const opponentId = isHome ? game.awayTeamId : game.homeTeamId;
      const opponent = getTeamById(opponentId);
      if (!opponent) continue;

      const selfTravel = isHome ? homeTravel : awayTravel;
      const opponentTravel = isHome ? awayTravel : homeTravel;
      const selfRest = restDays(
        previousKickoffs.get(`${game.id}:${teamId}`) || null,
        game.kickoff
      );
      const opponentRest = restDays(
        previousKickoffs.get(`${game.id}:${opponentId}`) || null,
        game.kickoff
      );
      const restDifference = (selfRest ?? 7) - (opponentRest ?? 7);
      const restAdvantage = clamp(restDifference, -3, 3) * 8;
      const travelDifference = opponentTravel - selfTravel;
      const travelAdvantage = clamp((travelDifference / 1000) * 18, -45, 45);
      const selfIsLocal = selfTravel <= 100;
      const opponentIsLocal = opponentTravel <= 100;
      const venueAdvantage = neutral
        ? 0
        : selfIsLocal && !opponentIsLocal
          ? 50
          : opponentIsLocal && !selfIsLocal
            ? -50
            : isHome
              ? 50
              : -50;
      const venueType = neutral
        ? "neutral"
        : !isHome && venueAdvantage > 0
          ? "local"
          : venueAdvantage > 0
            ? "home"
            : "away";
      const contextAdvantage = venueAdvantage + restAdvantage + travelAdvantage;
      const teamRating = ratings.get(teamId) ?? ELO_BASELINE;
      const opponentRating = ratings.get(opponentId) ?? ELO_BASELINE;
      const opponentRank = powerRanks.get(opponentId) || NRL_TEAMS.length;
      const winChance = Math.round(
        expectedWinProbability(teamRating, opponentRating, contextAdvantage) * 100
      );
      const difficulty = Math.round(
        (1 - expectedWinProbability(ELO_BASELINE, opponentRating, contextAdvantage)) * 100
      );
      const label = difficultyLabel(difficulty);
      const restAssessment = assessDifference(restDifference, 0.75);
      const travelAssessment = assessDifference(travelDifference, 250);

      fixtures[teamId].push({
        gameId: game.id,
        round: game.round,
        kickoff: game.kickoff,
        venue: game.venue,
        teamId,
        opponent,
        venueType,
        difficulty,
        difficultyLabel: label,
        winChance,
        explanation: fixtureExplanation({
          difficultyLabel: label,
          venueType,
          opponentRank,
          restAssessment,
          travelAssessment,
        }),
        factors: {
          opponent: {
            label: "Opponent",
            detail: `Power rank #${opponentRank}`,
            assessment:
              opponentRank <= 5
                ? "disadvantage"
                : opponentRank >= 13
                  ? "favourable"
                  : "even",
          },
          venue: {
            label: "Venue",
            detail: `${venueType[0].toUpperCase()}${venueType.slice(1)} · ${game.venue}`,
            assessment:
              venueAdvantage > 0
                ? "favourable"
                : venueAdvantage < 0
                  ? "disadvantage"
                  : "even",
          },
          rest: {
            label: "Rest",
            detail:
              selfRest === null || opponentRest === null
                ? "Season opener"
                : `${formatRest(selfRest)} vs ${formatRest(opponentRest)}`,
            assessment: restAssessment,
          },
          travel: {
            label: "Travel",
            detail: `${roundedDistance(selfTravel).toLocaleString()} km vs ${roundedDistance(opponentTravel).toLocaleString()} km`,
            assessment: travelAssessment,
          },
        },
      });
    }
  }

  for (const teamFixtures of Object.values(fixtures)) {
    teamFixtures.sort(
      (a, b) => a.round - b.round || String(a.kickoff).localeCompare(String(b.kickoff))
    );
  }

  const summaries = ladder.map((entry) => {
    const teamFixtures = fixtures[entry.team.id] || [];
    const scheduleDifficulty = teamFixtures.length
      ? Math.round(
          teamFixtures.reduce((total, fixture) => total + fixture.difficulty, 0) /
            teamFixtures.length
        )
      : 0;
    return {
      position: entry.position,
      team: entry.team,
      powerRank: powerRanks.get(entry.team.id) || NRL_TEAMS.length,
      remainingGames: teamFixtures.length,
      scheduleDifficulty,
      difficultyLabel: teamFixtures.length ? difficultyLabel(scheduleDifficulty) : "Complete",
      scheduleRank: 0,
      projectedWins:
        Math.round(
          teamFixtures.reduce((total, fixture) => total + fixture.winChance / 100, 0) * 10
        ) / 10,
    };
  });

  const scheduleRanks = new Map(
    [...summaries]
      .sort((a, b) => b.scheduleDifficulty - a.scheduleDifficulty)
      .map((summary, index) => [summary.team.id, index + 1])
  );
  for (const summary of summaries) {
    summary.scheduleRank = scheduleRanks.get(summary.team.id) || summaries.length;
  }

  return {
    season,
    model: {
      gamesProcessed,
      seasons: `2022-${season}`,
      includesFinals: true,
    },
    summaries: summaries.sort((a, b) => a.position - b.position),
    fixtures,
  };
}
