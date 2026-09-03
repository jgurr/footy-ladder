import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { TEAM_LOGO_SOURCES } from "./update-team-logos.mjs";

const EXPECTED_TEAM_IDS = [
  "bri",
  "can",
  "cby",
  "cro",
  "dol",
  "gld",
  "man",
  "mel",
  "new",
  "nql",
  "nzl",
  "par",
  "pen",
  "sou",
  "sti",
  "syd",
  "wst",
];

test("official logo source manifest covers all 17 NRL teams once", () => {
  const actualIds = TEAM_LOGO_SOURCES.map(({ id }) => id).sort();
  assert.deepEqual(actualIds, EXPECTED_TEAM_IDS);
  assert.equal(new Set(actualIds).size, EXPECTED_TEAM_IDS.length);
});

test("every team has valid compact and full local SVG assets", async () => {
  for (const teamId of EXPECTED_TEAM_IDS) {
    for (const filename of ["badge-24.svg", "badge.svg"]) {
      const assetPath = path.join(process.cwd(), "public", "team-logos", teamId, filename);
      const svg = await readFile(assetPath, "utf8");

      assert.match(svg, /<svg(?:\s|>)/i, `${assetPath} should contain SVG markup`);
      assert.doesNotMatch(svg, /<(?:script|foreignObject)(?:\s|>)/i);
      assert.ok(svg.length > 500, `${assetPath} is unexpectedly small`);
    }
  }
});
