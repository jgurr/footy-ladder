import { appendFile } from "node:fs/promises";

export const PRE_GAME_MINUTES = 5;
export const GAME_DURATION_MINUTES = 120;
export const POST_GAME_MINUTES = 60;

function isInsideSyncWindow(game, nowMs) {
  if (!game.kickoff) return false;

  const kickoffMs = new Date(game.kickoff).getTime();
  if (!Number.isFinite(kickoffMs)) return false;

  const startsAt = kickoffMs - PRE_GAME_MINUTES * 60_000;
  const endsAt =
    kickoffMs +
    (GAME_DURATION_MINUTES + POST_GAME_MINUTES) * 60_000;

  return nowMs >= startsAt && nowMs <= endsAt;
}

function isOverdueScheduledGame(game, nowMs) {
  if (game.status !== "scheduled" || !game.kickoff) return false;

  const kickoffMs = new Date(game.kickoff).getTime();
  return Number.isFinite(kickoffMs) && nowMs >= kickoffMs;
}

export function findActiveSyncWindow(games, now = new Date()) {
  const nowMs = now.getTime();

  return games.find((game) => isInsideSyncWindow(game, nowMs));
}

export function findSyncTargetRounds(games, now = new Date()) {
  const nowMs = now.getTime();
  const rounds = new Set();

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

async function writeOutputs(values) {
  if (!process.env.GITHUB_OUTPUT) return;

  const lines = Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  await appendFile(process.env.GITHUB_OUTPUT, `${lines}\n`);
}

async function main() {
  const season = Number(process.env.SEASON || new Date().getUTCFullYear());
  const siteUrl = (process.env.SITE_URL || "https://www.getemonside.com").replace(/\/$/, "");
  const response = await fetch(
    `${siteUrl}/api/games?season=${season}&sync-window=${Date.now()}`,
    {
      headers: { "User-Agent": "footy-ladder-github-action" },
    }
  );

  if (!response.ok) {
    throw new Error(`Schedule request failed with HTTP ${response.status}`);
  }

  const games = await response.json();
  const targetRounds = findSyncTargetRounds(games);
  const targetGame = games.find((game) => targetRounds.includes(game.round));
  const active = targetRounds.length > 0;

  await writeOutputs({
    active,
    season,
    // Let the endpoint reconcile every target when more than one round is stale.
    round: targetRounds.length === 1 ? targetRounds[0] : "",
    game_id: targetGame?.id || "",
  });

  if (targetGame) {
    console.log(
      `Sync required for round${targetRounds.length === 1 ? "" : "s"} ` +
        `${targetRounds.join(", ")}: ` +
        `${targetGame.awayTeam?.shortCode || targetGame.awayTeamId} at ` +
        `${targetGame.homeTeam?.shortCode || targetGame.homeTeamId}`
    );
  } else {
    console.log("No active or overdue games; no production sync required.");
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
