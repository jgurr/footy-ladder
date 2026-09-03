import assert from "node:assert/strict";
import test from "node:test";
import { findActiveSyncGame, findSyncTargetRounds } from "./sync-window";

const games = [
  {
    id: "round-17-game",
    round: 17,
    kickoff: "2026-06-26T10:00:00.000Z",
    status: "scheduled" as const,
  },
];

test("starts five minutes before kickoff", () => {
  assert.equal(
    findActiveSyncGame(games, new Date("2026-06-26T09:55:00.000Z"))?.id,
    "round-17-game"
  );
});

test("does not start before the pre-game window", () => {
  assert.equal(
    findActiveSyncGame(games, new Date("2026-06-26T09:54:59.999Z")),
    undefined
  );
});

test("continues through expected game time plus post-game buffer", () => {
  assert.equal(
    findActiveSyncGame(games, new Date("2026-06-26T13:00:00.000Z"))?.id,
    "round-17-game"
  );
});

test("stops after the post-game buffer", () => {
  assert.equal(
    findActiveSyncGame(games, new Date("2026-06-26T13:00:00.001Z")),
    undefined
  );
});

test("keeps an overdue live round eligible for reconciliation", () => {
  assert.deepEqual(
    findSyncTargetRounds(
      [{ ...games[0], status: "live" }],
      new Date("2026-06-27T10:00:00.000Z")
    ),
    [17]
  );
});

test("reconciles a scheduled game missed for its entire live window", () => {
  assert.deepEqual(
    findSyncTargetRounds(games, new Date("2026-06-27T10:00:00.000Z")),
    [17]
  );
});

test("returns all live and currently active rounds once", () => {
  assert.deepEqual(
    findSyncTargetRounds(
      [
        { ...games[0], status: "live" },
        {
          id: "round-18-game-a",
          round: 18,
          kickoff: "2026-06-27T10:00:00.000Z",
          status: "scheduled",
        },
        {
          id: "round-18-game-b",
          round: 18,
          kickoff: "2026-06-27T12:00:00.000Z",
          status: "scheduled",
        },
      ],
      new Date("2026-06-27T10:05:00.000Z")
    ),
    [17, 18]
  );
});

test("does not refresh completed games outside their sync window", () => {
  assert.deepEqual(
    findSyncTargetRounds(
      [{ ...games[0], status: "final" }],
      new Date("2026-06-27T10:00:00.000Z")
    ),
    []
  );
});
