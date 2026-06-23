import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRunHomeData,
  difficultyLabel,
  distanceKm,
  gameOutlookLabel,
  scheduleEdgeLabel,
} from "./run-home";
import { NRL_TEAMS } from "./teams";
import type { Game, LadderEntry } from "./types";

const ladder: LadderEntry[] = NRL_TEAMS.map((team, index) => ({
  team,
  season: 2026,
  round: 1,
  played: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  pointsFor: 0,
  pointsAgainst: 0,
  differential: 0,
  winPct: 0,
  nrlPoints: 0,
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
    homeScore: 20,
    awayScore: 10,
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

test("distance uses great-circle kilometres", () => {
  const distance = distanceKm({ lat: -27.465, lon: 153.009 }, { lat: -35.251, lon: 149.102 });
  assert.ok(distance > 900 && distance < 1000);
});

test("difficulty labels use readable bands", () => {
  assert.equal(difficultyLabel(75), "Very hard");
  assert.equal(difficultyLabel(60), "Hard");
  assert.equal(difficultyLabel(50), "Even");
  assert.equal(difficultyLabel(30), "Easier");
});

test("run-home labels explain chances and schedule edge", () => {
  assert.equal(gameOutlookLabel(70), "Strong chance");
  assert.equal(gameOutlookLabel(60), "Good shot");
  assert.equal(gameOutlookLabel(50), "Toss-up");
  assert.equal(gameOutlookLabel(40), "Tough game");
  assert.equal(gameOutlookLabel(25), "Rough ask");

  assert.equal(scheduleEdgeLabel(1.1, 10), "Friendly");
  assert.equal(scheduleEdgeLabel(0.3, 10), "Easier");
  assert.equal(scheduleEdgeLabel(0, 10), "Neutral");
  assert.equal(scheduleEdgeLabel(-0.3, 10), "Harder");
  assert.equal(scheduleEdgeLabel(-1.1, 10), "Brutal");
  assert.equal(scheduleEdgeLabel(0, 0), "Complete");
});

test("run home produces reciprocal fixture context and summaries", () => {
  const data = buildRunHomeData(2026, ladder, games);
  const broncos = data.fixtures.bri[0];
  const raiders = data.fixtures.can[0];

  assert.equal(broncos.venueType, "home");
  assert.equal(raiders.venueType, "away");
  assert.equal(broncos.factors.rest.detail, "7 days vs 7 days");
  assert.equal(broncos.factors.travel.assessment, "favourable");
  assert.equal(typeof broncos.averageWinChance, "number");
  assert.equal(typeof broncos.outlookLabel, "string");
  assert.equal(raiders.factors.travel.assessment, "disadvantage");
  const broncosSummary = data.summaries.find((row) => row.team.id === "bri");
  assert.equal(broncosSummary?.remainingGames, 1);
  assert.equal(typeof broncosSummary?.averageTeamWins, "number");
  assert.equal(typeof broncosSummary?.scheduleEdge, "number");
  assert.equal(data.model.includesFinals, true);
  assert.equal(data.model.gamesProcessed, 841);
});
