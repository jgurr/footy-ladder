import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCronExpressions,
  buildGameWindows,
  replaceGeneratedSchedule,
} from "./generate-game-cron.mjs";

test("merges overlapping match windows", () => {
  const windows = buildGameWindows(
    [
      { kickoff: "2026-06-25T10:00:00Z" },
      { kickoff: "2026-06-25T12:00:00Z" },
    ],
    new Date("2026-06-25T00:00:00Z")
  );

  assert.deepEqual(windows, [
    {
      start: new Date("2026-06-25T09:55:00Z").getTime(),
      end: new Date("2026-06-25T15:00:00Z").getTime(),
    },
  ]);
});

test("generates five-minute cron segments for an exact UTC date", () => {
  const expressions = buildCronExpressions([
    {
      start: new Date("2026-06-25T09:55:00Z").getTime(),
      end: new Date("2026-06-25T11:10:00Z").getTime(),
    },
  ]);

  assert.deepEqual(
    expressions.map(({ cron }) => cron),
    ["55 9 25 6 *", "*/5 10 25 6 *", "0-10/5 11 25 6 *"]
  );
});

test("replaces only the generated schedule block", () => {
  const workflow = `on:\n  schedule:\n${"      # BEGIN GENERATED GAME WINDOWS"}\n      - cron: "old"\n${"      # END GENERATED GAME WINDOWS"}\n  workflow_dispatch:\n`;
  const updated = replaceGeneratedSchedule(workflow, [{ cron: "*/5 10 25 6 *" }]);

  assert.match(updated, /cron: "\*\/5 10 25 6 \*"/);
  assert.doesNotMatch(updated, /cron: "old"/);
  assert.match(updated, /workflow_dispatch/);
});
