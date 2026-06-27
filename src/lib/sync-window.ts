import type { Game } from "./types";

export const PRE_GAME_SYNC_MINUTES = 5;
export const EXPECTED_GAME_DURATION_MINUTES = 120;
export const POST_GAME_SYNC_MINUTES = 60;

export function findActiveSyncGame(
  games: Pick<Game, "id" | "kickoff" | "round">[],
  now = new Date()
) {
  const nowMs = now.getTime();

  return games.find((game) => {
    if (!game.kickoff) return false;

    const kickoffMs = new Date(game.kickoff).getTime();
    if (!Number.isFinite(kickoffMs)) return false;

    const startsAt = kickoffMs - PRE_GAME_SYNC_MINUTES * 60_000;
    const endsAt =
      kickoffMs +
      (EXPECTED_GAME_DURATION_MINUTES + POST_GAME_SYNC_MINUTES) * 60_000;

    return nowMs >= startsAt && nowMs <= endsAt;
  });
}
