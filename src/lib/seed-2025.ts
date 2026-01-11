/**
 * 2025 NRL Season Data Import
 * Source: Rugby League Project (rugbyleagueproject.org)
 */

import { sql, generateId } from "./database";
import type { GameStatus } from "./types";

// Map team names from source to our team IDs
const TEAM_NAME_MAP: Record<string, string> = {
  Brisbane: "bri",
  Canberra: "can",
  Canterbury: "cby",
  Cronulla: "cro",
  Dolphins: "dol",
  "Gold Coast": "gld",
  Manly: "man",
  Melbourne: "mel",
  Newcastle: "new",
  "North Qld": "nql",
  Warriors: "nzl",
  Parramatta: "par",
  Penrith: "pen",
  "South Sydney": "sou",
  "St Geo Illa": "sti",
  Sydney: "syd",
  "Wests Tigers": "wst",
};

interface RawGame {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

interface RoundData {
  round: number;
  games: RawGame[];
}

// 2025 NRL Season Results (scraped from Rugby League Project)
const SEASON_2025: RoundData[] = [
  {
    round: 1,
    games: [
      { homeTeam: "Canberra", awayTeam: "Warriors", homeScore: 30, awayScore: 8 },
      { homeTeam: "Penrith", awayTeam: "Cronulla", homeScore: 28, awayScore: 22 },
      { homeTeam: "Sydney", awayTeam: "Brisbane", homeScore: 14, awayScore: 50 },
      { homeTeam: "Wests Tigers", awayTeam: "Newcastle", homeScore: 8, awayScore: 10 },
      { homeTeam: "South Sydney", awayTeam: "Dolphins", homeScore: 16, awayScore: 14 },
      { homeTeam: "St Geo Illa", awayTeam: "Canterbury", homeScore: 20, awayScore: 28 },
      { homeTeam: "Manly", awayTeam: "North Qld", homeScore: 42, awayScore: 12 },
      { homeTeam: "Melbourne", awayTeam: "Parramatta", homeScore: 56, awayScore: 18 },
    ],
  },
  {
    round: 2,
    games: [
      { homeTeam: "Newcastle", awayTeam: "Dolphins", homeScore: 26, awayScore: 12 },
      { homeTeam: "Warriors", awayTeam: "Manly", homeScore: 36, awayScore: 16 },
      { homeTeam: "Penrith", awayTeam: "Sydney", homeScore: 32, awayScore: 38 },
      { homeTeam: "St Geo Illa", awayTeam: "South Sydney", homeScore: 24, awayScore: 25 },
      { homeTeam: "North Qld", awayTeam: "Cronulla", homeScore: 12, awayScore: 36 },
      { homeTeam: "Canberra", awayTeam: "Brisbane", homeScore: 32, awayScore: 22 },
      { homeTeam: "Parramatta", awayTeam: "Wests Tigers", homeScore: 6, awayScore: 32 },
      { homeTeam: "Canterbury", awayTeam: "Gold Coast", homeScore: 40, awayScore: 24 },
    ],
  },
  {
    round: 3,
    games: [
      { homeTeam: "Melbourne", awayTeam: "Penrith", homeScore: 30, awayScore: 24 },
      { homeTeam: "Warriors", awayTeam: "Sydney", homeScore: 14, awayScore: 6 },
      { homeTeam: "Brisbane", awayTeam: "North Qld", homeScore: 26, awayScore: 16 },
      { homeTeam: "Cronulla", awayTeam: "South Sydney", homeScore: 27, awayScore: 12 },
      { homeTeam: "Dolphins", awayTeam: "Wests Tigers", homeScore: 18, awayScore: 30 },
      { homeTeam: "Gold Coast", awayTeam: "Newcastle", homeScore: 26, awayScore: 6 },
      { homeTeam: "Parramatta", awayTeam: "Canterbury", homeScore: 8, awayScore: 16 },
      { homeTeam: "Manly", awayTeam: "Canberra", homeScore: 40, awayScore: 12 },
    ],
  },
  {
    round: 4,
    games: [
      { homeTeam: "South Sydney", awayTeam: "Penrith", homeScore: 28, awayScore: 18 },
      { homeTeam: "Sydney", awayTeam: "Gold Coast", homeScore: 12, awayScore: 30 },
      { homeTeam: "Dolphins", awayTeam: "Brisbane", homeScore: 12, awayScore: 20 },
      { homeTeam: "St Geo Illa", awayTeam: "Melbourne", homeScore: 14, awayScore: 8 },
      { homeTeam: "North Qld", awayTeam: "Canberra", homeScore: 30, awayScore: 20 },
      { homeTeam: "Cronulla", awayTeam: "Canterbury", homeScore: 6, awayScore: 20 },
      { homeTeam: "Manly", awayTeam: "Parramatta", homeScore: 26, awayScore: 12 },
      { homeTeam: "Wests Tigers", awayTeam: "Warriors", homeScore: 24, awayScore: 26 },
    ],
  },
  {
    round: 5,
    games: [
      { homeTeam: "Canberra", awayTeam: "Cronulla", homeScore: 24, awayScore: 20 },
      { homeTeam: "Penrith", awayTeam: "North Qld", homeScore: 18, awayScore: 22 },
      { homeTeam: "South Sydney", awayTeam: "Sydney", homeScore: 20, awayScore: 14 },
      { homeTeam: "Parramatta", awayTeam: "St Geo Illa", homeScore: 23, awayScore: 22 },
      { homeTeam: "Gold Coast", awayTeam: "Dolphins", homeScore: 10, awayScore: 36 },
      { homeTeam: "Brisbane", awayTeam: "Wests Tigers", homeScore: 46, awayScore: 24 },
      { homeTeam: "Manly", awayTeam: "Melbourne", homeScore: 24, awayScore: 48 },
      { homeTeam: "Canterbury", awayTeam: "Newcastle", homeScore: 20, awayScore: 0 },
    ],
  },
  {
    round: 6,
    games: [
      { homeTeam: "Dolphins", awayTeam: "Penrith", homeScore: 30, awayScore: 12 },
      { homeTeam: "St Geo Illa", awayTeam: "Gold Coast", homeScore: 38, awayScore: 16 },
      { homeTeam: "Brisbane", awayTeam: "Sydney", homeScore: 16, awayScore: 26 },
      { homeTeam: "Cronulla", awayTeam: "Manly", homeScore: 24, awayScore: 18 },
      { homeTeam: "South Sydney", awayTeam: "North Qld", homeScore: 16, awayScore: 24 },
      { homeTeam: "Parramatta", awayTeam: "Canberra", homeScore: 12, awayScore: 50 },
      { homeTeam: "Melbourne", awayTeam: "Warriors", homeScore: 42, awayScore: 14 },
      { homeTeam: "Newcastle", awayTeam: "Wests Tigers", homeScore: 4, awayScore: 20 },
    ],
  },
  {
    round: 7,
    games: [
      { homeTeam: "Manly", awayTeam: "St Geo Illa", homeScore: 18, awayScore: 20 },
      { homeTeam: "Canterbury", awayTeam: "South Sydney", homeScore: 32, awayScore: 0 },
      { homeTeam: "Dolphins", awayTeam: "Melbourne", homeScore: 42, awayScore: 22 },
      { homeTeam: "Warriors", awayTeam: "Brisbane", homeScore: 20, awayScore: 18 },
      { homeTeam: "Sydney", awayTeam: "Penrith", homeScore: 12, awayScore: 40 },
      { homeTeam: "Gold Coast", awayTeam: "Canberra", homeScore: 20, awayScore: 30 },
      { homeTeam: "Newcastle", awayTeam: "Cronulla", homeScore: 14, awayScore: 34 },
      { homeTeam: "Wests Tigers", awayTeam: "Parramatta", homeScore: 22, awayScore: 38 },
    ],
  },
  {
    round: 8,
    games: [
      { homeTeam: "Brisbane", awayTeam: "Canterbury", homeScore: 42, awayScore: 18 },
      { homeTeam: "Sydney", awayTeam: "St Geo Illa", homeScore: 46, awayScore: 18 },
      { homeTeam: "Warriors", awayTeam: "Newcastle", homeScore: 26, awayScore: 12 },
      { homeTeam: "Melbourne", awayTeam: "South Sydney", homeScore: 24, awayScore: 16 },
      { homeTeam: "North Qld", awayTeam: "Gold Coast", homeScore: 50, awayScore: 18 },
      { homeTeam: "Penrith", awayTeam: "Manly", homeScore: 10, awayScore: 26 },
      { homeTeam: "Canberra", awayTeam: "Dolphins", homeScore: 40, awayScore: 28 },
      { homeTeam: "Wests Tigers", awayTeam: "Cronulla", homeScore: 20, awayScore: 18 },
    ],
  },
  {
    round: 9,
    games: [
      { homeTeam: "Cronulla", awayTeam: "Parramatta", homeScore: 28, awayScore: 18 },
      { homeTeam: "Sydney", awayTeam: "Dolphins", homeScore: 36, awayScore: 26 },
      { homeTeam: "South Sydney", awayTeam: "Newcastle", homeScore: 4, awayScore: 30 },
      { homeTeam: "Warriors", awayTeam: "North Qld", homeScore: 30, awayScore: 26 },
      { homeTeam: "Wests Tigers", awayTeam: "St Geo Illa", homeScore: 34, awayScore: 28 },
      { homeTeam: "Gold Coast", awayTeam: "Canterbury", homeScore: 18, awayScore: 38 },
      { homeTeam: "Penrith", awayTeam: "Brisbane", homeScore: 32, awayScore: 8 },
      { homeTeam: "Melbourne", awayTeam: "Canberra", homeScore: 18, awayScore: 20 },
    ],
  },
  {
    round: 10,
    games: [
      { homeTeam: "Parramatta", awayTeam: "Dolphins", homeScore: 16, awayScore: 20 },
      { homeTeam: "Newcastle", awayTeam: "Gold Coast", homeScore: 20, awayScore: 24 },
      { homeTeam: "South Sydney", awayTeam: "Brisbane", homeScore: 22, awayScore: 14 },
      { homeTeam: "Canberra", awayTeam: "Canterbury", homeScore: 20, awayScore: 32 },
      { homeTeam: "St Geo Illa", awayTeam: "Warriors", homeScore: 14, awayScore: 15 },
      { homeTeam: "North Qld", awayTeam: "Penrith", homeScore: 30, awayScore: 30 },
      { homeTeam: "Melbourne", awayTeam: "Wests Tigers", homeScore: 64, awayScore: 0 },
      { homeTeam: "Manly", awayTeam: "Cronulla", homeScore: 14, awayScore: 30 },
    ],
  },
  {
    round: 11,
    games: [
      { homeTeam: "Newcastle", awayTeam: "Parramatta", homeScore: 6, awayScore: 28 },
      { homeTeam: "Canterbury", awayTeam: "Sydney", homeScore: 24, awayScore: 20 },
      { homeTeam: "Dolphins", awayTeam: "Warriors", homeScore: 12, awayScore: 16 },
      { homeTeam: "North Qld", awayTeam: "Manly", homeScore: 6, awayScore: 24 },
      { homeTeam: "Cronulla", awayTeam: "Melbourne", homeScore: 31, awayScore: 26 },
      { homeTeam: "Brisbane", awayTeam: "St Geo Illa", homeScore: 26, awayScore: 30 },
      { homeTeam: "Canberra", awayTeam: "Gold Coast", homeScore: 40, awayScore: 24 },
      { homeTeam: "Wests Tigers", awayTeam: "South Sydney", homeScore: 12, awayScore: 22 },
    ],
  },
  {
    round: 12,
    games: [
      { homeTeam: "Canterbury", awayTeam: "Dolphins", homeScore: 8, awayScore: 44 },
      { homeTeam: "Parramatta", awayTeam: "Manly", homeScore: 30, awayScore: 10 },
      { homeTeam: "Penrith", awayTeam: "Newcastle", homeScore: 6, awayScore: 25 },
      { homeTeam: "Sydney", awayTeam: "Cronulla", homeScore: 42, awayScore: 16 },
      { homeTeam: "Warriors", awayTeam: "Canberra", homeScore: 10, awayScore: 16 },
    ],
  },
  {
    round: 13,
    games: [
      { homeTeam: "St Geo Illa", awayTeam: "Newcastle", homeScore: 20, awayScore: 6 },
      { homeTeam: "Gold Coast", awayTeam: "Melbourne", homeScore: 16, awayScore: 28 },
      { homeTeam: "North Qld", awayTeam: "Wests Tigers", homeScore: 32, awayScore: 28 },
      { homeTeam: "Manly", awayTeam: "Brisbane", homeScore: 34, awayScore: 6 },
      { homeTeam: "South Sydney", awayTeam: "Warriors", homeScore: 30, awayScore: 36 },
      { homeTeam: "Penrith", awayTeam: "Parramatta", homeScore: 18, awayScore: 10 },
      { homeTeam: "Sydney", awayTeam: "Canberra", homeScore: 24, awayScore: 26 },
    ],
  },
  {
    round: 14,
    games: [
      { homeTeam: "Newcastle", awayTeam: "Manly", homeScore: 26, awayScore: 22 },
      { homeTeam: "Melbourne", awayTeam: "North Qld", homeScore: 38, awayScore: 14 },
      { homeTeam: "Dolphins", awayTeam: "St Geo Illa", homeScore: 56, awayScore: 6 },
      { homeTeam: "Cronulla", awayTeam: "Warriors", homeScore: 10, awayScore: 40 },
      { homeTeam: "Brisbane", awayTeam: "Gold Coast", homeScore: 44, awayScore: 14 },
      { homeTeam: "Canberra", awayTeam: "South Sydney", homeScore: 36, awayScore: 12 },
      { homeTeam: "Wests Tigers", awayTeam: "Penrith", homeScore: 14, awayScore: 18 },
      { homeTeam: "Canterbury", awayTeam: "Parramatta", homeScore: 30, awayScore: 12 },
    ],
  },
  {
    round: 15,
    games: [
      { homeTeam: "Cronulla", awayTeam: "St Geo Illa", homeScore: 30, awayScore: 18 },
      { homeTeam: "Gold Coast", awayTeam: "Manly", homeScore: 28, awayScore: 8 },
      { homeTeam: "Newcastle", awayTeam: "Sydney", homeScore: 8, awayScore: 12 },
      { homeTeam: "North Qld", awayTeam: "Dolphins", homeScore: 4, awayScore: 58 },
      { homeTeam: "South Sydney", awayTeam: "Canterbury", homeScore: 18, awayScore: 24 },
    ],
  },
  {
    round: 16,
    games: [
      { homeTeam: "Wests Tigers", awayTeam: "Canberra", homeScore: 12, awayScore: 16 },
      { homeTeam: "Warriors", awayTeam: "Penrith", homeScore: 18, awayScore: 28 },
      { homeTeam: "Dolphins", awayTeam: "Newcastle", homeScore: 20, awayScore: 26 },
      { homeTeam: "South Sydney", awayTeam: "Melbourne", homeScore: 24, awayScore: 25 },
      { homeTeam: "Brisbane", awayTeam: "Cronulla", homeScore: 34, awayScore: 28 },
      { homeTeam: "Sydney", awayTeam: "North Qld", homeScore: 42, awayScore: 8 },
      { homeTeam: "Parramatta", awayTeam: "Gold Coast", homeScore: 36, awayScore: 20 },
    ],
  },
  {
    round: 17,
    games: [
      { homeTeam: "Penrith", awayTeam: "Canterbury", homeScore: 8, awayScore: 6 },
      { homeTeam: "Manly", awayTeam: "Wests Tigers", homeScore: 28, awayScore: 10 },
      { homeTeam: "Newcastle", awayTeam: "Canberra", homeScore: 18, awayScore: 22 },
      { homeTeam: "Brisbane", awayTeam: "Warriors", homeScore: 26, awayScore: 12 },
      { homeTeam: "St Geo Illa", awayTeam: "Parramatta", homeScore: 34, awayScore: 20 },
      { homeTeam: "Dolphins", awayTeam: "South Sydney", homeScore: 50, awayScore: 28 },
      { homeTeam: "Melbourne", awayTeam: "Cronulla", homeScore: 30, awayScore: 6 },
      { homeTeam: "Gold Coast", awayTeam: "North Qld", homeScore: 24, awayScore: 30 },
    ],
  },
  {
    round: 18,
    games: [
      { homeTeam: "Canterbury", awayTeam: "Brisbane", homeScore: 18, awayScore: 22 },
      { homeTeam: "Canberra", awayTeam: "St Geo Illa", homeScore: 28, awayScore: 24 },
      { homeTeam: "North Qld", awayTeam: "Melbourne", homeScore: 20, awayScore: 26 },
      { homeTeam: "Sydney", awayTeam: "Wests Tigers", homeScore: 28, awayScore: 30 },
      { homeTeam: "Manly", awayTeam: "South Sydney", homeScore: 30, awayScore: 12 },
    ],
  },
  {
    round: 19,
    games: [
      { homeTeam: "Cronulla", awayTeam: "Dolphins", homeScore: 24, awayScore: 12 },
      { homeTeam: "Newcastle", awayTeam: "Melbourne", homeScore: 14, awayScore: 32 },
      { homeTeam: "St Geo Illa", awayTeam: "Sydney", homeScore: 24, awayScore: 31 },
      { homeTeam: "North Qld", awayTeam: "Canterbury", homeScore: 8, awayScore: 12 },
      { homeTeam: "Warriors", awayTeam: "Wests Tigers", homeScore: 34, awayScore: 14 },
      { homeTeam: "Parramatta", awayTeam: "Penrith", homeScore: 10, awayScore: 32 },
      { homeTeam: "Gold Coast", awayTeam: "Brisbane", homeScore: 14, awayScore: 26 },
    ],
  },
  {
    round: 20,
    games: [
      { homeTeam: "Dolphins", awayTeam: "North Qld", homeScore: 43, awayScore: 24 },
      { homeTeam: "Cronulla", awayTeam: "Sydney", homeScore: 31, awayScore: 18 },
      { homeTeam: "Penrith", awayTeam: "South Sydney", homeScore: 30, awayScore: 10 },
      { homeTeam: "Canberra", awayTeam: "Parramatta", homeScore: 40, awayScore: 16 },
      { homeTeam: "Canterbury", awayTeam: "St Geo Illa", homeScore: 20, awayScore: 18 },
      { homeTeam: "Melbourne", awayTeam: "Manly", homeScore: 16, awayScore: 18 },
      { homeTeam: "Wests Tigers", awayTeam: "Gold Coast", homeScore: 21, awayScore: 20 },
      { homeTeam: "Newcastle", awayTeam: "Warriors", homeScore: 15, awayScore: 20 },
    ],
  },
  {
    round: 21,
    games: [
      { homeTeam: "Sydney", awayTeam: "Melbourne", homeScore: 30, awayScore: 34 },
      { homeTeam: "North Qld", awayTeam: "St Geo Illa", homeScore: 38, awayScore: 32 },
      { homeTeam: "Brisbane", awayTeam: "Parramatta", homeScore: 20, awayScore: 22 },
      { homeTeam: "Warriors", awayTeam: "Gold Coast", homeScore: 16, awayScore: 24 },
      { homeTeam: "Penrith", awayTeam: "Wests Tigers", homeScore: 36, awayScore: 2 },
      { homeTeam: "South Sydney", awayTeam: "Cronulla", homeScore: 12, awayScore: 14 },
      { homeTeam: "Canberra", awayTeam: "Newcastle", homeScore: 44, awayScore: 18 },
      { homeTeam: "Canterbury", awayTeam: "Manly", homeScore: 42, awayScore: 4 },
    ],
  },
  {
    round: 22,
    games: [
      { homeTeam: "Parramatta", awayTeam: "Melbourne", homeScore: 10, awayScore: 16 },
      { homeTeam: "Warriors", awayTeam: "Dolphins", homeScore: 18, awayScore: 20 },
      { homeTeam: "Brisbane", awayTeam: "South Sydney", homeScore: 60, awayScore: 14 },
      { homeTeam: "Gold Coast", awayTeam: "Penrith", homeScore: 26, awayScore: 30 },
      { homeTeam: "St Geo Illa", awayTeam: "Canberra", homeScore: 18, awayScore: 12 },
      { homeTeam: "Manly", awayTeam: "Sydney", homeScore: 4, awayScore: 20 },
      { homeTeam: "Wests Tigers", awayTeam: "Canterbury", homeScore: 28, awayScore: 14 },
      { homeTeam: "Cronulla", awayTeam: "North Qld", homeScore: 32, awayScore: 12 },
    ],
  },
  {
    round: 23,
    games: [
      { homeTeam: "Melbourne", awayTeam: "Brisbane", homeScore: 22, awayScore: 2 },
      { homeTeam: "Newcastle", awayTeam: "Penrith", homeScore: 12, awayScore: 48 },
      { homeTeam: "Canberra", awayTeam: "Manly", homeScore: 28, awayScore: 12 },
      { homeTeam: "St Geo Illa", awayTeam: "Cronulla", homeScore: 22, awayScore: 14 },
      { homeTeam: "Dolphins", awayTeam: "Sydney", homeScore: 12, awayScore: 64 },
      { homeTeam: "Canterbury", awayTeam: "Warriors", homeScore: 32, awayScore: 14 },
      { homeTeam: "Gold Coast", awayTeam: "South Sydney", homeScore: 18, awayScore: 20 },
      { homeTeam: "Parramatta", awayTeam: "North Qld", homeScore: 19, awayScore: 18 },
    ],
  },
  {
    round: 24,
    games: [
      { homeTeam: "Penrith", awayTeam: "Melbourne", homeScore: 18, awayScore: 22 },
      { homeTeam: "Warriors", awayTeam: "St Geo Illa", homeScore: 14, awayScore: 10 },
      { homeTeam: "Sydney", awayTeam: "Canterbury", homeScore: 32, awayScore: 12 },
      { homeTeam: "Cronulla", awayTeam: "Gold Coast", homeScore: 54, awayScore: 22 },
      { homeTeam: "Brisbane", awayTeam: "Dolphins", homeScore: 38, awayScore: 28 },
      { homeTeam: "South Sydney", awayTeam: "Parramatta", homeScore: 20, awayScore: 16 },
      { homeTeam: "Wests Tigers", awayTeam: "Manly", homeScore: 26, awayScore: 12 },
      { homeTeam: "North Qld", awayTeam: "Newcastle", homeScore: 38, awayScore: 4 },
    ],
  },
  {
    round: 25,
    games: [
      { homeTeam: "South Sydney", awayTeam: "St Geo Illa", homeScore: 40, awayScore: 0 },
      { homeTeam: "Penrith", awayTeam: "Canberra", homeScore: 16, awayScore: 20 },
      { homeTeam: "Melbourne", awayTeam: "Canterbury", homeScore: 20, awayScore: 14 },
      { homeTeam: "Manly", awayTeam: "Dolphins", homeScore: 58, awayScore: 30 },
      { homeTeam: "Gold Coast", awayTeam: "Warriors", homeScore: 18, awayScore: 32 },
      { homeTeam: "Parramatta", awayTeam: "Sydney", homeScore: 30, awayScore: 10 },
      { homeTeam: "Newcastle", awayTeam: "Brisbane", homeScore: 12, awayScore: 46 },
      { homeTeam: "Wests Tigers", awayTeam: "North Qld", homeScore: 28, awayScore: 34 },
    ],
  },
  {
    round: 26,
    games: [
      { homeTeam: "Canterbury", awayTeam: "Penrith", homeScore: 28, awayScore: 4 },
      { homeTeam: "Warriors", awayTeam: "Parramatta", homeScore: 22, awayScore: 26 },
      { homeTeam: "Melbourne", awayTeam: "Sydney", homeScore: 10, awayScore: 40 },
      { homeTeam: "Canberra", awayTeam: "Wests Tigers", homeScore: 24, awayScore: 10 },
      { homeTeam: "St Geo Illa", awayTeam: "Manly", homeScore: 24, awayScore: 40 },
      { homeTeam: "North Qld", awayTeam: "Brisbane", homeScore: 30, awayScore: 38 },
      { homeTeam: "Cronulla", awayTeam: "Newcastle", homeScore: 40, awayScore: 16 },
      { homeTeam: "Dolphins", awayTeam: "Gold Coast", homeScore: 36, awayScore: 30 },
    ],
  },
  {
    round: 27,
    games: [
      { homeTeam: "Brisbane", awayTeam: "Melbourne", homeScore: 30, awayScore: 14 },
      { homeTeam: "Manly", awayTeam: "Warriors", homeScore: 27, awayScore: 26 },
      { homeTeam: "Sydney", awayTeam: "South Sydney", homeScore: 36, awayScore: 6 },
      { homeTeam: "St Geo Illa", awayTeam: "Penrith", homeScore: 20, awayScore: 40 },
      { homeTeam: "Gold Coast", awayTeam: "Wests Tigers", homeScore: 36, awayScore: 28 },
      { homeTeam: "Canterbury", awayTeam: "Cronulla", homeScore: 6, awayScore: 24 },
      { homeTeam: "Dolphins", awayTeam: "Canberra", homeScore: 62, awayScore: 24 },
      { homeTeam: "Parramatta", awayTeam: "Newcastle", homeScore: 66, awayScore: 10 },
    ],
  },
];

/**
 * Import all 2025 season games into the database
 */
export async function seed2025Season(): Promise<void> {
  let totalGames = 0;

  for (const roundData of SEASON_2025) {
    for (const game of roundData.games) {
      const homeTeamId = TEAM_NAME_MAP[game.homeTeam];
      const awayTeamId = TEAM_NAME_MAP[game.awayTeam];

      if (!homeTeamId || !awayTeamId) {
        console.error(`Unknown team: ${game.homeTeam} or ${game.awayTeam}`);
        continue;
      }

      const id = generateId();
      const status: GameStatus = "final";
      const kickoff = `2025-03-${String(roundData.round).padStart(2, "0")}T19:00:00Z`;

      await sql`
        INSERT INTO games (id, season, round, home_team_id, away_team_id, home_score, away_score, venue, kickoff, status, minute)
        VALUES (${id}, 2025, ${roundData.round}, ${homeTeamId}, ${awayTeamId},
                ${game.homeScore}, ${game.awayScore}, 'TBD', ${kickoff}, ${status}, NULL)
        ON CONFLICT (id) DO NOTHING
      `;
      totalGames++;
    }
  }

  console.log(`Imported ${totalGames} games for 2025 NRL season`);
}

// Export for API use
export { SEASON_2025, TEAM_NAME_MAP };
