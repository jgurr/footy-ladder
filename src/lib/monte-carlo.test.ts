import assert from "node:assert/strict";
import test from "node:test";
import { buildMonteCarloData, normalizeIterations } from "./monte-carlo";
import { NRL_TEAMS } from "./teams";
import type { Game, LadderEntry } from "./types";

const ladder: LadderEntry[] = NRL_TEAMS.map((team, index) => ({
  team,
  season: 2026,
  round: 1,
  played: 1,
  wins: index === 0 ? 1 : 0,
  losses: index === 0 ? 0 : 1,
  draws: 0,
  pointsFor: index === 0 ? 30 : 12,
  pointsAgainst: index === 0 ? 12 : 30,
  differential: index === 0 ? 18 : -18,
  winPct: index === 0 ? 100 : 0,
  nrlPoints: index === 0 ? 2 : 0,
  position: index + 1,
  byesTaken: 0,
}));

const games: Game[] = [
  {
    id: "past",
    season: 2026,
    round: 1,
    homeTeamId: "bri",
    awayTeamId: "can",
    homeScore: 30,
    awayScore: 12,
    venue: "Suncorp Stadium",
    kickoff: "2026-03-05T09:00:00Z",
    status: "final",
  },
  {
    id: "future",
    season: 2026,
    round: 2,
    homeTeamId: "bri",
    awayTeamId: "can",
    homeScore: null,
    awayScore: null,
    venue: "Suncorp Stadium",
    kickoff: "2026-03-12T09:00:00Z",
    status: "scheduled",
  },
];

test("iteration count is bounded for interactive API use", () => {
  assert.equal(normalizeIterations(20), 1000);
  assert.equal(normalizeIterations(20_000), 20_000);
  assert.equal(normalizeIterations(100_000), 50_000);
});

test("monte carlo returns deterministic final-position histograms", () => {
  const first = buildMonteCarloData(2026, ladder, games, 1000);
  const second = buildMonteCarloData(2026, ladder, games, 1000);

  assert.equal(first.seed, second.seed);
  assert.equal(first.remainingGames, 1);
  assert.equal(first.iterations, 1000);
  assert.match(first.model.tiebreakers, /projected final PD/);
  assert.deepEqual(
    first.teams.map((team) => team.averagePosition),
    second.teams.map((team) => team.averagePosition)
  );

  for (const team of first.teams) {
    assert.equal(
      team.positionBuckets.reduce((total, bucket) => total + bucket.count, 0),
      first.iterations
    );
    assert.equal(team.positionBuckets.length, NRL_TEAMS.length);
  }
});
