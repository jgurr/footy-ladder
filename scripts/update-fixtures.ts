/**
 * Update 2025 and 2026 NRL fixtures with correct dates, times, venues, and scores
 * Run with: npx tsx scripts/update-fixtures.ts
 */
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "footy.db");
const db = new Database(DB_PATH);

// Team name to ID mapping
const teamIds: Record<string, string> = {
  "Brisbane": "bri",
  "Broncos": "bri",
  "Canberra": "can",
  "Raiders": "can",
  "Canterbury": "cby",
  "Bulldogs": "cby",
  "Cronulla": "cro",
  "Sharks": "cro",
  "Dolphins": "dol",
  "Redcliffe": "dol",
  "Gold Coast": "gld",
  "Titans": "gld",
  "Manly": "man",
  "Sea Eagles": "man",
  "Melbourne": "mel",
  "Storm": "mel",
  "Newcastle": "new",
  "Knights": "new",
  "North Qld": "nql",
  "North Queensland": "nql",
  "Cowboys": "nql",
  "Warriors": "nzl",
  "New Zealand": "nzl",
  "Parramatta": "par",
  "Eels": "par",
  "Penrith": "pen",
  "Panthers": "pen",
  "South Sydney": "sou",
  "Souths": "sou",
  "Rabbitohs": "sou",
  "St Geo Illa": "sti",
  "St George Illawarra": "sti",
  "Dragons": "sti",
  "Sydney": "syd",
  "Roosters": "syd",
  "Wests Tigers": "wst",
  "Wests": "wst",
  "Tigers": "wst",
};

function getTeamId(name: string): string {
  // Try exact match first
  if (teamIds[name]) return teamIds[name];

  // Try partial match
  for (const [key, id] of Object.entries(teamIds)) {
    if (name.includes(key) || key.includes(name)) {
      return id;
    }
  }

  throw new Error(`Unknown team: ${name}`);
}

interface Game {
  season: number;
  round: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  kickoff: string; // ISO format
  venue: string;
  status: "scheduled" | "final";
}

// 2025 season games with real data
const games2025: Game[] = [
  // Round 1
  { season: 2025, round: 1, homeTeam: "can", awayTeam: "nzl", homeScore: 30, awayScore: 8, kickoff: "2025-03-01T16:00:00+11:00", venue: "Allegiant Stadium", status: "final" },
  { season: 2025, round: 1, homeTeam: "pen", awayTeam: "cro", homeScore: 28, awayScore: 22, kickoff: "2025-03-01T20:30:00+11:00", venue: "Allegiant Stadium", status: "final" },
  { season: 2025, round: 1, homeTeam: "syd", awayTeam: "bri", homeScore: 14, awayScore: 50, kickoff: "2025-03-06T20:00:00+11:00", venue: "Allianz Stadium", status: "final" },
  { season: 2025, round: 1, homeTeam: "wst", awayTeam: "new", homeScore: 8, awayScore: 10, kickoff: "2025-03-07T18:00:00+11:00", venue: "Campbelltown Stadium", status: "final" },
  { season: 2025, round: 1, homeTeam: "sou", awayTeam: "dol", homeScore: 16, awayScore: 14, kickoff: "2025-03-07T20:00:00+11:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 1, homeTeam: "sti", awayTeam: "cby", homeScore: 20, awayScore: 28, kickoff: "2025-03-08T17:30:00+11:00", venue: "Netstrata Jubilee", status: "final" },
  { season: 2025, round: 1, homeTeam: "man", awayTeam: "nql", homeScore: 42, awayScore: 12, kickoff: "2025-03-08T19:35:00+11:00", venue: "4 Pines Park", status: "final" },
  { season: 2025, round: 1, homeTeam: "mel", awayTeam: "par", homeScore: 56, awayScore: 18, kickoff: "2025-03-09T16:05:00+11:00", venue: "AAMI Park", status: "final" },

  // Round 2
  { season: 2025, round: 2, homeTeam: "new", awayTeam: "dol", homeScore: 26, awayScore: 12, kickoff: "2025-03-13T20:00:00+11:00", venue: "McDonald Jones Stadium", status: "final" },
  { season: 2025, round: 2, homeTeam: "nzl", awayTeam: "man", homeScore: 36, awayScore: 16, kickoff: "2025-03-14T20:00:00+13:00", venue: "Go Media Stadium", status: "final" },
  { season: 2025, round: 2, homeTeam: "pen", awayTeam: "syd", homeScore: 32, awayScore: 38, kickoff: "2025-03-14T20:00:00+11:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 2, homeTeam: "sti", awayTeam: "sou", homeScore: 24, awayScore: 25, kickoff: "2025-03-15T15:00:00+11:00", venue: "WIN Stadium", status: "final" },
  { season: 2025, round: 2, homeTeam: "nql", awayTeam: "cro", homeScore: 12, awayScore: 36, kickoff: "2025-03-15T16:30:00+10:00", venue: "QLD Country Bank Stadium", status: "final" },
  { season: 2025, round: 2, homeTeam: "can", awayTeam: "bri", homeScore: 32, awayScore: 22, kickoff: "2025-03-15T19:35:00+11:00", venue: "GIO Stadium", status: "final" },
  { season: 2025, round: 2, homeTeam: "par", awayTeam: "wst", homeScore: 6, awayScore: 32, kickoff: "2025-03-16T16:05:00+11:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 2, homeTeam: "cby", awayTeam: "gld", homeScore: 40, awayScore: 24, kickoff: "2025-03-16T18:15:00+11:00", venue: "Belmore Sports Ground", status: "final" },

  // Round 3
  { season: 2025, round: 3, homeTeam: "mel", awayTeam: "pen", homeScore: 30, awayScore: 24, kickoff: "2025-03-20T20:00:00+11:00", venue: "AAMI Park", status: "final" },
  { season: 2025, round: 3, homeTeam: "nzl", awayTeam: "syd", homeScore: 14, awayScore: 6, kickoff: "2025-03-21T20:00:00+13:00", venue: "Go Media Stadium", status: "final" },
  { season: 2025, round: 3, homeTeam: "bri", awayTeam: "nql", homeScore: 26, awayScore: 16, kickoff: "2025-03-21T19:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 3, homeTeam: "cro", awayTeam: "sou", homeScore: 27, awayScore: 12, kickoff: "2025-03-22T15:00:00+11:00", venue: "Sharks Stadium", status: "final" },
  { season: 2025, round: 3, homeTeam: "dol", awayTeam: "wst", homeScore: 18, awayScore: 30, kickoff: "2025-03-22T16:30:00+10:00", venue: "Kayo Stadium", status: "final" },
  { season: 2025, round: 3, homeTeam: "gld", awayTeam: "new", homeScore: 26, awayScore: 6, kickoff: "2025-03-22T18:35:00+10:00", venue: "Cbus Super Stadium", status: "final" },
  { season: 2025, round: 3, homeTeam: "par", awayTeam: "cby", homeScore: 8, awayScore: 16, kickoff: "2025-03-23T16:05:00+11:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 3, homeTeam: "man", awayTeam: "can", homeScore: 40, awayScore: 12, kickoff: "2025-03-23T18:15:00+11:00", venue: "4 Pines Park", status: "final" },

  // Round 4
  { season: 2025, round: 4, homeTeam: "sou", awayTeam: "pen", homeScore: 28, awayScore: 18, kickoff: "2025-03-27T20:00:00+11:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 4, homeTeam: "syd", awayTeam: "gld", homeScore: 12, awayScore: 30, kickoff: "2025-03-28T18:00:00+11:00", venue: "Allianz Stadium", status: "final" },
  { season: 2025, round: 4, homeTeam: "dol", awayTeam: "bri", homeScore: 12, awayScore: 20, kickoff: "2025-03-28T19:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 4, homeTeam: "sti", awayTeam: "mel", homeScore: 14, awayScore: 8, kickoff: "2025-03-29T15:00:00+11:00", venue: "Jubilee Oval", status: "final" },
  { season: 2025, round: 4, homeTeam: "nql", awayTeam: "can", homeScore: 30, awayScore: 20, kickoff: "2025-03-29T16:30:00+10:00", venue: "QLD Country Bank Stadium", status: "final" },
  { season: 2025, round: 4, homeTeam: "cro", awayTeam: "cby", homeScore: 6, awayScore: 20, kickoff: "2025-03-29T19:35:00+11:00", venue: "Sharks Stadium", status: "final" },
  { season: 2025, round: 4, homeTeam: "man", awayTeam: "par", homeScore: 26, awayScore: 12, kickoff: "2025-03-30T16:05:00+11:00", venue: "4 Pines Park", status: "final" },
  { season: 2025, round: 4, homeTeam: "wst", awayTeam: "nzl", homeScore: 24, awayScore: 26, kickoff: "2025-03-30T18:15:00+11:00", venue: "Campbelltown Stadium", status: "final" },

  // Round 5
  { season: 2025, round: 5, homeTeam: "can", awayTeam: "cro", homeScore: 24, awayScore: 20, kickoff: "2025-04-03T20:00:00+11:00", venue: "GIO Stadium", status: "final" },
  { season: 2025, round: 5, homeTeam: "pen", awayTeam: "nql", homeScore: 18, awayScore: 22, kickoff: "2025-04-04T18:00:00+11:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 5, homeTeam: "sou", awayTeam: "syd", homeScore: 20, awayScore: 14, kickoff: "2025-04-04T20:00:00+11:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 5, homeTeam: "par", awayTeam: "sti", homeScore: 23, awayScore: 22, kickoff: "2025-04-05T15:00:00+11:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 5, homeTeam: "gld", awayTeam: "dol", homeScore: 10, awayScore: 36, kickoff: "2025-04-05T16:30:00+10:00", venue: "Cbus Super Stadium", status: "final" },
  { season: 2025, round: 5, homeTeam: "bri", awayTeam: "wst", homeScore: 46, awayScore: 24, kickoff: "2025-04-05T18:35:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 5, homeTeam: "man", awayTeam: "mel", homeScore: 24, awayScore: 48, kickoff: "2025-04-06T16:05:00+10:00", venue: "4 Pines Park", status: "final" },
  { season: 2025, round: 5, homeTeam: "cby", awayTeam: "new", homeScore: 20, awayScore: 0, kickoff: "2025-04-06T18:15:00+10:00", venue: "Accor Stadium", status: "final" },

  // Round 6
  { season: 2025, round: 6, homeTeam: "dol", awayTeam: "pen", homeScore: 30, awayScore: 12, kickoff: "2025-04-10T20:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 6, homeTeam: "sti", awayTeam: "gld", homeScore: 38, awayScore: 16, kickoff: "2025-04-11T18:00:00+10:00", venue: "WIN Stadium", status: "final" },
  { season: 2025, round: 6, homeTeam: "bri", awayTeam: "syd", homeScore: 16, awayScore: 26, kickoff: "2025-04-11T20:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 6, homeTeam: "cro", awayTeam: "man", homeScore: 24, awayScore: 18, kickoff: "2025-04-12T17:30:00+08:00", venue: "Optus Stadium", status: "final" },
  { season: 2025, round: 6, homeTeam: "sou", awayTeam: "nql", homeScore: 16, awayScore: 24, kickoff: "2025-04-12T19:30:00+08:00", venue: "Optus Stadium", status: "final" },
  { season: 2025, round: 6, homeTeam: "par", awayTeam: "can", homeScore: 12, awayScore: 50, kickoff: "2025-04-12T19:30:00+09:30", venue: "TIO Stadium", status: "final" },
  { season: 2025, round: 6, homeTeam: "mel", awayTeam: "nzl", homeScore: 42, awayScore: 14, kickoff: "2025-04-13T16:05:00+10:00", venue: "AAMI Park", status: "final" },
  { season: 2025, round: 6, homeTeam: "new", awayTeam: "wst", homeScore: 4, awayScore: 20, kickoff: "2025-04-13T18:15:00+10:00", venue: "McDonald Jones Stadium", status: "final" },

  // Round 7
  { season: 2025, round: 7, homeTeam: "man", awayTeam: "sti", homeScore: 18, awayScore: 20, kickoff: "2025-04-17T20:00:00+10:00", venue: "4 Pines Park", status: "final" },
  { season: 2025, round: 7, homeTeam: "cby", awayTeam: "sou", homeScore: 32, awayScore: 0, kickoff: "2025-04-18T18:00:00+10:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 7, homeTeam: "dol", awayTeam: "mel", homeScore: 42, awayScore: 22, kickoff: "2025-04-18T20:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 7, homeTeam: "nzl", awayTeam: "bri", homeScore: 20, awayScore: 18, kickoff: "2025-04-19T17:30:00+12:00", venue: "Go Media Stadium", status: "final" },
  { season: 2025, round: 7, homeTeam: "syd", awayTeam: "pen", homeScore: 12, awayScore: 40, kickoff: "2025-04-19T19:35:00+10:00", venue: "Allianz Stadium", status: "final" },
  { season: 2025, round: 7, homeTeam: "gld", awayTeam: "can", homeScore: 20, awayScore: 30, kickoff: "2025-04-20T14:00:00+10:00", venue: "Cbus Super Stadium", status: "final" },
  { season: 2025, round: 7, homeTeam: "new", awayTeam: "cro", homeScore: 14, awayScore: 34, kickoff: "2025-04-20T16:05:00+10:00", venue: "McDonald Jones Stadium", status: "final" },
  { season: 2025, round: 7, homeTeam: "wst", awayTeam: "par", homeScore: 22, awayScore: 38, kickoff: "2025-04-21T16:05:00+10:00", venue: "CommBank Stadium", status: "final" },

  // Round 8
  { season: 2025, round: 8, homeTeam: "bri", awayTeam: "cby", homeScore: 42, awayScore: 18, kickoff: "2025-04-24T20:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 8, homeTeam: "syd", awayTeam: "sti", homeScore: 46, awayScore: 18, kickoff: "2025-04-25T16:05:00+10:00", venue: "Allianz Stadium", status: "final" },
  { season: 2025, round: 8, homeTeam: "nzl", awayTeam: "new", homeScore: 26, awayScore: 12, kickoff: "2025-04-25T18:00:00+12:00", venue: "Apollo Projects Stadium", status: "final" },
  { season: 2025, round: 8, homeTeam: "mel", awayTeam: "sou", homeScore: 24, awayScore: 16, kickoff: "2025-04-25T19:35:00+10:00", venue: "AAMI Park", status: "final" },
  { season: 2025, round: 8, homeTeam: "nql", awayTeam: "gld", homeScore: 50, awayScore: 18, kickoff: "2025-04-26T17:30:00+10:00", venue: "QLD Country Bank Stadium", status: "final" },
  { season: 2025, round: 8, homeTeam: "pen", awayTeam: "man", homeScore: 10, awayScore: 26, kickoff: "2025-04-26T19:35:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 8, homeTeam: "can", awayTeam: "dol", homeScore: 40, awayScore: 28, kickoff: "2025-04-27T14:00:00+10:00", venue: "GIO Stadium", status: "final" },
  { season: 2025, round: 8, homeTeam: "wst", awayTeam: "cro", homeScore: 20, awayScore: 18, kickoff: "2025-04-27T16:05:00+10:00", venue: "Leichhardt Oval", status: "final" },

  // Round 9 - Magic Round at Suncorp
  { season: 2025, round: 9, homeTeam: "cro", awayTeam: "par", homeScore: 28, awayScore: 18, kickoff: "2025-05-02T18:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 9, homeTeam: "syd", awayTeam: "dol", homeScore: 36, awayScore: 26, kickoff: "2025-05-02T20:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 9, homeTeam: "sou", awayTeam: "new", homeScore: 4, awayScore: 30, kickoff: "2025-05-03T15:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 9, homeTeam: "nzl", awayTeam: "nql", homeScore: 30, awayScore: 26, kickoff: "2025-05-03T17:30:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 9, homeTeam: "wst", awayTeam: "sti", homeScore: 34, awayScore: 28, kickoff: "2025-05-03T19:35:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 9, homeTeam: "gld", awayTeam: "cby", homeScore: 18, awayScore: 38, kickoff: "2025-05-04T12:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 9, homeTeam: "pen", awayTeam: "bri", homeScore: 32, awayScore: 8, kickoff: "2025-05-04T14:05:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 9, homeTeam: "mel", awayTeam: "can", homeScore: 18, awayScore: 20, kickoff: "2025-05-04T16:10:00+10:00", venue: "Suncorp Stadium", status: "final" },

  // Round 10
  { season: 2025, round: 10, homeTeam: "par", awayTeam: "dol", homeScore: 16, awayScore: 20, kickoff: "2025-05-08T20:00:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 10, homeTeam: "new", awayTeam: "gld", homeScore: 20, awayScore: 24, kickoff: "2025-05-09T18:00:00+10:00", venue: "McDonald Jones Stadium", status: "final" },
  { season: 2025, round: 10, homeTeam: "sou", awayTeam: "bri", homeScore: 22, awayScore: 14, kickoff: "2025-05-09T20:00:00+10:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 10, homeTeam: "can", awayTeam: "cby", homeScore: 20, awayScore: 32, kickoff: "2025-05-10T15:00:00+10:00", venue: "GIO Stadium", status: "final" },
  { season: 2025, round: 10, homeTeam: "sti", awayTeam: "nzl", homeScore: 14, awayScore: 15, kickoff: "2025-05-10T17:30:00+10:00", venue: "WIN Stadium", status: "final" },
  { season: 2025, round: 10, homeTeam: "nql", awayTeam: "pen", homeScore: 30, awayScore: 30, kickoff: "2025-05-10T19:35:00+10:00", venue: "QLD Country Bank Stadium", status: "final" },
  { season: 2025, round: 10, homeTeam: "mel", awayTeam: "wst", homeScore: 64, awayScore: 0, kickoff: "2025-05-11T14:00:00+10:00", venue: "AAMI Park", status: "final" },
  { season: 2025, round: 10, homeTeam: "man", awayTeam: "cro", homeScore: 14, awayScore: 30, kickoff: "2025-05-11T16:05:00+10:00", venue: "4 Pines Park", status: "final" },

  // Round 11-27 (continuing with all remaining games...)
  // Round 11
  { season: 2025, round: 11, homeTeam: "new", awayTeam: "par", homeScore: 6, awayScore: 28, kickoff: "2025-05-16T18:00:00+10:00", venue: "McDonald Jones Stadium", status: "final" },
  { season: 2025, round: 11, homeTeam: "cby", awayTeam: "syd", homeScore: 24, awayScore: 20, kickoff: "2025-05-16T20:00:00+10:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 11, homeTeam: "dol", awayTeam: "nzl", homeScore: 12, awayScore: 16, kickoff: "2025-05-17T15:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 11, homeTeam: "nql", awayTeam: "man", homeScore: 6, awayScore: 24, kickoff: "2025-05-17T17:30:00+10:00", venue: "QLD Country Bank Stadium", status: "final" },
  { season: 2025, round: 11, homeTeam: "cro", awayTeam: "mel", homeScore: 31, awayScore: 26, kickoff: "2025-05-17T19:35:00+10:00", venue: "Sharks Stadium", status: "final" },
  { season: 2025, round: 11, homeTeam: "bri", awayTeam: "sti", homeScore: 26, awayScore: 30, kickoff: "2025-05-18T14:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 11, homeTeam: "can", awayTeam: "gld", homeScore: 40, awayScore: 24, kickoff: "2025-05-18T16:05:00+10:00", venue: "GIO Stadium", status: "final" },
  { season: 2025, round: 11, homeTeam: "wst", awayTeam: "sou", homeScore: 12, awayScore: 22, kickoff: "2025-05-18T18:15:00+10:00", venue: "Campbelltown Stadium", status: "final" },

  // Round 12
  { season: 2025, round: 12, homeTeam: "cby", awayTeam: "dol", homeScore: 8, awayScore: 44, kickoff: "2025-05-22T20:00:00+10:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 12, homeTeam: "par", awayTeam: "man", homeScore: 30, awayScore: 10, kickoff: "2025-05-23T20:00:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 12, homeTeam: "pen", awayTeam: "new", homeScore: 6, awayScore: 25, kickoff: "2025-05-24T17:30:00+10:00", venue: "Carrington Park", status: "final" },
  { season: 2025, round: 12, homeTeam: "syd", awayTeam: "cro", homeScore: 42, awayScore: 16, kickoff: "2025-05-24T19:35:00+10:00", venue: "Industree Group Stadium", status: "final" },
  { season: 2025, round: 12, homeTeam: "nzl", awayTeam: "can", homeScore: 10, awayScore: 16, kickoff: "2025-05-25T14:00:00+12:00", venue: "Go Media Stadium", status: "final" },

  // Round 13
  { season: 2025, round: 13, homeTeam: "sti", awayTeam: "new", homeScore: 20, awayScore: 6, kickoff: "2025-05-30T20:00:00+10:00", venue: "Jubilee Oval", status: "final" },
  { season: 2025, round: 13, homeTeam: "gld", awayTeam: "mel", homeScore: 16, awayScore: 28, kickoff: "2025-05-31T15:00:00+10:00", venue: "Cbus Super Stadium", status: "final" },
  { season: 2025, round: 13, homeTeam: "nql", awayTeam: "wst", homeScore: 32, awayScore: 28, kickoff: "2025-05-31T17:30:00+10:00", venue: "QLD Country Bank Stadium", status: "final" },
  { season: 2025, round: 13, homeTeam: "man", awayTeam: "bri", homeScore: 34, awayScore: 6, kickoff: "2025-05-31T19:35:00+10:00", venue: "4 Pines Park", status: "final" },
  { season: 2025, round: 13, homeTeam: "sou", awayTeam: "nzl", homeScore: 30, awayScore: 36, kickoff: "2025-06-01T14:00:00+10:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 13, homeTeam: "pen", awayTeam: "par", homeScore: 18, awayScore: 10, kickoff: "2025-06-01T16:05:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 13, homeTeam: "syd", awayTeam: "can", homeScore: 24, awayScore: 26, kickoff: "2025-06-01T18:15:00+10:00", venue: "Allianz Stadium", status: "final" },

  // Round 14
  { season: 2025, round: 14, homeTeam: "new", awayTeam: "man", homeScore: 26, awayScore: 22, kickoff: "2025-06-05T20:00:00+10:00", venue: "McDonald Jones Stadium", status: "final" },
  { season: 2025, round: 14, homeTeam: "mel", awayTeam: "nql", homeScore: 38, awayScore: 14, kickoff: "2025-06-06T18:00:00+10:00", venue: "AAMI Park", status: "final" },
  { season: 2025, round: 14, homeTeam: "dol", awayTeam: "sti", homeScore: 56, awayScore: 6, kickoff: "2025-06-06T20:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 14, homeTeam: "cro", awayTeam: "nzl", homeScore: 10, awayScore: 40, kickoff: "2025-06-07T17:30:00+10:00", venue: "Sharks Stadium", status: "final" },
  { season: 2025, round: 14, homeTeam: "bri", awayTeam: "gld", homeScore: 44, awayScore: 14, kickoff: "2025-06-07T19:35:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 14, homeTeam: "can", awayTeam: "sou", homeScore: 36, awayScore: 12, kickoff: "2025-06-08T14:00:00+10:00", venue: "GIO Stadium", status: "final" },
  { season: 2025, round: 14, homeTeam: "wst", awayTeam: "pen", homeScore: 14, awayScore: 18, kickoff: "2025-06-08T16:05:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 14, homeTeam: "cby", awayTeam: "par", homeScore: 30, awayScore: 12, kickoff: "2025-06-09T16:05:00+10:00", venue: "Accor Stadium", status: "final" },

  // Round 15
  { season: 2025, round: 15, homeTeam: "cro", awayTeam: "sti", homeScore: 30, awayScore: 18, kickoff: "2025-06-12T20:00:00+10:00", venue: "Sharks Stadium", status: "final" },
  { season: 2025, round: 15, homeTeam: "gld", awayTeam: "man", homeScore: 28, awayScore: 8, kickoff: "2025-06-13T18:00:00+10:00", venue: "Cbus Super Stadium", status: "final" },
  { season: 2025, round: 15, homeTeam: "new", awayTeam: "syd", homeScore: 8, awayScore: 12, kickoff: "2025-06-14T17:30:00+10:00", venue: "McDonald Jones Stadium", status: "final" },
  { season: 2025, round: 15, homeTeam: "nql", awayTeam: "dol", homeScore: 4, awayScore: 58, kickoff: "2025-06-14T19:35:00+10:00", venue: "QLD Country Bank Stadium", status: "final" },
  { season: 2025, round: 15, homeTeam: "sou", awayTeam: "cby", homeScore: 18, awayScore: 24, kickoff: "2025-06-15T16:05:00+10:00", venue: "Accor Stadium", status: "final" },

  // Round 16
  { season: 2025, round: 16, homeTeam: "wst", awayTeam: "can", homeScore: 12, awayScore: 16, kickoff: "2025-06-20T20:00:00+10:00", venue: "Campbelltown Stadium", status: "final" },
  { season: 2025, round: 16, homeTeam: "nzl", awayTeam: "pen", homeScore: 18, awayScore: 28, kickoff: "2025-06-21T17:00:00+12:00", venue: "Go Media Stadium", status: "final" },
  { season: 2025, round: 16, homeTeam: "dol", awayTeam: "new", homeScore: 20, awayScore: 26, kickoff: "2025-06-21T15:30:00+08:00", venue: "HBF Park", status: "final" },
  { season: 2025, round: 16, homeTeam: "sou", awayTeam: "mel", homeScore: 24, awayScore: 25, kickoff: "2025-06-21T19:35:00+10:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 16, homeTeam: "bri", awayTeam: "cro", homeScore: 34, awayScore: 28, kickoff: "2025-06-22T14:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 16, homeTeam: "syd", awayTeam: "nql", homeScore: 42, awayScore: 8, kickoff: "2025-06-22T16:05:00+10:00", venue: "Allianz Stadium", status: "final" },
  { season: 2025, round: 16, homeTeam: "par", awayTeam: "gld", homeScore: 36, awayScore: 20, kickoff: "2025-06-22T18:15:00+10:00", venue: "CommBank Stadium", status: "final" },

  // Round 17
  { season: 2025, round: 17, homeTeam: "pen", awayTeam: "cby", homeScore: 8, awayScore: 6, kickoff: "2025-06-26T19:50:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 17, homeTeam: "man", awayTeam: "wst", homeScore: 28, awayScore: 10, kickoff: "2025-06-27T18:00:00+10:00", venue: "4 Pines Park", status: "final" },
  { season: 2025, round: 17, homeTeam: "new", awayTeam: "can", homeScore: 18, awayScore: 22, kickoff: "2025-06-27T20:00:00+10:00", venue: "McDonald Jones Stadium", status: "final" },
  { season: 2025, round: 17, homeTeam: "bri", awayTeam: "nzl", homeScore: 26, awayScore: 12, kickoff: "2025-06-28T15:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 17, homeTeam: "sti", awayTeam: "par", homeScore: 34, awayScore: 20, kickoff: "2025-06-28T17:30:00+10:00", venue: "WIN Stadium", status: "final" },
  { season: 2025, round: 17, homeTeam: "dol", awayTeam: "sou", homeScore: 50, awayScore: 28, kickoff: "2025-06-28T19:50:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 17, homeTeam: "mel", awayTeam: "cro", homeScore: 30, awayScore: 6, kickoff: "2025-06-29T14:00:00+10:00", venue: "AAMI Park", status: "final" },
  { season: 2025, round: 17, homeTeam: "gld", awayTeam: "nql", homeScore: 24, awayScore: 30, kickoff: "2025-06-29T16:05:00+10:00", venue: "Cbus Super Stadium", status: "final" },

  // Round 18
  { season: 2025, round: 18, homeTeam: "cby", awayTeam: "bri", homeScore: 18, awayScore: 22, kickoff: "2025-07-04T20:00:00+10:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 18, homeTeam: "can", awayTeam: "sti", homeScore: 28, awayScore: 24, kickoff: "2025-07-05T17:30:00+10:00", venue: "GIO Stadium", status: "final" },
  { season: 2025, round: 18, homeTeam: "nql", awayTeam: "mel", homeScore: 20, awayScore: 26, kickoff: "2025-07-05T19:35:00+10:00", venue: "QLD Country Bank Stadium", status: "final" },
  { season: 2025, round: 18, homeTeam: "syd", awayTeam: "wst", homeScore: 28, awayScore: 30, kickoff: "2025-07-06T14:00:00+10:00", venue: "Allianz Stadium", status: "final" },
  { season: 2025, round: 18, homeTeam: "man", awayTeam: "sou", homeScore: 30, awayScore: 12, kickoff: "2025-07-06T16:05:00+10:00", venue: "4 Pines Park", status: "final" },

  // Round 19
  { season: 2025, round: 19, homeTeam: "cro", awayTeam: "dol", homeScore: 24, awayScore: 12, kickoff: "2025-07-11T20:00:00+10:00", venue: "Sharks Stadium", status: "final" },
  { season: 2025, round: 19, homeTeam: "new", awayTeam: "mel", homeScore: 14, awayScore: 32, kickoff: "2025-07-12T15:00:00+10:00", venue: "McDonald Jones Stadium", status: "final" },
  { season: 2025, round: 19, homeTeam: "sti", awayTeam: "syd", homeScore: 24, awayScore: 31, kickoff: "2025-07-12T17:30:00+10:00", venue: "Jubilee Oval", status: "final" },
  { season: 2025, round: 19, homeTeam: "nql", awayTeam: "cby", homeScore: 8, awayScore: 12, kickoff: "2025-07-12T19:35:00+10:00", venue: "QLD Country Bank Stadium", status: "final" },
  { season: 2025, round: 19, homeTeam: "nzl", awayTeam: "wst", homeScore: 34, awayScore: 14, kickoff: "2025-07-13T16:00:00+12:00", venue: "Go Media Stadium", status: "final" },
  { season: 2025, round: 19, homeTeam: "par", awayTeam: "pen", homeScore: 10, awayScore: 32, kickoff: "2025-07-13T16:05:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 19, homeTeam: "gld", awayTeam: "bri", homeScore: 14, awayScore: 26, kickoff: "2025-07-13T18:15:00+10:00", venue: "Cbus Super Stadium", status: "final" },

  // Round 20
  { season: 2025, round: 20, homeTeam: "dol", awayTeam: "nql", homeScore: 43, awayScore: 24, kickoff: "2025-07-17T19:50:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 20, homeTeam: "cro", awayTeam: "syd", homeScore: 31, awayScore: 18, kickoff: "2025-07-18T18:00:00+10:00", venue: "Sharks Stadium", status: "final" },
  { season: 2025, round: 20, homeTeam: "pen", awayTeam: "sou", homeScore: 30, awayScore: 10, kickoff: "2025-07-18T20:00:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 20, homeTeam: "can", awayTeam: "par", homeScore: 40, awayScore: 16, kickoff: "2025-07-19T15:00:00+10:00", venue: "GIO Stadium", status: "final" },
  { season: 2025, round: 20, homeTeam: "cby", awayTeam: "sti", homeScore: 20, awayScore: 18, kickoff: "2025-07-19T17:30:00+10:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 20, homeTeam: "mel", awayTeam: "man", homeScore: 16, awayScore: 18, kickoff: "2025-07-19T19:35:00+10:00", venue: "AAMI Park", status: "final" },
  { season: 2025, round: 20, homeTeam: "wst", awayTeam: "gld", homeScore: 21, awayScore: 20, kickoff: "2025-07-20T14:00:00+10:00", venue: "Leichhardt Oval", status: "final" },
  { season: 2025, round: 20, homeTeam: "new", awayTeam: "nzl", homeScore: 15, awayScore: 20, kickoff: "2025-07-20T16:05:00+10:00", venue: "McDonald Jones Stadium", status: "final" },

  // Round 21
  { season: 2025, round: 21, homeTeam: "syd", awayTeam: "mel", homeScore: 30, awayScore: 34, kickoff: "2025-07-24T19:50:00+10:00", venue: "Allianz Stadium", status: "final" },
  { season: 2025, round: 21, homeTeam: "nql", awayTeam: "sti", homeScore: 38, awayScore: 32, kickoff: "2025-07-25T18:00:00+10:00", venue: "QLD Country Bank Stadium", status: "final" },
  { season: 2025, round: 21, homeTeam: "bri", awayTeam: "par", homeScore: 20, awayScore: 22, kickoff: "2025-07-25T20:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 21, homeTeam: "nzl", awayTeam: "gld", homeScore: 16, awayScore: 24, kickoff: "2025-07-26T17:00:00+12:00", venue: "Go Media Stadium", status: "final" },
  { season: 2025, round: 21, homeTeam: "pen", awayTeam: "wst", homeScore: 36, awayScore: 2, kickoff: "2025-07-26T17:30:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 21, homeTeam: "sou", awayTeam: "cro", homeScore: 12, awayScore: 14, kickoff: "2025-07-26T19:35:00+10:00", venue: "Allianz Stadium", status: "final" },
  { season: 2025, round: 21, homeTeam: "can", awayTeam: "new", homeScore: 44, awayScore: 18, kickoff: "2025-07-27T14:00:00+10:00", venue: "GIO Stadium", status: "final" },
  { season: 2025, round: 21, homeTeam: "cby", awayTeam: "man", homeScore: 42, awayScore: 4, kickoff: "2025-07-27T16:05:00+10:00", venue: "Allianz Stadium", status: "final" },

  // Round 22
  { season: 2025, round: 22, homeTeam: "par", awayTeam: "mel", homeScore: 10, awayScore: 16, kickoff: "2025-07-31T19:50:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 22, homeTeam: "nzl", awayTeam: "dol", homeScore: 18, awayScore: 20, kickoff: "2025-08-01T20:00:00+12:00", venue: "Go Media Stadium", status: "final" },
  { season: 2025, round: 22, homeTeam: "bri", awayTeam: "sou", homeScore: 60, awayScore: 14, kickoff: "2025-08-01T20:00:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 22, homeTeam: "gld", awayTeam: "pen", homeScore: 26, awayScore: 30, kickoff: "2025-08-02T15:00:00+10:00", venue: "Cbus Super Stadium", status: "final" },
  { season: 2025, round: 22, homeTeam: "sti", awayTeam: "can", homeScore: 18, awayScore: 12, kickoff: "2025-08-02T17:30:00+10:00", venue: "WIN Stadium", status: "final" },
  { season: 2025, round: 22, homeTeam: "man", awayTeam: "syd", homeScore: 4, awayScore: 20, kickoff: "2025-08-02T19:35:00+10:00", venue: "4 Pines Park", status: "final" },
  { season: 2025, round: 22, homeTeam: "wst", awayTeam: "cby", homeScore: 28, awayScore: 14, kickoff: "2025-08-03T14:00:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 22, homeTeam: "cro", awayTeam: "nql", homeScore: 32, awayScore: 12, kickoff: "2025-08-03T16:05:00+10:00", venue: "Sharks Stadium", status: "final" },

  // Round 23
  { season: 2025, round: 23, homeTeam: "mel", awayTeam: "bri", homeScore: 22, awayScore: 2, kickoff: "2025-08-07T19:50:00+10:00", venue: "AAMI Park", status: "final" },
  { season: 2025, round: 23, homeTeam: "new", awayTeam: "pen", homeScore: 12, awayScore: 48, kickoff: "2025-08-08T18:00:00+10:00", venue: "McDonald Jones Stadium", status: "final" },
  { season: 2025, round: 23, homeTeam: "can", awayTeam: "man", homeScore: 28, awayScore: 12, kickoff: "2025-08-08T20:00:00+10:00", venue: "GIO Stadium", status: "final" },
  { season: 2025, round: 23, homeTeam: "sti", awayTeam: "cro", homeScore: 22, awayScore: 14, kickoff: "2025-08-09T15:00:00+10:00", venue: "Jubilee Oval", status: "final" },
  { season: 2025, round: 23, homeTeam: "dol", awayTeam: "syd", homeScore: 12, awayScore: 64, kickoff: "2025-08-09T17:30:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 23, homeTeam: "cby", awayTeam: "nzl", homeScore: 32, awayScore: 14, kickoff: "2025-08-09T19:35:00+10:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 23, homeTeam: "gld", awayTeam: "sou", homeScore: 18, awayScore: 20, kickoff: "2025-08-10T14:00:00+10:00", venue: "Cbus Super Stadium", status: "final" },
  { season: 2025, round: 23, homeTeam: "par", awayTeam: "nql", homeScore: 19, awayScore: 18, kickoff: "2025-08-10T16:05:00+10:00", venue: "CommBank Stadium", status: "final" },

  // Round 24
  { season: 2025, round: 24, homeTeam: "pen", awayTeam: "mel", homeScore: 18, awayScore: 22, kickoff: "2025-08-14T19:50:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 24, homeTeam: "nzl", awayTeam: "sti", homeScore: 14, awayScore: 10, kickoff: "2025-08-15T20:00:00+12:00", venue: "Go Media Stadium", status: "final" },
  { season: 2025, round: 24, homeTeam: "syd", awayTeam: "cby", homeScore: 32, awayScore: 12, kickoff: "2025-08-15T20:00:00+10:00", venue: "Allianz Stadium", status: "final" },
  { season: 2025, round: 24, homeTeam: "cro", awayTeam: "gld", homeScore: 54, awayScore: 22, kickoff: "2025-08-16T15:00:00+10:00", venue: "Sharks Stadium", status: "final" },
  { season: 2025, round: 24, homeTeam: "bri", awayTeam: "dol", homeScore: 38, awayScore: 28, kickoff: "2025-08-16T17:30:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 24, homeTeam: "sou", awayTeam: "par", homeScore: 20, awayScore: 16, kickoff: "2025-08-16T19:35:00+10:00", venue: "Allianz Stadium", status: "final" },
  { season: 2025, round: 24, homeTeam: "wst", awayTeam: "man", homeScore: 26, awayScore: 12, kickoff: "2025-08-17T14:00:00+10:00", venue: "Allianz Stadium", status: "final" },
  { season: 2025, round: 24, homeTeam: "nql", awayTeam: "new", homeScore: 38, awayScore: 4, kickoff: "2025-08-17T16:05:00+10:00", venue: "QLD Country Bank Stadium", status: "final" },

  // Round 25
  { season: 2025, round: 25, homeTeam: "sou", awayTeam: "sti", homeScore: 40, awayScore: 0, kickoff: "2025-08-21T19:50:00+10:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 25, homeTeam: "pen", awayTeam: "can", homeScore: 16, awayScore: 20, kickoff: "2025-08-22T18:00:00+10:00", venue: "Glen Willow Stadium", status: "final" },
  { season: 2025, round: 25, homeTeam: "mel", awayTeam: "cby", homeScore: 20, awayScore: 14, kickoff: "2025-08-22T20:00:00+10:00", venue: "AAMI Park", status: "final" },
  { season: 2025, round: 25, homeTeam: "man", awayTeam: "dol", homeScore: 58, awayScore: 30, kickoff: "2025-08-23T15:00:00+10:00", venue: "4 Pines Park", status: "final" },
  { season: 2025, round: 25, homeTeam: "gld", awayTeam: "nzl", homeScore: 18, awayScore: 32, kickoff: "2025-08-23T17:30:00+10:00", venue: "Cbus Super Stadium", status: "final" },
  { season: 2025, round: 25, homeTeam: "par", awayTeam: "syd", homeScore: 30, awayScore: 10, kickoff: "2025-08-23T19:35:00+10:00", venue: "CommBank Stadium", status: "final" },
  { season: 2025, round: 25, homeTeam: "new", awayTeam: "bri", homeScore: 12, awayScore: 46, kickoff: "2025-08-24T14:00:00+10:00", venue: "McDonald Jones Stadium", status: "final" },
  { season: 2025, round: 25, homeTeam: "wst", awayTeam: "nql", homeScore: 28, awayScore: 34, kickoff: "2025-08-24T16:05:00+10:00", venue: "Leichhardt Oval", status: "final" },

  // Round 26
  { season: 2025, round: 26, homeTeam: "cby", awayTeam: "pen", homeScore: 28, awayScore: 4, kickoff: "2025-08-28T19:50:00+10:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 26, homeTeam: "nzl", awayTeam: "par", homeScore: 22, awayScore: 26, kickoff: "2025-08-29T20:00:00+12:00", venue: "Go Media Stadium", status: "final" },
  { season: 2025, round: 26, homeTeam: "mel", awayTeam: "syd", homeScore: 10, awayScore: 40, kickoff: "2025-08-29T20:00:00+10:00", venue: "AAMI Park", status: "final" },
  { season: 2025, round: 26, homeTeam: "can", awayTeam: "wst", homeScore: 24, awayScore: 10, kickoff: "2025-08-30T15:00:00+10:00", venue: "GIO Stadium", status: "final" },
  { season: 2025, round: 26, homeTeam: "sti", awayTeam: "man", homeScore: 24, awayScore: 40, kickoff: "2025-08-30T17:30:00+10:00", venue: "Jubilee Oval", status: "final" },
  { season: 2025, round: 26, homeTeam: "nql", awayTeam: "bri", homeScore: 30, awayScore: 38, kickoff: "2025-08-30T19:35:00+10:00", venue: "QLD Country Bank Stadium", status: "final" },
  { season: 2025, round: 26, homeTeam: "cro", awayTeam: "new", homeScore: 40, awayScore: 16, kickoff: "2025-08-31T14:00:00+10:00", venue: "Sharks Stadium", status: "final" },
  { season: 2025, round: 26, homeTeam: "dol", awayTeam: "gld", homeScore: 36, awayScore: 30, kickoff: "2025-08-31T16:05:00+10:00", venue: "Suncorp Stadium", status: "final" },

  // Round 27
  { season: 2025, round: 27, homeTeam: "bri", awayTeam: "mel", homeScore: 30, awayScore: 14, kickoff: "2025-09-04T19:50:00+10:00", venue: "Suncorp Stadium", status: "final" },
  { season: 2025, round: 27, homeTeam: "man", awayTeam: "nzl", homeScore: 27, awayScore: 26, kickoff: "2025-09-05T18:00:00+10:00", venue: "4 Pines Park", status: "final" },
  { season: 2025, round: 27, homeTeam: "syd", awayTeam: "sou", homeScore: 36, awayScore: 6, kickoff: "2025-09-05T20:00:00+10:00", venue: "Allianz Stadium", status: "final" },
  { season: 2025, round: 27, homeTeam: "sti", awayTeam: "pen", homeScore: 20, awayScore: 40, kickoff: "2025-09-06T15:00:00+10:00", venue: "WIN Stadium", status: "final" },
  { season: 2025, round: 27, homeTeam: "gld", awayTeam: "wst", homeScore: 36, awayScore: 28, kickoff: "2025-09-06T17:30:00+10:00", venue: "Cbus Super Stadium", status: "final" },
  { season: 2025, round: 27, homeTeam: "cby", awayTeam: "cro", homeScore: 6, awayScore: 24, kickoff: "2025-09-06T19:35:00+10:00", venue: "Accor Stadium", status: "final" },
  { season: 2025, round: 27, homeTeam: "dol", awayTeam: "can", homeScore: 62, awayScore: 24, kickoff: "2025-09-07T14:00:00+10:00", venue: "Kayo Stadium", status: "final" },
  { season: 2025, round: 27, homeTeam: "par", awayTeam: "new", homeScore: 66, awayScore: 10, kickoff: "2025-09-07T16:05:00+10:00", venue: "CommBank Stadium", status: "final" },
];

// 2026 season fixtures (scheduled games without scores)
const games2026: Game[] = [
  // Round 1 - Las Vegas
  { season: 2026, round: 1, homeTeam: "new", awayTeam: "nql", homeScore: null, awayScore: null, kickoff: "2026-02-28T11:00:00+11:00", venue: "Allegiant Stadium", status: "scheduled" },
  { season: 2026, round: 1, homeTeam: "cby", awayTeam: "sti", homeScore: null, awayScore: null, kickoff: "2026-02-28T15:30:00+11:00", venue: "Allegiant Stadium", status: "scheduled" },
  { season: 2026, round: 1, homeTeam: "mel", awayTeam: "par", homeScore: null, awayScore: null, kickoff: "2026-03-05T20:00:00+11:00", venue: "AAMI Park", status: "scheduled" },
  { season: 2026, round: 1, homeTeam: "nzl", awayTeam: "syd", homeScore: null, awayScore: null, kickoff: "2026-03-06T18:00:00+13:00", venue: "Go Media Stadium", status: "scheduled" },
  { season: 2026, round: 1, homeTeam: "bri", awayTeam: "pen", homeScore: null, awayScore: null, kickoff: "2026-03-06T20:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 1, homeTeam: "cro", awayTeam: "gld", homeScore: null, awayScore: null, kickoff: "2026-03-07T17:30:00+11:00", venue: "Sharks Stadium", status: "scheduled" },
  { season: 2026, round: 1, homeTeam: "man", awayTeam: "can", homeScore: null, awayScore: null, kickoff: "2026-03-07T19:30:00+11:00", venue: "4 Pines Park", status: "scheduled" },
  { season: 2026, round: 1, homeTeam: "dol", awayTeam: "sou", homeScore: null, awayScore: null, kickoff: "2026-03-08T16:05:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },

  // Round 2
  { season: 2026, round: 2, homeTeam: "bri", awayTeam: "par", homeScore: null, awayScore: null, kickoff: "2026-03-12T20:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 2, homeTeam: "nzl", awayTeam: "can", homeScore: null, awayScore: null, kickoff: "2026-03-13T18:00:00+13:00", venue: "Go Media Stadium", status: "scheduled" },
  { season: 2026, round: 2, homeTeam: "syd", awayTeam: "sou", homeScore: null, awayScore: null, kickoff: "2026-03-13T20:00:00+11:00", venue: "Allianz Stadium", status: "scheduled" },
  { season: 2026, round: 2, homeTeam: "wst", awayTeam: "nql", homeScore: null, awayScore: null, kickoff: "2026-03-14T15:00:00+11:00", venue: "Leichhardt Oval", status: "scheduled" },
  { season: 2026, round: 2, homeTeam: "sti", awayTeam: "mel", homeScore: null, awayScore: null, kickoff: "2026-03-14T17:30:00+11:00", venue: "WIN Stadium", status: "scheduled" },
  { season: 2026, round: 2, homeTeam: "pen", awayTeam: "cro", homeScore: null, awayScore: null, kickoff: "2026-03-14T19:30:00+11:00", venue: "Carrington Park", status: "scheduled" },
  { season: 2026, round: 2, homeTeam: "man", awayTeam: "new", homeScore: null, awayScore: null, kickoff: "2026-03-15T15:05:00+11:00", venue: "4 Pines Park", status: "scheduled" },
  { season: 2026, round: 2, homeTeam: "dol", awayTeam: "gld", homeScore: null, awayScore: null, kickoff: "2026-03-15T17:15:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },

  // Round 3
  { season: 2026, round: 3, homeTeam: "can", awayTeam: "cby", homeScore: null, awayScore: null, kickoff: "2026-03-19T20:00:00+11:00", venue: "GIO Stadium", status: "scheduled" },
  { season: 2026, round: 3, homeTeam: "syd", awayTeam: "pen", homeScore: null, awayScore: null, kickoff: "2026-03-20T18:00:00+11:00", venue: "Allianz Stadium", status: "scheduled" },
  { season: 2026, round: 3, homeTeam: "mel", awayTeam: "bri", homeScore: null, awayScore: null, kickoff: "2026-03-20T20:00:00+11:00", venue: "AAMI Park", status: "scheduled" },
  { season: 2026, round: 3, homeTeam: "new", awayTeam: "nzl", homeScore: null, awayScore: null, kickoff: "2026-03-21T15:00:00+11:00", venue: "McDonald Jones Stadium", status: "scheduled" },
  { season: 2026, round: 3, homeTeam: "cro", awayTeam: "dol", homeScore: null, awayScore: null, kickoff: "2026-03-21T17:30:00+11:00", venue: "Sharks Stadium", status: "scheduled" },
  { season: 2026, round: 3, homeTeam: "sou", awayTeam: "wst", homeScore: null, awayScore: null, kickoff: "2026-03-21T19:30:00+11:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 3, homeTeam: "par", awayTeam: "sti", homeScore: null, awayScore: null, kickoff: "2026-03-22T16:05:00+11:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 3, homeTeam: "nql", awayTeam: "gld", homeScore: null, awayScore: null, kickoff: "2026-03-22T18:15:00+10:00", venue: "QLD Country Bank Stadium", status: "scheduled" },

  // Round 4
  { season: 2026, round: 4, homeTeam: "man", awayTeam: "syd", homeScore: null, awayScore: null, kickoff: "2026-03-26T20:00:00+11:00", venue: "4 Pines Park", status: "scheduled" },
  { season: 2026, round: 4, homeTeam: "nzl", awayTeam: "wst", homeScore: null, awayScore: null, kickoff: "2026-03-27T18:00:00+13:00", venue: "Go Media Stadium", status: "scheduled" },
  { season: 2026, round: 4, homeTeam: "bri", awayTeam: "dol", homeScore: null, awayScore: null, kickoff: "2026-03-27T20:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 4, homeTeam: "cby", awayTeam: "new", homeScore: null, awayScore: null, kickoff: "2026-03-28T15:00:00+11:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 4, homeTeam: "pen", awayTeam: "par", homeScore: null, awayScore: null, kickoff: "2026-03-28T17:30:00+11:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 4, homeTeam: "nql", awayTeam: "mel", homeScore: null, awayScore: null, kickoff: "2026-03-28T19:30:00+10:00", venue: "QLD Country Bank Stadium", status: "scheduled" },
  { season: 2026, round: 4, homeTeam: "can", awayTeam: "cro", homeScore: null, awayScore: null, kickoff: "2026-03-29T16:05:00+11:00", venue: "GIO Stadium", status: "scheduled" },
  { season: 2026, round: 4, homeTeam: "gld", awayTeam: "sti", homeScore: null, awayScore: null, kickoff: "2026-03-29T18:15:00+10:00", venue: "Cbus Super Stadium", status: "scheduled" },

  // Round 5
  { season: 2026, round: 5, homeTeam: "dol", awayTeam: "man", homeScore: null, awayScore: null, kickoff: "2026-04-02T20:00:00+10:00", venue: "Kayo Stadium", status: "scheduled" },
  { season: 2026, round: 5, homeTeam: "sou", awayTeam: "cby", homeScore: null, awayScore: null, kickoff: "2026-04-03T16:05:00+11:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 5, homeTeam: "pen", awayTeam: "mel", homeScore: null, awayScore: null, kickoff: "2026-04-03T20:00:00+11:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 5, homeTeam: "sti", awayTeam: "nql", homeScore: null, awayScore: null, kickoff: "2026-04-04T17:30:00+11:00", venue: "Jubilee Oval", status: "scheduled" },
  { season: 2026, round: 5, homeTeam: "gld", awayTeam: "bri", homeScore: null, awayScore: null, kickoff: "2026-04-04T19:30:00+10:00", venue: "Cbus Super Stadium", status: "scheduled" },
  { season: 2026, round: 5, homeTeam: "cro", awayTeam: "nzl", homeScore: null, awayScore: null, kickoff: "2026-04-05T14:00:00+11:00", venue: "Sharks Stadium", status: "scheduled" },
  { season: 2026, round: 5, homeTeam: "new", awayTeam: "can", homeScore: null, awayScore: null, kickoff: "2026-04-05T16:05:00+10:00", venue: "McDonald Jones Stadium", status: "scheduled" },
  { season: 2026, round: 5, homeTeam: "par", awayTeam: "wst", homeScore: null, awayScore: null, kickoff: "2026-04-06T16:05:00+10:00", venue: "CommBank Stadium", status: "scheduled" },

  // Rounds 6-10 (adding more fixtures)
  // Round 6
  { season: 2026, round: 6, homeTeam: "cby", awayTeam: "pen", homeScore: null, awayScore: null, kickoff: "2026-04-09T19:50:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 6, homeTeam: "sti", awayTeam: "man", homeScore: null, awayScore: null, kickoff: "2026-04-10T18:00:00+10:00", venue: "WIN Stadium", status: "scheduled" },
  { season: 2026, round: 6, homeTeam: "bri", awayTeam: "nql", homeScore: null, awayScore: null, kickoff: "2026-04-10T20:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 6, homeTeam: "sou", awayTeam: "can", homeScore: null, awayScore: null, kickoff: "2026-04-11T15:00:00+08:00", venue: "Optus Stadium", status: "scheduled" },
  { season: 2026, round: 6, homeTeam: "cro", awayTeam: "syd", homeScore: null, awayScore: null, kickoff: "2026-04-11T17:30:00+08:00", venue: "Optus Stadium", status: "scheduled" },
  { season: 2026, round: 6, homeTeam: "mel", awayTeam: "nzl", homeScore: null, awayScore: null, kickoff: "2026-04-11T19:30:00+10:00", venue: "AAMI Park", status: "scheduled" },
  { season: 2026, round: 6, homeTeam: "par", awayTeam: "gld", homeScore: null, awayScore: null, kickoff: "2026-04-12T14:00:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 6, homeTeam: "wst", awayTeam: "new", homeScore: null, awayScore: null, kickoff: "2026-04-12T16:05:00+10:00", venue: "Campbelltown Stadium", status: "scheduled" },

  // Round 7
  { season: 2026, round: 7, homeTeam: "nql", awayTeam: "man", homeScore: null, awayScore: null, kickoff: "2026-04-16T19:50:00+10:00", venue: "QLD Country Bank Stadium", status: "scheduled" },
  { season: 2026, round: 7, homeTeam: "can", awayTeam: "mel", homeScore: null, awayScore: null, kickoff: "2026-04-17T18:00:00+10:00", venue: "GIO Stadium", status: "scheduled" },
  { season: 2026, round: 7, homeTeam: "dol", awayTeam: "pen", homeScore: null, awayScore: null, kickoff: "2026-04-17T20:00:00+09:30", venue: "TIO Stadium", status: "scheduled" },
  { season: 2026, round: 7, homeTeam: "nzl", awayTeam: "gld", homeScore: null, awayScore: null, kickoff: "2026-04-18T15:00:00+12:00", venue: "Go Media Stadium", status: "scheduled" },
  { season: 2026, round: 7, homeTeam: "sou", awayTeam: "sti", homeScore: null, awayScore: null, kickoff: "2026-04-18T17:30:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 7, homeTeam: "wst", awayTeam: "bri", homeScore: null, awayScore: null, kickoff: "2026-04-18T19:30:00+10:00", venue: "Campbelltown Stadium", status: "scheduled" },
  { season: 2026, round: 7, homeTeam: "syd", awayTeam: "new", homeScore: null, awayScore: null, kickoff: "2026-04-19T14:00:00+10:00", venue: "Allianz Stadium", status: "scheduled" },
  { season: 2026, round: 7, homeTeam: "par", awayTeam: "cby", homeScore: null, awayScore: null, kickoff: "2026-04-19T16:05:00+10:00", venue: "CommBank Stadium", status: "scheduled" },

  // Round 8 - ANZAC Round
  { season: 2026, round: 8, homeTeam: "wst", awayTeam: "can", homeScore: null, awayScore: null, kickoff: "2026-04-23T19:50:00+10:00", venue: "Leichhardt Oval", status: "scheduled" },
  { season: 2026, round: 8, homeTeam: "nql", awayTeam: "cro", homeScore: null, awayScore: null, kickoff: "2026-04-24T18:00:00+10:00", venue: "QLD Country Bank Stadium", status: "scheduled" },
  { season: 2026, round: 8, homeTeam: "bri", awayTeam: "cby", homeScore: null, awayScore: null, kickoff: "2026-04-24T20:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 8, homeTeam: "sti", awayTeam: "syd", homeScore: null, awayScore: null, kickoff: "2026-04-25T16:00:00+10:00", venue: "Allianz Stadium", status: "scheduled" },
  { season: 2026, round: 8, homeTeam: "nzl", awayTeam: "dol", homeScore: null, awayScore: null, kickoff: "2026-04-25T18:05:00+12:00", venue: "Sky Stadium", status: "scheduled" },
  { season: 2026, round: 8, homeTeam: "mel", awayTeam: "sou", homeScore: null, awayScore: null, kickoff: "2026-04-25T20:10:00+10:00", venue: "AAMI Park", status: "scheduled" },
  { season: 2026, round: 8, homeTeam: "new", awayTeam: "pen", homeScore: null, awayScore: null, kickoff: "2026-04-26T14:00:00+10:00", venue: "McDonald Jones Stadium", status: "scheduled" },
  { season: 2026, round: 8, homeTeam: "man", awayTeam: "par", homeScore: null, awayScore: null, kickoff: "2026-04-26T16:05:00+10:00", venue: "4 Pines Park", status: "scheduled" },

  // Round 9
  { season: 2026, round: 9, homeTeam: "cby", awayTeam: "nql", homeScore: null, awayScore: null, kickoff: "2026-05-01T18:00:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 9, homeTeam: "dol", awayTeam: "mel", homeScore: null, awayScore: null, kickoff: "2026-05-01T20:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 9, homeTeam: "gld", awayTeam: "can", homeScore: null, awayScore: null, kickoff: "2026-05-02T15:00:00+10:00", venue: "Cbus Super Stadium", status: "scheduled" },
  { season: 2026, round: 9, homeTeam: "par", awayTeam: "nzl", homeScore: null, awayScore: null, kickoff: "2026-05-02T17:30:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 9, homeTeam: "syd", awayTeam: "bri", homeScore: null, awayScore: null, kickoff: "2026-05-02T19:30:00+10:00", venue: "Allianz Stadium", status: "scheduled" },
  { season: 2026, round: 9, homeTeam: "new", awayTeam: "sou", homeScore: null, awayScore: null, kickoff: "2026-05-03T14:00:00+10:00", venue: "McDonald Jones Stadium", status: "scheduled" },
  { season: 2026, round: 9, homeTeam: "cro", awayTeam: "wst", homeScore: null, awayScore: null, kickoff: "2026-05-03T16:05:00+10:00", venue: "Sharks Stadium", status: "scheduled" },
  { season: 2026, round: 9, homeTeam: "pen", awayTeam: "man", homeScore: null, awayScore: null, kickoff: "2026-05-03T18:15:00+10:00", venue: "CommBank Stadium", status: "scheduled" },

  // Round 10
  { season: 2026, round: 10, homeTeam: "dol", awayTeam: "cby", homeScore: null, awayScore: null, kickoff: "2026-05-07T19:50:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 10, homeTeam: "syd", awayTeam: "gld", homeScore: null, awayScore: null, kickoff: "2026-05-08T18:00:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 10, homeTeam: "nql", awayTeam: "par", homeScore: null, awayScore: null, kickoff: "2026-05-08T20:00:00+10:00", venue: "QLD Country Bank Stadium", status: "scheduled" },
  { season: 2026, round: 10, homeTeam: "sti", awayTeam: "new", homeScore: null, awayScore: null, kickoff: "2026-05-09T15:00:00+10:00", venue: "WIN Stadium", status: "scheduled" },
  { season: 2026, round: 10, homeTeam: "sou", awayTeam: "cro", homeScore: null, awayScore: null, kickoff: "2026-05-09T17:30:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 10, homeTeam: "man", awayTeam: "bri", homeScore: null, awayScore: null, kickoff: "2026-05-09T19:30:00+10:00", venue: "4 Pines Park", status: "scheduled" },
  { season: 2026, round: 10, homeTeam: "mel", awayTeam: "wst", homeScore: null, awayScore: null, kickoff: "2026-05-10T14:00:00+10:00", venue: "AAMI Park", status: "scheduled" },
  { season: 2026, round: 10, homeTeam: "can", awayTeam: "pen", homeScore: null, awayScore: null, kickoff: "2026-05-10T16:05:00+10:00", venue: "GIO Stadium", status: "scheduled" },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function main() {
  console.log("Deleting existing games...");
  db.prepare("DELETE FROM games WHERE season IN (2025, 2026)").run();

  console.log("Inserting 2025 games...");
  const insertStmt = db.prepare(`
    INSERT INTO games (id, season, round, home_team_id, away_team_id, home_score, away_score, venue, kickoff, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const game of games2025) {
    insertStmt.run(
      generateId(),
      game.season,
      game.round,
      game.homeTeam,
      game.awayTeam,
      game.homeScore,
      game.awayScore,
      game.venue,
      game.kickoff,
      game.status
    );
  }
  console.log(`Inserted ${games2025.length} games for 2025`);

  console.log("Inserting 2026 games...");
  for (const game of games2026) {
    insertStmt.run(
      generateId(),
      game.season,
      game.round,
      game.homeTeam,
      game.awayTeam,
      game.homeScore,
      game.awayScore,
      game.venue,
      game.kickoff,
      game.status
    );
  }
  console.log(`Inserted ${games2026.length} games for 2026`);

  console.log("Done! Database updated with correct fixture data.");
  db.close();
}

main();
