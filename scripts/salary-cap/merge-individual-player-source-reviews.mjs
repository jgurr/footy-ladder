#!/usr/bin/env node
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const outputDir = path.join(process.cwd(), "docs/research/individual-source-review");
const finalJsonPath = path.join(outputDir, "player-source-review-2026.json");
const finalCsvPath = path.join(outputDir, "player-source-review-2026.csv");
const inputPath = path.join(process.cwd(), "src/data/salary-cap/all-teams-2026.json");

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

const data = JSON.parse(await readFile(inputPath, "utf8"));
const order = new Map();
let index = 0;
for (const team of data.teams) {
  for (const player of team.players) {
    order.set(`${team.teamId}::${player.name}`, index);
    index++;
  }
}

const files = (await readdir(outputDir))
  .filter((file) => /^player-source-review-2026-chunk-\d+\.json$/.test(file))
  .sort();

const recordsByPlayer = new Map();
const chunks = [];
for (const file of files) {
  const chunk = JSON.parse(await readFile(path.join(outputDir, file), "utf8"));
  chunks.push({ file, records: chunk.records?.length ?? 0 });
  for (const record of chunk.records ?? []) {
    recordsByPlayer.set(`${record.teamId}::${record.player}`, record);
  }
}

const records = [...recordsByPlayer.values()].sort((a, b) => {
  const left = order.get(`${a.teamId}::${a.player}`) ?? Number.MAX_SAFE_INTEGER;
  const right = order.get(`${b.teamId}::${b.player}`) ?? Number.MAX_SAFE_INTEGER;
  return left - right;
});

const output = {
  checkedAt: new Date().toISOString(),
  searchProvider:
    "Merged chunked Bing News RSS direct publisher URL discovery outputs.",
  sourcePolicy:
    "Candidate links are leads only. Bing News candidates include decoded publisher URLs, but salary figures are promoted only after article review; paywalled Daily Telegraph and SMH candidates require credentialed browser review.",
  requestedDomains: [
    "dailytelegraph.com.au",
    "smh.com.au",
    "nine.com.au",
    "foxsports.com.au",
    "news.com.au",
    "club domains",
    "other reputable sports/news sources",
  ],
  totalDatasetPlayers: order.size,
  selectedPlayers: records.length,
  chunks,
  records,
};

await writeFile(finalJsonPath, JSON.stringify(output, null, 2) + "\n");

const csvRows = [[
  "teamId",
  "teamName",
  "player",
  "currentEvidenceRole",
  "candidateRank",
  "candidateDomain",
  "candidateScore",
  "candidateSignals",
  "exactPlayerName",
  "sourceName",
  "publishedAt",
  "reviewStatus",
  "title",
  "url",
  "bingNewsUrl",
  "googleNewsUrl",
  "originalUrl",
  "needsOriginalUrlResolution",
  "snippet",
]];

for (const record of output.records) {
  if (record.candidates.length === 0) {
    csvRows.push([
      record.teamId,
      record.teamName,
      record.player,
      record.currentEvidenceRole,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "no_candidate_found",
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

  record.candidates.forEach((candidate, candidateIndex) => {
    csvRows.push([
      record.teamId,
      record.teamName,
      record.player,
      record.currentEvidenceRole,
      candidateIndex + 1,
      candidate.domain,
      candidate.score,
      candidate.signals.join("|"),
      candidate.exactPlayerName ?? "",
      candidate.sourceName ?? "",
      candidate.publishedAt ?? "",
      candidate.reviewStatus,
      candidate.title,
      candidate.url,
      candidate.bingNewsUrl ?? "",
      candidate.googleNewsUrl ?? "",
      candidate.originalUrl ?? "",
      candidate.needsOriginalUrlResolution ?? "",
      candidate.snippet,
    ]);
  });
}

await writeFile(finalCsvPath, csvRows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");

console.log(JSON.stringify({
  finalJsonPath,
  finalCsvPath,
  chunks,
  records: output.records.length,
  candidates: output.records.reduce((total, record) => total + record.candidates.length, 0),
}, null, 2));
