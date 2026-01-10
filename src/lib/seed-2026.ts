/**
 * 2026 NRL Season Schedule Import
 * Source: NRL.com / Rugby League Zone (rugbyleaguezone.com)
 *
 * Note: Dates are approximate based on round structure.
 * Actual kickoff times will be updated as they become available.
 */

import { getDb, generateId } from "./database";
import type { GameStatus } from "./types";

// Map team names from source to our team IDs
const TEAM_NAME_MAP: Record<string, string> = {
  "Brisbane Broncos": "bri",
  "Canberra Raiders": "can",
  "Canterbury-Bankstown Bulldogs": "cby",
  "Cronulla-Sutherland Sharks": "cro",
  "Dolphins": "dol",
  "Gold Coast Titans": "gld",
  "Manly-Warringah Sea Eagles": "man",
  "Melbourne Storm": "mel",
  "Newcastle Knights": "new",
  "North Queensland Cowboys": "nql",
  "New Zealand Warriors": "nzl",
  "Parramatta Eels": "par",
  "Penrith Panthers": "pen",
  "South Sydney Rabbitohs": "sou",
  "St George Illawarra Dragons": "sti",
  "Sydney Roosters": "syd",
  "Wests Tigers": "wst",
};

interface ScheduledGame {
  homeTeam: string;
  awayTeam: string;
  venue?: string;
}

interface RoundData {
  round: number;
  startDate: string; // ISO date string
  games: ScheduledGame[];
}

// 2026 NRL Season Schedule
// Season starts March 1, 2026 (Round 1 in Las Vegas)
// Approximate dates based on typical Thursday-Sunday round structure
const SEASON_2026: RoundData[] = [
  {
    round: 1,
    startDate: "2026-03-01",
    games: [
      { homeTeam: "Newcastle Knights", awayTeam: "North Queensland Cowboys", venue: "Allegiant Stadium" },
      { homeTeam: "Canterbury-Bankstown Bulldogs", awayTeam: "St George Illawarra Dragons", venue: "Allegiant Stadium" },
      { homeTeam: "Melbourne Storm", awayTeam: "Parramatta Eels", venue: "AAMI Park" },
      { homeTeam: "New Zealand Warriors", awayTeam: "Sydney Roosters", venue: "Go Media Stadium" },
      { homeTeam: "Brisbane Broncos", awayTeam: "Penrith Panthers", venue: "Suncorp Stadium" },
      { homeTeam: "Cronulla-Sutherland Sharks", awayTeam: "Gold Coast Titans", venue: "Sharks Stadium" },
      { homeTeam: "Manly-Warringah Sea Eagles", awayTeam: "Canberra Raiders", venue: "4 Pines Park" },
      { homeTeam: "Dolphins", awayTeam: "South Sydney Rabbitohs", venue: "Suncorp Stadium" },
    ],
  },
  {
    round: 2,
    startDate: "2026-03-12",
    games: [
      { homeTeam: "Brisbane Broncos", awayTeam: "Parramatta Eels" },
      { homeTeam: "New Zealand Warriors", awayTeam: "Canberra Raiders" },
      { homeTeam: "Sydney Roosters", awayTeam: "South Sydney Rabbitohs" },
      { homeTeam: "Wests Tigers", awayTeam: "North Queensland Cowboys" },
      { homeTeam: "St George Illawarra Dragons", awayTeam: "Melbourne Storm" },
      { homeTeam: "Penrith Panthers", awayTeam: "Cronulla-Sutherland Sharks" },
      { homeTeam: "Manly-Warringah Sea Eagles", awayTeam: "Newcastle Knights" },
      { homeTeam: "Dolphins", awayTeam: "Gold Coast Titans" },
    ],
  },
  {
    round: 3,
    startDate: "2026-03-19",
    games: [
      { homeTeam: "Canberra Raiders", awayTeam: "Canterbury-Bankstown Bulldogs" },
      { homeTeam: "Sydney Roosters", awayTeam: "Penrith Panthers" },
      { homeTeam: "Melbourne Storm", awayTeam: "Brisbane Broncos" },
      { homeTeam: "Newcastle Knights", awayTeam: "New Zealand Warriors" },
      { homeTeam: "Cronulla-Sutherland Sharks", awayTeam: "Dolphins" },
      { homeTeam: "South Sydney Rabbitohs", awayTeam: "Wests Tigers" },
      { homeTeam: "Parramatta Eels", awayTeam: "St George Illawarra Dragons" },
      { homeTeam: "North Queensland Cowboys", awayTeam: "Gold Coast Titans" },
    ],
  },
  {
    round: 4,
    startDate: "2026-03-26",
    games: [
      { homeTeam: "Manly-Warringah Sea Eagles", awayTeam: "Sydney Roosters" },
      { homeTeam: "New Zealand Warriors", awayTeam: "Wests Tigers" },
      { homeTeam: "Brisbane Broncos", awayTeam: "Dolphins" },
      { homeTeam: "Canterbury-Bankstown Bulldogs", awayTeam: "Newcastle Knights" },
      { homeTeam: "Penrith Panthers", awayTeam: "Parramatta Eels" },
      { homeTeam: "North Queensland Cowboys", awayTeam: "Melbourne Storm" },
      { homeTeam: "Canberra Raiders", awayTeam: "Cronulla-Sutherland Sharks" },
      { homeTeam: "Gold Coast Titans", awayTeam: "St George Illawarra Dragons" },
    ],
  },
  {
    round: 5,
    startDate: "2026-04-02",
    games: [
      { homeTeam: "Dolphins", awayTeam: "Manly-Warringah Sea Eagles" },
      { homeTeam: "South Sydney Rabbitohs", awayTeam: "Canterbury-Bankstown Bulldogs" },
      { homeTeam: "Penrith Panthers", awayTeam: "Melbourne Storm" },
      { homeTeam: "St George Illawarra Dragons", awayTeam: "North Queensland Cowboys" },
      { homeTeam: "Gold Coast Titans", awayTeam: "Brisbane Broncos" },
      { homeTeam: "Cronulla-Sutherland Sharks", awayTeam: "New Zealand Warriors" },
      { homeTeam: "Newcastle Knights", awayTeam: "Canberra Raiders" },
      { homeTeam: "Parramatta Eels", awayTeam: "Wests Tigers" },
    ],
  },
  {
    round: 6,
    startDate: "2026-04-09",
    games: [
      { homeTeam: "Canterbury-Bankstown Bulldogs", awayTeam: "Penrith Panthers" },
      { homeTeam: "St George Illawarra Dragons", awayTeam: "Manly-Warringah Sea Eagles" },
      { homeTeam: "Brisbane Broncos", awayTeam: "North Queensland Cowboys" },
      { homeTeam: "South Sydney Rabbitohs", awayTeam: "Canberra Raiders" },
      { homeTeam: "Cronulla-Sutherland Sharks", awayTeam: "Sydney Roosters" },
      { homeTeam: "Melbourne Storm", awayTeam: "New Zealand Warriors" },
      { homeTeam: "Parramatta Eels", awayTeam: "Gold Coast Titans" },
      { homeTeam: "Wests Tigers", awayTeam: "Newcastle Knights" },
    ],
  },
  {
    round: 7,
    startDate: "2026-04-16",
    games: [
      { homeTeam: "North Queensland Cowboys", awayTeam: "Manly-Warringah Sea Eagles" },
      { homeTeam: "Canberra Raiders", awayTeam: "Melbourne Storm" },
      { homeTeam: "Dolphins", awayTeam: "Penrith Panthers" },
      { homeTeam: "New Zealand Warriors", awayTeam: "Gold Coast Titans" },
      { homeTeam: "South Sydney Rabbitohs", awayTeam: "St George Illawarra Dragons" },
      { homeTeam: "Wests Tigers", awayTeam: "Brisbane Broncos" },
      { homeTeam: "Sydney Roosters", awayTeam: "Newcastle Knights" },
      { homeTeam: "Parramatta Eels", awayTeam: "Canterbury-Bankstown Bulldogs" },
    ],
  },
  {
    round: 8,
    startDate: "2026-04-23",
    games: [
      { homeTeam: "Wests Tigers", awayTeam: "Canberra Raiders" },
      { homeTeam: "North Queensland Cowboys", awayTeam: "Cronulla-Sutherland Sharks" },
      { homeTeam: "Brisbane Broncos", awayTeam: "Canterbury-Bankstown Bulldogs" },
      { homeTeam: "St George Illawarra Dragons", awayTeam: "Sydney Roosters" },
      { homeTeam: "New Zealand Warriors", awayTeam: "Dolphins" },
      { homeTeam: "Melbourne Storm", awayTeam: "South Sydney Rabbitohs" },
      { homeTeam: "Newcastle Knights", awayTeam: "Penrith Panthers" },
      { homeTeam: "Manly-Warringah Sea Eagles", awayTeam: "Parramatta Eels" },
    ],
  },
  {
    round: 9,
    startDate: "2026-04-30",
    games: [
      { homeTeam: "Canterbury-Bankstown Bulldogs", awayTeam: "North Queensland Cowboys" },
      { homeTeam: "Dolphins", awayTeam: "Melbourne Storm" },
      { homeTeam: "Gold Coast Titans", awayTeam: "Canberra Raiders" },
      { homeTeam: "Parramatta Eels", awayTeam: "New Zealand Warriors" },
      { homeTeam: "Sydney Roosters", awayTeam: "Brisbane Broncos" },
      { homeTeam: "Newcastle Knights", awayTeam: "South Sydney Rabbitohs" },
      { homeTeam: "Cronulla-Sutherland Sharks", awayTeam: "Wests Tigers" },
      { homeTeam: "Penrith Panthers", awayTeam: "Manly-Warringah Sea Eagles" },
    ],
  },
  {
    round: 10,
    startDate: "2026-05-07",
    games: [
      { homeTeam: "Dolphins", awayTeam: "Canterbury-Bankstown Bulldogs" },
      { homeTeam: "Sydney Roosters", awayTeam: "Gold Coast Titans" },
      { homeTeam: "North Queensland Cowboys", awayTeam: "Parramatta Eels" },
      { homeTeam: "St George Illawarra Dragons", awayTeam: "Newcastle Knights" },
      { homeTeam: "South Sydney Rabbitohs", awayTeam: "Cronulla-Sutherland Sharks" },
      { homeTeam: "Manly-Warringah Sea Eagles", awayTeam: "Brisbane Broncos" },
      { homeTeam: "Melbourne Storm", awayTeam: "Wests Tigers" },
      { homeTeam: "Canberra Raiders", awayTeam: "Penrith Panthers" },
    ],
  },
  {
    round: 11, // Magic Round
    startDate: "2026-05-14",
    games: [
      { homeTeam: "Cronulla-Sutherland Sharks", awayTeam: "Canterbury-Bankstown Bulldogs", venue: "Suncorp Stadium" },
      { homeTeam: "South Sydney Rabbitohs", awayTeam: "Dolphins", venue: "Suncorp Stadium" },
      { homeTeam: "Wests Tigers", awayTeam: "Manly-Warringah Sea Eagles", venue: "Suncorp Stadium" },
      { homeTeam: "Sydney Roosters", awayTeam: "North Queensland Cowboys", venue: "Suncorp Stadium" },
      { homeTeam: "Parramatta Eels", awayTeam: "Melbourne Storm", venue: "Suncorp Stadium" },
      { homeTeam: "Gold Coast Titans", awayTeam: "Newcastle Knights", venue: "Suncorp Stadium" },
      { homeTeam: "New Zealand Warriors", awayTeam: "Brisbane Broncos", venue: "Suncorp Stadium" },
      { homeTeam: "Penrith Panthers", awayTeam: "St George Illawarra Dragons", venue: "Suncorp Stadium" },
    ],
  },
  {
    round: 12, // Bye round
    startDate: "2026-05-21",
    games: [
      { homeTeam: "Canberra Raiders", awayTeam: "Dolphins" },
      { homeTeam: "Canterbury-Bankstown Bulldogs", awayTeam: "Melbourne Storm" },
      { homeTeam: "St George Illawarra Dragons", awayTeam: "New Zealand Warriors" },
      { homeTeam: "Manly-Warringah Sea Eagles", awayTeam: "Gold Coast Titans" },
      { homeTeam: "North Queensland Cowboys", awayTeam: "South Sydney Rabbitohs" },
    ],
  },
  {
    round: 13,
    startDate: "2026-05-28",
    games: [
      { homeTeam: "Cronulla-Sutherland Sharks", awayTeam: "Manly-Warringah Sea Eagles" },
      { homeTeam: "Newcastle Knights", awayTeam: "Parramatta Eels" },
      { homeTeam: "Wests Tigers", awayTeam: "Canterbury-Bankstown Bulldogs" },
      { homeTeam: "Melbourne Storm", awayTeam: "Sydney Roosters" },
      { homeTeam: "Brisbane Broncos", awayTeam: "St George Illawarra Dragons" },
      { homeTeam: "Canberra Raiders", awayTeam: "North Queensland Cowboys" },
      { homeTeam: "Penrith Panthers", awayTeam: "New Zealand Warriors" },
    ],
  },
  {
    round: 14,
    startDate: "2026-06-04",
    games: [
      { homeTeam: "Manly-Warringah Sea Eagles", awayTeam: "South Sydney Rabbitohs" },
      { homeTeam: "Melbourne Storm", awayTeam: "Newcastle Knights" },
      { homeTeam: "Canberra Raiders", awayTeam: "Sydney Roosters" },
      { homeTeam: "North Queensland Cowboys", awayTeam: "Dolphins" },
      { homeTeam: "Brisbane Broncos", awayTeam: "Gold Coast Titans" },
      { homeTeam: "Wests Tigers", awayTeam: "Penrith Panthers" },
      { homeTeam: "Cronulla-Sutherland Sharks", awayTeam: "St George Illawarra Dragons" },
    ],
  },
  {
    round: 15, // Bye round
    startDate: "2026-06-11",
    games: [
      { homeTeam: "South Sydney Rabbitohs", awayTeam: "Brisbane Broncos" },
      { homeTeam: "Dolphins", awayTeam: "Sydney Roosters" },
      { homeTeam: "New Zealand Warriors", awayTeam: "Cronulla-Sutherland Sharks" },
      { homeTeam: "Parramatta Eels", awayTeam: "Canberra Raiders" },
      { homeTeam: "Wests Tigers", awayTeam: "Gold Coast Titans" },
    ],
  },
  {
    round: 16,
    startDate: "2026-06-18",
    games: [
      { homeTeam: "Newcastle Knights", awayTeam: "St George Illawarra Dragons" },
      { homeTeam: "Wests Tigers", awayTeam: "Dolphins" },
      { homeTeam: "Gold Coast Titans", awayTeam: "Penrith Panthers" },
      { homeTeam: "Canterbury-Bankstown Bulldogs", awayTeam: "Manly-Warringah Sea Eagles" },
      { homeTeam: "New Zealand Warriors", awayTeam: "North Queensland Cowboys" },
      { homeTeam: "Melbourne Storm", awayTeam: "Canberra Raiders" },
      { homeTeam: "Sydney Roosters", awayTeam: "Cronulla-Sutherland Sharks" },
    ],
  },
  {
    round: 17,
    startDate: "2026-06-25",
    games: [
      { homeTeam: "Parramatta Eels", awayTeam: "South Sydney Rabbitohs" },
      { homeTeam: "Gold Coast Titans", awayTeam: "Canterbury-Bankstown Bulldogs" },
      { homeTeam: "Brisbane Broncos", awayTeam: "Sydney Roosters" },
      { homeTeam: "Dolphins", awayTeam: "New Zealand Warriors" },
      { homeTeam: "North Queensland Cowboys", awayTeam: "Penrith Panthers" },
      { homeTeam: "Manly-Warringah Sea Eagles", awayTeam: "Melbourne Storm" },
      { homeTeam: "Canberra Raiders", awayTeam: "St George Illawarra Dragons" },
      { homeTeam: "Newcastle Knights", awayTeam: "Wests Tigers" },
    ],
  },
  {
    round: 18, // Bye round
    startDate: "2026-07-02",
    games: [
      { homeTeam: "Penrith Panthers", awayTeam: "South Sydney Rabbitohs" },
      { homeTeam: "St George Illawarra Dragons", awayTeam: "Wests Tigers" },
      { homeTeam: "Brisbane Broncos", awayTeam: "Cronulla-Sutherland Sharks" },
      { homeTeam: "Parramatta Eels", awayTeam: "Manly-Warringah Sea Eagles" },
      { homeTeam: "Newcastle Knights", awayTeam: "Dolphins" },
    ],
  },
  {
    round: 19,
    startDate: "2026-07-09",
    games: [
      { homeTeam: "Wests Tigers", awayTeam: "New Zealand Warriors" },
      { homeTeam: "Dolphins", awayTeam: "Cronulla-Sutherland Sharks" },
      { homeTeam: "Canterbury-Bankstown Bulldogs", awayTeam: "Canberra Raiders" },
      { homeTeam: "Sydney Roosters", awayTeam: "Parramatta Eels" },
      { homeTeam: "South Sydney Rabbitohs", awayTeam: "Newcastle Knights" },
      { homeTeam: "Manly-Warringah Sea Eagles", awayTeam: "North Queensland Cowboys" },
      { homeTeam: "Melbourne Storm", awayTeam: "Gold Coast Titans" },
    ],
  },
  {
    round: 20,
    startDate: "2026-07-16",
    games: [
      { homeTeam: "Penrith Panthers", awayTeam: "Brisbane Broncos" },
      { homeTeam: "Cronulla-Sutherland Sharks", awayTeam: "Newcastle Knights" },
      { homeTeam: "Sydney Roosters", awayTeam: "Melbourne Storm" },
      { homeTeam: "Canberra Raiders", awayTeam: "South Sydney Rabbitohs" },
      { homeTeam: "New Zealand Warriors", awayTeam: "St George Illawarra Dragons" },
      { homeTeam: "Canterbury-Bankstown Bulldogs", awayTeam: "Wests Tigers" },
      { homeTeam: "Gold Coast Titans", awayTeam: "Manly-Warringah Sea Eagles" },
      { homeTeam: "Dolphins", awayTeam: "North Queensland Cowboys" },
    ],
  },
  {
    round: 21,
    startDate: "2026-07-23",
    games: [
      { homeTeam: "Parramatta Eels", awayTeam: "Penrith Panthers" },
      { homeTeam: "Newcastle Knights", awayTeam: "Sydney Roosters" },
      { homeTeam: "South Sydney Rabbitohs", awayTeam: "Melbourne Storm" },
      { homeTeam: "Canberra Raiders", awayTeam: "Wests Tigers" },
      { homeTeam: "Canterbury-Bankstown Bulldogs", awayTeam: "New Zealand Warriors" },
      { homeTeam: "North Queensland Cowboys", awayTeam: "Brisbane Broncos" },
      { homeTeam: "St George Illawarra Dragons", awayTeam: "Gold Coast Titans" },
      { homeTeam: "Manly-Warringah Sea Eagles", awayTeam: "Cronulla-Sutherland Sharks" },
    ],
  },
  {
    round: 22,
    startDate: "2026-07-30",
    games: [
      { homeTeam: "North Queensland Cowboys", awayTeam: "Sydney Roosters" },
      { homeTeam: "St George Illawarra Dragons", awayTeam: "Dolphins" },
      { homeTeam: "Melbourne Storm", awayTeam: "Canterbury-Bankstown Bulldogs" },
      { homeTeam: "Gold Coast Titans", awayTeam: "New Zealand Warriors" },
      { homeTeam: "Penrith Panthers", awayTeam: "Canberra Raiders" },
      { homeTeam: "Brisbane Broncos", awayTeam: "Newcastle Knights" },
      { homeTeam: "Cronulla-Sutherland Sharks", awayTeam: "South Sydney Rabbitohs" },
      { homeTeam: "Wests Tigers", awayTeam: "Parramatta Eels" },
    ],
  },
  {
    round: 23,
    startDate: "2026-08-06",
    games: [
      { homeTeam: "Gold Coast Titans", awayTeam: "North Queensland Cowboys" },
      { homeTeam: "New Zealand Warriors", awayTeam: "Penrith Panthers" },
      { homeTeam: "Sydney Roosters", awayTeam: "Canterbury-Bankstown Bulldogs" },
      { homeTeam: "Melbourne Storm", awayTeam: "Manly-Warringah Sea Eagles" },
      { homeTeam: "Dolphins", awayTeam: "Brisbane Broncos" },
      { homeTeam: "South Sydney Rabbitohs", awayTeam: "Parramatta Eels" },
      { homeTeam: "Canberra Raiders", awayTeam: "Newcastle Knights" },
      { homeTeam: "St George Illawarra Dragons", awayTeam: "Cronulla-Sutherland Sharks" },
    ],
  },
  {
    round: 24,
    startDate: "2026-08-13",
    games: [
      { homeTeam: "Penrith Panthers", awayTeam: "Sydney Roosters" },
      { homeTeam: "Manly-Warringah Sea Eagles", awayTeam: "Dolphins" },
      { homeTeam: "Canterbury-Bankstown Bulldogs", awayTeam: "South Sydney Rabbitohs" },
      { homeTeam: "Cronulla-Sutherland Sharks", awayTeam: "Canberra Raiders" },
      { homeTeam: "Parramatta Eels", awayTeam: "North Queensland Cowboys" },
      { homeTeam: "Brisbane Broncos", awayTeam: "New Zealand Warriors" },
      { homeTeam: "Newcastle Knights", awayTeam: "Gold Coast Titans" },
      { homeTeam: "Wests Tigers", awayTeam: "St George Illawarra Dragons" },
    ],
  },
  {
    round: 25,
    startDate: "2026-08-20",
    games: [
      { homeTeam: "Melbourne Storm", awayTeam: "Penrith Panthers" },
      { homeTeam: "Canberra Raiders", awayTeam: "Brisbane Broncos" },
      { homeTeam: "Dolphins", awayTeam: "Parramatta Eels" },
      { homeTeam: "Newcastle Knights", awayTeam: "Manly-Warringah Sea Eagles" },
      { homeTeam: "South Sydney Rabbitohs", awayTeam: "New Zealand Warriors" },
      { homeTeam: "St George Illawarra Dragons", awayTeam: "Canterbury-Bankstown Bulldogs" },
      { homeTeam: "Gold Coast Titans", awayTeam: "Cronulla-Sutherland Sharks" },
      { homeTeam: "Sydney Roosters", awayTeam: "Wests Tigers" },
    ],
  },
  {
    round: 26,
    startDate: "2026-08-27",
    games: [
      { homeTeam: "Brisbane Broncos", awayTeam: "Melbourne Storm" },
      { homeTeam: "Manly-Warringah Sea Eagles", awayTeam: "St George Illawarra Dragons" },
      { homeTeam: "Penrith Panthers", awayTeam: "Canterbury-Bankstown Bulldogs" },
      { homeTeam: "Gold Coast Titans", awayTeam: "South Sydney Rabbitohs" },
      { homeTeam: "Sydney Roosters", awayTeam: "Dolphins" },
      { homeTeam: "North Queensland Cowboys", awayTeam: "Wests Tigers" },
      { homeTeam: "New Zealand Warriors", awayTeam: "Newcastle Knights" },
      { homeTeam: "Parramatta Eels", awayTeam: "Cronulla-Sutherland Sharks" },
    ],
  },
  {
    round: 27,
    startDate: "2026-09-03",
    games: [
      { homeTeam: "Canterbury-Bankstown Bulldogs", awayTeam: "Brisbane Broncos" },
      { homeTeam: "Gold Coast Titans", awayTeam: "Dolphins" },
      { homeTeam: "South Sydney Rabbitohs", awayTeam: "Sydney Roosters" },
      { homeTeam: "New Zealand Warriors", awayTeam: "Manly-Warringah Sea Eagles" },
      { homeTeam: "North Queensland Cowboys", awayTeam: "Canberra Raiders" },
      { homeTeam: "Cronulla-Sutherland Sharks", awayTeam: "Melbourne Storm" },
      { homeTeam: "St George Illawarra Dragons", awayTeam: "Parramatta Eels" },
      { homeTeam: "Penrith Panthers", awayTeam: "Wests Tigers" },
    ],
  },
];

/**
 * Import all 2026 season games into the database
 */
export function seed2026Season(): void {
  const db = getDb();

  const insertGame = db.prepare(`
    INSERT OR REPLACE INTO games
    (id, season, round, home_team_id, away_team_id, home_score, away_score, venue, kickoff, status, minute)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalGames = 0;

  const insertMany = db.transaction((rounds: RoundData[]) => {
    for (const roundData of rounds) {
      for (let i = 0; i < roundData.games.length; i++) {
        const game = roundData.games[i];
        const homeTeamId = TEAM_NAME_MAP[game.homeTeam];
        const awayTeamId = TEAM_NAME_MAP[game.awayTeam];

        if (!homeTeamId || !awayTeamId) {
          console.error(`Unknown team: ${game.homeTeam} or ${game.awayTeam}`);
          continue;
        }

        const id = generateId();
        const status: GameStatus = "scheduled";

        // Calculate approximate kickoff time based on game index
        // Games typically spread across Thu-Sun
        const dayOffset = Math.floor(i / 2); // Spread over 4 days
        const baseDate = new Date(roundData.startDate);
        baseDate.setDate(baseDate.getDate() + dayOffset);

        // Default kickoff times: 19:00 for even index, 20:00 for odd
        const hour = i % 2 === 0 ? 19 : 20;
        baseDate.setHours(hour, 0, 0, 0);

        const kickoff = baseDate.toISOString();

        insertGame.run(
          id,
          2026,
          roundData.round,
          homeTeamId,
          awayTeamId,
          null, // No score yet - scheduled
          null,
          game.venue || "TBD",
          kickoff,
          status,
          null
        );
        totalGames++;
      }
    }
  });

  insertMany(SEASON_2026);
  console.log(`Imported ${totalGames} games across ${SEASON_2026.length} rounds for 2026 NRL season`);
}

// Export for API use
export { SEASON_2026, TEAM_NAME_MAP as TEAM_NAME_MAP_2026 };
