#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const inputPath = path.join(process.cwd(), "src/data/salary-cap/all-teams-2026.json");
const outputDir = path.join(process.cwd(), "docs/research/player-specific-article-review");
const outputJsonPath = path.join(outputDir, "zerotackle-player-contracts-2026.json");
const outputCsvPath = path.join(outputDir, "zerotackle-player-contracts-2026.csv");

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

const fetchConcurrency = args.has("--fetch-concurrency")
  ? Number(args.get("--fetch-concurrency"))
  : 8;
const timeoutMs = args.has("--timeout-ms") ? Number(args.get("--timeout-ms")) : 15000;

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyPlayerName(name) {
  return normalizeText(name)
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const slugVariantMap = new Map([
  ["Braden Uele", ["braden-hamlin-uele"]],
  ["Chanel Tevita-Harris", ["chanel-harris-tavita", "chanel-harris-tevita"]],
  ["Ed Kosi", ["edward-kosi"]],
  ["Jaimin Joliffe", ["jaimin-jolliffe"]],
  ["Jake Clydesdale", ["jake-clydsdale", "jacob-clydesdale"]],
  ["John Fonua", ["ioane-fonua"]],
  ["Josh Patson", ["josh-patston", "joshua-patson"]],
  ["Lachie Hubner", ["lachlan-hubner"]],
  ["Linday Smith", ["lindsay-smith"]],
  ["Mat Feagai", ["max-feagai"]],
  ["Mathew Croker", ["matthew-croker"]],
  ["Pasamu Saulo", ["pasami-saulo"]],
  ["Sam Healey", ["samuel-healey", "sam-healy"]],
  ["Sifa Talakai", ["siosifa-talakai"]],
  ["Sualauvi Fa'alogo", ["sua-faalogo"]],
  ["Tom Hazleton", ["thomas-hazelton", "tom-hazelton"]],
  ["Tuki Simpkins", ["tukimihia-simpkins"]],
  ["Wilson Decourcey", ["wilson-de-courcey"]],
]);

function slugCandidates(name) {
  return [...new Set([slugifyPlayerName(name), ...(slugVariantMap.get(normalizeText(name)) ?? [])])];
}

function compactForMatch(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function stripHtml(html) {
  return normalizeText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replaceAll("&amp;", "&")
      .replaceAll("&nbsp;", " ")
      .replaceAll("&#039;", "'")
      .replaceAll("&#8217;", "'"),
  );
}

function includesPlayerName(text, playerName) {
  return compactForMatch(text).includes(compactForMatch(playerName));
}

function hasLastNameAndTeam(text, playerName, teamName) {
  const normalized = normalizeText(text).toLowerCase();
  const compact = compactForMatch(text);
  const parts = normalizeText(playerName).split(/\s+/).filter(Boolean);
  const lastName = compactForMatch(parts.at(-1) ?? playerName);
  const teamBits = normalizeText(teamName)
    .toLowerCase()
    .split(/\s+/)
    .filter((part) => part.length > 3);
  return compact.includes(lastName) && teamBits.some((part) => normalized.includes(part));
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0",
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-AU,en;q=0.9",
      },
      signal: controller.signal,
    });
    const html = await response.text();
    if (response.status === 429 || /Just a moment/i.test(html)) {
      const readerResponse = await fetch(`https://r.jina.ai/http://${url}`, {
        headers: {
          "user-agent": "Mozilla/5.0",
          accept: "text/plain,text/markdown",
          "accept-language": "en-AU,en;q=0.9",
        },
        signal: controller.signal,
      });
      return { status: readerResponse.status, html: await readerResponse.text(), fetchedVia: "jina-reader" };
    }
    return { status: response.status, html, fetchedVia: "direct" };
  } finally {
    clearTimeout(timeout);
  }
}

async function runWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await worker(items[currentIndex], currentIndex);
      }
    }),
  );
  return results;
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function extractContractSnippet(text) {
  const idx = text.toLowerCase().indexOf("player contracts");
  if (idx === -1) return "";
  return text.slice(idx, idx + 420);
}

const data = JSON.parse(await readFile(inputPath, "utf8"));
const players = data.teams.flatMap((team) =>
  team.players.map((player) => ({ team, player, slugs: slugCandidates(player.name) })),
);

const records = await runWithConcurrency(
  players,
  async ({ team, player, slugs }, index) => {
    const attempts = [];
    try {
      let selected = null;
      const primarySlug = slugifyPlayerName(player.name);
      for (const slug of slugs) {
        const url = `https://www.zerotackle.com/players/${slug}/`;
        const { status, html, fetchedVia } = await fetchHtml(url);
        const title = normalizeText(
          html.match(/<title>([^<]+)/i)?.[1] ?? html.match(/^Title:\s*(.+)$/m)?.[1] ?? "",
        );
        const text = stripHtml(html);
        const titleIsNotFound = /Page not found/i.test(title);
        const isCuratedVariant = slug !== primarySlug;
        const hasPlayer =
          includesPlayerName(title, player.name) ||
          includesPlayerName(text.slice(0, 5000), player.name) ||
          hasLastNameAndTeam(title, player.name, team.teamName) ||
          (isCuratedVariant && !titleIsNotFound);
        const hasContractTable = /Player Contracts/i.test(text);
        const contractSnippet = extractContractSnippet(text);
        const matched = status === 200 && !titleIsNotFound && hasPlayer && hasContractTable;
        const attempt = {
          slug,
          url,
          status,
          fetchedVia,
          matched,
          title,
          hasPlayer,
          hasContractTable,
          contractSnippet,
        };
        attempts.push(attempt);
        if (matched) {
          selected = attempt;
          break;
        }
      }
      const selectedAttempt = selected ?? attempts[0];
      if ((index + 1) % 50 === 0) console.error(`checked ${index + 1}/${players.length}`);
      return {
        teamId: team.teamId,
        teamName: team.teamName,
        player: player.name,
        position: player.position,
        slug: selectedAttempt.slug,
        attemptedSlugs: attempts.map((attempt) => attempt.slug),
        url: selectedAttempt.url,
        status: selectedAttempt.status,
        fetchedVia: selectedAttempt.fetchedVia,
        matched: selectedAttempt.matched,
        title: selectedAttempt.title,
        hasPlayer: selectedAttempt.hasPlayer,
        hasContractTable: selectedAttempt.hasContractTable,
        contractSnippet: selectedAttempt.contractSnippet,
      };
    } catch (error) {
      return {
        teamId: team.teamId,
        teamName: team.teamName,
        player: player.name,
        position: player.position,
        slug: slugs[0],
        attemptedSlugs: slugs,
        url: `https://www.zerotackle.com/players/${slugs[0]}/`,
        status: "error",
        matched: false,
        error: error instanceof Error ? error.message : String(error),
        title: "",
        hasPlayer: false,
        hasContractTable: false,
        contractSnippet: "",
      };
    }
  },
  fetchConcurrency,
);

const output = {
  checkedAt: new Date().toISOString(),
  sourcePolicy:
    "Direct deterministic Zero Tackle player profile fetch by generated player slug. Pages are used as player-specific contract/profile evidence, not salary evidence.",
  totalPlayers: records.length,
  totals: {
    records: records.length,
    matched: records.filter((record) => record.matched).length,
    unmatched: records.filter((record) => !record.matched).length,
  },
  records,
};

await mkdir(outputDir, { recursive: true });
await writeFile(outputJsonPath, JSON.stringify(output, null, 2) + "\n");

const rows = [[
  "teamId",
  "teamName",
  "player",
  "position",
  "matched",
  "status",
  "title",
  "url",
  "contractSnippet",
]];
for (const record of records) {
  rows.push([
    record.teamId,
    record.teamName,
    record.player,
    record.position,
    record.matched,
    record.status,
    record.title,
    record.url,
    record.contractSnippet,
  ]);
}
await writeFile(outputCsvPath, rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");

console.log(JSON.stringify({ outputJsonPath, outputCsvPath, totals: output.totals }, null, 2));
