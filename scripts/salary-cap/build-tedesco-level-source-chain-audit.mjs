#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "src/data/salary-cap/all-teams-2026.json");
const reviewDir = path.join(root, "docs/research/player-specific-article-review");
const outputJsonPath = path.join(reviewDir, "tedesco-level-source-chain-audit-2026.json");
const outputCsvPath = path.join(reviewDir, "tedesco-level-source-chain-audit-2026.csv");
const outputMdPath = path.join(reviewDir, "tedesco-level-source-chain-audit-2026.md");

const reviewLayerPaths = [
  path.join(reviewDir, "combined-player-specific-article-review-2026.json"),
  path.join(reviewDir, "player-specific-article-review-2026-tedesco-source-sites.json"),
];

const clubDomains = new Map([
  ["bri", "broncos.com.au"],
  ["can", "raiders.com.au"],
  ["cby", "bulldogs.com.au"],
  ["cro", "sharks.com.au"],
  ["dol", "dolphinsnrl.com.au"],
  ["gld", "titans.com.au"],
  ["man", "seaeagles.com.au"],
  ["mel", "melbournestorm.com.au"],
  ["new", "newcastleknights.com.au"],
  ["nql", "cowboys.com.au"],
  ["nzl", "warriors.kiwi"],
  ["par", "parraeels.com.au"],
  ["pen", "penrithpanthers.com.au"],
  ["sou", "rabbitohs.com.au"],
  ["sti", "dragons.com.au"],
  ["syd", "roosters.com.au"],
  ["wst", "weststigers.com.au"],
]);

const salaryPublisherDomains = [
  "dailytelegraph.com.au",
  "smh.com.au",
  "nine.com.au",
  "wwos.nine.com.au",
  "foxsports.com.au",
  "news.com.au",
  "codesports.com.au",
  "couriermail.com.au",
  "theaustralian.com.au",
  "heraldsun.com.au",
  "goldcoastbulletin.com.au",
  "townsvillebulletin.com.au",
  "themercury.com.au",
  "7news.com.au",
  "au.sports.yahoo.com",
];

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function getPrimaryEstimate(player, season) {
  return (
    player.salaryEstimates?.find((estimate) => estimate.season === season) ||
    player.salaryEstimates?.[0] ||
    {}
  );
}

function sameOrSubdomain(domain, allowed) {
  return domain === allowed || domain.endsWith(`.${allowed}`);
}

function isSalaryPublisher(domain) {
  return salaryPublisherDomains.some((allowed) => sameOrSubdomain(domain, allowed));
}

function isOfficialTermDomain(domain, teamId) {
  const clubDomain = clubDomains.get(teamId);
  return sameOrSubdomain(domain, "nrl.com") || Boolean(clubDomain && sameOrSubdomain(domain, clubDomain));
}

function sourceDomain(source) {
  try {
    return new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function sourceToCandidate(source, articleUse) {
  return {
    articleUse,
    domain: sourceDomain(source),
    reputable: true,
    primaryPreferred: true,
    officialClubSource: source.sourceTier === "official" || source.sourceTier === "club",
    score: 100,
    title: source.title,
    url: source.url,
    snippet: source.notes ?? "",
    sourceId: source.id,
    fromProductionSource: true,
  };
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function candidateText(candidate) {
  return normalizeText(`${candidate.title ?? ""} ${candidate.snippet ?? ""}`);
}

function isInitialContractLead(candidate) {
  const text = candidateText(candidate);
  return /\b(signs with|joins|join|signed with|lands|agrees to join|switch|move to|move from|deal with)\b/.test(text);
}

function isExtensionLead(candidate) {
  const text = candidateText(candidate);
  return /\b(extension|extends|extend|re-signs|re-signed|resigns|commits|committed|renews|stays|remain|option)\b/.test(text);
}

function isMoneyLead(candidate) {
  const text = candidateText(candidate);
  return (
    candidate.articleUse === "player_specific_salary_candidate" ||
    /\$ ?\d+(?:\.\d+)?\s?(?:m|million|k|,000)/i.test(text)
  );
}

function candidateKey(candidate) {
  return `${candidate.url}::${candidate.articleUse}`;
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

const dataset = JSON.parse(await readFile(dataPath, "utf8"));
const reviewLayers = [];
for (const filePath of reviewLayerPaths) {
  const layer = await readJsonIfExists(filePath);
  if (layer?.records) reviewLayers.push({ filePath, layer });
}

const candidatesByPlayer = new Map();
for (const { layer } of reviewLayers) {
  for (const record of layer.records) {
    const key = `${record.teamId}::${record.player}`;
    const existing = candidatesByPlayer.get(key) ?? [];
    const seen = new Set(existing.map(candidateKey));
    for (const candidate of record.candidates ?? []) {
      if (!candidate?.url || candidate.articleUse === "context_only") continue;
      const next = {
        ...candidate,
        domain: candidate.domain ?? "",
      };
      if (!seen.has(candidateKey(next))) {
        existing.push(next);
        seen.add(candidateKey(next));
      }
    }
    candidatesByPlayer.set(key, existing);
  }
}

function ranked(candidates) {
  return [...candidates].sort((a, b) => {
    const articleRank = {
      player_specific_salary_candidate: 4,
      player_specific_contract_candidate: 3,
      player_specific_profile_candidate: 2,
    };
    return (
      (articleRank[b.articleUse] ?? 0) - (articleRank[a.articleUse] ?? 0) ||
      Number(b.primaryPreferred) - Number(a.primaryPreferred) ||
      Number(b.officialClubSource) - Number(a.officialClubSource) ||
      Number(b.reputable) - Number(a.reputable) ||
      Number(b.score ?? 0) - Number(a.score ?? 0)
    );
  });
}

function firstUrls(candidates, count = 3) {
  return candidates.slice(0, count).map((candidate) => candidate.url);
}

const records = [];
for (const team of dataset.teams) {
  const sourcesById = new Map((team.sources ?? []).map((source) => [source.id, source]));
  for (const player of team.players) {
    const key = `${team.teamId}::${player.name}`;
    const estimate = getPrimaryEstimate(player, dataset.season);
    const candidates = ranked(candidatesByPlayer.get(key) ?? []);
    const hasPrimaryPromotedSalary =
      estimate.estimateType !== "unknown" && estimate.evidenceRole === "primary_individual_report";
    const hasDisplayedCrossReferencedSalary =
      estimate.estimateType !== "unknown" && estimate.evidenceRole === "cross_referenced_baseline";
    const productionSalarySources = hasPrimaryPromotedSalary
      ? (estimate.sources ?? [])
          .map((sourceId) => sourcesById.get(sourceId))
          .filter(Boolean)
          .filter((source) => source.supportsDirectSalaryClaim)
          .map((source) => sourceToCandidate(source, "player_specific_salary_candidate"))
      : [];
    const productionContractSources = (player.contractSourceIds ?? [])
      .map((sourceId) => sourcesById.get(sourceId))
      .filter(Boolean)
      .map((source) => sourceToCandidate(source, "player_specific_contract_candidate"));
    const salaryLeads = candidates.filter(
      (candidate) => isMoneyLead(candidate) && candidate.reputable && isSalaryPublisher(candidate.domain),
    );
    const contractLeads = candidates.filter(
      (candidate) => candidate.articleUse === "player_specific_contract_candidate" && candidate.reputable,
    );
    const allSalaryLeads = ranked([...productionSalarySources, ...salaryLeads]);
    const allContractLeads = ranked([...productionContractSources, ...contractLeads]);
    const officialTermLeads = allContractLeads.filter((candidate) =>
      isOfficialTermDomain(candidate.domain, team.teamId),
    );
    const initialContractLeads = allContractLeads.filter(isInitialContractLead);
    const extensionLeads = allContractLeads.filter(isExtensionLead);
    const primaryPublisherLeads = [...productionSalarySources, ...candidates].filter(
      (candidate) => candidate.reputable && isSalaryPublisher(candidate.domain),
    );

    const hasPlayerSpecificSalaryLead = allSalaryLeads.length > 0;
    const hasOfficialTermLead = officialTermLeads.length > 0;
    const hasContractChainLead = initialContractLeads.length > 0 || extensionLeads.length > 0;

    let chainStatus = "no_player_specific_candidates";
    if (hasPrimaryPromotedSalary && hasOfficialTermLead) {
      chainStatus = "tedesco_level_promoted";
    } else if (hasPrimaryPromotedSalary) {
      chainStatus = "primary_salary_needs_official_term_candidate";
    } else if (hasDisplayedCrossReferencedSalary) {
      chainStatus = "displayed_salary_needs_tedesco_level_chain";
    } else if (hasPlayerSpecificSalaryLead && hasOfficialTermLead && hasContractChainLead) {
      chainStatus = "ready_for_manual_salary_promotion_review";
    } else if (hasPlayerSpecificSalaryLead) {
      chainStatus = "salary_candidate_needs_term_chain";
    } else if (hasOfficialTermLead || hasContractChainLead) {
      chainStatus = "term_chain_no_salary_candidate";
    } else if (candidates.length > 0) {
      chainStatus = "profile_or_secondary_candidates_only";
    }

    records.push({
      teamId: team.teamId,
      teamName: team.teamName,
      player: player.name,
      position: player.position,
      currentEvidenceRole: estimate.evidenceRole ?? "",
      currentEstimateType: estimate.estimateType ?? "",
      currentAmountCents: estimate.amountCents ?? null,
      currentContractYears: player.contractYears ?? [],
      chainStatus,
      candidateCount: candidates.length,
      productionSalarySourceCount: productionSalarySources.length,
      productionContractSourceCount: productionContractSources.length,
      salaryLeadCount: allSalaryLeads.length,
      contractLeadCount: allContractLeads.length,
      officialTermLeadCount: officialTermLeads.length,
      initialContractLeadCount: initialContractLeads.length,
      extensionLeadCount: extensionLeads.length,
      primaryPublisherLeadCount: primaryPublisherLeads.length,
      salaryLeadUrls: firstUrls(allSalaryLeads),
      officialTermUrls: firstUrls(officialTermLeads),
      initialContractUrls: firstUrls(initialContractLeads),
      extensionUrls: firstUrls(extensionLeads),
      topCandidateUrls: firstUrls(candidates, 5),
    });
  }
}

const totals = records.reduce(
  (acc, record) => {
    acc.players += 1;
    acc[record.chainStatus] = (acc[record.chainStatus] ?? 0) + 1;
    if (record.salaryLeadCount > 0) acc.playersWithSalaryLead += 1;
    if (record.officialTermLeadCount > 0) acc.playersWithOfficialTermLead += 1;
    if (record.initialContractLeadCount > 0) acc.playersWithInitialContractLead += 1;
    if (record.extensionLeadCount > 0) acc.playersWithExtensionLead += 1;
    return acc;
  },
  {
    players: 0,
    playersWithSalaryLead: 0,
    playersWithOfficialTermLead: 0,
    playersWithInitialContractLead: 0,
    playersWithExtensionLead: 0,
  },
);

const teamSummaries = dataset.teams.map((team) => {
  const teamRecords = records.filter((record) => record.teamId === team.teamId);
  return teamRecords.reduce(
    (acc, record) => {
      acc.players += 1;
      if (record.salaryLeadCount > 0) acc.salaryLeads += 1;
      if (record.officialTermLeadCount > 0) acc.officialTermLeads += 1;
      if (record.initialContractLeadCount > 0) acc.initialContractLeads += 1;
      if (record.extensionLeadCount > 0) acc.extensionLeads += 1;
      acc.statuses[record.chainStatus] = (acc.statuses[record.chainStatus] ?? 0) + 1;
      return acc;
    },
    {
      teamId: team.teamId,
      teamName: team.teamName,
      players: 0,
      salaryLeads: 0,
      officialTermLeads: 0,
      initialContractLeads: 0,
      extensionLeads: 0,
      statuses: {},
    },
  );
});

const output = {
  checkedAt: new Date().toISOString(),
  scope:
    "Tedesco-level source-chain audit: player-specific salary/value leads, initial contract leads, extension/option leads, and official club/NRL term leads for every current dataset player.",
  sourceLayers: reviewLayers.map(({ filePath }) => filePath),
  totals,
  teamSummaries,
  records,
};

await mkdir(reviewDir, { recursive: true });
await writeFile(outputJsonPath, JSON.stringify(output, null, 2) + "\n");

const csvRows = [[
  "teamId",
  "teamName",
  "player",
  "position",
  "chainStatus",
  "currentEvidenceRole",
  "currentEstimateType",
  "currentAmountCents",
  "currentContractYears",
  "candidateCount",
  "productionSalarySourceCount",
  "productionContractSourceCount",
  "salaryLeadCount",
  "contractLeadCount",
  "officialTermLeadCount",
  "initialContractLeadCount",
  "extensionLeadCount",
  "salaryLeadUrls",
  "officialTermUrls",
  "initialContractUrls",
  "extensionUrls",
  "topCandidateUrls",
]];
for (const record of records) {
  csvRows.push([
    record.teamId,
    record.teamName,
    record.player,
    record.position,
    record.chainStatus,
    record.currentEvidenceRole,
    record.currentEstimateType,
    record.currentAmountCents,
    record.currentContractYears,
    record.candidateCount,
    record.productionSalarySourceCount,
    record.productionContractSourceCount,
    record.salaryLeadCount,
    record.contractLeadCount,
    record.officialTermLeadCount,
    record.initialContractLeadCount,
    record.extensionLeadCount,
    record.salaryLeadUrls,
    record.officialTermUrls,
    record.initialContractUrls,
    record.extensionUrls,
    record.topCandidateUrls,
  ]);
}
await writeFile(outputCsvPath, csvRows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");

const statusRows = Object.entries(totals)
  .filter(([key]) => !["players", "playersWithSalaryLead", "playersWithOfficialTermLead", "playersWithInitialContractLead", "playersWithExtensionLead"].includes(key))
  .sort((a, b) => b[1] - a[1]);

const md = [
  "# Tedesco-Level Source Chain Audit 2026",
  "",
  `Generated: ${output.checkedAt}`,
  "",
  "## Standard",
  "",
  "- Salary/value evidence: player-specific article from a credible publisher that discusses money, value, salary, offer, or contract worth.",
  "- Term evidence: official club/NRL source preferred; major-media extension/signing reporting retained as supporting evidence.",
  "- Unknown remains unknown until the salary/value claim is directly reviewed and can be attached to the player.",
  "",
  "## Totals",
  "",
  `- Players audited: ${totals.players}`,
  `- Players with salary/value leads: ${totals.playersWithSalaryLead}`,
  `- Players with official term leads: ${totals.playersWithOfficialTermLead}`,
  `- Players with initial-contract leads: ${totals.playersWithInitialContractLead}`,
  `- Players with extension/option leads: ${totals.playersWithExtensionLead}`,
  "",
  "## Chain Status",
  "",
  "| Status | Players |",
  "| --- | ---: |",
  ...statusRows.map(([status, count]) => `| ${status} | ${count} |`),
  "",
  "## Team Summary",
  "",
  "| Team | Players | Salary Leads | Official Term | Initial Contract | Extension/Option |",
  "| --- | ---: | ---: | ---: | ---: | ---: |",
  ...teamSummaries.map(
    (team) =>
      `| ${team.teamName} | ${team.players} | ${team.salaryLeads} | ${team.officialTermLeads} | ${team.initialContractLeads} | ${team.extensionLeads} |`,
  ),
  "",
  "## Manual Promotion Queue",
  "",
  ...records
    .filter((record) =>
      ["ready_for_manual_salary_promotion_review", "salary_candidate_needs_term_chain"].includes(record.chainStatus),
    )
    .slice(0, 80)
    .map(
      (record) =>
        `- ${record.teamName}: ${record.player} — ${record.chainStatus} — salary leads ${record.salaryLeadCount}, official terms ${record.officialTermLeadCount}`,
    ),
  "",
];
await writeFile(outputMdPath, md.join("\n"));

console.log(
  JSON.stringify(
    {
      outputJsonPath,
      outputCsvPath,
      outputMdPath,
      totals,
    },
    null,
    2,
  ),
);
