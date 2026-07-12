#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputPath = path.join(process.cwd(), "src/data/salary-cap/all-teams-2026.json");
const outputPath = path.join(
  process.cwd(),
  "docs/research/individual-player-source-queue-2026.csv"
);

const data = JSON.parse(await readFile(inputPath, "utf8"));

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

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function searchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

const rows = [
  [
    "teamId",
    "teamName",
    "player",
    "position",
    "currentEvidenceRole",
    "currentEstimateType",
    "currentConfidenceScore",
    "generalSearchUrl",
    "dailyTelegraphSearchUrl",
    "smhSearchUrl",
    "clubContractSearchUrl",
  ],
];

for (const team of data.teams) {
  const domain = clubDomains.get(team.teamId);
  for (const player of team.players) {
    const estimate = player.salaryEstimates[0];
    rows.push([
      team.teamId,
      team.teamName,
      player.name,
      player.position,
      estimate.evidenceRole,
      estimate.estimateType,
      estimate.confidenceScore,
      searchUrl(`"${player.name}" "${team.teamName}" salary contract worth deal extension NRL`),
      searchUrl(`site:dailytelegraph.com.au "${player.name}" salary contract NRL`),
      searchUrl(`site:smh.com.au "${player.name}" salary contract NRL`),
      domain ? searchUrl(`site:${domain} "${player.name}" contract`) : "",
    ]);
  }
}

await writeFile(
  outputPath,
  rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n"
);

console.log(JSON.stringify({ outputPath, players: rows.length - 1 }, null, 2));
