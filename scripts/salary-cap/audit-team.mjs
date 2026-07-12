#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i], process.argv[i + 1]);
}

const team = args.get("--team") ?? "WST";
const season = Number(args.get("--season") ?? 2026);

if (team.toUpperCase() !== "WST") {
  throw new Error(`Only WST pilot data exists right now, received ${team}`);
}

const filePath = path.join(
  process.cwd(),
  "src/data/salary-cap/wests-tigers-2026-pilot.json"
);
const data = JSON.parse(await readFile(filePath, "utf8"));

assert.equal(data.teamId, "wst");
assert.equal(data.season, season);
assert.equal(data.players.length, 30, "Wests Tigers pilot must include 30 players");

const sourceIds = new Set(data.sources.map((source) => source.id));
const sourcesById = new Map(data.sources.map((source) => [source.id, source]));
const bands = new Set(["high", "medium", "low", "unknown"]);
const estimateTypes = new Set([
  "reported_exact",
  "reported_range",
  "derived_range",
  "unknown",
]);

let sourcedSalaryCount = 0;
let unknownSalaryCount = 0;
let primaryIndividualCount = 0;
let crossReferencedBaselineCount = 0;
let backupBaselineCount = 0;
let bucketUnknownCount = 0;
let openUnknownCount = 0;

for (const player of data.players) {
  assert.equal(player.rosterCategory, "top30", `${player.name} must be top30`);
  assert.ok(player.contractYears.length > 0, `${player.name} needs contract years`);
  assert.ok(player.salaryEstimates.length > 0, `${player.name} needs a salary estimate state`);

  for (const estimate of player.salaryEstimates) {
    assert.equal(estimate.season, season, `${player.name} estimate season mismatch`);
    assert.ok(estimateTypes.has(estimate.estimateType), `${player.name} invalid estimate type`);
    assert.ok(bands.has(estimate.confidenceBand), `${player.name} invalid confidence band`);
    assert.ok(
      estimate.confidenceScore >= 0 && estimate.confidenceScore <= 100,
      `${player.name} invalid confidence score`
    );
    assert.ok(estimate.reasoning, `${player.name} estimate needs reasoning`);

    if (estimate.estimateType === "unknown") {
      unknownSalaryCount++;
      if (estimate.evidenceRole === "bucket_unknown") {
        bucketUnknownCount++;
      } else if (estimate.evidenceRole === "open_unknown") {
        openUnknownCount++;
      }
    } else {
      sourcedSalaryCount++;
      if (estimate.evidenceRole === "primary_individual_report") {
        primaryIndividualCount++;
      } else if (estimate.evidenceRole === "cross_referenced_baseline") {
        crossReferencedBaselineCount++;
      } else if (estimate.evidenceRole === "backup_baseline") {
        backupBaselineCount++;
      }
      assert.ok(
        estimate.sources?.length > 0,
        `${player.name} non-unknown salary estimate needs source ids`
      );
      for (const sourceId of estimate.sources) {
        assert.ok(sourceIds.has(sourceId), `${player.name} references missing source ${sourceId}`);
        const source = sourcesById.get(sourceId);
        assert.equal(
          source.supportsDirectSalaryClaim,
          true,
          `${player.name} non-unknown salary estimate must reference a direct salary/value claim source, got ${sourceId}`
        );
      }
    }
  }
}

console.log(JSON.stringify({
  team: data.teamName,
  season,
  players: data.players.length,
  sourcedSalaryCount,
  unknownSalaryCount,
  primaryIndividualCount,
  crossReferencedBaselineCount,
  backupBaselineCount,
  bucketUnknownCount,
  openUnknownCount,
  excludedOrMonitor: data.excludedOrMonitor.length,
}, null, 2));
