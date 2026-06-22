import { readFile, writeFile } from "node:fs/promises";
import {
  GAME_DURATION_MINUTES,
  POST_GAME_MINUTES,
  PRE_GAME_MINUTES,
} from "./check-game-sync-window.mjs";

const START_MARKER = "      # BEGIN GENERATED GAME WINDOWS";
const END_MARKER = "      # END GENERATED GAME WINDOWS";

function toFiveMinuteFloor(timestamp) {
  return Math.floor(timestamp / 300_000) * 300_000;
}

function toFiveMinuteCeil(timestamp) {
  return Math.ceil(timestamp / 300_000) * 300_000;
}

export function buildGameWindows(games, after = new Date()) {
  const afterMs = after.getTime();
  const windows = games
    .filter((game) => game.kickoff)
    .map((game) => {
      const kickoff = new Date(game.kickoff).getTime();
      return {
        start: toFiveMinuteFloor(kickoff - PRE_GAME_MINUTES * 60_000),
        end: toFiveMinuteCeil(
          kickoff + (GAME_DURATION_MINUTES + POST_GAME_MINUTES) * 60_000
        ),
      };
    })
    .filter((window) => Number.isFinite(window.start) && window.end >= afterMs)
    .sort((a, b) => a.start - b.start);

  const merged = [];
  for (const window of windows) {
    const previous = merged.at(-1);
    if (previous && window.start <= previous.end + 300_000) {
      previous.end = Math.max(previous.end, window.end);
    } else {
      merged.push({ ...window });
    }
  }

  return merged;
}

function minuteExpression(minutes) {
  const values = [...minutes].sort((a, b) => a - b);
  if (values.length === 12 && values.every((value, index) => value === index * 5)) {
    return "*/5";
  }

  const contiguous = values.every(
    (value, index) => index === 0 || value - values[index - 1] === 5
  );
  if (contiguous && values.length > 2) {
    return `${values[0]}-${values.at(-1)}/5`;
  }

  return values.join(",");
}

export function buildCronExpressions(windows) {
  const perHour = new Map();

  for (const window of windows) {
    for (let timestamp = window.start; timestamp <= window.end; timestamp += 300_000) {
      const date = new Date(timestamp);
      const key = [
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
      ].join("-");
      const minutes = perHour.get(key) || new Set();
      minutes.add(date.getUTCMinutes());
      perHour.set(key, minutes);
    }
  }

  const byDaySet = new Map();
  for (const [key, minutes] of perHour) {
    const [year, month, day, hour] = key.split("-").map(Number);
    const expression = minuteExpression(minutes);
    const groupKey = `${year}|${month}|${hour}|${expression}`;
    const group = byDaySet.get(groupKey) || { year, month, hour, expression, days: [] };
    group.days.push(day);
    byDaySet.set(groupKey, group);
  }

  const byHourSet = new Map();
  for (const group of byDaySet.values()) {
    group.days.sort((a, b) => a - b);
    const days = group.days.join(",");
    const groupKey = `${group.year}|${group.month}|${days}|${group.expression}`;
    const combined = byHourSet.get(groupKey) || {
      year: group.year,
      month: group.month,
      days,
      expression: group.expression,
      hours: [],
    };
    combined.hours.push(group.hour);
    byHourSet.set(groupKey, combined);
  }

  return [...byHourSet.values()]
    .map((group) => {
      group.hours.sort((a, b) => a - b);
      return {
        ...group,
        cron: `${group.expression} ${group.hours.join(",")} ${group.days} ${group.month} *`,
      };
    })
    .sort(
      (a, b) =>
        a.year - b.year ||
        a.month - b.month ||
        Number(a.days.split(",")[0]) - Number(b.days.split(",")[0]) ||
        a.hours[0] - b.hours[0]
    );
}

export function replaceGeneratedSchedule(workflow, expressions) {
  const start = workflow.indexOf(START_MARKER);
  const end = workflow.indexOf(END_MARKER);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error("Workflow is missing generated schedule markers");
  }

  const generated = [
    START_MARKER,
    ...expressions.map(({ cron }) => `      - cron: "${cron}"`),
    END_MARKER,
  ].join("\n");

  return workflow.slice(0, start) + generated + workflow.slice(end + END_MARKER.length);
}

async function main() {
  const write = process.argv.includes("--write");
  const inputArg = process.argv.find((value) => value.startsWith("--input="));
  const afterArg = process.argv.find((value) => value.startsWith("--after="));
  const workflowPath = ".github/workflows/live-game-sync.yml";
  const after = afterArg ? new Date(afterArg.slice("--after=".length)) : new Date();

  const games = inputArg
    ? JSON.parse(await readFile(inputArg.slice("--input=".length), "utf8"))
    : await fetch("https://www.getemonside.com/api/games?season=2026").then(
        async (response) => {
          if (!response.ok) throw new Error(`Fixture fetch failed with HTTP ${response.status}`);
          return response.json();
        }
      );

  const windows = buildGameWindows(games, after);
  const expressions = buildCronExpressions(windows);
  console.log(
    JSON.stringify(
      {
        after: after.toISOString(),
        games: games.filter((game) => game.kickoff && new Date(game.kickoff) >= after).length,
        mergedWindows: windows.length,
        cronExpressions: expressions.length,
        firstWindow: windows[0] && new Date(windows[0].start).toISOString(),
        lastWindow: windows.at(-1) && new Date(windows.at(-1).end).toISOString(),
      },
      null,
      2
    )
  );

  if (write) {
    const workflow = await readFile(workflowPath, "utf8");
    await writeFile(workflowPath, replaceGeneratedSchedule(workflow, expressions));
  } else {
    console.log(expressions.map(({ cron }) => `- cron: "${cron}"`).join("\n"));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
