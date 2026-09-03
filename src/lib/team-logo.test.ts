import assert from "node:assert/strict";
import test from "node:test";
import { NRL_TEAMS } from "./teams";
import {
  COMPACT_TEAM_LOGO_MAX_SIZE,
  TEAM_LOGO_IDS,
  getTeamLogoSrc,
  isTeamLogoId,
} from "./team-logo";

test("logo manifest stays aligned with the NRL team manifest", () => {
  assert.deepEqual(
    [...TEAM_LOGO_IDS].sort(),
    NRL_TEAMS.map(({ id }) => id).sort()
  );
});

test("uses official compact artwork through the 24px breakpoint", () => {
  assert.equal(COMPACT_TEAM_LOGO_MAX_SIZE, 24);
  assert.equal(getTeamLogoSrc("cby", 14), "/team-logos/cby/badge-24.svg");
  assert.equal(getTeamLogoSrc("CBY", 24), "/team-logos/cby/badge-24.svg");
});

test("uses the official full badge above the compact breakpoint", () => {
  assert.equal(getTeamLogoSrc("cby", 25), "/team-logos/cby/badge.svg");
  assert.equal(getTeamLogoSrc("cby", 32), "/team-logos/cby/badge.svg");
});

test("allows an explicit asset variant and rejects unknown teams", () => {
  assert.equal(getTeamLogoSrc("bri", 16, "full"), "/team-logos/bri/badge.svg");
  assert.equal(getTeamLogoSrc("bri", 32, "compact"), "/team-logos/bri/badge-24.svg");
  assert.equal(getTeamLogoSrc("unknown", 24), null);
  assert.equal(isTeamLogoId("../cby"), false);
});
