import { getDb, generateId } from "./database";
import { NRL_TEAMS, getTeamById } from "./teams";
import {
  calculateWinPercentage,
  calculateDifferential,
  calculateNRLPoints,
  sortLadder,
  assignPositions,
} from "./calculations";
import type { Team, Game, LadderEntry, GameStatus } from "./types";

/**
 * Seed the database with NRL teams
 */
export function seedTeams(): void {
  const db = getDb();

  const insertTeam = db.prepare(`
    INSERT OR REPLACE INTO teams (id, name, location, short_code, primary_color, secondary_color, logo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((teams: Team[]) => {
    for (const team of teams) {
      insertTeam.run(
        team.id,
        team.name,
        team.location,
        team.shortCode,
        team.primaryColor,
        team.secondaryColor,
        team.logoUrl || null
      );
    }
  });

  insertMany(NRL_TEAMS);
}

/**
 * Get all teams from database
 */
export function getAllTeams(): Team[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
    SELECT id, name, location, short_code as shortCode,
           primary_color as primaryColor, secondary_color as secondaryColor,
           logo_url as logoUrl
    FROM teams
    ORDER BY name
  `
    )
    .all() as Team[];

  return rows;
}

/**
 * Get games for a specific round
 */
export function getGamesByRound(season: number, round: number): Game[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
    SELECT id, season, round, home_team_id as homeTeamId, away_team_id as awayTeamId,
           home_score as homeScore, away_score as awayScore, venue, kickoff, status, minute
    FROM games
    WHERE season = ? AND round = ?
    ORDER BY kickoff
  `
    )
    .all(season, round) as Game[];

  return rows;
}

/**
 * Get all games for a season
 */
export function getGamesBySeason(season: number): Game[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
    SELECT id, season, round, home_team_id as homeTeamId, away_team_id as awayTeamId,
           home_score as homeScore, away_score as awayScore, venue, kickoff, status, minute
    FROM games
    WHERE season = ?
    ORDER BY round, kickoff
  `
    )
    .all(season) as Game[];

  return rows;
}

/**
 * Insert a game
 */
export function insertGame(game: Omit<Game, "id">): string {
  const db = getDb();
  const id = generateId();

  db.prepare(
    `
    INSERT INTO games (id, season, round, home_team_id, away_team_id, home_score, away_score, venue, kickoff, status, minute)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    id,
    game.season,
    game.round,
    game.homeTeamId,
    game.awayTeamId,
    game.homeScore,
    game.awayScore,
    game.venue,
    game.kickoff,
    game.status,
    game.minute || null
  );

  return id;
}

/**
 * Update game score
 */
export function updateGameScore(
  gameId: string,
  homeScore: number,
  awayScore: number,
  status: GameStatus,
  minute?: number
): void {
  const db = getDb();

  db.prepare(
    `
    UPDATE games
    SET home_score = ?, away_score = ?, status = ?, minute = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `
  ).run(homeScore, awayScore, status, minute || null, gameId);
}

/**
 * Calculate ladder from games for a specific round
 */
export function calculateLadderFromGames(
  season: number,
  upToRound: number
): LadderEntry[] {
  const db = getDb();

  // Get all completed games up to the specified round
  const games = db
    .prepare(
      `
    SELECT home_team_id, away_team_id, home_score, away_score, round
    FROM games
    WHERE season = ? AND round <= ? AND status = 'final'
  `
    )
    .all(season, upToRound) as {
    home_team_id: string;
    away_team_id: string;
    home_score: number;
    away_score: number;
    round: number;
  }[];

  // Initialize stats for all teams
  const stats = new Map<
    string,
    {
      played: number;
      wins: number;
      losses: number;
      draws: number;
      pointsFor: number;
      pointsAgainst: number;
      roundsPlayed: Set<number>;
    }
  >();

  for (const team of NRL_TEAMS) {
    stats.set(team.id, {
      played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      roundsPlayed: new Set(),
    });
  }

  // Process games
  for (const game of games) {
    const homeStats = stats.get(game.home_team_id);
    const awayStats = stats.get(game.away_team_id);

    if (!homeStats || !awayStats) continue;

    // Update played
    homeStats.played++;
    awayStats.played++;
    homeStats.roundsPlayed.add(game.round);
    awayStats.roundsPlayed.add(game.round);

    // Update points
    homeStats.pointsFor += game.home_score;
    homeStats.pointsAgainst += game.away_score;
    awayStats.pointsFor += game.away_score;
    awayStats.pointsAgainst += game.home_score;

    // Update W/L/D
    if (game.home_score > game.away_score) {
      homeStats.wins++;
      awayStats.losses++;
    } else if (game.away_score > game.home_score) {
      awayStats.wins++;
      homeStats.losses++;
    } else {
      homeStats.draws++;
      awayStats.draws++;
    }
  }

  // Build ladder entries
  const entries: LadderEntry[] = [];

  for (const team of NRL_TEAMS) {
    const teamStats = stats.get(team.id);
    if (!teamStats) continue;

    const winPct = calculateWinPercentage(
      teamStats.wins,
      teamStats.losses,
      teamStats.draws
    );
    const differential = calculateDifferential(
      teamStats.pointsFor,
      teamStats.pointsAgainst
    );
    const nrlPoints = calculateNRLPoints(teamStats.wins, teamStats.draws);

    // Calculate byes (rounds where team didn't play)
    let byesTaken = 0;
    for (let r = 1; r <= upToRound; r++) {
      if (!teamStats.roundsPlayed.has(r)) {
        byesTaken++;
      }
    }

    entries.push({
      team,
      season,
      round: upToRound,
      played: teamStats.played,
      wins: teamStats.wins,
      losses: teamStats.losses,
      draws: teamStats.draws,
      pointsFor: teamStats.pointsFor,
      pointsAgainst: teamStats.pointsAgainst,
      differential,
      winPct,
      nrlPoints,
      position: 0, // Will be assigned after sorting
      byesTaken,
    });
  }

  // Sort and assign positions
  const sorted = sortLadder(entries);
  return assignPositions(sorted);
}

/**
 * Get or calculate ladder for a specific round
 */
export function getLadder(season: number, round?: number): LadderEntry[] {
  const db = getDb();

  // If no round specified, find the latest round with completed games
  if (!round) {
    const latestRound = db
      .prepare(
        `
      SELECT MAX(round) as maxRound
      FROM games
      WHERE season = ? AND status = 'final'
    `
      )
      .get(season) as { maxRound: number | null };

    round = latestRound?.maxRound || 1;
  }

  // Check if we have a snapshot for this round
  const snapshot = db
    .prepare(
      `
    SELECT ls.*, t.name, t.location, t.short_code as shortCode,
           t.primary_color as primaryColor, t.secondary_color as secondaryColor,
           t.logo_url as logoUrl
    FROM ladder_snapshots ls
    JOIN teams t ON ls.team_id = t.id
    WHERE ls.season = ? AND ls.round = ?
    ORDER BY ls.position
  `
    )
    .all(season, round) as any[];

  if (snapshot.length > 0) {
    return snapshot.map((row) => ({
      team: {
        id: row.team_id,
        name: row.name,
        location: row.location,
        shortCode: row.shortCode,
        primaryColor: row.primaryColor,
        secondaryColor: row.secondaryColor,
        logoUrl: row.logoUrl,
      },
      season: row.season,
      round: row.round,
      played: row.played,
      wins: row.wins,
      losses: row.losses,
      draws: row.draws,
      pointsFor: row.points_for,
      pointsAgainst: row.points_against,
      differential: row.differential,
      winPct: row.win_pct,
      nrlPoints: row.nrl_points,
      position: row.position,
      byesTaken: row.byes_taken,
    }));
  }

  // No snapshot, calculate from games
  return calculateLadderFromGames(season, round);
}

/**
 * Save ladder snapshot
 */
export function saveLadderSnapshot(entries: LadderEntry[]): void {
  const db = getDb();

  const insert = db.prepare(`
    INSERT OR REPLACE INTO ladder_snapshots
    (id, season, round, team_id, played, wins, losses, draws,
     points_for, points_against, differential, win_pct, nrl_points, position, byes_taken)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((entries: LadderEntry[]) => {
    for (const entry of entries) {
      insert.run(
        generateId(),
        entry.season,
        entry.round,
        entry.team.id,
        entry.played,
        entry.wins,
        entry.losses,
        entry.draws,
        entry.pointsFor,
        entry.pointsAgainst,
        entry.differential,
        entry.winPct,
        entry.nrlPoints,
        entry.position,
        entry.byesTaken
      );
    }
  });

  insertMany(entries);
}

/**
 * Initialize database with teams
 */
export function initializeDatabase(): void {
  const db = getDb(); // This creates tables if they don't exist
  seedTeams();
}
