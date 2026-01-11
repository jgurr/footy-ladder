import { sql, generateId, initSchema } from "./database";
import { NRL_TEAMS } from "./teams";
import {
  calculateWinPercentage,
  calculateDifferential,
  calculateNRLPoints,
  sortLadder,
  assignPositions,
} from "./calculations";
import type { Team, Game, LadderEntry, GameStatus } from "./types";

let schemaInitialized = false;

/**
 * Ensure schema and teams are initialized
 */
export async function initializeDatabase(): Promise<void> {
  if (schemaInitialized) return;

  await initSchema();
  await seedTeams();
  schemaInitialized = true;
}

/**
 * Seed the database with NRL teams
 */
export async function seedTeams(): Promise<void> {
  for (const team of NRL_TEAMS) {
    await sql`
      INSERT INTO teams (id, name, location, short_code, primary_color, secondary_color, logo_url)
      VALUES (${team.id}, ${team.name}, ${team.location}, ${team.shortCode}, ${team.primaryColor}, ${team.secondaryColor}, ${team.logoUrl || null})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        location = EXCLUDED.location,
        short_code = EXCLUDED.short_code,
        primary_color = EXCLUDED.primary_color,
        secondary_color = EXCLUDED.secondary_color,
        logo_url = EXCLUDED.logo_url
    `;
  }
}

/**
 * Get all teams from database
 */
export async function getAllTeams(): Promise<Team[]> {
  const { rows } = await sql`
    SELECT id, name, location, short_code as "shortCode",
           primary_color as "primaryColor", secondary_color as "secondaryColor",
           logo_url as "logoUrl"
    FROM teams
    ORDER BY name
  `;
  return rows as Team[];
}

/**
 * Get games for a specific round
 */
export async function getGamesByRound(season: number, round: number): Promise<Game[]> {
  const { rows } = await sql`
    SELECT id, season, round, home_team_id as "homeTeamId", away_team_id as "awayTeamId",
           home_score as "homeScore", away_score as "awayScore", venue, kickoff, status, minute
    FROM games
    WHERE season = ${season} AND round = ${round}
    ORDER BY kickoff NULLS FIRST
  `;
  return rows as Game[];
}

/**
 * Get all games for a season
 */
export async function getGamesBySeason(season: number): Promise<Game[]> {
  const { rows } = await sql`
    SELECT id, season, round, home_team_id as "homeTeamId", away_team_id as "awayTeamId",
           home_score as "homeScore", away_score as "awayScore", venue, kickoff, status, minute
    FROM games
    WHERE season = ${season}
    ORDER BY round, kickoff NULLS FIRST
  `;
  return rows as Game[];
}

/**
 * Insert a game
 */
export async function insertGame(game: Omit<Game, "id">): Promise<string> {
  const id = generateId();

  await sql`
    INSERT INTO games (id, season, round, home_team_id, away_team_id, home_score, away_score, venue, kickoff, status, minute)
    VALUES (${id}, ${game.season}, ${game.round}, ${game.homeTeamId}, ${game.awayTeamId},
            ${game.homeScore}, ${game.awayScore}, ${game.venue}, ${game.kickoff}, ${game.status}, ${game.minute || null})
  `;

  return id;
}

/**
 * Update game score
 */
export async function updateGameScore(
  gameId: string,
  homeScore: number,
  awayScore: number,
  status: GameStatus,
  minute?: number
): Promise<void> {
  await sql`
    UPDATE games
    SET home_score = ${homeScore}, away_score = ${awayScore}, status = ${status},
        minute = ${minute || null}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${gameId}
  `;
}

/**
 * Calculate ladder from games for a specific round
 */
export async function calculateLadderFromGames(
  season: number,
  upToRound: number
): Promise<LadderEntry[]> {
  // Get all completed games up to the specified round
  const { rows: games } = await sql`
    SELECT home_team_id, away_team_id, home_score, away_score, round
    FROM games
    WHERE season = ${season} AND round <= ${upToRound} AND status = 'final'
  `;

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
export async function getLadder(season: number, round?: number): Promise<LadderEntry[]> {
  // If no round specified, find the latest round with completed games
  let currentRound: number;
  if (!round) {
    const { rows } = await sql`
      SELECT MAX(round) as "maxRound"
      FROM games
      WHERE season = ${season} AND status = 'final'
    `;
    currentRound = rows[0]?.maxRound || 1;
  } else {
    currentRound = round;
  }

  // Check if we have a snapshot for this round
  const { rows: snapshot } = await sql`
    SELECT ls.*, t.name, t.location, t.short_code as "shortCode",
           t.primary_color as "primaryColor", t.secondary_color as "secondaryColor",
           t.logo_url as "logoUrl"
    FROM ladder_snapshots ls
    JOIN teams t ON ls.team_id = t.id
    WHERE ls.season = ${season} AND ls.round = ${currentRound}
    ORDER BY ls.position
  `;

  if (snapshot.length > 0) {
    return snapshot.map((row: any) => ({
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
  return calculateLadderFromGames(season, currentRound);
}

/**
 * Save ladder snapshot
 */
export async function saveLadderSnapshot(entries: LadderEntry[]): Promise<void> {
  for (const entry of entries) {
    const id = generateId();
    await sql`
      INSERT INTO ladder_snapshots
      (id, season, round, team_id, played, wins, losses, draws,
       points_for, points_against, differential, win_pct, nrl_points, position, byes_taken)
      VALUES (${id}, ${entry.season}, ${entry.round}, ${entry.team.id}, ${entry.played},
              ${entry.wins}, ${entry.losses}, ${entry.draws}, ${entry.pointsFor},
              ${entry.pointsAgainst}, ${entry.differential}, ${entry.winPct},
              ${entry.nrlPoints}, ${entry.position}, ${entry.byesTaken})
      ON CONFLICT (season, round, team_id) DO UPDATE SET
        played = EXCLUDED.played,
        wins = EXCLUDED.wins,
        losses = EXCLUDED.losses,
        draws = EXCLUDED.draws,
        points_for = EXCLUDED.points_for,
        points_against = EXCLUDED.points_against,
        differential = EXCLUDED.differential,
        win_pct = EXCLUDED.win_pct,
        nrl_points = EXCLUDED.nrl_points,
        position = EXCLUDED.position,
        byes_taken = EXCLUDED.byes_taken
    `;
  }
}

/**
 * Get upcoming games for a team (next N rounds from current round)
 */
export async function getUpcomingGamesForTeam(
  season: number,
  teamId: string,
  fromRound: number,
  count: number = 5
): Promise<Array<{
  round: number;
  opponentId: string | null;
  isHome: boolean;
  opponentPosition?: number;
}>> {
  const results: Array<{
    round: number;
    opponentId: string | null;
    isHome: boolean;
    opponentPosition?: number;
  }> = [];

  // Get games for the next N rounds
  for (let r = fromRound; r < fromRound + count && r <= 27; r++) {
    const { rows } = await sql`
      SELECT round, home_team_id, away_team_id
      FROM games
      WHERE season = ${season} AND round = ${r} AND (home_team_id = ${teamId} OR away_team_id = ${teamId})
      LIMIT 1
    `;

    if (rows.length > 0) {
      const game = rows[0];
      const isHome = game.home_team_id === teamId;
      results.push({
        round: r,
        opponentId: isHome ? game.away_team_id : game.home_team_id,
        isHome,
      });
    } else {
      // Bye round
      results.push({
        round: r,
        opponentId: null,
        isHome: false,
      });
    }
  }

  return results;
}

/**
 * Get next 5 fixtures for all teams (for ladder Next 5 view)
 */
export async function getNext5ForAllTeams(
  season: number,
  currentRound: number,
  ladderPositions: Map<string, number>
): Promise<Map<
  string,
  Array<{
    round: number;
    opponentId: string | null;
    isHome: boolean;
    opponentPosition: number;
  }>
>> {
  const result = new Map<
    string,
    Array<{
      round: number;
      opponentId: string | null;
      isHome: boolean;
      opponentPosition: number;
    }>
  >();

  for (const team of NRL_TEAMS) {
    const fixtures = await getUpcomingGamesForTeam(season, team.id, currentRound, 5);
    result.set(
      team.id,
      fixtures.map((f) => ({
        ...f,
        opponentPosition: f.opponentId ? ladderPositions.get(f.opponentId) || 0 : 0,
      }))
    );
  }

  return result;
}

/**
 * Get total byes in a season for a team
 */
export function getTotalByesForSeason(season: number): number {
  // 2026 has 3 byes per team
  // 2025 varied but was also around 3
  return 3;
}
