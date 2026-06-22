import { sql } from "./database";

export interface SeasonStatus {
  lastSyncedAt: string | null;
  latestFinalRound: number;
  liveGames: number;
  nextScheduledRound: number | null;
}

export async function getSeasonStatus(season: number): Promise<SeasonStatus> {
  const { rows } = await sql`
    SELECT
      MAX(updated_at) as "lastSyncedAt",
      COUNT(*) FILTER (WHERE status = 'live') as "liveGames",
      MAX(round) FILTER (WHERE status = 'final') as "latestFinalRound",
      MIN(round) FILTER (WHERE status = 'scheduled') as "nextScheduledRound"
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
  };
}
