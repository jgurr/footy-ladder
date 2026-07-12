#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const filePath = path.join(
  process.cwd(),
  "src/data/salary-cap/wests-tigers-2026-deep-pass.json"
);
const data = JSON.parse(await readFile(filePath, "utf8"));

assert.equal(data.teamId, "wst");
assert.equal(data.season, 2026);
assert.equal(data.salaryFindings.length, 19);
assert.equal(data.top30Confidence.ambiguousNames.length, 4);

for (const finding of data.salaryFindings) {
  assert.ok(finding.name, "finding needs name");
  assert.ok(finding.finding, `${finding.name} needs finding`);
  assert.ok(finding.salaryConfidence, `${finding.name} needs salary confidence`);
  assert.ok(finding.contractLengthConfidence, `${finding.name} needs contract confidence`);
  assert.ok(finding.sources.length > 0, `${finding.name} needs source refs`);
}

console.log(JSON.stringify({
  team: data.teamName,
  season: data.season,
  top30ConfidenceScore: data.top30Confidence.score,
  salaryFindings: data.salaryFindings.length,
  ambiguousTop30Records: data.top30Confidence.ambiguousNames.length,
}, null, 2));
