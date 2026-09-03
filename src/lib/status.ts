import { sql } from "./database";
import { REGULAR_SEASON_LAST_ROUND } from "./season";

export interface SeasonStatus {
  lastSyncedAt: string | null;
  latestFinalRound: number;
  liveGames: number;
  nextScheduledRound: number | null;
  regularSeasonComplete: boolean;
}

export async function getSeasonStatus(season: number): Promise<SeasonStatus> {
  const { rows } = await sql`
    SELECT
      MAX(updated_at) as "lastSyncedAt",
      COUNT(*) FILTER (WHERE status = 'live') as "liveGames",
      MAX(round) FILTER (
        WHERE status = 'final' AND round <= ${REGULAR_SEASON_LAST_ROUND}
      ) as "latestFinalRound",
      MIN(round) FILTER (WHERE status = 'scheduled') as "nextScheduledRound",
      COUNT(*) FILTER (
        WHERE round = ${REGULAR_SEASON_LAST_ROUND}
      ) as "lastRoundGames",
      COUNT(*) FILTER (
        WHERE round = ${REGULAR_SEASON_LAST_ROUND} AND status = 'final'
      ) as "lastRoundFinalGames"
    FROM games
    WHERE season = ${season}
  `;

  const status = rows[0] || {};

  return {
    lastSyncedAt: status.lastSyncedAt
      ? new Date(status.lastSyncedAt).toISOString()
      : null,
    liveGames: Number(status.liveGames || 0),
    latestFinalRound: Number(status.latestFinalRound || 1),
    nextScheduledRound: status.nextScheduledRound
      ? Number(status.nextScheduledRound)
      : null,
    regularSeasonComplete:
      Number(status.lastRoundGames || 0) > 0 &&
      Number(status.lastRoundGames) === Number(status.lastRoundFinalGames || 0),
  };
}
