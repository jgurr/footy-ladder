#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const allowIncomplete = args.has("--allow-incomplete");
const dataPath = path.join(process.cwd(), "src/data/salary-cap/all-teams-2026.json");
const sourceReviewPath = path.join(
  process.cwd(),
  "docs/research/individual-source-review/player-source-review-2026.json"
);
const outputDir = path.join(process.cwd(), "docs/research/quality-audits");
const outputPath = path.join(outputDir, "equal-depth-audit-2026.json");

function hasPlaceholderContractYears(team, player) {
  return (
    player.contractSourceStatus !== "official_nrl_tracker" &&
    Array.isArray(player.contractYears) &&
    player.contractYears.length === 1 &&
    player.contractYears[0] === 2026
  );
}

function primaryEstimate(player) {
  return player.salaryEstimates?.find((estimate) => estimate.season === 2026) ??
    player.salaryEstimates?.[0];
}

function summarizeSourceReview(records) {
  const byPlayer = new Map(records.map((record) => [`${record.teamId}::${record.player}`, record]));

  return {
    byPlayer,
    totals: {
      reviewedPlayers: records.length,
      candidateLinks: records.reduce((total, record) => total + (record.candidates?.length ?? 0), 0),
      authoritativeExactNamePlayers: records.filter((record) =>
        record.candidates?.some((candidate) => candidate.authoritative && candidate.exactPlayerName)
      ).length,
      dailyTelegraphCandidates: records.reduce(
        (total, record) =>
          total +
          (record.candidates ?? []).filter((candidate) =>
            candidate.domain?.endsWith("dailytelegraph.com.au")
          ).length,
        0
      ),
      smhCandidates: records.reduce(
        (total, record) =>
          total +
          (record.candidates ?? []).filter((candidate) => candidate.domain?.endsWith("smh.com.au"))
            .length,
        0
      ),
    },
  };
}

const data = JSON.parse(await readFile(dataPath, "utf8"));
const sourceReview = JSON.parse(await readFile(sourceReviewPath, "utf8"));
const { byPlayer, totals } = summarizeSourceReview(sourceReview.records ?? []);

const teamSummaries = data.teams.map((team) => {
  const players = team.players ?? [];
  const playerSummaries = players.map((player) => {
    const estimate = primaryEstimate(player);
    const reviewRecord = byPlayer.get(`${team.teamId}::${player.name}`);
    const candidates = reviewRecord?.candidates ?? [];
    const authoritativeExactCandidates = candidates.filter(
      (candidate) => candidate.authoritative && candidate.exactPlayerName
    );
    const preferredPublisherCandidates = candidates.filter((candidate) =>
      /(^|\.)dailytelegraph\.com\.au$|(^|\.)smh\.com\.au$|(^|\.)nine\.com\.au$|(^|\.)foxsports\.com\.au$/i.test(
        candidate.domain ?? ""
      )
    );

    return {
      name: player.name,
      evidenceRole: estimate?.evidenceRole ?? "missing",
      estimateType: estimate?.estimateType ?? "missing",
      confidenceScore: estimate?.confidenceScore ?? null,
      contractYears: player.contractYears ?? [],
      placeholderContractYears: hasPlaceholderContractYears(team, player),
      candidateLinks: candidates.length,
      authoritativeExactCandidateLinks: authoritativeExactCandidates.length,
      preferredPublisherCandidateLinks: preferredPublisherCandidates.length,
      needsPlayerArticleReview:
        estimate?.evidenceRole === "backup_baseline" ||
        estimate?.evidenceRole === "bucket_unknown" ||
        estimate?.evidenceRole === "open_unknown" ||
        estimate?.evidenceRole === "derived_bucket_range" ||
        estimate?.evidenceRole === "derived_cap_residual_range",
      needsContractTermReview: hasPlaceholderContractYears(team, player),
    };
  });

  const blockers = [];
  const placeholderContractPlayers = playerSummaries.filter((player) => player.placeholderContractYears);
  const backupBaselinePlayers = playerSummaries.filter((player) => player.evidenceRole === "backup_baseline");
  const unknownSalaryPlayers = playerSummaries.filter((player) =>
    ["bucket_unknown", "open_unknown"].includes(player.evidenceRole)
  );
  const derivedRangePlayers = playerSummaries.filter((player) =>
    ["derived_bucket_range", "derived_cap_residual_range"].includes(player.evidenceRole)
  );
  const playerFocusedCandidates = playerSummaries.filter(
    (player) => player.authoritativeExactCandidateLinks > 0
  );

  if (players.length !== 30) {
    blockers.push(`Roster snapshot has ${players.length} players; needs documented Top 30 reconciliation.`);
  }
  if (placeholderContractPlayers.length > 0) {
    blockers.push(
      `${placeholderContractPlayers.length} players still use generated [2026] contract-year placeholders.`
    );
  }
  if (backupBaselinePlayers.length > 0) {
    blockers.push(
      `${backupBaselinePlayers.length} players still use league-wide roster-value article as primary salary evidence.`
    );
  }
  if (derivedRangePlayers.length > Math.ceil(players.length * 0.5)) {
    blockers.push(
      `${derivedRangePlayers.length} players use derived ranges; needs more player-specific salary article review.`
    );
  }
  if (playerFocusedCandidates.length < Math.ceil(players.length * 0.6)) {
    blockers.push(
      `Only ${playerFocusedCandidates.length}/${players.length} players have authoritative exact-name candidate links; target is at least 60% before article review.`
    );
  }

  return {
    teamId: team.teamId,
    teamName: team.teamName,
    players: players.length,
    rosterIsTop30Sized: players.length === 30,
    placeholderContractYears: placeholderContractPlayers.length,
    backupBaselinePlayers: backupBaselinePlayers.length,
    unknownSalaryPlayers: unknownSalaryPlayers.length,
    derivedRangePlayers: derivedRangePlayers.length,
    authoritativeExactCandidatePlayers: playerFocusedCandidates.length,
    blockers,
    playerSummaries,
  };
});

const output = {
  checkedAt: new Date().toISOString(),
  season: data.season,
  productionReady: false,
  policy:
    "Every club must receive the same depth as the Wests Tigers pilot: Top 30 reconciliation, official/club contract-term review, player-by-player salary article search, and source-linked confidence. Generated [2026] contract years and league-wide roster valuation numbers are blockers, not production data.",
  sourceReviewTotals: totals,
  teams: teamSummaries,
  blockers: teamSummaries.flatMap((team) =>
    team.blockers.map((blocker) => ({
      teamId: team.teamId,
      teamName: team.teamName,
      blocker,
    }))
  ),
};

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log(
  JSON.stringify(
    {
      outputPath,
      teams: output.teams.length,
      blockers: output.blockers.length,
      sourceReviewTotals: output.sourceReviewTotals,
      teamSummary: output.teams.map((team) => ({
        teamId: team.teamId,
        players: team.players,
        placeholderContractYears: team.placeholderContractYears,
        backupBaselinePlayers: team.backupBaselinePlayers,
        derivedRangePlayers: team.derivedRangePlayers,
        authoritativeExactCandidatePlayers: team.authoritativeExactCandidatePlayers,
        blockers: team.blockers.length,
      })),
    },
    null,
    2
  )
);

if (!allowIncomplete && output.blockers.length > 0) {
  process.exitCode = 1;
}
