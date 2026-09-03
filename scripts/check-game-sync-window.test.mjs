import assert from "node:assert/strict";
import test from "node:test";
import {
  findActiveSyncWindow,
  findSyncTargetRounds,
} from "./check-game-sync-window.mjs";

const games = [
  {
    id: "round-16-game",
    round: 16,
    kickoff: "2026-06-20T10:00:00.000Z",
    status: "scheduled",
  },
];

test("starts syncing five minutes before kickoff", () => {
  assert.equal(
    findActiveSyncWindow(games, new Date("2026-06-20T09:55:00.000Z"))?.id,
    "round-16-game"
  );
});

test("does not sync before the pre-game window", () => {
  assert.equal(
    findActiveSyncWindow(games, new Date("2026-06-20T09:54:59.999Z")),
    undefined
  );
});

test("continues through the match and sixty minutes after", () => {
  assert.equal(
    findActiveSyncWindow(games, new Date("2026-06-20T13:00:00.000Z"))?.id,
    "round-16-game"
  );
});

test("stops after the post-game window", () => {
  assert.equal(
    findActiveSyncWindow(games, new Date("2026-06-20T13:00:00.001Z")),
    undefined
  );
});

test("targets an overdue game while it remains live", () => {
  assert.deepEqual(
    findSyncTargetRounds(
      [{ ...games[0], status: "live" }],
      new Date("2026-06-21T10:00:00.000Z")
    ),
    [16]
  );
});

test("targets a scheduled game missed for its entire live window", () => {
  assert.deepEqual(
    findSyncTargetRounds(games, new Date("2026-06-21T10:00:00.000Z")),
    [16]
  );
});

test("deduplicates rounds containing multiple active games", () => {
  assert.deepEqual(
    findSyncTargetRounds(
      [
        games[0],
        {
          id: "round-16-late-game",
          round: 16,
          kickoff: "2026-06-20T12:00:00.000Z",
          status: "scheduled",
        },
      ],
      new Date("2026-06-20T10:05:00.000Z")
    ),
    [16]
  );
});
