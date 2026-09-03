import assert from "node:assert/strict";
import test from "node:test";
import { buildFinalsData } from "./finals";
import { NRL_TEAMS } from "./teams";
import type { Game, LadderEntry } from "./types";

function ladderEntry(position: number): LadderEntry {
  return {
    team: NRL_TEAMS[position - 1],
    season: 2026,
    round: 27,
    position,
    played: 24,
    wins: 25 - position,
    losses: position - 1,
    draws: 0,
    pointsFor: 500,
    pointsAgainst: 300,
    differential: 200,
    winPct: 80,
    nrlPoints: 40,
    byesTaken: 3,
  };
}

function finalGame(
  id: string,
  round: number,
  homeSeed: number,
  awaySeed: number,
  homeScore: number,
  awayScore: number
): Game {
  return {
    id,
    season: 2026,
    round,
    homeTeamId: NRL_TEAMS[homeSeed - 1].id,
    awayTeamId: NRL_TEAMS[awaySeed - 1].id,
    homeScore,
    awayScore,
    venue: "Test Stadium",
    kickoff: "2026-09-11T09:50:00.000Z",
    status: "final",
  };
}

const ladder = Array.from({ length: 8 }, (_, index) => ladderEntry(index + 1));

test("projects the opening finals matches from ladder seeds", () => {
  const data = buildFinalsData(2026, ladder, [], {
    regularSeasonComplete: false,
  });

  assert.equal(data.mode, "projected");
  assert.deepEqual(
    data.matches.qf1.slots.map((slot) => slot.team?.seed),
    [1, 4]
  );
  assert.deepEqual(
    data.matches.ef2.slots.map((slot) => slot.team?.seed),
    [6, 7]
  );
  assert.deepEqual(
    data.matches.sf1.slots.map((slot) => slot.source),
    ["Loser QF1", "Winner EF1"]
  );
});

test("advances winners and qualifying-final losers through the NRL matrix", () => {
  const games = [
    finalGame("qf1", 28, 1, 4, 24, 10),
    finalGame("qf2", 28, 2, 3, 12, 18),
    finalGame("ef1", 28, 5, 8, 8, 20),
    finalGame("ef2", 28, 6, 7, 22, 16),
    finalGame("sf1", 29, 4, 8, 12, 26),
    finalGame("sf2", 29, 2, 6, 20, 14),
  ];
  const data = buildFinalsData(2026, ladder, games, {
    regularSeasonComplete: true,
  });

  assert.equal(data.mode, "official");
  assert.deepEqual(
    data.matches.sf1.slots.map((slot) => slot.team?.seed),
    [4, 8]
  );
  assert.deepEqual(
    data.matches.pf1.slots.map((slot) => slot.team?.seed),
    [1, 2]
  );
  assert.deepEqual(
    data.matches.pf2.slots.map((slot) => slot.team?.seed),
    [3, 8]
  );
});

test("keeps future rounds as pathway labels until their feeder games finish", () => {
  const data = buildFinalsData(
    2026,
    ladder,
    [finalGame("qf1", 28, 1, 4, 24, 10)],
    { regularSeasonComplete: true }
  );

  assert.equal(data.matches.sf1.slots[0].team?.seed, 4);
  assert.equal(data.matches.sf1.slots[1].team, null);
  assert.equal(data.matches.sf1.slots[1].source, "Winner EF1");
  assert.equal(data.matches.pf1.slots[0].team?.seed, 1);
  assert.equal(data.matches.pf1.slots[1].source, "Winner SF2");
});
