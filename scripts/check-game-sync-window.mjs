import { appendFile } from "node:fs/promises";

const PRE_GAME_MINUTES = 5;
const GAME_DURATION_MINUTES = 120;
const POST_GAME_MINUTES = 60;

export function findActiveSyncWindow(games, now = new Date()) {
  const nowMs = now.getTime();

  return games.find((game) => {
    if (!game.kickoff) return false;

    const kickoffMs = new Date(game.kickoff).getTime();
    if (!Number.isFinite(kickoffMs)) return false;

    const startsAt = kickoffMs - PRE_GAME_MINUTES * 60_000;
    const endsAt =
      kickoffMs +
      (GAME_DURATION_MINUTES + POST_GAME_MINUTES) * 60_000;

    return nowMs >= startsAt && nowMs <= endsAt;
  });
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
  const activeGame = findActiveSyncWindow(games);
  const active = Boolean(activeGame);

  await writeOutputs({
    active,
    season,
    round: activeGame?.round || "",
    game_id: activeGame?.id || "",
  });

  if (activeGame) {
    console.log(
      `Sync window active for Round ${activeGame.round}: ` +
        `${activeGame.awayTeam?.shortCode || activeGame.awayTeamId} at ` +
        `${activeGame.homeTeam?.shortCode || activeGame.homeTeamId}`
    );
  } else {
    console.log("Outside all game sync windows; no production sync required.");
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
