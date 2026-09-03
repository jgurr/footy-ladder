import type { Game } from "./types";

export const PRE_GAME_SYNC_MINUTES = 5;
export const EXPECTED_GAME_DURATION_MINUTES = 120;
export const POST_GAME_SYNC_MINUTES = 60;

type SyncWindowGame = Pick<Game, "id" | "kickoff" | "round">;
type SyncTargetGame = SyncWindowGame & Pick<Game, "status">;

function isInsideSyncWindow(game: SyncWindowGame, nowMs: number): boolean {
  if (!game.kickoff) return false;

  const kickoffMs = new Date(game.kickoff).getTime();
  if (!Number.isFinite(kickoffMs)) return false;

  const startsAt = kickoffMs - PRE_GAME_SYNC_MINUTES * 60_000;
  const endsAt =
    kickoffMs +
    (EXPECTED_GAME_DURATION_MINUTES + POST_GAME_SYNC_MINUTES) * 60_000;

  return nowMs >= startsAt && nowMs <= endsAt;
}

function isOverdueScheduledGame(game: SyncTargetGame, nowMs: number): boolean {
  if (game.status !== "scheduled" || !game.kickoff) return false;

  const kickoffMs = new Date(game.kickoff).getTime();
  return Number.isFinite(kickoffMs) && nowMs >= kickoffMs;
}

export function findActiveSyncGame(
  games: SyncWindowGame[],
  now = new Date()
) {
  const nowMs = now.getTime();

  return games.find((game) => isInsideSyncWindow(game, nowMs));
}

/**
 * Return every round that needs an official draw refresh.
 *
 * Games marked live or still scheduled after kickoff remain sync targets until
 * the official source resolves them, even after the expected match window has
 * elapsed. This makes missed or delayed scheduler runs self-healing.
 */
export function findSyncTargetRounds(
  games: SyncTargetGame[],
  now = new Date()
): number[] {
  const nowMs = now.getTime();
  const rounds = new Set<number>();

  for (const game of games) {
    if (
      game.status === "live" ||
      isInsideSyncWindow(game, nowMs) ||
      isOverdueScheduledGame(game, nowMs)
    ) {
      rounds.add(game.round);
    }
  }

  return [...rounds].sort((a, b) => a - b);
}
