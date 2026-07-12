#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const filePath = path.join(
  process.cwd(),
  "src/data/salary-cap/all-teams-2026.json"
);
const data = JSON.parse(await readFile(filePath, "utf8"));

assert.equal(data.season, 2026);
assert.equal(data.teams.length, 17, "All-team salary file must include 17 clubs");
assert.equal(
  data.productionReady,
  false,
  "All-team salary file should remain non-production until player-by-player source pass is complete"
);
assert.equal(
  data.individualSourcePass?.status,
  "required_before_production",
  "All-team salary file must track the required individual source pass"
);

let playerCount = 0;
let sourcedSalaryCount = 0;
let unknownSalaryCount = 0;
let primaryIndividualCount = 0;
let crossReferencedBaselineCount = 0;
let backupBaselineCount = 0;
let bucketUnknownCount = 0;
let openUnknownCount = 0;
const teamSummaries = [];

for (const team of data.teams) {
  assert.ok(team.teamId, "Team needs teamId");
  assert.ok(team.teamName, `${team.teamId} needs teamName`);
  assert.ok(
    team.players.length >= 26 && team.players.length <= 30,
    `${team.teamName} should stay within generated roster-count bounds`
  );
  assert.equal(
    team.rosterInterpretation?.includedCount,
    team.players.length,
    `${team.teamName} includedCount must match player records`
  );

  const sourceIds = new Set(team.sources.map((source) => source.id));
  const sourcesById = new Map(team.sources.map((source) => [source.id, source]));

  for (const player of team.players) {
    playerCount++;
    assert.ok(player.name, `${team.teamName} has unnamed player`);
    assert.ok(!/^\d+$/.test(player.name), `${team.teamName} has numeric fake player`);
    assert.ok(player.contractYears.length > 0, `${player.name} needs contract years`);
    assert.ok(player.salaryEstimates.length > 0, `${player.name} needs salary estimate state`);

    for (const estimate of player.salaryEstimates) {
      assert.equal(estimate.season, 2026, `${player.name} estimate season mismatch`);
      assert.ok(estimate.reasoning, `${player.name} estimate needs reasoning`);
      assert.ok(
        estimate.confidenceScore >= 0 && estimate.confidenceScore <= 100,
        `${player.name} invalid confidence score`
      );

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
        assert.ok(estimate.sources?.length > 0, `${player.name} sourced estimate needs source ids`);
        for (const sourceId of estimate.sources) {
          assert.ok(sourceIds.has(sourceId), `${player.name} references missing source ${sourceId}`);
          assert.equal(
            sourcesById.get(sourceId)?.supportsDirectSalaryClaim,
            true,
            `${player.name} non-unknown salary estimate must reference a direct salary/value source`
          );
        }
      }
    }
  }

  teamSummaries.push({
    team: team.teamId,
    players: team.players.length,
    sourced: team.players.filter((player) =>
      player.salaryEstimates.some((estimate) => estimate.estimateType !== "unknown")
    ).length,
    primaryIndividual: team.players.filter((player) =>
      player.salaryEstimates.some((estimate) => estimate.evidenceRole === "primary_individual_report")
    ).length,
    crossReferencedBaseline: team.players.filter((player) =>
      player.salaryEstimates.some((estimate) => estimate.evidenceRole === "cross_referenced_baseline")
    ).length,
    backupBaseline: team.players.filter((player) =>
      player.salaryEstimates.some((estimate) => estimate.evidenceRole === "backup_baseline")
    ).length,
  });
}

console.log(JSON.stringify({
  season: data.season,
  status: data.status,
  productionReady: data.productionReady,
  teams: data.teams.length,
  playerCount,
  sourcedSalaryCount,
  unknownSalaryCount,
  primaryIndividualCount,
  crossReferencedBaselineCount,
  backupBaselineCount,
  bucketUnknownCount,
  openUnknownCount,
  teamSummaries,
}, null, 2));
