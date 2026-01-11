/**
 * 2026 NRL Season Schedule Import
 * Source: Rugby League Project (rugbyleagueproject.org/seasons/nrl-2026/results.html)
 *
 * All kickoff times stored in UTC.
 * Original times from source are in AEST/AEDT:
 * - Before April 5: AEDT (UTC+11)
 * - April 5 onwards: AEST (UTC+10)
 */

import { sql, generateId } from "./database";
import type { GameStatus } from "./types";

// Map team names from source to our team IDs
const TEAM_NAME_MAP: Record<string, string> = {
  "Brisbane": "bri",
  "Canberra": "can",
  "Canterbury": "cby",
  "Cronulla": "cro",
  "Dolphins": "dol",
  "Gold Coast": "gld",
  "Manly": "man",
  "Melbourne": "mel",
  "Newcastle": "new",
  "North Qld": "nql",
  "Warriors": "nzl",
  "Parramatta": "par",
  "Penrith": "pen",
  "South Sydney": "sou",
  "St Geo Illa": "sti",
  "Sydney": "syd",
  "Wests Tigers": "wst",
};

interface ScheduledGame {
  homeTeam: string;
  awayTeam: string;
  venue: string;
  kickoffUTC: string | null; // ISO string in UTC, null if TBD
}

interface RoundData {
  round: number;
  name?: string; // e.g., "Magic Round", "ANZAC Round"
  games: ScheduledGame[];
}

// 2026 NRL Season Schedule - All times converted to UTC
const SEASON_2026: RoundData[] = [
  {
    round: 1,
    games: [
      // Las Vegas games - Feb 28 (no kickoff times listed)
      { homeTeam: "Canterbury", awayTeam: "St Geo Illa", venue: "Allegiant Stadium", kickoffUTC: null },
      { homeTeam: "Newcastle", awayTeam: "North Qld", venue: "Allegiant Stadium", kickoffUTC: null },
      // Australian games - AEDT (UTC+11)
      { homeTeam: "Melbourne", awayTeam: "Parramatta", venue: "AAMI Park", kickoffUTC: "2026-03-05T09:00:00Z" }, // Thu 8pm AEDT
      { homeTeam: "Warriors", awayTeam: "Sydney", venue: "Go Media Stadium", kickoffUTC: "2026-03-06T09:00:00Z" }, // Fri 8pm AEDT
      { homeTeam: "Brisbane", awayTeam: "Penrith", venue: "Suncorp Stadium", kickoffUTC: "2026-03-06T08:00:00Z" }, // Fri 7pm AEDT
      { homeTeam: "Cronulla", awayTeam: "Gold Coast", venue: "PointsBet Stadium", kickoffUTC: "2026-03-07T06:30:00Z" }, // Sat 5:30pm AEDT
      { homeTeam: "Manly", awayTeam: "Canberra", venue: "4 Pines Park", kickoffUTC: "2026-03-07T08:30:00Z" }, // Sat 7:30pm AEDT
      { homeTeam: "Dolphins", awayTeam: "South Sydney", venue: "Suncorp Stadium", kickoffUTC: "2026-03-08T04:05:00Z" }, // Sun 3:05pm AEDT
    ],
  },
  {
    round: 2,
    games: [
      { homeTeam: "Brisbane", awayTeam: "Parramatta", venue: "Suncorp Stadium", kickoffUTC: "2026-03-12T08:00:00Z" }, // Thu 7pm AEDT
      { homeTeam: "Warriors", awayTeam: "Canberra", venue: "Go Media Stadium", kickoffUTC: "2026-03-13T09:00:00Z" }, // Fri 8pm AEDT
      { homeTeam: "Sydney", awayTeam: "South Sydney", venue: "Allianz Stadium", kickoffUTC: "2026-03-13T09:00:00Z" }, // Fri 8pm AEDT
      { homeTeam: "Wests Tigers", awayTeam: "North Qld", venue: "Leichhardt Oval", kickoffUTC: "2026-03-14T04:00:00Z" }, // Sat 3pm AEDT
      { homeTeam: "St Geo Illa", awayTeam: "Melbourne", venue: "WIN Stadium", kickoffUTC: "2026-03-14T06:30:00Z" }, // Sat 5:30pm AEDT
      { homeTeam: "Penrith", awayTeam: "Cronulla", venue: "BlueBet Stadium", kickoffUTC: "2026-03-14T08:30:00Z" }, // Sat 7:30pm AEDT
      { homeTeam: "Manly", awayTeam: "Newcastle", venue: "4 Pines Park", kickoffUTC: "2026-03-15T05:05:00Z" }, // Sun 4:05pm AEDT
      { homeTeam: "Dolphins", awayTeam: "Gold Coast", venue: "Suncorp Stadium", kickoffUTC: "2026-03-15T06:15:00Z" }, // Sun 5:15pm AEDT
    ],
  },
  {
    round: 3,
    name: "Multicultural Round",
    games: [
      { homeTeam: "Canberra", awayTeam: "Canterbury", venue: "GIO Stadium", kickoffUTC: "2026-03-19T09:00:00Z" }, // Thu 8pm AEDT
      { homeTeam: "Sydney", awayTeam: "Penrith", venue: "Allianz Stadium", kickoffUTC: "2026-03-20T07:00:00Z" }, // Fri 6pm AEDT
      { homeTeam: "Melbourne", awayTeam: "Brisbane", venue: "AAMI Park", kickoffUTC: "2026-03-20T09:00:00Z" }, // Fri 8pm AEDT
      { homeTeam: "Newcastle", awayTeam: "Warriors", venue: "McDonald Jones Stadium", kickoffUTC: "2026-03-21T04:00:00Z" }, // Sat 3pm AEDT
      { homeTeam: "Cronulla", awayTeam: "Dolphins", venue: "PointsBet Stadium", kickoffUTC: "2026-03-21T06:30:00Z" }, // Sat 5:30pm AEDT
      { homeTeam: "South Sydney", awayTeam: "Wests Tigers", venue: "Accor Stadium", kickoffUTC: "2026-03-21T08:30:00Z" }, // Sat 7:30pm AEDT
      { homeTeam: "Parramatta", awayTeam: "St Geo Illa", venue: "CommBank Stadium", kickoffUTC: "2026-03-22T05:05:00Z" }, // Sun 4:05pm AEDT
      { homeTeam: "North Qld", awayTeam: "Gold Coast", venue: "Qld Country Bank Stadium", kickoffUTC: "2026-03-22T06:15:00Z" }, // Sun 5:15pm AEDT
    ],
  },
  {
    round: 4,
    games: [
      { homeTeam: "Manly", awayTeam: "Sydney", venue: "4 Pines Park", kickoffUTC: "2026-03-26T09:00:00Z" }, // Thu 8pm AEDT
      { homeTeam: "Warriors", awayTeam: "Wests Tigers", venue: "Go Media Stadium", kickoffUTC: "2026-03-27T09:00:00Z" }, // Fri 8pm AEDT
      { homeTeam: "Brisbane", awayTeam: "Dolphins", venue: "Suncorp Stadium", kickoffUTC: "2026-03-27T08:00:00Z" }, // Fri 7pm AEDT
      { homeTeam: "Canterbury", awayTeam: "Newcastle", venue: "Accor Stadium", kickoffUTC: "2026-03-28T04:00:00Z" }, // Sat 3pm AEDT
      { homeTeam: "Penrith", awayTeam: "Parramatta", venue: "CommBank Stadium", kickoffUTC: "2026-03-28T06:30:00Z" }, // Sat 5:30pm AEDT
      { homeTeam: "North Qld", awayTeam: "Melbourne", venue: "Qld Country Bank Stadium", kickoffUTC: "2026-03-28T07:30:00Z" }, // Sat 6:30pm AEDT
      { homeTeam: "Canberra", awayTeam: "Cronulla", venue: "GIO Stadium", kickoffUTC: "2026-03-29T05:05:00Z" }, // Sun 4:05pm AEDT
      { homeTeam: "Gold Coast", awayTeam: "St Geo Illa", venue: "Cbus Super Stadium", kickoffUTC: "2026-03-29T06:15:00Z" }, // Sun 5:15pm AEDT
    ],
  },
  {
    round: 5,
    games: [
      { homeTeam: "Dolphins", awayTeam: "Manly", venue: "Kayo Stadium", kickoffUTC: "2026-04-02T08:00:00Z" }, // Thu 7pm AEDT
      { homeTeam: "South Sydney", awayTeam: "Canterbury", venue: "Accor Stadium", kickoffUTC: "2026-04-03T05:05:00Z" }, // Fri 4:05pm AEDT
      { homeTeam: "Penrith", awayTeam: "Melbourne", venue: "CommBank Stadium", kickoffUTC: "2026-04-03T09:00:00Z" }, // Fri 8pm AEDT
      { homeTeam: "St Geo Illa", awayTeam: "North Qld", venue: "Netstrata Jubilee Stadium", kickoffUTC: "2026-04-04T06:30:00Z" }, // Sat 5:30pm AEDT
      { homeTeam: "Gold Coast", awayTeam: "Brisbane", venue: "Cbus Super Stadium", kickoffUTC: "2026-04-04T07:30:00Z" }, // Sat 6:30pm AEDT
      // After April 5 - AEST (UTC+10)
      { homeTeam: "Cronulla", awayTeam: "Warriors", venue: "PointsBet Stadium", kickoffUTC: "2026-04-05T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Newcastle", awayTeam: "Canberra", venue: "McDonald Jones Stadium", kickoffUTC: "2026-04-05T06:05:00Z" }, // Sun 4:05pm AEST
      { homeTeam: "Parramatta", awayTeam: "Wests Tigers", venue: "CommBank Stadium", kickoffUTC: "2026-04-06T06:05:00Z" }, // Mon 4:05pm AEST
    ],
  },
  {
    round: 6,
    games: [
      { homeTeam: "Canterbury", awayTeam: "Penrith", venue: "Accor Stadium", kickoffUTC: "2026-04-09T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "St Geo Illa", awayTeam: "Manly", venue: "WIN Stadium", kickoffUTC: "2026-04-10T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "Brisbane", awayTeam: "North Qld", venue: "Suncorp Stadium", kickoffUTC: "2026-04-10T10:00:00Z" }, // Fri 8pm AEST
      // Perth double-header - AWST (UTC+8)
      { homeTeam: "South Sydney", awayTeam: "Canberra", venue: "Optus Stadium", kickoffUTC: "2026-04-11T05:00:00Z" }, // Sat 1pm AWST
      { homeTeam: "Cronulla", awayTeam: "Sydney", venue: "Optus Stadium", kickoffUTC: "2026-04-11T07:30:00Z" }, // Sat 3:30pm AWST
      { homeTeam: "Melbourne", awayTeam: "Warriors", venue: "AAMI Park", kickoffUTC: "2026-04-11T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Parramatta", awayTeam: "Gold Coast", venue: "CommBank Stadium", kickoffUTC: "2026-04-12T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Wests Tigers", awayTeam: "Newcastle", venue: "Campbelltown Stadium", kickoffUTC: "2026-04-12T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 7,
    games: [
      { homeTeam: "North Qld", awayTeam: "Manly", venue: "Qld Country Bank Stadium", kickoffUTC: "2026-04-16T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Canberra", awayTeam: "Melbourne", venue: "GIO Stadium", kickoffUTC: "2026-04-17T08:00:00Z" }, // Fri 6pm AEST
      // Darwin game - ACST (UTC+9:30)
      { homeTeam: "Dolphins", awayTeam: "Penrith", venue: "TIO Stadium", kickoffUTC: "2026-04-17T10:00:00Z" }, // Fri 7:30pm ACST
      { homeTeam: "Warriors", awayTeam: "Gold Coast", venue: "Go Media Stadium", kickoffUTC: "2026-04-18T07:00:00Z" }, // Sat 5pm AEST
      { homeTeam: "South Sydney", awayTeam: "St Geo Illa", venue: "Accor Stadium", kickoffUTC: "2026-04-18T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Wests Tigers", awayTeam: "Brisbane", venue: "Campbelltown Stadium", kickoffUTC: "2026-04-18T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Sydney", awayTeam: "Newcastle", venue: "Allianz Stadium", kickoffUTC: "2026-04-19T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Parramatta", awayTeam: "Canterbury", venue: "CommBank Stadium", kickoffUTC: "2026-04-19T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 8,
    name: "ANZAC Round",
    games: [
      { homeTeam: "Wests Tigers", awayTeam: "Canberra", venue: "Leichhardt Oval", kickoffUTC: "2026-04-23T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "North Qld", awayTeam: "Cronulla", venue: "Qld Country Bank Stadium", kickoffUTC: "2026-04-24T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "Brisbane", awayTeam: "Canterbury", venue: "Suncorp Stadium", kickoffUTC: "2026-04-24T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "St Geo Illa", awayTeam: "Sydney", venue: "Allianz Stadium", kickoffUTC: "2026-04-25T06:00:00Z" }, // Sat 4pm AEST (ANZAC Day)
      // Wellington game - NZST (UTC+12)
      { homeTeam: "Warriors", awayTeam: "Dolphins", venue: "Sky Stadium", kickoffUTC: "2026-04-25T08:05:00Z" }, // Sat 8:05pm NZST
      { homeTeam: "Melbourne", awayTeam: "South Sydney", venue: "AAMI Park", kickoffUTC: "2026-04-25T10:10:00Z" }, // Sat 8:10pm AEST
      { homeTeam: "Newcastle", awayTeam: "Penrith", venue: "McDonald Jones Stadium", kickoffUTC: "2026-04-26T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Manly", awayTeam: "Parramatta", venue: "4 Pines Park", kickoffUTC: "2026-04-26T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 9,
    games: [
      { homeTeam: "Canterbury", awayTeam: "North Qld", venue: "Accor Stadium", kickoffUTC: "2026-05-01T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "Dolphins", awayTeam: "Melbourne", venue: "Suncorp Stadium", kickoffUTC: "2026-05-01T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Gold Coast", awayTeam: "Canberra", venue: "Cbus Super Stadium", kickoffUTC: "2026-05-02T05:00:00Z" }, // Sat 3pm AEST
      { homeTeam: "Parramatta", awayTeam: "Warriors", venue: "CommBank Stadium", kickoffUTC: "2026-05-02T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Sydney", awayTeam: "Brisbane", venue: "Allianz Stadium", kickoffUTC: "2026-05-02T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Newcastle", awayTeam: "South Sydney", venue: "McDonald Jones Stadium", kickoffUTC: "2026-05-03T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Cronulla", awayTeam: "Wests Tigers", venue: "PointsBet Stadium", kickoffUTC: "2026-05-03T06:05:00Z" }, // Sun 4:05pm AEST
      { homeTeam: "Penrith", awayTeam: "Manly", venue: "CommBank Stadium", kickoffUTC: "2026-05-03T08:15:00Z" }, // Sun 6:15pm AEST
    ],
  },
  {
    round: 10,
    games: [
      { homeTeam: "Dolphins", awayTeam: "Canterbury", venue: "Suncorp Stadium", kickoffUTC: "2026-05-07T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Sydney", awayTeam: "Gold Coast", venue: "Accor Stadium", kickoffUTC: "2026-05-08T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "North Qld", awayTeam: "Parramatta", venue: "Qld Country Bank Stadium", kickoffUTC: "2026-05-08T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "St Geo Illa", awayTeam: "Newcastle", venue: "WIN Stadium", kickoffUTC: "2026-05-09T05:00:00Z" }, // Sat 3pm AEST
      { homeTeam: "South Sydney", awayTeam: "Cronulla", venue: "Accor Stadium", kickoffUTC: "2026-05-09T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Manly", awayTeam: "Brisbane", venue: "4 Pines Park", kickoffUTC: "2026-05-09T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Melbourne", awayTeam: "Wests Tigers", venue: "AAMI Park", kickoffUTC: "2026-05-10T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Canberra", awayTeam: "Penrith", venue: "GIO Stadium", kickoffUTC: "2026-05-10T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 11,
    name: "Magic Round",
    games: [
      // All games at Suncorp Stadium
      { homeTeam: "Cronulla", awayTeam: "Canterbury", venue: "Suncorp Stadium", kickoffUTC: "2026-05-15T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "South Sydney", awayTeam: "Dolphins", venue: "Suncorp Stadium", kickoffUTC: "2026-05-15T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Wests Tigers", awayTeam: "Manly", venue: "Suncorp Stadium", kickoffUTC: "2026-05-16T05:00:00Z" }, // Sat 3pm AEST
      { homeTeam: "Sydney", awayTeam: "North Qld", venue: "Suncorp Stadium", kickoffUTC: "2026-05-16T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Parramatta", awayTeam: "Melbourne", venue: "Suncorp Stadium", kickoffUTC: "2026-05-16T09:45:00Z" }, // Sat 7:45pm AEST
      { homeTeam: "Gold Coast", awayTeam: "Newcastle", venue: "Suncorp Stadium", kickoffUTC: "2026-05-17T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Warriors", awayTeam: "Brisbane", venue: "Suncorp Stadium", kickoffUTC: "2026-05-17T06:05:00Z" }, // Sun 4:05pm AEST
      { homeTeam: "Penrith", awayTeam: "St Geo Illa", venue: "Suncorp Stadium", kickoffUTC: "2026-05-17T08:25:00Z" }, // Sun 6:25pm AEST
    ],
  },
  {
    round: 12,
    games: [
      { homeTeam: "Canberra", awayTeam: "Dolphins", venue: "GIO Stadium", kickoffUTC: "2026-05-21T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Canterbury", awayTeam: "Melbourne", venue: "Accor Stadium", kickoffUTC: "2026-05-22T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "St Geo Illa", awayTeam: "Warriors", venue: "Netstrata Jubilee Stadium", kickoffUTC: "2026-05-23T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Manly", awayTeam: "Gold Coast", venue: "4 Pines Park", kickoffUTC: "2026-05-23T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "North Qld", awayTeam: "South Sydney", venue: "Qld Country Bank Stadium", kickoffUTC: "2026-05-24T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 13,
    games: [
      { homeTeam: "Cronulla", awayTeam: "Manly", venue: "PointsBet Stadium", kickoffUTC: "2026-05-29T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Newcastle", awayTeam: "Parramatta", venue: "McDonald Jones Stadium", kickoffUTC: "2026-05-30T05:00:00Z" }, // Sat 3pm AEST
      { homeTeam: "Wests Tigers", awayTeam: "Canterbury", venue: "CommBank Stadium", kickoffUTC: "2026-05-30T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Melbourne", awayTeam: "Sydney", venue: "AAMI Park", kickoffUTC: "2026-05-30T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Brisbane", awayTeam: "St Geo Illa", venue: "Suncorp Stadium", kickoffUTC: "2026-05-31T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Canberra", awayTeam: "North Qld", venue: "GIO Stadium", kickoffUTC: "2026-05-31T06:05:00Z" }, // Sun 4:05pm AEST
      { homeTeam: "Penrith", awayTeam: "Warriors", venue: "CommBank Stadium", kickoffUTC: "2026-05-31T08:15:00Z" }, // Sun 6:15pm AEST
    ],
  },
  {
    round: 14,
    games: [
      { homeTeam: "Manly", awayTeam: "South Sydney", venue: "4 Pines Park", kickoffUTC: "2026-06-04T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Melbourne", awayTeam: "Newcastle", venue: "AAMI Park", kickoffUTC: "2026-06-05T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "Canberra", awayTeam: "Sydney", venue: "GIO Stadium", kickoffUTC: "2026-06-05T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "North Qld", awayTeam: "Dolphins", venue: "Qld Country Bank Stadium", kickoffUTC: "2026-06-06T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Brisbane", awayTeam: "Gold Coast", venue: "Suncorp Stadium", kickoffUTC: "2026-06-06T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Wests Tigers", awayTeam: "Penrith", venue: "CommBank Stadium", kickoffUTC: "2026-06-07T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Cronulla", awayTeam: "St Geo Illa", venue: "PointsBet Stadium", kickoffUTC: "2026-06-07T06:05:00Z" }, // Sun 4:05pm AEST
      { homeTeam: "Canterbury", awayTeam: "Parramatta", venue: "Accor Stadium", kickoffUTC: "2026-06-08T06:05:00Z" }, // Mon 4:05pm AEST
    ],
  },
  {
    round: 15,
    games: [
      { homeTeam: "South Sydney", awayTeam: "Brisbane", venue: "Accor Stadium", kickoffUTC: "2026-06-11T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Dolphins", awayTeam: "Sydney", venue: "Suncorp Stadium", kickoffUTC: "2026-06-12T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Warriors", awayTeam: "Cronulla", venue: "Go Media Stadium", kickoffUTC: "2026-06-13T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Parramatta", awayTeam: "Canberra", venue: "CommBank Stadium", kickoffUTC: "2026-06-13T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Wests Tigers", awayTeam: "Gold Coast", venue: "Leichhardt Oval", kickoffUTC: "2026-06-14T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 16,
    games: [
      { homeTeam: "Newcastle", awayTeam: "St Geo Illa", venue: "McDonald Jones Stadium", kickoffUTC: "2026-06-19T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Wests Tigers", awayTeam: "Dolphins", venue: "Campbelltown Stadium", kickoffUTC: "2026-06-20T05:00:00Z" }, // Sat 3pm AEST
      { homeTeam: "Gold Coast", awayTeam: "Penrith", venue: "Cbus Super Stadium", kickoffUTC: "2026-06-20T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Canterbury", awayTeam: "Manly", venue: "Accor Stadium", kickoffUTC: "2026-06-20T09:30:00Z" }, // Sat 7:30pm AEST
      // Auckland game - NZST (UTC+12)
      { homeTeam: "Warriors", awayTeam: "North Qld", venue: "Go Media Stadium", kickoffUTC: "2026-06-21T04:00:00Z" }, // Sun 4pm NZST
      { homeTeam: "Melbourne", awayTeam: "Canberra", venue: "AAMI Park", kickoffUTC: "2026-06-21T06:05:00Z" }, // Sun 4:05pm AEST
      { homeTeam: "Sydney", awayTeam: "Cronulla", venue: "Allianz Stadium", kickoffUTC: "2026-06-21T08:15:00Z" }, // Sun 6:15pm AEST
    ],
  },
  {
    round: 17,
    name: "Beanie for Brain Cancer Round",
    games: [
      { homeTeam: "Parramatta", awayTeam: "South Sydney", venue: "CommBank Stadium", kickoffUTC: "2026-06-25T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Gold Coast", awayTeam: "Canterbury", venue: "Cbus Super Stadium", kickoffUTC: "2026-06-26T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "Brisbane", awayTeam: "Sydney", venue: "Suncorp Stadium", kickoffUTC: "2026-06-26T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Dolphins", awayTeam: "Warriors", venue: "Suncorp Stadium", kickoffUTC: "2026-06-27T05:00:00Z" }, // Sat 3pm AEST
      { homeTeam: "North Qld", awayTeam: "Penrith", venue: "Qld Country Bank Stadium", kickoffUTC: "2026-06-27T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Manly", awayTeam: "Melbourne", venue: "4 Pines Park", kickoffUTC: "2026-06-27T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Canberra", awayTeam: "St Geo Illa", venue: "GIO Stadium", kickoffUTC: "2026-06-28T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Newcastle", awayTeam: "Wests Tigers", venue: "McDonald Jones Stadium", kickoffUTC: "2026-06-28T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 18,
    games: [
      { homeTeam: "Penrith", awayTeam: "South Sydney", venue: "CommBank Stadium", kickoffUTC: "2026-07-03T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "St Geo Illa", awayTeam: "Wests Tigers", venue: "Netstrata Jubilee Stadium", kickoffUTC: "2026-07-04T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Brisbane", awayTeam: "Cronulla", venue: "Suncorp Stadium", kickoffUTC: "2026-07-04T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Parramatta", awayTeam: "Manly", venue: "CommBank Stadium", kickoffUTC: "2026-07-05T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Newcastle", awayTeam: "Dolphins", venue: "McDonald Jones Stadium", kickoffUTC: "2026-07-05T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 19,
    games: [
      { homeTeam: "Wests Tigers", awayTeam: "Warriors", venue: "Campbelltown Stadium", kickoffUTC: "2026-07-10T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Dolphins", awayTeam: "Cronulla", venue: "Kayo Stadium", kickoffUTC: "2026-07-11T05:00:00Z" }, // Sat 3pm AEST
      { homeTeam: "Canterbury", awayTeam: "Canberra", venue: "Accor Stadium", kickoffUTC: "2026-07-11T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Sydney", awayTeam: "Parramatta", venue: "Allianz Stadium", kickoffUTC: "2026-07-11T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "South Sydney", awayTeam: "Newcastle", venue: "Accor Stadium", kickoffUTC: "2026-07-12T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Manly", awayTeam: "North Qld", venue: "4 Pines Park", kickoffUTC: "2026-07-12T06:05:00Z" }, // Sun 4:05pm AEST
      { homeTeam: "Melbourne", awayTeam: "Gold Coast", venue: "AAMI Park", kickoffUTC: "2026-07-12T08:15:00Z" }, // Sun 6:15pm AEST
    ],
  },
  {
    round: 20,
    name: "Women in League Round",
    games: [
      { homeTeam: "Penrith", awayTeam: "Brisbane", venue: "CommBank Stadium", kickoffUTC: "2026-07-16T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Cronulla", awayTeam: "Newcastle", venue: "PointsBet Stadium", kickoffUTC: "2026-07-17T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "Sydney", awayTeam: "Melbourne", venue: "Allianz Stadium", kickoffUTC: "2026-07-17T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Canberra", awayTeam: "South Sydney", venue: "GIO Stadium", kickoffUTC: "2026-07-18T05:00:00Z" }, // Sat 3pm AEST
      { homeTeam: "Warriors", awayTeam: "St Geo Illa", venue: "Go Media Stadium", kickoffUTC: "2026-07-18T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Canterbury", awayTeam: "Wests Tigers", venue: "Accor Stadium", kickoffUTC: "2026-07-18T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Gold Coast", awayTeam: "Manly", venue: "Cbus Super Stadium", kickoffUTC: "2026-07-19T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Dolphins", awayTeam: "North Qld", venue: "Suncorp Stadium", kickoffUTC: "2026-07-19T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 21,
    games: [
      { homeTeam: "Parramatta", awayTeam: "Penrith", venue: "CommBank Stadium", kickoffUTC: "2026-07-23T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Newcastle", awayTeam: "Sydney", venue: "McDonald Jones Stadium", kickoffUTC: "2026-07-24T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "South Sydney", awayTeam: "Melbourne", venue: "Accor Stadium", kickoffUTC: "2026-07-24T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Canberra", awayTeam: "Wests Tigers", venue: "GIO Stadium", kickoffUTC: "2026-07-25T05:00:00Z" }, // Sat 3pm AEST
      { homeTeam: "Canterbury", awayTeam: "Warriors", venue: "Accor Stadium", kickoffUTC: "2026-07-25T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "North Qld", awayTeam: "Brisbane", venue: "Qld Country Bank Stadium", kickoffUTC: "2026-07-25T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "St Geo Illa", awayTeam: "Gold Coast", venue: "Netstrata Jubilee Stadium", kickoffUTC: "2026-07-26T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Manly", awayTeam: "Cronulla", venue: "4 Pines Park", kickoffUTC: "2026-07-26T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 22,
    games: [
      { homeTeam: "North Qld", awayTeam: "Sydney", venue: "Qld Country Bank Stadium", kickoffUTC: "2026-07-30T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "St Geo Illa", awayTeam: "Dolphins", venue: "WIN Stadium", kickoffUTC: "2026-07-31T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "Melbourne", awayTeam: "Canterbury", venue: "AAMI Park", kickoffUTC: "2026-07-31T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Gold Coast", awayTeam: "Warriors", venue: "Cbus Super Stadium", kickoffUTC: "2026-08-01T05:00:00Z" }, // Sat 3pm AEST
      // Mudgee regional game
      { homeTeam: "Penrith", awayTeam: "Canberra", venue: "Glen Willow Stadium", kickoffUTC: "2026-08-01T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Brisbane", awayTeam: "Newcastle", venue: "Suncorp Stadium", kickoffUTC: "2026-08-01T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Cronulla", awayTeam: "South Sydney", venue: "PointsBet Stadium", kickoffUTC: "2026-08-02T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Wests Tigers", awayTeam: "Parramatta", venue: "CommBank Stadium", kickoffUTC: "2026-08-02T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 23,
    name: "Indigenous Round",
    games: [
      { homeTeam: "Gold Coast", awayTeam: "North Qld", venue: "Cbus Super Stadium", kickoffUTC: "2026-08-06T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Warriors", awayTeam: "Penrith", venue: "Go Media Stadium", kickoffUTC: "2026-08-07T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Sydney", awayTeam: "Canterbury", venue: "Allianz Stadium", kickoffUTC: "2026-08-07T10:00:00Z" }, // Fri 8pm AEST
      // Perth game - AWST (UTC+8)
      { homeTeam: "Melbourne", awayTeam: "Manly", venue: "HBF Park", kickoffUTC: "2026-08-08T05:00:00Z" }, // Sat 1pm AWST
      { homeTeam: "Dolphins", awayTeam: "Brisbane", venue: "Suncorp Stadium", kickoffUTC: "2026-08-08T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "South Sydney", awayTeam: "Parramatta", venue: "Allianz Stadium", kickoffUTC: "2026-08-08T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Canberra", awayTeam: "Newcastle", venue: "GIO Stadium", kickoffUTC: "2026-08-09T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "St Geo Illa", awayTeam: "Cronulla", venue: "Netstrata Jubilee Stadium", kickoffUTC: "2026-08-09T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 24,
    games: [
      { homeTeam: "Penrith", awayTeam: "Sydney", venue: "CommBank Stadium", kickoffUTC: "2026-08-13T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Manly", awayTeam: "Dolphins", venue: "4 Pines Park", kickoffUTC: "2026-08-14T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "Canterbury", awayTeam: "South Sydney", venue: "Accor Stadium", kickoffUTC: "2026-08-14T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Cronulla", awayTeam: "Canberra", venue: "PointsBet Stadium", kickoffUTC: "2026-08-15T05:00:00Z" }, // Sat 3pm AEST
      { homeTeam: "Parramatta", awayTeam: "North Qld", venue: "CommBank Stadium", kickoffUTC: "2026-08-15T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Brisbane", awayTeam: "Warriors", venue: "Suncorp Stadium", kickoffUTC: "2026-08-15T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Newcastle", awayTeam: "Gold Coast", venue: "McDonald Jones Stadium", kickoffUTC: "2026-08-16T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Wests Tigers", awayTeam: "St Geo Illa", venue: "CommBank Stadium", kickoffUTC: "2026-08-16T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 25,
    name: "Telstra Round",
    games: [
      { homeTeam: "Melbourne", awayTeam: "Penrith", venue: "AAMI Park", kickoffUTC: "2026-08-20T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Canberra", awayTeam: "Brisbane", venue: "GIO Stadium", kickoffUTC: "2026-08-21T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "Dolphins", awayTeam: "Parramatta", venue: "Suncorp Stadium", kickoffUTC: "2026-08-21T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Newcastle", awayTeam: "Manly", venue: "McDonald Jones Stadium", kickoffUTC: "2026-08-22T05:00:00Z" }, // Sat 3pm AEST
      { homeTeam: "South Sydney", awayTeam: "Warriors", venue: "Accor Stadium", kickoffUTC: "2026-08-22T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "St Geo Illa", awayTeam: "Canterbury", venue: "Allianz Stadium", kickoffUTC: "2026-08-22T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Gold Coast", awayTeam: "Cronulla", venue: "Cbus Super Stadium", kickoffUTC: "2026-08-23T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Sydney", awayTeam: "Wests Tigers", venue: "Allianz Stadium", kickoffUTC: "2026-08-23T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 26,
    games: [
      { homeTeam: "Brisbane", awayTeam: "Melbourne", venue: "Suncorp Stadium", kickoffUTC: "2026-08-27T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Manly", awayTeam: "St Geo Illa", venue: "4 Pines Park", kickoffUTC: "2026-08-28T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "Penrith", awayTeam: "Canterbury", venue: "CommBank Stadium", kickoffUTC: "2026-08-28T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Gold Coast", awayTeam: "South Sydney", venue: "Cbus Super Stadium", kickoffUTC: "2026-08-29T05:00:00Z" }, // Sat 3pm AEST
      { homeTeam: "Sydney", awayTeam: "Dolphins", venue: "Allianz Stadium", kickoffUTC: "2026-08-29T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "North Qld", awayTeam: "Wests Tigers", venue: "Qld Country Bank Stadium", kickoffUTC: "2026-08-29T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "Warriors", awayTeam: "Newcastle", venue: "Go Media Stadium", kickoffUTC: "2026-08-30T06:00:00Z" }, // Sun 4pm AEST
      { homeTeam: "Parramatta", awayTeam: "Cronulla", venue: "CommBank Stadium", kickoffUTC: "2026-08-30T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
  {
    round: 27,
    games: [
      { homeTeam: "Canterbury", awayTeam: "Brisbane", venue: "Accor Stadium", kickoffUTC: "2026-09-03T09:50:00Z" }, // Thu 7:50pm AEST
      { homeTeam: "Gold Coast", awayTeam: "Dolphins", venue: "Cbus Super Stadium", kickoffUTC: "2026-09-04T08:00:00Z" }, // Fri 6pm AEST
      { homeTeam: "South Sydney", awayTeam: "Sydney", venue: "Allianz Stadium", kickoffUTC: "2026-09-04T10:00:00Z" }, // Fri 8pm AEST
      { homeTeam: "Warriors", awayTeam: "Manly", venue: "Go Media Stadium", kickoffUTC: "2026-09-05T07:00:00Z" }, // Sat 5pm AEST
      { homeTeam: "North Qld", awayTeam: "Canberra", venue: "Qld Country Bank Stadium", kickoffUTC: "2026-09-05T07:30:00Z" }, // Sat 5:30pm AEST
      { homeTeam: "Cronulla", awayTeam: "Melbourne", venue: "PointsBet Stadium", kickoffUTC: "2026-09-05T09:30:00Z" }, // Sat 7:30pm AEST
      { homeTeam: "St Geo Illa", awayTeam: "Parramatta", venue: "WIN Stadium", kickoffUTC: "2026-09-06T04:00:00Z" }, // Sun 2pm AEST
      { homeTeam: "Penrith", awayTeam: "Wests Tigers", venue: "CommBank Stadium", kickoffUTC: "2026-09-06T06:05:00Z" }, // Sun 4:05pm AEST
    ],
  },
];

/**
 * Import all 2026 season games into the database
 */
export async function seed2026Season(): Promise<void> {
  let totalGames = 0;

  for (const roundData of SEASON_2026) {
    for (const game of roundData.games) {
      const homeTeamId = TEAM_NAME_MAP[game.homeTeam];
      const awayTeamId = TEAM_NAME_MAP[game.awayTeam];

      if (!homeTeamId || !awayTeamId) {
        console.error(`Unknown team: ${game.homeTeam} or ${game.awayTeam}`);
        continue;
      }

      const id = generateId();
      const status: GameStatus = "scheduled";

      await sql`
        INSERT INTO games (id, season, round, home_team_id, away_team_id, home_score, away_score, venue, kickoff, status, minute)
        VALUES (${id}, 2026, ${roundData.round}, ${homeTeamId}, ${awayTeamId},
                NULL, NULL, ${game.venue}, ${game.kickoffUTC}, ${status}, NULL)
        ON CONFLICT (id) DO NOTHING
      `;
      totalGames++;
    }
  }

  console.log(`Imported ${totalGames} games across ${SEASON_2026.length} rounds for 2026 NRL season`);
}

// Export for API use
export { SEASON_2026, TEAM_NAME_MAP as TEAM_NAME_MAP_2026 };
