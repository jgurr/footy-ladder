import assert from "node:assert/strict";
import test from "node:test";
import { findActiveSyncWindow } from "./check-game-sync-window.mjs";

const games = [
  {
    id: "round-16-game",
    round: 16,
    kickoff: "2026-06-20T10:00:00.000Z",
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
