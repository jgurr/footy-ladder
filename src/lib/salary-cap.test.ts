import test from "node:test";
import assert from "node:assert/strict";
import {
  dollarsToCents,
  getConfidenceBand,
  validateSalaryEstimateValue,
} from "./salary-cap";

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
