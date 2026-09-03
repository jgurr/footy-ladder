import test from "node:test";
import assert from "node:assert/strict";
import salaryData from "@/data/salary-cap/all-teams-2026.json";
import {
  dollarsToCents,
  getConfidenceBand,
  hasCredibleSalaryArticleEvidence,
  normalizeSalaryEstimateForDisplay,
  validateSalaryEstimateValue,
} from "./salary-cap";
import type { DisplaySalaryEstimate } from "./salary-cap";

test("getConfidenceBand maps score ranges", () => {
  assert.equal(getConfidenceBand(100), "high");
  assert.equal(getConfidenceBand(80), "high");
  assert.equal(getConfidenceBand(79), "medium");
  assert.equal(getConfidenceBand(55), "medium");
  assert.equal(getConfidenceBand(54), "low");
  assert.equal(getConfidenceBand(25), "low");
  assert.equal(getConfidenceBand(24), "unknown");
  assert.equal(getConfidenceBand(0), "unknown");
});

test("getConfidenceBand rejects invalid scores", () => {
  assert.throws(() => getConfidenceBand(-1));
  assert.throws(() => getConfidenceBand(101));
});

test("dollarsToCents converts public salary figures safely", () => {
  assert.equal(dollarsToCents(120000), 12000000);
  assert.equal(dollarsToCents(11.25), 1125);
});

test("validateSalaryEstimateValue accepts exact, range, and unknown shapes", () => {
  assert.doesNotThrow(() =>
    validateSalaryEstimateValue({
      estimateType: "reported_exact",
      claimShape: "annual_salary",
      amountCents: 12000000,
    })
  );

  assert.doesNotThrow(() =>
    validateSalaryEstimateValue({
      estimateType: "reported_range",
      claimShape: "annual_salary",
      lowAmountCents: 50000000,
      highAmountCents: 65000000,
    })
  );

  assert.doesNotThrow(() =>
    validateSalaryEstimateValue({
      estimateType: "unknown",
      claimShape: "unknown",
    })
  );
});

test("validateSalaryEstimateValue rejects false precision", () => {
  assert.throws(() =>
    validateSalaryEstimateValue({
      estimateType: "unknown",
      claimShape: "annual_salary",
      amountCents: 12000000,
    })
  );

  assert.throws(() =>
    validateSalaryEstimateValue({
      estimateType: "reported_range",
      claimShape: "annual_salary",
      lowAmountCents: 65000000,
      highAmountCents: 50000000,
    })
  );
});

test("hasCredibleSalaryArticleEvidence only accepts player-specific evidence roles", () => {
  assert.equal(
    hasCredibleSalaryArticleEvidence({
      estimateType: "reported_exact",
      evidenceRole: "primary_individual_report",
    }),
    true
  );
  assert.equal(
    hasCredibleSalaryArticleEvidence({
      estimateType: "reported_exact",
      evidenceRole: "cross_referenced_baseline",
    }),
    true
  );
  assert.equal(
    hasCredibleSalaryArticleEvidence({
      estimateType: "reported_exact",
      evidenceRole: "backup_baseline",
    }),
    false
  );
  assert.equal(
    hasCredibleSalaryArticleEvidence({
      estimateType: "derived_range",
      evidenceRole: "derived_bucket_range",
    }),
    false
  );
});

test("normalizeSalaryEstimateForDisplay hides unsupported salary values as unknown", () => {
  const estimate = normalizeSalaryEstimateForDisplay({
    season: 2026,
    estimateType: "derived_range",
    claimShape: "market_estimate",
    lowAmountCents: 20000000,
    highAmountCents: 65000000,
    confidenceScore: 42,
    confidenceBand: "low",
    evidenceRole: "derived_bucket_range",
    sources: ["league-wide-roster-value"],
    reasoning: "Residual bucket estimate.",
  });

  assert.equal(estimate.estimateType, "unknown");
  assert.equal(estimate.claimShape, "unknown");
  assert.equal(estimate.lowAmountCents, undefined);
  assert.equal(estimate.highAmountCents, undefined);
  assert.equal(estimate.confidenceBand, "unknown");
  assert.deepEqual(estimate.sources, []);
});

test("normalizeSalaryEstimateForDisplay preserves supported article-backed values", () => {
  const estimate = normalizeSalaryEstimateForDisplay({
    season: 2026,
    estimateType: "reported_exact",
    claimShape: "annual_salary",
    amountCents: 75000000,
    confidenceScore: 65,
    confidenceBand: "medium",
    evidenceRole: "cross_referenced_baseline",
    sources: ["player-focused-contract-report"],
    reasoning: "Player-specific report cross-references the value.",
  });

  assert.equal(estimate.estimateType, "reported_exact");
  assert.equal(estimate.amountCents, 75000000);
  assert.deepEqual(estimate.sources, ["player-focused-contract-report"]);
});

test("James Tedesco salary record uses player-specific source chain through 2027", () => {
  const roosters = salaryData.teams.find((team) => team.teamId === "syd");
  assert.ok(roosters);
  const tedesco = roosters.players.find((player) => player.name === "James Tedesco");
  assert.ok(tedesco);

  const rawEstimate =
    tedesco.salaryEstimates.find((candidate) => candidate.season === salaryData.season) ||
    tedesco.salaryEstimates[0];
  assert.ok(rawEstimate);
  const estimate = normalizeSalaryEstimateForDisplay(
    rawEstimate as DisplaySalaryEstimate
  );

  assert.equal(estimate.estimateType, "reported_exact");
  assert.equal(estimate.amountCents, 110000000);
  assert.equal(estimate.confidenceBand, "high");
  assert.equal(estimate.evidenceRole, "primary_individual_report");
  assert.deepEqual(tedesco.contractYears, [2026, 2027]);
  assert.ok(estimate.sources);
  assert.ok(estimate.sources.includes("dt-tedesco-roosters-initial-2017"));
  assert.ok(estimate.sources.includes("dt-tedesco-roosters-extension-2024"));
  assert.ok(estimate.sources.includes("dt-tedesco-roosters-extension-2025"));
  assert.ok(tedesco.contractSourceIds);
  assert.ok(tedesco.contractSourceIds.includes("roosters-tedesco-2027-extension"));
});
