import { findActiveSyncWindow } from "./check-game-sync-window.mjs";

export const DEFAULT_MAX_SYNC_STALENESS_MINUTES = 15;
export const DEFAULT_SCHEDULED_GRACE_MINUTES = 10;

function minutesBetween(laterMs, earlierMs) {
  return Math.round(((laterMs - earlierMs) / 60_000) * 10) / 10;
}

function gameLabel(game) {
  const away = game.awayTeam?.shortCode || game.awayTeamId || "Away";
  const home = game.homeTeam?.shortCode || game.homeTeamId || "Home";
  return `Round ${game.round}: ${away} at ${home}`;
}

export function evaluateLiveSyncHealth({
  games,
  status,
  now = new Date(),
  maxStalenessMinutes = DEFAULT_MAX_SYNC_STALENESS_MINUTES,
  scheduledGraceMinutes = DEFAULT_SCHEDULED_GRACE_MINUTES,
}) {
  const activeGame = findActiveSyncWindow(games, now);

  if (!activeGame) {
    return {
      healthy: true,
      active: false,
      message: "No game is inside the live sync window.",
    };
  }

  const nowMs = now.getTime();
  const lastSyncedMs = status?.lastSyncedAt
    ? new Date(status.lastSyncedAt).getTime()
    : Number.NaN;

  if (!Number.isFinite(lastSyncedMs)) {
    return {
      healthy: false,
      active: true,
      message: `${gameLabel(activeGame)} is in a sync window, but production has no lastSyncedAt timestamp.`,
    };
  }

  const syncAgeMinutes = minutesBetween(nowMs, lastSyncedMs);
  if (syncAgeMinutes > maxStalenessMinutes) {
    return {
      healthy: false,
      active: true,
      message:
        `${gameLabel(activeGame)} is in a sync window, but production last synced ` +
        `${syncAgeMinutes} minutes ago. Limit is ${maxStalenessMinutes} minutes.`,
    };
  }

  const kickoffMs = activeGame.kickoff
    ? new Date(activeGame.kickoff).getTime()
    : Number.NaN;
  const scheduledGraceMs = scheduledGraceMinutes * 60_000;
  const isStillScheduledAfterKickoff =
    activeGame.status === "scheduled" &&
    Number.isFinite(kickoffMs) &&
    nowMs >= kickoffMs + scheduledGraceMs;

  if (isStillScheduledAfterKickoff) {
    return {
      healthy: false,
      active: true,
      message:
        `${gameLabel(activeGame)} kicked off ${minutesBetween(nowMs, kickoffMs)} minutes ago, ` +
        "but production still marks it scheduled.",
    };
  }

  return {
    healthy: true,
    active: true,
    message:
      `${gameLabel(activeGame)} sync looks healthy. ` +
      `Last synced ${syncAgeMinutes} minutes ago.`,
  };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "footy-ladder-live-sync-observer" },
  });

  if (!response.ok) {
    throw new Error(`${url} failed with HTTP ${response.status}`);
  }

  return response.json();
}

async function main() {
  const season = Number(process.env.SEASON || new Date().getUTCFullYear());
  const siteUrl = (process.env.SITE_URL || "https://www.getemonside.com").replace(/\/$/, "");
  const maxStalenessMinutes = Number(
    process.env.MAX_SYNC_STALENESS_MINUTES ||
      DEFAULT_MAX_SYNC_STALENESS_MINUTES
  );

  const cacheBust = Date.now();
  const [games, status] = await Promise.all([
    fetchJson(`${siteUrl}/api/games?season=${season}&health-window=${cacheBust}`),
    fetchJson(`${siteUrl}/api/status?season=${season}&health-status=${cacheBust}`),
  ]);

  const result = evaluateLiveSyncHealth({
    games,
    status,
    maxStalenessMinutes,
  });

  if (result.healthy) {
    console.log(result.message);
    return;
  }

  console.error(result.message);
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
