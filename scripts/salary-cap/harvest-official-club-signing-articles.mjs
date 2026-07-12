#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const inputPath = path.join(process.cwd(), "src/data/salary-cap/all-teams-2026.json");
const outputDir = path.join(process.cwd(), "docs/research/player-specific-article-review");
const outputJsonPath = path.join(outputDir, "official-club-signing-articles-2026.json");
const outputCsvPath = path.join(outputDir, "official-club-signing-articles-2026.csv");

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

const maxArticlesPerTeam = args.has("--max-articles-per-team")
  ? Number(args.get("--max-articles-per-team"))
  : 45;
const timeoutMs = args.has("--timeout-ms") ? Number(args.get("--timeout-ms")) : 20000;
const teamFilter = args.get("--team")?.toLowerCase();
const fetchConcurrency = args.has("--fetch-concurrency")
  ? Number(args.get("--fetch-concurrency"))
  : 8;

const clubDomains = new Map([
  ["bri", "www.broncos.com.au"],
  ["can", "www.raiders.com.au"],
  ["cby", "www.bulldogs.com.au"],
  ["cro", "www.sharks.com.au"],
  ["dol", "www.dolphinsnrl.com.au"],
  ["gld", "www.titans.com.au"],
  ["man", "www.seaeagles.com.au"],
  ["mel", "www.melbournestorm.com.au"],
  ["new", "www.newcastleknights.com.au"],
  ["nql", "www.cowboys.com.au"],
  ["nzl", "www.warriors.kiwi"],
  ["par", "www.parraeels.com.au"],
  ["pen", "www.penrithpanthers.com.au"],
  ["sou", "www.rabbitohs.com.au"],
  ["sti", "www.dragons.com.au"],
  ["syd", "www.roosters.com.au"],
  ["wst", "www.weststigers.com.au"],
]);

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function readerUrl(url) {
  return `https://r.jina.ai/http://${url}`;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0",
        accept: "text/plain,text/markdown",
        "accept-language": "en-AU,en;q=0.9",
      },
      signal: controller.signal,
    });
    return { status: response.status, text: await response.text() };
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

function playerAliases(name) {
  const normalized = normalizeText(name);
  const parts = normalized.split(/\s+/).filter(Boolean);
  const aliases = new Set([normalized]);
  if (parts.length >= 2) aliases.add(`${parts[0]} ${parts.at(-1)}`);
  return [...aliases].map((alias) => alias.toLowerCase()).filter((alias) => alias.includes(" "));
}

function mentionsPlayer(text, player) {
  const lower = normalizeText(text).toLowerCase();
  return playerAliases(player.name).some((alias) => lower.includes(alias));
}

function signalsFor(text) {
  const signals = [];
  if (/\$ ?\d+(?:\.\d+)?\s?(?:m|million|k|,000)/i.test(text)) signals.push("money");
  if (/\b(?:contract|deal|extension|signed|re-signed|resigned|committed|joins|remain|release|upgrade|top 30)\b/i.test(text)) {
    signals.push("contract_or_signing_language");
  }
  if (/\b(?:until|through|to the end of|end of)\s+(?:20\d{2}|the \d{4} season)\b/i.test(text)) {
    signals.push("term_language");
  }
  if (/\b(?:one|two|three|four|five|six|seven)-year\b/i.test(text) || /\b\d+-year\b/i.test(text)) {
    signals.push("term_length_language");
  }
  return [...new Set(signals)];
}

function classify(text, player) {
  const titleMatch = text.match(/^Title:\s*(.+)$/m);
  const title = normalizeText(titleMatch?.[1] ?? "");
  const titleMentionsPlayer = mentionsPlayer(title, player);
  const articleMentionsPlayer = mentionsPlayer(text, player);
  const signals = signalsFor(text);
  let articleUse = "player_specific_profile_candidate";
  if (signals.includes("money")) articleUse = "player_specific_salary_candidate";
  else if (
    signals.includes("contract_or_signing_language") ||
    signals.includes("term_language") ||
    signals.includes("term_length_language")
  ) {
    articleUse = "player_specific_contract_candidate";
  }
  return {
    title,
    titleMentionsPlayer,
    articleMentionsPlayer,
    articleUse,
    signals,
  };
}

function extractArticleLinks(markdown, domain) {
  const urls = new Map();
  const escapedDomain = domain.replaceAll(".", "\\.");
  const pattern = new RegExp(`\\((https:\\/\\/${escapedDomain}\\/news\\/20\\d{2}\\/[^)]+)\\)`, "g");
  for (const match of markdown.matchAll(pattern)) {
    const url = match[1].replace(/#.*$/, "");
    const start = Math.max(0, match.index - 220);
    const context = markdown.slice(start, match.index);
    const title =
      context.match(/###\s*([^#\n\]]+?)\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun|\d|[0-9]+ weeks|[0-9]+ months|yesterday|today)/i)?.[1] ??
      context.match(/Image \d+:\s*([^\]]+)/)?.[1] ??
      "";
    if (!urls.has(url)) urls.set(url, normalizeText(title));
  }
  return [...urls.entries()].map(([url, title]) => ({ url, title }));
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

async function writeOutputs(output) {
  await mkdir(outputDir, { recursive: true });
  await writeFile(outputJsonPath, JSON.stringify(output, null, 2) + "\n");
  const rows = [[
    "teamId",
    "teamName",
    "player",
    "position",
    "articleUse",
    "signals",
    "title",
    "url",
    "publishedAt",
    "titleMentionsPlayer",
    "articleMentionsPlayer",
    "textSample",
  ]];
  for (const record of output.records) {
    if (!record.matches.length) {
      rows.push([
        record.teamId,
        record.teamName,
        record.player,
        record.position,
        "no_official_club_signing_article_found",
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
    for (const match of record.matches) {
      rows.push([
        record.teamId,
        record.teamName,
        record.player,
        record.position,
        match.articleUse,
        match.signals,
        match.title,
        match.url,
        match.publishedAt,
        match.titleMentionsPlayer,
        match.articleMentionsPlayer,
        match.textSample,
      ]);
    }
  }
  await writeFile(outputCsvPath, rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");
}

const data = JSON.parse(await readFile(inputPath, "utf8"));
const teams = data.teams.filter((team) => !teamFilter || team.teamId === teamFilter);
const output = {
  checkedAt: new Date().toISOString(),
  sourcePolicy:
    "Official club Signings topic pages fetched through Jina Reader because direct club fetches are redirected through NRL login middleware. Article URLs remain original club URLs.",
  totalTeams: teams.length,
  totalPlayers: teams.reduce((sum, team) => sum + team.players.length, 0),
  records: [],
  teamSources: [],
};

for (const team of teams) {
  const domain = clubDomains.get(team.teamId);
  if (!domain) continue;
  const topicUrl = `https://${domain}/news/topic/signings/`;
  let topicText = "";
  let articleLinks = [];
  try {
    const topic = await fetchText(readerUrl(topicUrl));
    topicText = topic.text;
    articleLinks = extractArticleLinks(topicText, domain).slice(0, maxArticlesPerTeam);
    output.teamSources.push({
      teamId: team.teamId,
      teamName: team.teamName,
      topicUrl,
      fetchStatus: topic.status,
      articleLinks: articleLinks.length,
    });
  } catch (error) {
    output.teamSources.push({
      teamId: team.teamId,
      teamName: team.teamName,
      topicUrl,
      fetchStatus: "error",
      error: error instanceof Error ? error.message : String(error),
      articleLinks: 0,
    });
  }

  const articleTexts = await runWithConcurrency(
    articleLinks,
    async (article) => {
      try {
        const fetched = await fetchText(readerUrl(article.url));
        return {
          ...article,
          status: fetched.status,
          text: fetched.text,
          publishedAt: fetched.text.match(/^Published Time:\s*(.+)$/m)?.[1] ?? "",
        };
      } catch (error) {
        return {
          ...article,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
          text: "",
          publishedAt: "",
        };
      }
    },
    fetchConcurrency,
  );

  for (const player of team.players) {
    const matches = [];
    for (const article of articleTexts) {
      if (!mentionsPlayer(`${article.title} ${article.text}`, player)) continue;
      const classification = classify(article.text, player);
      matches.push({
        url: article.url,
        title: classification.title || article.title,
        publishedAt: article.publishedAt,
        fetchStatus: article.status,
        articleUse: classification.articleUse,
        signals: classification.signals,
        titleMentionsPlayer: classification.titleMentionsPlayer,
        articleMentionsPlayer: classification.articleMentionsPlayer,
        textSample: normalizeText(article.text).slice(0, 700),
      });
    }
    output.records.push({
      teamId: team.teamId,
      teamName: team.teamName,
      player: player.name,
      position: player.position,
      matches,
    });
  }

  await writeOutputs(output);
  const matchedPlayers = output.records.filter(
    (record) => record.teamId === team.teamId && record.matches.length > 0,
  ).length;
  console.error(
    `${team.teamName}: ${articleLinks.length} signing articles; ${matchedPlayers}/${team.players.length} players matched`,
  );
}

output.completedAt = new Date().toISOString();
output.totals = {
  records: output.records.length,
  candidates: output.records.reduce((sum, record) => sum + record.matches.length, 0),
  playersWithOfficialClubSigningArticle: output.records.filter((record) => record.matches.length > 0)
    .length,
  playersWithoutOfficialClubSigningArticle: output.records.filter((record) => record.matches.length === 0)
    .length,
};

await writeOutputs(output);
console.log(JSON.stringify({ outputJsonPath, outputCsvPath, totals: output.totals }, null, 2));
