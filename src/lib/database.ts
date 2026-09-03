import { sql } from "@vercel/postgres";
import { v4 as uuidv4 } from "uuid";

let gameSyncStateInitialized = false;

export async function initGameSyncStateSchema(): Promise<void> {
  if (gameSyncStateInitialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS game_sync_state (
      season INTEGER PRIMARY KEY,
      locked_until TIMESTAMPTZ NOT NULL,
      last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
  gameSyncStateInitialized = true;
}

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
      kickoff TEXT,
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
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_games_match_unique
    ON games(season, round, home_team_id, away_team_id)
  `;

  // Shared cooldown for visitor-triggered official game refreshes. The lease
  // prevents concurrent clients from stampeding the upstream NRL draw page.
  await initGameSyncStateSchema();

  // Salary cap rule facts by season and bucket.
  await sql`
    CREATE TABLE IF NOT EXISTS salary_cap_rules (
      id TEXT PRIMARY KEY,
      season INTEGER NOT NULL,
      competition TEXT NOT NULL DEFAULT 'NRL' CHECK(competition IN ('NRL', 'NRLW')),
      rule_type TEXT NOT NULL CHECK(rule_type IN (
        'top30_base_cap',
        'veteran_developed_allowance',
        'motor_vehicle_allowance',
        'minimum_top30_salary',
        'supplementary_list_salary',
        'spend_floor_pct'
      )),
      amount_cents BIGINT,
      percentage_bps INTEGER,
      source_url TEXT NOT NULL,
      source_name TEXT NOT NULL,
      source_published_at TEXT,
      source_checked_at TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(season, competition, rule_type, source_url)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      nrl_id TEXT UNIQUE,
      display_name TEXT NOT NULL,
      given_name TEXT,
      family_name TEXT,
      date_of_birth TEXT,
      primary_position TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS player_aliases (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      alias TEXT NOT NULL,
      source_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(player_id, alias)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS roster_snapshots (
      id TEXT PRIMARY KEY,
      season INTEGER NOT NULL,
      team_id TEXT NOT NULL REFERENCES teams(id),
      as_of_date TEXT NOT NULL,
      source_url TEXT NOT NULL,
      source_name TEXT NOT NULL,
      source_published_at TEXT,
      source_checked_at TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(season, team_id, as_of_date, source_url)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS roster_entries (
      id TEXT PRIMARY KEY,
      roster_snapshot_id TEXT NOT NULL REFERENCES roster_snapshots(id) ON DELETE CASCADE,
      player_id TEXT NOT NULL REFERENCES players(id),
      team_id TEXT NOT NULL REFERENCES teams(id),
      roster_category TEXT NOT NULL CHECK(roster_category IN (
        'top30',
        'supplementary',
        'development',
        'train_trial',
        'injured_reserve',
        'released',
        'unknown'
      )),
      jersey_number INTEGER,
      listed_position TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN (
        'active',
        'injured',
        'suspended',
        'released',
        'retired',
        'loaned',
        'unknown'
      )),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(roster_snapshot_id, player_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS player_contracts (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      team_id TEXT NOT NULL REFERENCES teams(id),
      start_season INTEGER,
      end_season INTEGER,
      contract_status TEXT NOT NULL DEFAULT 'active' CHECK(contract_status IN (
        'active',
        'signed_future',
        'released',
        'retired',
        'medical_retirement',
        'expired',
        'unknown'
      )),
      option_type TEXT CHECK(option_type IN (
        'club',
        'player',
        'mutual',
        'vesting',
        'none',
        'unknown'
      )),
      option_seasons TEXT,
      source_summary TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS salary_sources (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      publisher TEXT NOT NULL,
      author TEXT,
      published_at TEXT,
      checked_at TEXT NOT NULL,
      source_tier TEXT NOT NULL DEFAULT 'secondary' CHECK(source_tier IN (
        'official',
        'major_media',
        'club',
        'agent_or_player',
        'database',
        'secondary',
        'unknown'
      )),
      paywall_status TEXT NOT NULL DEFAULT 'unknown' CHECK(paywall_status IN (
        'open',
        'metered',
        'paywalled',
        'snippet_only',
        'unknown'
      )),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(url)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS salary_estimates (
      id TEXT PRIMARY KEY,
      player_id TEXT NOT NULL REFERENCES players(id),
      team_id TEXT NOT NULL REFERENCES teams(id),
      contract_id TEXT REFERENCES player_contracts(id) ON DELETE SET NULL,
      season INTEGER NOT NULL,
      estimate_type TEXT NOT NULL CHECK(estimate_type IN (
        'reported_exact',
        'reported_range',
        'derived_range',
        'unknown'
      )),
      claim_shape TEXT NOT NULL CHECK(claim_shape IN (
        'annual_salary',
        'total_contract_value',
        'average_annual_value',
        'salary_cap_value',
        'market_estimate',
        'minimum_salary_floor',
        'unknown'
      )),
      amount_cents BIGINT,
      low_amount_cents BIGINT,
      high_amount_cents BIGINT,
      confidence_score INTEGER NOT NULL CHECK(confidence_score >= 0 AND confidence_score <= 100),
      confidence_band TEXT NOT NULL CHECK(confidence_band IN ('high', 'medium', 'low', 'unknown')),
      annualization_method TEXT,
      includes_allowances BOOLEAN,
      includes_bonuses BOOLEAN,
      includes_third_party BOOLEAN,
      reasoning TEXT NOT NULL,
      caveats TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS salary_estimate_sources (
      id TEXT PRIMARY KEY,
      salary_estimate_id TEXT NOT NULL REFERENCES salary_estimates(id) ON DELETE CASCADE,
      salary_source_id TEXT NOT NULL REFERENCES salary_sources(id) ON DELETE CASCADE,
      claim_text TEXT,
      claim_value_text TEXT,
      support_level TEXT NOT NULL DEFAULT 'supports' CHECK(support_level IN (
        'primary',
        'supports',
        'conflicts',
        'context'
      )),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(salary_estimate_id, salary_source_id, support_level)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_salary_cap_rules_season ON salary_cap_rules(season, competition)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_player_aliases_alias ON player_aliases(alias)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_roster_snapshots_team_season ON roster_snapshots(team_id, season)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_roster_entries_snapshot ON roster_entries(roster_snapshot_id, roster_category)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_player_contracts_player_team ON player_contracts(player_id, team_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_salary_estimates_team_season ON salary_estimates(team_id, season)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_salary_estimates_player_season ON salary_estimates(player_id, season)`;

  // Migration: Allow NULL kickoff times (for TBD games like Las Vegas)
  await sql`ALTER TABLE games ALTER COLUMN kickoff DROP NOT NULL`;
}

// Helper to generate unique IDs
export function generateId(): string {
  return uuidv4();
}

// Re-export sql for direct use in queries
export { sql };
