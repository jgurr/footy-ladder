import Database from "better-sqlite3";
import path from "path";

// Database file path
const DB_PATH = path.join(process.cwd(), "data", "footy.db");

// Singleton database instance
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  // Teams table
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      short_code TEXT UNIQUE NOT NULL,
      primary_color TEXT NOT NULL,
      secondary_color TEXT NOT NULL,
      logo_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Games table
  db.exec(`
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ladder snapshots table
  db.exec(`
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(season, round, team_id)
    )
  `);

  // Scraping log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS scraping_log (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      status TEXT NOT NULL,
      records_updated INTEGER DEFAULT 0,
      error_message TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for common queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_games_season_round ON games(season, round);
    CREATE INDEX IF NOT EXISTS idx_ladder_season_round ON ladder_snapshots(season, round);
    CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
  `);
}

// Helper to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Close database on process exit
process.on("exit", () => {
  if (db) {
    db.close();
  }
});
