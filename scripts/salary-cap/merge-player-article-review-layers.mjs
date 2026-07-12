#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDir = path.join(process.cwd(), "docs/research/player-specific-article-review");
const basePath = path.join(outputDir, "player-specific-article-review-2026.json");
const officialPath = path.join(outputDir, "official-club-signing-articles-2026.json");
const bingHtmlPath = path.join(outputDir, "player-specific-article-review-2026-bing-html-lite-full.json");
const zeroTacklePath = path.join(outputDir, "zerotackle-player-contracts-2026.json");
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
let bingHtml = { records: [] };
try {
  bingHtml = JSON.parse(await readFile(bingHtmlPath, "utf8"));
} catch {
  bingHtml = { records: [] };
}
let zeroTackle = { records: [] };
try {
  zeroTackle = JSON.parse(await readFile(zeroTacklePath, "utf8"));
} catch {
  zeroTackle = { records: [] };
}
const officialByKey = new Map(
  official.records.map((record) => [`${record.teamId}::${record.player}`, record]),
);
const bingHtmlByKey = new Map(
  (bingHtml.records ?? []).map((record) => [`${record.teamId}::${record.player}`, record]),
);
const zeroTackleByKey = new Map(
  (zeroTackle.records ?? []).map((record) => [`${record.teamId}::${record.player}`, record]),
);

const records = base.records.map((record) => {
  const officialRecord = officialByKey.get(`${record.teamId}::${record.player}`);
  const bingHtmlRecord = bingHtmlByKey.get(`${record.teamId}::${record.player}`);
  const zeroTackleRecord = zeroTackleByKey.get(`${record.teamId}::${record.player}`);
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
  for (const match of bingHtmlRecord?.candidates ?? []) {
    if (match.articleUse === "context_only") continue;
    const candidate = {
      ...match,
      providers: [...new Set([...(match.providers ?? []), "bing-html-lite"])],
      foundBy: [...new Set([...(match.foundBy ?? []), "bing_html_lite"])],
      supplementalSearchSource: true,
    };
    if (!seen.has(candidateKey(candidate))) {
      candidates.push(candidate);
      seen.add(candidateKey(candidate));
    }
  }
  if (zeroTackleRecord?.matched) {
    const candidate = {
      articleUse: "player_specific_contract_candidate",
      domain: "zerotackle.com",
      reputable: true,
      primaryPreferred: false,
      score: 70,
      signals: ["contract_or_signing_language", "contract_table"],
      providers: ["zerotackle-direct-player-profile"],
      foundBy: ["zerotackle_direct_slug"],
      publishedAt: "",
      sourceName: "Zero Tackle",
      title: zeroTackleRecord.title,
      url: zeroTackleRecord.url,
      snippet: zeroTackleRecord.contractSnippet,
      zeroTackleProfileSource: true,
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
    supplementalSearchCandidates: candidates.filter((candidate) => candidate.supplementalSearchSource)
      .length,
    zeroTackleProfileCandidates: candidates.filter((candidate) => candidate.zeroTackleProfileSource)
      .length,
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
    if (record.summary.supplementalSearchCandidates > 0) acc.playersWithSupplementalSearchCandidate += 1;
    if (record.summary.zeroTackleProfileCandidates > 0) acc.playersWithZeroTackleProfileCandidate += 1;
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
    playersWithSupplementalSearchCandidate: 0,
    playersWithZeroTackleProfileCandidate: 0,
    playersWithNoCandidate: 0,
  },
);

const output = {
  checkedAt: new Date().toISOString(),
  sourceLayers: [basePath, officialPath, bingHtmlPath, zeroTacklePath],
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
  "supplementalSearchSource",
  "zeroTackleProfileSource",
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
      candidate.supplementalSearchSource ?? false,
      candidate.zeroTackleProfileSource ?? false,
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
