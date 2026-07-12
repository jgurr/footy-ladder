#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (!arg.startsWith("--")) continue;
  const next = process.argv[i + 1];
  if (next && !next.startsWith("--")) {
    args.set(arg, next);
    i += 1;
  } else {
    args.set(arg, "true");
  }
}

const inputPath = path.resolve(
  process.cwd(),
  args.get("--input") ??
    "docs/research/player-specific-article-review/player-specific-article-review-2026.json",
);
const outputDir = path.join(process.cwd(), "docs/research/player-specific-article-review");
const outputPath = path.join(outputDir, "player-specific-article-review-2026-summary.md");

const review = JSON.parse(await readFile(inputPath, "utf8"));
const records = review.records ?? [];

function has(record, key) {
  return Number(record.summary?.[key] ?? 0) > 0;
}

function playerSpecificCount(record) {
  return (
    Number(record.summary?.playerSpecificSalaryCandidates ?? 0) +
    Number(record.summary?.playerSpecificContractCandidates ?? 0) +
    Number(record.summary?.playerSpecificProfileCandidates ?? 0)
  );
}

function pct(count, total) {
  return total === 0 ? "0.0%" : `${((count / total) * 100).toFixed(1)}%`;
}

const totals = {
  players: records.length,
  candidates: records.reduce((sum, record) => sum + record.candidates.length, 0),
  salary: records.filter((record) => has(record, "playerSpecificSalaryCandidates")).length,
  contract: records.filter((record) => has(record, "playerSpecificContractCandidates")).length,
  profile: records.filter((record) => has(record, "playerSpecificProfileCandidates")).length,
  preferredPrimary: records.filter((record) => has(record, "preferredPrimaryCandidates")).length,
  anyPlayerSpecific: records.filter((record) => playerSpecificCount(record) > 0).length,
  none: records.filter((record) => playerSpecificCount(record) === 0).length,
};

const byTeam = new Map();
for (const record of records) {
  const current = byTeam.get(record.teamId) ?? {
    teamId: record.teamId,
    teamName: record.teamName,
    players: 0,
    candidates: 0,
    salary: 0,
    contract: 0,
    profile: 0,
    none: 0,
  };
  current.players += 1;
  current.candidates += record.candidates.length;
  if (has(record, "playerSpecificSalaryCandidates")) current.salary += 1;
  if (has(record, "playerSpecificContractCandidates")) current.contract += 1;
  if (has(record, "playerSpecificProfileCandidates")) current.profile += 1;
  if (playerSpecificCount(record) === 0) current.none += 1;
  byTeam.set(record.teamId, current);
}

const gapPlayers = records
  .filter((record) => playerSpecificCount(record) === 0)
  .map((record) => `${record.teamName}: ${record.player} (${record.position})`);

const examples = records
  .flatMap((record) =>
    record.candidates.slice(0, 3).map((candidate) => ({
      teamName: record.teamName,
      player: record.player,
      articleUse: candidate.articleUse,
      domain: candidate.domain,
      title: candidate.title,
      url: candidate.url,
    })),
  )
  .filter((candidate) =>
    ["player_specific_salary_candidate", "player_specific_contract_candidate"].includes(
      candidate.articleUse,
    ),
  )
  .slice(0, 30);

const lines = [
  "# Player-Specific Article Review 2026",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Scope",
  "",
  "- Every player in `src/data/salary-cap/all-teams-2026.json` was searched individually by name.",
  "- The canonical pass uses Bing News RSS against direct salary, contract, signed-extension, publisher-site, NRL.com, and club-domain query families.",
  "- Context-only team articles are excluded from candidate counts by default.",
  "- Salary evidence remains scarce because NRL salaries are private and usually appear only in major-media reporting.",
  "",
  "## Totals",
  "",
  `- Players searched: ${totals.players}`,
  `- Player-specific candidate links: ${totals.candidates}`,
  `- Players with salary candidate: ${totals.salary} (${pct(totals.salary, totals.players)})`,
  `- Players with contract candidate: ${totals.contract} (${pct(totals.contract, totals.players)})`,
  `- Players with profile-only candidate: ${totals.profile} (${pct(totals.profile, totals.players)})`,
  `- Players with preferred primary-source candidate: ${totals.preferredPrimary} (${pct(totals.preferredPrimary, totals.players)})`,
  `- Players with any player-specific candidate: ${totals.anyPlayerSpecific} (${pct(totals.anyPlayerSpecific, totals.players)})`,
  `- Players still needing manual/credentialed search: ${totals.none} (${pct(totals.none, totals.players)})`,
  "",
  "## Team Coverage",
  "",
  "| Team | Players | Candidates | Salary | Contract | Profile | Still Missing |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...[...byTeam.values()]
    .sort((a, b) => a.teamName.localeCompare(b.teamName))
    .map(
      (team) =>
        `| ${team.teamName} | ${team.players} | ${team.candidates} | ${team.salary} | ${team.contract} | ${team.profile} | ${team.none} |`,
    ),
  "",
  "## Example Salary / Contract Candidates",
  "",
  ...examples.map(
    (candidate) =>
      `- ${candidate.teamName}: ${candidate.player} — ${candidate.articleUse} — ${candidate.domain} — [${candidate.title}](${candidate.url})`,
  ),
  "",
  "## Remaining Gap List",
  "",
  ...gapPlayers.map((player) => `- ${player}`),
  "",
];

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, lines.join("\n"));

console.log(
  JSON.stringify(
    {
      outputPath,
      totals,
    },
    null,
    2,
  ),
);
