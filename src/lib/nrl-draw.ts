import {
  calculateLadderFromGames,
  initializeDatabase,
  replaceGamesForRound,
  saveLadderSnapshot,
} from "./queries";
import { NRL_TEAMS } from "./teams";
import type { Game, GameStatus } from "./types";

const NRL_DRAW_URL = "https://www.nrl.com/draw/";
const NRL_PREMIERSHIP_COMPETITION_ID = 111;

const THEME_KEY_TO_TEAM_ID: Record<string, string> = {
  broncos: "bri",
  raiders: "can",
  bulldogs: "cby",
  sharks: "cro",
  dolphins: "dol",
  titans: "gld",
  "sea-eagles": "man",
  storm: "mel",
  knights: "new",
  cowboys: "nql",
  warriors: "nzl",
  eels: "par",
  panthers: "pen",
  rabbitohs: "sou",
  dragons: "sti",
  roosters: "syd",
  "wests-tigers": "wst",
};

const NICKNAME_TO_TEAM_ID: Record<string, string> = {
  Broncos: "bri",
  Raiders: "can",
  Bulldogs: "cby",
  Sharks: "cro",
  Dolphins: "dol",
  Titans: "gld",
  "Sea Eagles": "man",
  Storm: "mel",
  Knights: "new",
  Cowboys: "nql",
  Warriors: "nzl",
  Eels: "par",
  Panthers: "pen",
  Rabbitohs: "sou",
  Dragons: "sti",
  Roosters: "syd",
  "Wests Tigers": "wst",
};

interface NrlDrawData {
  byes?: Array<{
    roundTitle: string;
    teamNickName: string;
  }>;
  filterRounds?: Array<{ name: string; value: number }>;
  fixtures: NrlFixture[];
  selectedRoundId: number;
  selectedSeasonId: number;
}

interface NrlFixture {
  clock?: {
    gameTime?: string;
    kickOffTimeLong?: string;
  };
  awayTeam: NrlFixtureTeam;
  homeTeam: NrlFixtureTeam;
  matchCentreUrl?: string;
  matchMode?: string;
  matchState?: string;
  roundTitle: string;
  type: string;
  venue?: string;
  venueCity?: string;
}

interface NrlFixtureTeam {
  nickName: string;
  score?: number | null;
  theme?: {
    key?: string;
  };
}

export interface OfficialDrawSyncResult {
  season: number;
  syncedRounds: number[];
  gamesPerRound: Record<number, number>;
  latestFinalRound: number;
  totalGames: number;
}

function decodeHtmlAttribute(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function extractDrawData(html: string): NrlDrawData {
  const match = html.match(/id="vue-draw"[\s\S]*?\sq-data="([^"]+)"/);
  if (!match) {
    throw new Error("Could not find NRL draw q-data payload");
  }

  return JSON.parse(decodeHtmlAttribute(match[1])) as NrlDrawData;
}

function getRoundNumber(roundTitle: string): number {
  const match = roundTitle.match(/Round\s+(\d+)/i);
  if (!match) {
    throw new Error(`Could not parse round title "${roundTitle}"`);
  }

  return Number(match[1]);
}

function getTeamId(team: NrlFixtureTeam): string {
  const themeKey = team.theme?.key;
  const teamId =
    (themeKey ? THEME_KEY_TO_TEAM_ID[themeKey] : undefined) ||
    NICKNAME_TO_TEAM_ID[team.nickName];

  if (!teamId || !NRL_TEAMS.some((candidate) => candidate.id === teamId)) {
    throw new Error(
      `Could not map NRL team "${team.nickName}" (${themeKey || "no theme"})`
    );
  }

  return teamId;
}

function getGameStatus(fixture: NrlFixture): GameStatus {
  const matchState = fixture.matchState?.toLowerCase();
  const matchMode = fixture.matchMode?.toLowerCase();

  if (matchState === "fulltime" || matchMode === "post") {
    return "final";
  }

  if (
    matchState === "inprogress" ||
    matchState === "halftime" ||
    matchState === "paused" ||
    matchMode === "live"
  ) {
    return "live";
  }

  return "scheduled";
}

function getGameMinute(fixture: NrlFixture): number | undefined {
  const gameTime = fixture.clock?.gameTime;
  if (!gameTime) return undefined;

  const minute = Number(gameTime.split(":")[0]);
  return Number.isFinite(minute) ? minute : undefined;
}

async function fetchOfficialDrawData(
  season: number,
  round?: number
): Promise<NrlDrawData> {
  const params = new URLSearchParams({
    competition: String(NRL_PREMIERSHIP_COMPETITION_ID),
    season: String(season),
  });

  if (round) {
    params.set("round", String(round));
  }

  const response = await fetch(`${NRL_DRAW_URL}?${params}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`NRL draw fetch failed with HTTP ${response.status}`);
  }

  return extractDrawData(await response.text());
}

export async function fetchOfficialDrawGames(
  season: number,
  round?: number
): Promise<{ season: number; round: number; games: Omit<Game, "id">[] }> {
  const data = await fetchOfficialDrawData(season, round);
  const snapshotSeason = Number(data.selectedSeasonId);
  const snapshotRound = Number(data.selectedRoundId);

  const games = data.fixtures
    .filter((fixture) => fixture.type === "Match")
    .map((fixture) => {
      const fixtureRound = getRoundNumber(fixture.roundTitle || `Round ${snapshotRound}`);
      const status = getGameStatus(fixture);
      const homeScore = fixture.homeTeam.score ?? null;
      const awayScore = fixture.awayTeam.score ?? null;

      return {
        season: snapshotSeason,
        round: fixtureRound,
        homeTeamId: getTeamId(fixture.homeTeam),
        awayTeamId: getTeamId(fixture.awayTeam),
        homeScore: status === "scheduled" ? null : homeScore,
        awayScore: status === "scheduled" ? null : awayScore,
        venue: fixture.venue || fixture.venueCity || "TBD",
        kickoff: fixture.clock?.kickOffTimeLong || null,
        status,
        minute: status === "live" ? getGameMinute(fixture) : undefined,
      };
    });

  return {
    season: snapshotSeason,
    round: snapshotRound,
    games,
  };
}

export async function syncOfficialDrawGames(
  season: number = new Date().getFullYear(),
  options: { allAvailableRounds?: boolean; round?: number } = {}
): Promise<OfficialDrawSyncResult> {
  const firstRound = await fetchOfficialDrawGames(season, options.round);
  const roundsToSync = new Set<number>([firstRound.round]);

  if (options.allAvailableRounds && !options.round) {
    const data = await fetchOfficialDrawData(season);
    for (const round of data.filterRounds || []) {
      roundsToSync.add(round.value);
    }
  }

  const snapshots = [];
  for (const round of [...roundsToSync].sort((a, b) => a - b)) {
    snapshots.push(
      round === firstRound.round
        ? firstRound
        : await fetchOfficialDrawGames(season, round)
    );
  }

  await initializeDatabase();

  const syncedRounds: number[] = [];
  const gamesPerRound: Record<number, number> = {};
  const roundsToSnapshot = new Set<number>();
  let latestFinalRound = 1;
  let totalGames = 0;

  for (const snapshot of snapshots) {
    await replaceGamesForRound(snapshot.season, snapshot.round, snapshot.games);
    syncedRounds.push(snapshot.round);
    gamesPerRound[snapshot.round] = snapshot.games.length;
    totalGames += snapshot.games.length;

    if (snapshot.games.some((game) => game.status === "final")) {
      latestFinalRound = Math.max(latestFinalRound, snapshot.round);
      roundsToSnapshot.add(snapshot.round);
    }
  }

  for (const round of roundsToSnapshot) {
    const ladder = await calculateLadderFromGames(season, round);
    await saveLadderSnapshot(ladder);
  }

  return {
    season,
    syncedRounds,
    gamesPerRound,
    latestFinalRound,
    totalGames,
  };
}
