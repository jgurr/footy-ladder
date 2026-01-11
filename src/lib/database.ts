import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";

/**
 * Initialize database schema
 */
export async function initSchema(): Promise<void> {
  // Teams table
  await sql`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      short_code TEXT UNIQUE NOT NULL,
      primary_color TEXT NOT NULL,
      secondary_color TEXT NOT NULL,
      logo_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Games table
  await sql`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      season INTEGER NOT NULL,
      round INTEGER NOT NULL,
      home_team_id TEXT NOT NULL REFERENCES teams(id),
      away_team_id TEXT NOT NULL REFERENCES teams(id),
      home_score INTEGER,
      away_score INTEGER,
      venue TEXT NOT NULL,
      kickoff TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'live', 'final', 'postponed')),
      minute INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Ladder snapshots table
  await sql`
    CREATE TABLE IF NOT EXISTS ladder_snapshots (
      id TEXT PRIMARY KEY,
      season INTEGER NOT NULL,
      round INTEGER NOT NULL,
      team_id TEXT NOT NULL REFERENCES teams(id),
      played INTEGER NOT NULL DEFAULT 0,
      wins INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      draws INTEGER NOT NULL DEFAULT 0,
      points_for INTEGER NOT NULL DEFAULT 0,
      points_against INTEGER NOT NULL DEFAULT 0,
      differential INTEGER NOT NULL DEFAULT 0,
      win_pct REAL NOT NULL DEFAULT 0,
      nrl_points INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL,
      byes_taken INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(season, round, team_id)
    )
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_games_season_round ON games(season, round)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_ladder_season_round ON ladder_snapshots(season, round)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_games_status ON games(status)`;
}

// Helper to generate unique IDs
export function generateId(): string {
  return uuidv4();
}

// Re-export sql for direct use in queries
export { sql };
