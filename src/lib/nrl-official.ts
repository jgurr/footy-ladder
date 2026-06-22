import { initializeDatabase, saveLadderSnapshot } from "./queries";
import { assignPositions, sortLadder } from "./calculations";
import { NRL_TEAMS } from "./teams";
import type { LadderEntry, Team } from "./types";

const NRL_LADDER_URL = "https://www.nrl.com/ladder/";
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

interface NrlLadderData {
  filterRounds?: Array<{ name: string; value: number }>;
  positions: Array<{
    stats: {
      played: number;
      wins: number;
      drawn: number;
      lost: number;
      byes: number;
      "points for": number;
      "points against": number;
      "points difference": number;
      points: number;
    };
    teamNickname: string;
    theme?: {
      key?: string;
    };
  }>;
  selectedRoundId: number;
  selectedSeasonId: number;
}

export interface OfficialLadderSnapshot {
  season: number;
  round: number;
  entries: LadderEntry[];
}

export interface OfficialLadderSyncResult {
  season: number;
  syncedRounds: number[];
  latestRound: number;
  teamsPerRound: number;
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

function extractLadderData(html: string): NrlLadderData {
  const match = html.match(/id="vue-ladder"[\s\S]*?\sq-data="([^"]+)"/);
  if (!match) {
    throw new Error("Could not find NRL ladder q-data payload");
  }

  return JSON.parse(decodeHtmlAttribute(match[1])) as NrlLadderData;
}

function getTeamForNrlPosition(position: NrlLadderData["positions"][number]): Team {
  const themeKey = position.theme?.key;
  const teamId =
    (themeKey ? THEME_KEY_TO_TEAM_ID[themeKey] : undefined) ||
    NICKNAME_TO_TEAM_ID[position.teamNickname];

  const team = NRL_TEAMS.find((candidate) => candidate.id === teamId);
  if (!team) {
    throw new Error(
      `Could not map NRL team "${position.teamNickname}" (${themeKey || "no theme"})`
    );
  }

  return team;
}

async function fetchOfficialLadderData(
  season: number,
  round?: number
): Promise<NrlLadderData> {
  const params = new URLSearchParams({
    competition: String(NRL_PREMIERSHIP_COMPETITION_ID),
    season: String(season),
  });

  if (round) {
    params.set("round", String(round));
  }

  const response = await fetch(`${NRL_LADDER_URL}?${params}`, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`NRL ladder fetch failed with HTTP ${response.status}`);
  }

  return extractLadderData(await response.text());
}

export async function fetchOfficialLadderSnapshot(
  season: number,
  round?: number
): Promise<OfficialLadderSnapshot> {
  const data = await fetchOfficialLadderData(season, round);
  const snapshotRound = data.selectedRoundId;
  const snapshotSeason = data.selectedSeasonId;

  const entries: LadderEntry[] = data.positions.map((position) => {
    const team = getTeamForNrlPosition(position);
    const stats = position.stats;
    const played = Number(stats.played);
    const wins = Number(stats.wins);
    const draws = Number(stats.drawn);
    const losses = Number(stats.lost);
    const pointsFor = Number(stats["points for"]);
    const pointsAgainst = Number(stats["points against"]);
    const differential = Number(stats["points difference"]);
    const nrlPoints = Number(stats.points);

    return {
      team,
      season: snapshotSeason,
      round: snapshotRound,
      played,
      wins,
      losses,
      draws,
      pointsFor,
      pointsAgainst,
      differential,
      winPct: played > 0 ? ((wins + draws * 0.5) / played) * 100 : 0,
      nrlPoints,
      position: 0,
      byesTaken: Number(stats.byes),
    };
  });

  return {
    season: snapshotSeason,
    round: snapshotRound,
    entries: assignPositions(sortLadder(entries)),
  };
}

export async function syncOfficialLadderSnapshots(
  season: number = new Date().getFullYear(),
  options: { allAvailableRounds?: boolean; round?: number } = {}
): Promise<OfficialLadderSyncResult> {
  await initializeDatabase();

  const firstSnapshot = await fetchOfficialLadderSnapshot(season, options.round);
  const roundsToSync = new Set<number>([firstSnapshot.round]);
  const syncedRounds: number[] = [];

  if (options.allAvailableRounds && !options.round) {
    const data = await fetchOfficialLadderData(season);
    for (const round of data.filterRounds || []) {
      roundsToSync.add(round.value);
    }
  }

  for (const round of [...roundsToSync].sort((a, b) => a - b)) {
    const snapshot =
      round === firstSnapshot.round
        ? firstSnapshot
        : await fetchOfficialLadderSnapshot(season, round);
    await saveLadderSnapshot(snapshot.entries);
    syncedRounds.push(snapshot.round);
  }

  return {
    season,
    syncedRounds,
    latestRound: Math.max(...syncedRounds),
    teamsPerRound: firstSnapshot.entries.length,
  };
}
