/**
 * Add remaining 2026 NRL fixtures (rounds 11-27)
 * Run with: npx tsx scripts/add-2026-fixtures.ts
 */
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "footy.db");
const db = new Database(DB_PATH);

interface Game {
  season: number;
  round: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  kickoff: string;
  venue: string;
  status: "scheduled" | "final";
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 2026 fixtures rounds 11-27
const games2026Remaining: Game[] = [
  // Round 11 - Magic Round (all at Suncorp Stadium)
  { season: 2026, round: 11, homeTeam: "cro", awayTeam: "cby", homeScore: null, awayScore: null, kickoff: "2026-05-15T18:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 11, homeTeam: "sou", awayTeam: "dol", homeScore: null, awayScore: null, kickoff: "2026-05-15T20:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 11, homeTeam: "wst", awayTeam: "man", homeScore: null, awayScore: null, kickoff: "2026-05-16T15:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 11, homeTeam: "syd", awayTeam: "nql", homeScore: null, awayScore: null, kickoff: "2026-05-16T17:30:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 11, homeTeam: "par", awayTeam: "mel", homeScore: null, awayScore: null, kickoff: "2026-05-16T19:45:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 11, homeTeam: "gld", awayTeam: "new", homeScore: null, awayScore: null, kickoff: "2026-05-17T14:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 11, homeTeam: "nzl", awayTeam: "bri", homeScore: null, awayScore: null, kickoff: "2026-05-17T16:05:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 11, homeTeam: "pen", awayTeam: "sti", homeScore: null, awayScore: null, kickoff: "2026-05-17T18:25:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },

  // Round 12
  { season: 2026, round: 12, homeTeam: "can", awayTeam: "dol", homeScore: null, awayScore: null, kickoff: "2026-05-21T19:50:00+10:00", venue: "GIO Stadium", status: "scheduled" },
  { season: 2026, round: 12, homeTeam: "cby", awayTeam: "mel", homeScore: null, awayScore: null, kickoff: "2026-05-22T20:00:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 12, homeTeam: "sti", awayTeam: "nzl", homeScore: null, awayScore: null, kickoff: "2026-05-23T17:30:00+10:00", venue: "Jubilee Oval", status: "scheduled" },
  { season: 2026, round: 12, homeTeam: "man", awayTeam: "gld", homeScore: null, awayScore: null, kickoff: "2026-05-23T19:30:00+10:00", venue: "4 Pines Park", status: "scheduled" },
  { season: 2026, round: 12, homeTeam: "nql", awayTeam: "sou", homeScore: null, awayScore: null, kickoff: "2026-05-24T16:05:00+10:00", venue: "QLD Country Bank Stadium", status: "scheduled" },

  // Round 13
  { season: 2026, round: 13, homeTeam: "cro", awayTeam: "man", homeScore: null, awayScore: null, kickoff: "2026-05-29T20:00:00+10:00", venue: "Sharks Stadium", status: "scheduled" },
  { season: 2026, round: 13, homeTeam: "new", awayTeam: "par", homeScore: null, awayScore: null, kickoff: "2026-05-30T15:00:00+10:00", venue: "McDonald Jones Stadium", status: "scheduled" },
  { season: 2026, round: 13, homeTeam: "wst", awayTeam: "cby", homeScore: null, awayScore: null, kickoff: "2026-05-30T17:30:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 13, homeTeam: "mel", awayTeam: "syd", homeScore: null, awayScore: null, kickoff: "2026-05-30T19:30:00+10:00", venue: "AAMI Park", status: "scheduled" },
  { season: 2026, round: 13, homeTeam: "bri", awayTeam: "sti", homeScore: null, awayScore: null, kickoff: "2026-05-31T14:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 13, homeTeam: "can", awayTeam: "nql", homeScore: null, awayScore: null, kickoff: "2026-05-31T16:05:00+10:00", venue: "GIO Stadium", status: "scheduled" },
  { season: 2026, round: 13, homeTeam: "pen", awayTeam: "nzl", homeScore: null, awayScore: null, kickoff: "2026-05-31T18:15:00+10:00", venue: "CommBank Stadium", status: "scheduled" },

  // Round 14
  { season: 2026, round: 14, homeTeam: "man", awayTeam: "sou", homeScore: null, awayScore: null, kickoff: "2026-06-04T19:50:00+10:00", venue: "4 Pines Park", status: "scheduled" },
  { season: 2026, round: 14, homeTeam: "mel", awayTeam: "new", homeScore: null, awayScore: null, kickoff: "2026-06-05T18:00:00+10:00", venue: "AAMI Park", status: "scheduled" },
  { season: 2026, round: 14, homeTeam: "can", awayTeam: "syd", homeScore: null, awayScore: null, kickoff: "2026-06-05T20:00:00+10:00", venue: "GIO Stadium", status: "scheduled" },
  { season: 2026, round: 14, homeTeam: "nql", awayTeam: "dol", homeScore: null, awayScore: null, kickoff: "2026-06-06T17:30:00+10:00", venue: "QLD Country Bank Stadium", status: "scheduled" },
  { season: 2026, round: 14, homeTeam: "bri", awayTeam: "gld", homeScore: null, awayScore: null, kickoff: "2026-06-06T19:30:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 14, homeTeam: "wst", awayTeam: "pen", homeScore: null, awayScore: null, kickoff: "2026-06-07T14:00:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 14, homeTeam: "cro", awayTeam: "sti", homeScore: null, awayScore: null, kickoff: "2026-06-07T16:05:00+10:00", venue: "Sharks Stadium", status: "scheduled" },
  { season: 2026, round: 14, homeTeam: "cby", awayTeam: "par", homeScore: null, awayScore: null, kickoff: "2026-06-08T16:05:00+10:00", venue: "Accor Stadium", status: "scheduled" },

  // Round 15
  { season: 2026, round: 15, homeTeam: "sou", awayTeam: "bri", homeScore: null, awayScore: null, kickoff: "2026-06-11T19:50:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 15, homeTeam: "dol", awayTeam: "syd", homeScore: null, awayScore: null, kickoff: "2026-06-12T20:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 15, homeTeam: "nzl", awayTeam: "cro", homeScore: null, awayScore: null, kickoff: "2026-06-13T17:30:00+12:00", venue: "Go Media Stadium", status: "scheduled" },
  { season: 2026, round: 15, homeTeam: "par", awayTeam: "can", homeScore: null, awayScore: null, kickoff: "2026-06-13T19:30:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 15, homeTeam: "wst", awayTeam: "gld", homeScore: null, awayScore: null, kickoff: "2026-06-14T16:05:00+10:00", venue: "Leichhardt Oval", status: "scheduled" },

  // Round 16
  { season: 2026, round: 16, homeTeam: "new", awayTeam: "sti", homeScore: null, awayScore: null, kickoff: "2026-06-19T20:00:00+10:00", venue: "McDonald Jones Stadium", status: "scheduled" },
  { season: 2026, round: 16, homeTeam: "wst", awayTeam: "dol", homeScore: null, awayScore: null, kickoff: "2026-06-20T15:00:00+10:00", venue: "Campbelltown Stadium", status: "scheduled" },
  { season: 2026, round: 16, homeTeam: "gld", awayTeam: "pen", homeScore: null, awayScore: null, kickoff: "2026-06-20T17:30:00+10:00", venue: "Cbus Super Stadium", status: "scheduled" },
  { season: 2026, round: 16, homeTeam: "cby", awayTeam: "man", homeScore: null, awayScore: null, kickoff: "2026-06-20T19:30:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 16, homeTeam: "nzl", awayTeam: "nql", homeScore: null, awayScore: null, kickoff: "2026-06-21T14:00:00+12:00", venue: "One NZ Stadium", status: "scheduled" },
  { season: 2026, round: 16, homeTeam: "mel", awayTeam: "can", homeScore: null, awayScore: null, kickoff: "2026-06-21T16:05:00+10:00", venue: "AAMI Park", status: "scheduled" },
  { season: 2026, round: 16, homeTeam: "syd", awayTeam: "cro", homeScore: null, awayScore: null, kickoff: "2026-06-21T18:15:00+10:00", venue: "Allianz Stadium", status: "scheduled" },

  // Round 17
  { season: 2026, round: 17, homeTeam: "par", awayTeam: "sou", homeScore: null, awayScore: null, kickoff: "2026-06-25T19:50:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 17, homeTeam: "gld", awayTeam: "cby", homeScore: null, awayScore: null, kickoff: "2026-06-26T18:00:00+10:00", venue: "Cbus Super Stadium", status: "scheduled" },
  { season: 2026, round: 17, homeTeam: "bri", awayTeam: "syd", homeScore: null, awayScore: null, kickoff: "2026-06-26T20:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 17, homeTeam: "dol", awayTeam: "nzl", homeScore: null, awayScore: null, kickoff: "2026-06-27T15:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 17, homeTeam: "nql", awayTeam: "pen", homeScore: null, awayScore: null, kickoff: "2026-06-27T17:30:00+10:00", venue: "QLD Country Bank Stadium", status: "scheduled" },
  { season: 2026, round: 17, homeTeam: "man", awayTeam: "mel", homeScore: null, awayScore: null, kickoff: "2026-06-27T19:30:00+10:00", venue: "4 Pines Park", status: "scheduled" },
  { season: 2026, round: 17, homeTeam: "can", awayTeam: "sti", homeScore: null, awayScore: null, kickoff: "2026-06-28T14:00:00+10:00", venue: "GIO Stadium", status: "scheduled" },
  { season: 2026, round: 17, homeTeam: "new", awayTeam: "wst", homeScore: null, awayScore: null, kickoff: "2026-06-28T16:05:00+10:00", venue: "McDonald Jones Stadium", status: "scheduled" },

  // Round 18
  { season: 2026, round: 18, homeTeam: "pen", awayTeam: "sou", homeScore: null, awayScore: null, kickoff: "2026-07-03T20:00:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 18, homeTeam: "sti", awayTeam: "wst", homeScore: null, awayScore: null, kickoff: "2026-07-04T17:30:00+10:00", venue: "Jubilee Oval", status: "scheduled" },
  { season: 2026, round: 18, homeTeam: "bri", awayTeam: "cro", homeScore: null, awayScore: null, kickoff: "2026-07-04T19:30:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 18, homeTeam: "par", awayTeam: "man", homeScore: null, awayScore: null, kickoff: "2026-07-05T14:00:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 18, homeTeam: "new", awayTeam: "dol", homeScore: null, awayScore: null, kickoff: "2026-07-05T16:05:00+10:00", venue: "McDonald Jones Stadium", status: "scheduled" },

  // Round 19
  { season: 2026, round: 19, homeTeam: "wst", awayTeam: "nzl", homeScore: null, awayScore: null, kickoff: "2026-07-10T20:00:00+10:00", venue: "Campbelltown Stadium", status: "scheduled" },
  { season: 2026, round: 19, homeTeam: "dol", awayTeam: "cro", homeScore: null, awayScore: null, kickoff: "2026-07-11T15:00:00+10:00", venue: "Kayo Stadium", status: "scheduled" },
  { season: 2026, round: 19, homeTeam: "cby", awayTeam: "can", homeScore: null, awayScore: null, kickoff: "2026-07-11T17:30:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 19, homeTeam: "syd", awayTeam: "par", homeScore: null, awayScore: null, kickoff: "2026-07-11T19:30:00+10:00", venue: "Allianz Stadium", status: "scheduled" },
  { season: 2026, round: 19, homeTeam: "sou", awayTeam: "new", homeScore: null, awayScore: null, kickoff: "2026-07-12T14:00:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 19, homeTeam: "man", awayTeam: "nql", homeScore: null, awayScore: null, kickoff: "2026-07-12T16:05:00+10:00", venue: "4 Pines Park", status: "scheduled" },
  { season: 2026, round: 19, homeTeam: "mel", awayTeam: "gld", homeScore: null, awayScore: null, kickoff: "2026-07-12T18:15:00+10:00", venue: "AAMI Park", status: "scheduled" },

  // Round 20
  { season: 2026, round: 20, homeTeam: "pen", awayTeam: "bri", homeScore: null, awayScore: null, kickoff: "2026-07-16T19:50:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 20, homeTeam: "cro", awayTeam: "new", homeScore: null, awayScore: null, kickoff: "2026-07-17T18:00:00+10:00", venue: "Sharks Stadium", status: "scheduled" },
  { season: 2026, round: 20, homeTeam: "syd", awayTeam: "mel", homeScore: null, awayScore: null, kickoff: "2026-07-17T20:00:00+10:00", venue: "Allianz Stadium", status: "scheduled" },
  { season: 2026, round: 20, homeTeam: "can", awayTeam: "sou", homeScore: null, awayScore: null, kickoff: "2026-07-18T15:00:00+10:00", venue: "GIO Stadium", status: "scheduled" },
  { season: 2026, round: 20, homeTeam: "nzl", awayTeam: "sti", homeScore: null, awayScore: null, kickoff: "2026-07-18T17:30:00+12:00", venue: "Go Media Stadium", status: "scheduled" },
  { season: 2026, round: 20, homeTeam: "cby", awayTeam: "wst", homeScore: null, awayScore: null, kickoff: "2026-07-18T19:30:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 20, homeTeam: "gld", awayTeam: "man", homeScore: null, awayScore: null, kickoff: "2026-07-19T14:00:00+10:00", venue: "Cbus Super Stadium", status: "scheduled" },
  { season: 2026, round: 20, homeTeam: "dol", awayTeam: "nql", homeScore: null, awayScore: null, kickoff: "2026-07-19T16:05:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },

  // Round 21
  { season: 2026, round: 21, homeTeam: "par", awayTeam: "pen", homeScore: null, awayScore: null, kickoff: "2026-07-23T19:50:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 21, homeTeam: "new", awayTeam: "syd", homeScore: null, awayScore: null, kickoff: "2026-07-24T18:00:00+10:00", venue: "McDonald Jones Stadium", status: "scheduled" },
  { season: 2026, round: 21, homeTeam: "sou", awayTeam: "mel", homeScore: null, awayScore: null, kickoff: "2026-07-24T20:00:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 21, homeTeam: "can", awayTeam: "wst", homeScore: null, awayScore: null, kickoff: "2026-07-25T15:00:00+10:00", venue: "GIO Stadium", status: "scheduled" },
  { season: 2026, round: 21, homeTeam: "cby", awayTeam: "nzl", homeScore: null, awayScore: null, kickoff: "2026-07-25T17:30:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 21, homeTeam: "nql", awayTeam: "bri", homeScore: null, awayScore: null, kickoff: "2026-07-25T19:30:00+10:00", venue: "QLD Country Bank Stadium", status: "scheduled" },
  { season: 2026, round: 21, homeTeam: "sti", awayTeam: "gld", homeScore: null, awayScore: null, kickoff: "2026-07-26T14:00:00+10:00", venue: "Jubilee Oval", status: "scheduled" },
  { season: 2026, round: 21, homeTeam: "man", awayTeam: "cro", homeScore: null, awayScore: null, kickoff: "2026-07-26T16:05:00+10:00", venue: "4 Pines Park", status: "scheduled" },

  // Round 22
  { season: 2026, round: 22, homeTeam: "nql", awayTeam: "syd", homeScore: null, awayScore: null, kickoff: "2026-07-30T19:50:00+10:00", venue: "QLD Country Bank Stadium", status: "scheduled" },
  { season: 2026, round: 22, homeTeam: "sti", awayTeam: "dol", homeScore: null, awayScore: null, kickoff: "2026-07-31T18:00:00+10:00", venue: "WIN Stadium", status: "scheduled" },
  { season: 2026, round: 22, homeTeam: "mel", awayTeam: "cby", homeScore: null, awayScore: null, kickoff: "2026-07-31T20:00:00+10:00", venue: "AAMI Park", status: "scheduled" },
  { season: 2026, round: 22, homeTeam: "gld", awayTeam: "nzl", homeScore: null, awayScore: null, kickoff: "2026-08-01T15:00:00+10:00", venue: "Cbus Super Stadium", status: "scheduled" },
  { season: 2026, round: 22, homeTeam: "pen", awayTeam: "can", homeScore: null, awayScore: null, kickoff: "2026-08-01T17:30:00+10:00", venue: "Glen Willow Oval", status: "scheduled" },
  { season: 2026, round: 22, homeTeam: "bri", awayTeam: "new", homeScore: null, awayScore: null, kickoff: "2026-08-01T19:30:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 22, homeTeam: "cro", awayTeam: "sou", homeScore: null, awayScore: null, kickoff: "2026-08-02T14:00:00+10:00", venue: "Sharks Stadium", status: "scheduled" },
  { season: 2026, round: 22, homeTeam: "wst", awayTeam: "par", homeScore: null, awayScore: null, kickoff: "2026-08-02T16:05:00+10:00", venue: "CommBank Stadium", status: "scheduled" },

  // Round 23
  { season: 2026, round: 23, homeTeam: "gld", awayTeam: "nql", homeScore: null, awayScore: null, kickoff: "2026-08-06T19:50:00+10:00", venue: "Cbus Super Stadium", status: "scheduled" },
  { season: 2026, round: 23, homeTeam: "nzl", awayTeam: "pen", homeScore: null, awayScore: null, kickoff: "2026-08-07T18:00:00+12:00", venue: "Go Media Stadium", status: "scheduled" },
  { season: 2026, round: 23, homeTeam: "syd", awayTeam: "cby", homeScore: null, awayScore: null, kickoff: "2026-08-07T20:00:00+10:00", venue: "Allianz Stadium", status: "scheduled" },
  { season: 2026, round: 23, homeTeam: "mel", awayTeam: "man", homeScore: null, awayScore: null, kickoff: "2026-08-08T15:00:00+08:00", venue: "HBF Park", status: "scheduled" },
  { season: 2026, round: 23, homeTeam: "dol", awayTeam: "bri", homeScore: null, awayScore: null, kickoff: "2026-08-08T17:30:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 23, homeTeam: "sou", awayTeam: "par", homeScore: null, awayScore: null, kickoff: "2026-08-08T19:30:00+10:00", venue: "Allianz Stadium", status: "scheduled" },
  { season: 2026, round: 23, homeTeam: "can", awayTeam: "new", homeScore: null, awayScore: null, kickoff: "2026-08-09T14:00:00+10:00", venue: "GIO Stadium", status: "scheduled" },
  { season: 2026, round: 23, homeTeam: "sti", awayTeam: "cro", homeScore: null, awayScore: null, kickoff: "2026-08-09T16:05:00+10:00", venue: "Jubilee Oval", status: "scheduled" },

  // Round 24
  { season: 2026, round: 24, homeTeam: "pen", awayTeam: "syd", homeScore: null, awayScore: null, kickoff: "2026-08-13T19:50:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 24, homeTeam: "man", awayTeam: "dol", homeScore: null, awayScore: null, kickoff: "2026-08-14T18:00:00+10:00", venue: "4 Pines Park", status: "scheduled" },
  { season: 2026, round: 24, homeTeam: "cby", awayTeam: "sou", homeScore: null, awayScore: null, kickoff: "2026-08-14T20:00:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 24, homeTeam: "cro", awayTeam: "can", homeScore: null, awayScore: null, kickoff: "2026-08-15T15:00:00+10:00", venue: "Sharks Stadium", status: "scheduled" },
  { season: 2026, round: 24, homeTeam: "par", awayTeam: "nql", homeScore: null, awayScore: null, kickoff: "2026-08-15T17:30:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 24, homeTeam: "bri", awayTeam: "nzl", homeScore: null, awayScore: null, kickoff: "2026-08-15T19:30:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 24, homeTeam: "new", awayTeam: "gld", homeScore: null, awayScore: null, kickoff: "2026-08-16T14:00:00+10:00", venue: "McDonald Jones Stadium", status: "scheduled" },
  { season: 2026, round: 24, homeTeam: "wst", awayTeam: "sti", homeScore: null, awayScore: null, kickoff: "2026-08-16T16:05:00+10:00", venue: "CommBank Stadium", status: "scheduled" },

  // Round 25
  { season: 2026, round: 25, homeTeam: "mel", awayTeam: "pen", homeScore: null, awayScore: null, kickoff: "2026-08-20T19:50:00+10:00", venue: "AAMI Park", status: "scheduled" },
  { season: 2026, round: 25, homeTeam: "can", awayTeam: "bri", homeScore: null, awayScore: null, kickoff: "2026-08-21T18:00:00+10:00", venue: "GIO Stadium", status: "scheduled" },
  { season: 2026, round: 25, homeTeam: "dol", awayTeam: "par", homeScore: null, awayScore: null, kickoff: "2026-08-21T20:00:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 25, homeTeam: "new", awayTeam: "man", homeScore: null, awayScore: null, kickoff: "2026-08-22T15:00:00+10:00", venue: "McDonald Jones Stadium", status: "scheduled" },
  { season: 2026, round: 25, homeTeam: "sou", awayTeam: "nzl", homeScore: null, awayScore: null, kickoff: "2026-08-22T17:30:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 25, homeTeam: "sti", awayTeam: "cby", homeScore: null, awayScore: null, kickoff: "2026-08-22T19:30:00+10:00", venue: "Allianz Stadium", status: "scheduled" },
  { season: 2026, round: 25, homeTeam: "gld", awayTeam: "cro", homeScore: null, awayScore: null, kickoff: "2026-08-23T14:00:00+10:00", venue: "Cbus Super Stadium", status: "scheduled" },
  { season: 2026, round: 25, homeTeam: "syd", awayTeam: "wst", homeScore: null, awayScore: null, kickoff: "2026-08-23T16:05:00+10:00", venue: "Allianz Stadium", status: "scheduled" },

  // Round 26
  { season: 2026, round: 26, homeTeam: "bri", awayTeam: "mel", homeScore: null, awayScore: null, kickoff: "2026-08-27T19:50:00+10:00", venue: "Suncorp Stadium", status: "scheduled" },
  { season: 2026, round: 26, homeTeam: "man", awayTeam: "sti", homeScore: null, awayScore: null, kickoff: "2026-08-28T18:00:00+10:00", venue: "4 Pines Park", status: "scheduled" },
  { season: 2026, round: 26, homeTeam: "pen", awayTeam: "cby", homeScore: null, awayScore: null, kickoff: "2026-08-28T20:00:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
  { season: 2026, round: 26, homeTeam: "gld", awayTeam: "sou", homeScore: null, awayScore: null, kickoff: "2026-08-29T15:00:00+10:00", venue: "Cbus Super Stadium", status: "scheduled" },
  { season: 2026, round: 26, homeTeam: "syd", awayTeam: "dol", homeScore: null, awayScore: null, kickoff: "2026-08-29T17:30:00+10:00", venue: "Allianz Stadium", status: "scheduled" },
  { season: 2026, round: 26, homeTeam: "nql", awayTeam: "wst", homeScore: null, awayScore: null, kickoff: "2026-08-29T19:30:00+10:00", venue: "QLD Country Bank Stadium", status: "scheduled" },
  { season: 2026, round: 26, homeTeam: "nzl", awayTeam: "new", homeScore: null, awayScore: null, kickoff: "2026-08-30T14:00:00+12:00", venue: "Go Media Stadium", status: "scheduled" },
  { season: 2026, round: 26, homeTeam: "par", awayTeam: "cro", homeScore: null, awayScore: null, kickoff: "2026-08-30T16:05:00+10:00", venue: "CommBank Stadium", status: "scheduled" },

  // Round 27
  { season: 2026, round: 27, homeTeam: "cby", awayTeam: "bri", homeScore: null, awayScore: null, kickoff: "2026-09-03T19:50:00+10:00", venue: "Accor Stadium", status: "scheduled" },
  { season: 2026, round: 27, homeTeam: "gld", awayTeam: "dol", homeScore: null, awayScore: null, kickoff: "2026-09-04T18:00:00+10:00", venue: "Cbus Super Stadium", status: "scheduled" },
  { season: 2026, round: 27, homeTeam: "sou", awayTeam: "syd", homeScore: null, awayScore: null, kickoff: "2026-09-04T20:00:00+10:00", venue: "Allianz Stadium", status: "scheduled" },
  { season: 2026, round: 27, homeTeam: "nzl", awayTeam: "man", homeScore: null, awayScore: null, kickoff: "2026-09-05T15:00:00+12:00", venue: "Go Media Stadium", status: "scheduled" },
  { season: 2026, round: 27, homeTeam: "nql", awayTeam: "can", homeScore: null, awayScore: null, kickoff: "2026-09-05T17:30:00+10:00", venue: "QLD Country Bank Stadium", status: "scheduled" },
  { season: 2026, round: 27, homeTeam: "cro", awayTeam: "mel", homeScore: null, awayScore: null, kickoff: "2026-09-05T19:30:00+10:00", venue: "Sharks Stadium", status: "scheduled" },
  { season: 2026, round: 27, homeTeam: "sti", awayTeam: "par", homeScore: null, awayScore: null, kickoff: "2026-09-06T14:00:00+10:00", venue: "WIN Stadium", status: "scheduled" },
  { season: 2026, round: 27, homeTeam: "pen", awayTeam: "wst", homeScore: null, awayScore: null, kickoff: "2026-09-06T16:05:00+10:00", venue: "CommBank Stadium", status: "scheduled" },
];

function main() {
  console.log("Adding 2026 fixtures (rounds 11-27)...");

  // Delete existing rounds 11-27 for 2026 if any
  db.prepare("DELETE FROM games WHERE season = 2026 AND round >= 11").run();

  const insertStmt = db.prepare(`
    INSERT INTO games (id, season, round, home_team_id, away_team_id, home_score, away_score, venue, kickoff, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const game of games2026Remaining) {
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

  console.log(`Inserted ${games2026Remaining.length} games for 2026 (rounds 11-27)`);
  console.log("Done!");
  db.close();
}

main();
