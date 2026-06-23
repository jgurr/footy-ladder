import assert from "node:assert/strict";
import test from "node:test";
import historicalGames from "@/data/elo-history.json";
import {
  calculateEloRatings,
  calculateEloRoundSnapshots,
  ELO_BASELINE,
  ELO_SEASON_REGRESSION,
  expectedWinProbability,
  rankEloRatings,
} from "./elo";

test("expected probability is even for equally rated teams at a neutral venue", () => {
  assert.equal(expectedWinProbability(1500, 1500), 0.5);
  assert.ok(expectedWinProbability(1500, 1500, 50) > 0.5);
});

test("four-season history contains regular season and finals games", () => {
  assert.equal(historicalGames.length, 840);
  for (const season of [2022, 2023, 2024, 2025]) {
    const games = historicalGames.filter((game) => game.season === season);
    assert.equal(games.filter((game) => game.stage === "Grand Final").length, 1);
    assert.equal(games.filter((game) => game.stage.startsWith("Finals Week")).length, 8);
  }
});

test("prototype Elo carries continuously across seasons", () => {
  assert.equal(ELO_SEASON_REGRESSION, 0);
});

test("Elo processing remains zero-sum around the league baseline", () => {
  const result = calculateEloRatings(historicalGames);
  const ratings = [...result.ratings.values()];
  const average = ratings.reduce((total, rating) => total + rating, 0) / ratings.length;
  assert.ok(Math.abs(average - ELO_BASELINE) < 0.0001);
  assert.equal(result.gamesProcessed, 840);
});

test("power rankings order stronger ratings first", () => {
  const ranks = rankEloRatings(
    new Map([
      ["a", 1510],
      ["b", 1550],
      ["c", 1490],
    ]),
    ["a", "b", "c"]
  );
  assert.equal(ranks.get("b"), 1);
  assert.equal(ranks.get("c"), 3);
});

test("round snapshots include finals labels and a rating for every requested team", () => {
  const snapshots = calculateEloRoundSnapshots(historicalGames, ["pen", "bri", "mel"]);
  assert.ok(snapshots.length > 100);
  assert.ok(snapshots.some((snapshot) => snapshot.label === "Grand Final"));
  assert.equal(typeof snapshots.at(-1)?.ratings.pen, "number");
  assert.equal(typeof snapshots.at(-1)?.ratings.bri, "number");
  assert.equal(typeof snapshots.at(-1)?.ratings.mel, "number");
});
