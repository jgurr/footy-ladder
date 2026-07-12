#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDir = path.join(process.cwd(), "docs/research/player-specific-article-review");
const basePath = path.join(outputDir, "player-specific-article-review-2026.json");
const officialPath = path.join(outputDir, "official-club-signing-articles-2026.json");
const outputPath = path.join(outputDir, "combined-player-specific-article-review-2026.json");
const outputCsvPath = path.join(outputDir, "combined-player-specific-article-review-2026.csv");

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function candidateKey(candidate) {
  return `${candidate.url}::${candidate.articleUse}`;
}

const base = JSON.parse(await readFile(basePath, "utf8"));
const official = JSON.parse(await readFile(officialPath, "utf8"));
const officialByKey = new Map(
  official.records.map((record) => [`${record.teamId}::${record.player}`, record]),
);

const records = base.records.map((record) => {
  const officialRecord = officialByKey.get(`${record.teamId}::${record.player}`);
  const candidates = [...record.candidates];
  const seen = new Set(candidates.map(candidateKey));
  for (const match of officialRecord?.matches ?? []) {
    const candidate = {
      articleUse: match.articleUse,
      domain: new URL(match.url).hostname.replace(/^www\./, ""),
      reputable: true,
      primaryPreferred: true,
      score: 80,
      signals: match.signals,
      providers: ["official-club-signings-topic"],
      foundBy: ["official_club_signings_topic"],
      publishedAt: match.publishedAt,
      sourceName: record.teamName,
      title: match.title,
      url: match.url,
      snippet: match.textSample,
      officialClubSource: true,
    };
    if (!seen.has(candidateKey(candidate))) {
      candidates.push(candidate);
      seen.add(candidateKey(candidate));
    }
  }
  const summary = {
    totalCandidates: candidates.length,
    playerSpecificSalaryCandidates: candidates.filter(
      (candidate) => candidate.articleUse === "player_specific_salary_candidate",
    ).length,
    playerSpecificContractCandidates: candidates.filter(
      (candidate) => candidate.articleUse === "player_specific_contract_candidate",
    ).length,
    playerSpecificProfileCandidates: candidates.filter(
      (candidate) => candidate.articleUse === "player_specific_profile_candidate",
    ).length,
    preferredPrimaryCandidates: candidates.filter((candidate) => candidate.primaryPreferred).length,
    reputableCandidates: candidates.filter((candidate) => candidate.reputable).length,
    officialClubCandidates: candidates.filter((candidate) => candidate.officialClubSource).length,
  };
  return {
    ...record,
    candidates,
    summary,
  };
});

const totals = records.reduce(
  (acc, record) => {
    acc.records += 1;
    acc.candidates += record.candidates.length;
    if (record.summary.playerSpecificSalaryCandidates > 0) acc.playersWithSalaryCandidate += 1;
    if (record.summary.playerSpecificContractCandidates > 0) acc.playersWithContractCandidate += 1;
    if (record.summary.playerSpecificProfileCandidates > 0) acc.playersWithProfileCandidate += 1;
    if (record.summary.preferredPrimaryCandidates > 0) acc.playersWithPreferredPrimaryCandidate += 1;
    if (record.summary.officialClubCandidates > 0) acc.playersWithOfficialClubCandidate += 1;
    if (record.summary.totalCandidates === 0) acc.playersWithNoCandidate += 1;
    return acc;
  },
  {
    records: 0,
    candidates: 0,
    playersWithSalaryCandidate: 0,
    playersWithContractCandidate: 0,
    playersWithProfileCandidate: 0,
    playersWithPreferredPrimaryCandidate: 0,
    playersWithOfficialClubCandidate: 0,
    playersWithNoCandidate: 0,
  },
);

const output = {
  checkedAt: new Date().toISOString(),
  sourceLayers: [basePath, officialPath],
  totals,
  records,
};

await writeFile(outputPath, JSON.stringify(output, null, 2) + "\n");

const rows = [[
  "teamId",
  "teamName",
  "player",
  "position",
  "candidateRank",
  "articleUse",
  "domain",
  "officialClubSource",
  "signals",
  "providers",
  "publishedAt",
  "title",
  "url",
  "snippet",
]];

for (const record of records) {
  if (!record.candidates.length) {
    rows.push([
      record.teamId,
      record.teamName,
      record.player,
      record.position,
      "",
      "no_candidate_found",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    continue;
  }
  record.candidates.forEach((candidate, index) => {
    rows.push([
      record.teamId,
      record.teamName,
      record.player,
      record.position,
      index + 1,
      candidate.articleUse,
      candidate.domain,
      candidate.officialClubSource ?? false,
      candidate.signals,
      candidate.providers,
      candidate.publishedAt,
      candidate.title,
      candidate.url,
      candidate.snippet,
    ]);
  });
}

await writeFile(outputCsvPath, rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");

console.log(JSON.stringify({ outputPath, outputCsvPath, totals }, null, 2));
