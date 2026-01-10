// Core domain types for Footy Ladder

export interface Team {
  id: string;
  name: string;
  location: string;
  shortCode: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

export interface Game {
  id: string;
  season: number;
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  venue: string;
  kickoff: string; // ISO date string
  status: GameStatus;
  minute?: number;
}

export type GameStatus = "scheduled" | "live" | "final" | "postponed";

export interface LadderEntry {
  team: Team;
  season: number;
  round: number;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  pointsFor: number;
  pointsAgainst: number;
  differential: number;
  winPct: number;
  nrlPoints: number;
  position: number;
  byesTaken: number;
}

export interface GameWithTeams extends Game {
  homeTeam: Team;
  awayTeam: Team;
}

export type SortOption =
  | "winPct"
  | "wins"
  | "losses"
  | "played"
  | "draws"
  | "differential"
  | "pointsFor"
  | "pointsAgainst"
  | "pfPerGame"
  | "paPerGame";

export type SortDirection = "asc" | "desc";

export type ViewMode = "ladder" | "attack" | "defense";
