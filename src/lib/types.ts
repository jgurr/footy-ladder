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
  kickoff: string | null; // ISO date string
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

export type Competition = "NRL" | "NRLW";

export type SalaryCapRuleType =
  | "top30_base_cap"
  | "veteran_developed_allowance"
  | "motor_vehicle_allowance"
  | "minimum_top30_salary"
  | "supplementary_list_salary"
  | "spend_floor_pct";

export interface SalaryCapRule {
  id: string;
  season: number;
  competition: Competition;
  ruleType: SalaryCapRuleType;
  amountCents: number | null;
  percentageBps: number | null;
  sourceUrl: string;
  sourceName: string;
  sourcePublishedAt: string | null;
  sourceCheckedAt: string;
  notes: string | null;
}

export interface Player {
  id: string;
  nrlId: string | null;
  displayName: string;
  givenName: string | null;
  familyName: string | null;
  dateOfBirth: string | null;
  primaryPosition: string | null;
}

export type RosterCategory =
  | "top30"
  | "supplementary"
  | "development"
  | "train_trial"
  | "injured_reserve"
  | "released"
  | "unknown";

export type RosterStatus =
  | "active"
  | "injured"
  | "suspended"
  | "released"
  | "retired"
  | "loaned"
  | "unknown";

export interface RosterSnapshot {
  id: string;
  season: number;
  teamId: string;
  asOfDate: string;
  sourceUrl: string;
  sourceName: string;
  sourcePublishedAt: string | null;
  sourceCheckedAt: string;
  notes: string | null;
}

export interface RosterEntry {
  id: string;
  rosterSnapshotId: string;
  playerId: string;
  teamId: string;
  rosterCategory: RosterCategory;
  jerseyNumber: number | null;
  listedPosition: string | null;
  status: RosterStatus;
  notes: string | null;
}

export type ContractStatus =
  | "active"
  | "signed_future"
  | "released"
  | "retired"
  | "medical_retirement"
  | "expired"
  | "unknown";

export type ContractOptionType =
  | "club"
  | "player"
  | "mutual"
  | "vesting"
  | "none"
  | "unknown";

export interface PlayerContract {
  id: string;
  playerId: string;
  teamId: string;
  startSeason: number | null;
  endSeason: number | null;
  contractStatus: ContractStatus;
  optionType: ContractOptionType | null;
  optionSeasons: string | null;
  sourceSummary: string | null;
  notes: string | null;
}

export type SalaryEstimateType =
  | "reported_exact"
  | "reported_range"
  | "derived_range"
  | "unknown";

export type SalaryClaimShape =
  | "annual_salary"
  | "total_contract_value"
  | "average_annual_value"
  | "salary_cap_value"
  | "market_estimate"
  | "minimum_salary_floor"
  | "unknown";

export type ConfidenceBand = "high" | "medium" | "low" | "unknown";

export type SalaryEvidenceRole =
  | "primary_individual_report"
  | "cross_referenced_baseline"
  | "backup_baseline"
  | "bucket_unknown"
  | "open_unknown";

export type SalarySourceTier =
  | "official"
  | "major_media"
  | "club"
  | "agent_or_player"
  | "database"
  | "secondary"
  | "unknown";

export type PaywallStatus =
  | "open"
  | "metered"
  | "paywalled"
  | "snippet_only"
  | "unknown";

export interface SalarySource {
  id: string;
  url: string;
  title: string;
  publisher: string;
  author: string | null;
  publishedAt: string | null;
  checkedAt: string;
  sourceTier: SalarySourceTier;
  paywallStatus: PaywallStatus;
  notes: string | null;
}

export interface SalaryEstimate {
  id: string;
  playerId: string;
  teamId: string;
  contractId: string | null;
  season: number;
  estimateType: SalaryEstimateType;
  claimShape: SalaryClaimShape;
  amountCents: number | null;
  lowAmountCents: number | null;
  highAmountCents: number | null;
  confidenceScore: number;
  confidenceBand: ConfidenceBand;
  evidenceRole: SalaryEvidenceRole;
  annualizationMethod: string | null;
  includesAllowances: boolean | null;
  includesBonuses: boolean | null;
  includesThirdParty: boolean | null;
  reasoning: string;
  caveats: string | null;
}

export type SalaryEstimateSupportLevel =
  | "primary"
  | "supports"
  | "conflicts"
  | "context";

export interface SalaryEstimateSource {
  id: string;
  salaryEstimateId: string;
  salarySourceId: string;
  claimText: string | null;
  claimValueText: string | null;
  supportLevel: SalaryEstimateSupportLevel;
  notes: string | null;
}
