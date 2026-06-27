import assert from "node:assert/strict";
import test from "node:test";
import { findActiveSyncGame } from "./sync-window";

const games = [
  {
    id: "round-17-game",
    round: 17,
    kickoff: "2026-06-26T10:00:00.000Z",
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
