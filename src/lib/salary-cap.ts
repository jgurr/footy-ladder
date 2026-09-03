import type {
  ConfidenceBand,
  SalaryEstimateType,
  SalaryClaimShape,
} from "./types";

export const CONFIDENCE_BANDS: Record<
  ConfidenceBand,
  { min: number; max: number; label: string }
> = {
  high: { min: 80, max: 100, label: "High" },
  medium: { min: 55, max: 79, label: "Medium" },
  low: { min: 25, max: 54, label: "Low" },
  unknown: { min: 0, max: 24, label: "Unknown" },
};

export function getConfidenceBand(score: number): ConfidenceBand {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error(`Confidence score must be between 0 and 100: ${score}`);
  }

  if (score >= CONFIDENCE_BANDS.high.min) return "high";
  if (score >= CONFIDENCE_BANDS.medium.min) return "medium";
  if (score >= CONFIDENCE_BANDS.low.min) return "low";
  return "unknown";
}

export function dollarsToCents(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`Salary amount must be a non-negative number: ${amount}`);
  }

  return Math.round(amount * 100);
}

export function validateSalaryEstimateValue(input: {
  estimateType: SalaryEstimateType;
  claimShape: SalaryClaimShape;
  amountCents?: number | null;
  lowAmountCents?: number | null;
  highAmountCents?: number | null;
}): void {
  const amount = input.amountCents ?? null;
  const low = input.lowAmountCents ?? null;
  const high = input.highAmountCents ?? null;

  if (input.estimateType === "unknown") {
    if (amount !== null || low !== null || high !== null) {
      throw new Error("Unknown salary estimates cannot carry salary amounts");
    }
    if (input.claimShape !== "unknown") {
      throw new Error("Unknown salary estimates must use the unknown claim shape");
    }
    return;
  }

  if (input.estimateType === "reported_exact" && amount === null) {
    throw new Error("Reported exact salary estimates require amountCents");
  }

  if (
    (input.estimateType === "reported_range" ||
      input.estimateType === "derived_range") &&
    (low === null || high === null)
  ) {
    throw new Error("Range salary estimates require lowAmountCents and highAmountCents");
  }

  if (low !== null && high !== null && low > high) {
    throw new Error("Salary estimate lowAmountCents cannot exceed highAmountCents");
  }
}

export type DisplaySalaryEstimate = {
  season: number;
  estimateType: string;
  claimShape: string;
  amountCents?: number;
  lowAmountCents?: number;
  highAmountCents?: number;
  confidenceScore: number;
  confidenceBand: ConfidenceBand;
  evidenceRole?: string;
  sources?: string[];
  reasoning: string;
};

const credibleSalaryEvidenceRoles = new Set([
  "primary_individual_report",
  "cross_referenced_baseline",
]);

export function hasCredibleSalaryArticleEvidence(
  estimate: Pick<DisplaySalaryEstimate, "estimateType" | "evidenceRole">
): boolean {
  return (
    estimate.estimateType !== "unknown" &&
    Boolean(estimate.evidenceRole) &&
    credibleSalaryEvidenceRoles.has(estimate.evidenceRole as string)
  );
}

export function normalizeSalaryEstimateForDisplay<T extends DisplaySalaryEstimate>(
  estimate: T
): T {
  if (estimate.estimateType === "unknown" || hasCredibleSalaryArticleEvidence(estimate)) {
    return estimate;
  }

  return {
    ...estimate,
    estimateType: "unknown",
    claimShape: "unknown",
    amountCents: undefined,
    lowAmountCents: undefined,
    highAmountCents: undefined,
    confidenceScore: 10,
    confidenceBand: "unknown",
    evidenceRole: "open_unknown",
    sources: [],
    reasoning:
      "No credible player-specific salary article has been captured for this player yet, so roster valuation and derived bucket figures are hidden as unknown.",
  };
}
