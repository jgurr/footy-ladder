import assert from "node:assert/strict";
import test from "node:test";
import { evaluateLiveSyncHealth } from "./check-live-sync-health.mjs";

const baseGame = {
  id: "round-17-game",
  round: 17,
  kickoff: "2026-06-25T10:00:00.000Z",
  status: "live",
  homeTeam: { shortCode: "PAR" },
  awayTeam: { shortCode: "SOU" },
};

test("passes when no game is inside the sync window", () => {
  const result = evaluateLiveSyncHealth({
    games: [{ ...baseGame, status: "scheduled" }],
    status: {},
    now: new Date("2026-06-25T09:54:59.999Z"),
  });

  assert.equal(result.healthy, true);
  assert.equal(result.active, false);
});

test("fails for a stale live game after its normal sync window", () => {
  const result = evaluateLiveSyncHealth({
    games: [baseGame],
    status: { lastSyncedAt: "2026-06-25T12:00:00.000Z" },
    now: new Date("2026-06-26T10:00:00.000Z"),
  });

  assert.equal(result.healthy, false);
  assert.equal(result.active, true);
  assert.match(result.message, /needs syncing/);
});

test("fails for a scheduled game missed for its entire sync window", () => {
  const result = evaluateLiveSyncHealth({
    games: [{ ...baseGame, status: "scheduled" }],
    status: { lastSyncedAt: "2026-06-25T12:00:00.000Z" },
    now: new Date("2026-06-26T10:00:00.000Z"),
  });

  assert.equal(result.healthy, false);
  assert.equal(result.active, true);
  assert.match(result.message, /needs syncing/);
});

test("passes during a live window when production recently synced", () => {
  const result = evaluateLiveSyncHealth({
    games: [baseGame],
    status: { lastSyncedAt: "2026-06-25T10:08:00.000Z" },
    now: new Date("2026-06-25T10:15:00.000Z"),
  });

  assert.equal(result.healthy, true);
  assert.equal(result.active, true);
});

test("fails during a live window when production is stale", () => {
  const result = evaluateLiveSyncHealth({
    games: [baseGame],
    status: { lastSyncedAt: "2026-06-25T09:55:00.000Z" },
    now: new Date("2026-06-25T10:20:00.000Z"),
    maxStalenessMinutes: 15,
  });

  assert.equal(result.healthy, false);
  assert.match(result.message, /last synced 25 minutes ago/);
});

test("fails when a game is still scheduled after the kickoff grace period", () => {
  const result = evaluateLiveSyncHealth({
    games: [{ ...baseGame, status: "scheduled" }],
    status: { lastSyncedAt: "2026-06-25T10:10:00.000Z" },
    now: new Date("2026-06-25T10:11:00.000Z"),
  });

  assert.equal(result.healthy, false);
  assert.match(result.message, /still marks it scheduled/);
});

test("allows scheduled games before kickoff when sync is fresh", () => {
  const result = evaluateLiveSyncHealth({
    games: [{ ...baseGame, status: "scheduled" }],
    status: { lastSyncedAt: "2026-06-25T09:56:00.000Z" },
    now: new Date("2026-06-25T09:57:00.000Z"),
  });

  assert.equal(result.healthy, true);
});
