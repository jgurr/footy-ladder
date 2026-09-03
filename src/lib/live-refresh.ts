import { syncOfficialDrawGames } from "./nrl-draw";
import type { OfficialDrawSyncResult } from "./nrl-draw";
import {
  completeGameSyncLease,
  getGamesBySeason,
  releaseGameSyncLease,
  tryAcquireGameSyncLease,
} from "./queries";
import { findSyncTargetRounds } from "./sync-window";

export const LIVE_REFRESH_COOLDOWN_SECONDS = 25;
export const LIVE_REFRESH_LOCK_SECONDS = 120;

export interface LiveRefreshResult {
  refreshed: boolean;
  reason: "refreshed" | "no-target-rounds" | "cooldown-active";
  rounds: number[];
  sync?: OfficialDrawSyncResult;
}

export async function refreshOfficialGameRounds(
  season: number,
  rounds: number[]
): Promise<LiveRefreshResult> {
  const uniqueRounds = [...new Set(rounds)].sort((a, b) => a - b);
  if (uniqueRounds.length === 0) {
    return {
      refreshed: false,
      reason: "no-target-rounds",
      rounds: uniqueRounds,
    };
  }

  const acquired = await tryAcquireGameSyncLease(
    season,
    LIVE_REFRESH_LOCK_SECONDS
  );
  if (!acquired) {
    return {
      refreshed: false,
      reason: "cooldown-active",
      rounds: uniqueRounds,
    };
  }

  try {
    const sync = await syncOfficialDrawGames(season, { rounds: uniqueRounds });
    await completeGameSyncLease(season, LIVE_REFRESH_COOLDOWN_SECONDS);
    return {
      refreshed: true,
      reason: "refreshed",
      rounds: uniqueRounds,
      sync,
    };
  } catch (error) {
    await releaseGameSyncLease(season);
    throw error;
  }
}

/**
 * Refresh active or stranded live rounds from the canonical NRL draw source.
 * A database lease keeps this safe to call from every connected browser.
 */
export async function refreshLiveGamesIfNeeded(
  season: number,
  now = new Date()
): Promise<LiveRefreshResult> {
  const rounds = findSyncTargetRounds(await getGamesBySeason(season), now);
  if (rounds.length === 0) {
    return { refreshed: false, reason: "no-target-rounds", rounds };
  }

  return refreshOfficialGameRounds(season, rounds);
}
