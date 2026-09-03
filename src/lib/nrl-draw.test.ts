import assert from "node:assert/strict";
import test from "node:test";
import { parseOfficialRoundNumber } from "./nrl-draw";

test("maps official finals labels onto postseason round ids", () => {
  assert.equal(parseOfficialRoundNumber("Finals Week 1"), 28);
  assert.equal(parseOfficialRoundNumber("Finals Week 2"), 29);
  assert.equal(parseOfficialRoundNumber("Finals Week 3"), 30);
  assert.equal(parseOfficialRoundNumber("Grand Final"), 31);
});

test("continues parsing regular-season round labels", () => {
  assert.equal(parseOfficialRoundNumber("Round 27"), 27);
});
