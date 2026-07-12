#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const inputPath = path.join(process.cwd(), "src/data/salary-cap/all-teams-2026.json");
const outputDir = path.join(process.cwd(), "docs/research/individual-source-review");

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i], process.argv[i + 1]);
}

const teamFilter = args.get("--team")?.toLowerCase();
const limit = args.has("--limit") ? Number(args.get("--limit")) : Infinity;
const startAt = args.has("--start-at") ? Number(args.get("--start-at")) : 0;
const throttleMs = args.has("--throttle-ms") ? Number(args.get("--throttle-ms")) : 900;
const retryThrottleMs = args.has("--retry-throttle-ms")
  ? Number(args.get("--retry-throttle-ms"))
  : Math.max(throttleMs * 2, 1200);
const maxResultsPerQuery = args.has("--max-results")
  ? Number(args.get("--max-results"))
  : 8;
const resume = args.get("--resume") === "true";
const enableFallback = args.get("--fallback") === "true";
const requestTimeoutMs = args.has("--timeout-ms") ? Number(args.get("--timeout-ms")) : 12000;
const outputSuffixRaw = args.get("--output-suffix") ?? "";
const outputSuffix = outputSuffixRaw
  ? `-${outputSuffixRaw.replace(/[^a-zA-Z0-9_-]/g, "-")}`
  : "";
const outputJsonPath = path.join(outputDir, `player-source-review-2026${outputSuffix}.json`);
const outputCsvPath = path.join(outputDir, `player-source-review-2026${outputSuffix}.csv`);
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const authoritativeDomains = [
  "dailytelegraph.com.au",
  "smh.com.au",
  "nine.com.au",
  "foxsports.com.au",
  "news.com.au",
  "espn.com",
  "7news.com.au",
  "abc.net.au",
  "nrl.com",
  "zerotackle.com",
  "theaustralian.com.au",
  "couriermail.com.au",
  "heraldsun.com.au",
  "goldcoastbulletin.com.au",
  "themercury.com.au",
  "townsvillebulletin.com.au",
  "ntnews.com.au",
  "weeklytimesnow.com.au",
  "geelongadvertiser.com.au",
  "cairnspost.com.au",
  "adelaidenow.com.au",
  "perthnow.com.au",
  "thewest.com.au",
  "thenightly.com.au",
  "codesports.com.au",
  "rnz.co.nz",
  "au.sports.yahoo.com",
  "au.news.yahoo.com",
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url, headers) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    });
    const body = await response.text();
    return { response, body };
  } finally {
    clearTimeout(timeout);
  }
}

function decodeHtml(input) {
  return input
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(input, tagName) {
  const match = input.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function extractSource(input) {
  const match = input.match(/<source\s+url="([^"]+)">([\s\S]*?)<\/source>/i);
  return {
    sourceUrl: match ? decodeHtml(match[1]) : "",
    sourceName: match ? decodeHtml(match[2]) : "",
  };
}

function decodeJsString(input) {
  try {
    return JSON.parse(`"${input}"`);
  } catch {
    return input.replaceAll("\\u0026", "&").replaceAll('\\"', '"').replaceAll("\\/", "/");
  }
}

function normalizeResultUrl(href) {
  const raw = href.startsWith("//") ? `https:${href}` : href;
  try {
    const url = new URL(raw);
    const wrapped = url.searchParams.get("uddg");
    if (wrapped) return wrapped;
    return raw;
  } catch {
    return raw;
  }
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isAuthoritativeDomain(domain, teamId) {
  const clubDomain = clubDomains.get(teamId);
  return (
    authoritativeDomains.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`)) ||
    Boolean(clubDomain && (domain === clubDomain || domain.endsWith(`.${clubDomain}`)))
  );
}

function moneySignals(text) {
  const lower = text.toLowerCase();
  const signals = [];
  if (/\$ ?\d+(?:\.\d+)?\s?(?:m|million|k|,000)/i.test(text)) signals.push("money");
  if (/\b(?:contract|deal|extension|salary|worth|cap|option|aav|per season|per year)\b/i.test(text)) {
    signals.push("contract_language");
  }
  if (/\b(?:until|through|end of)\s+(?:20\d{2}|the \d{4} season)\b/i.test(text)) {
    signals.push("term_language");
  }
  if (lower.includes("daily telegraph") || lower.includes("courier mail")) {
    signals.push("news_corp_reporting");
  }
  return signals;
}

function resultScore({ title, snippet, domain, player, teamId }) {
  const text = `${title} ${snippet}`;
  const lower = text.toLowerCase();
  const playerParts = player.name.toLowerCase().split(/\s+/).filter(Boolean);
  const titleLower = title.toLowerCase();
  let score = 0;
  const exactPlayerName = lower.includes(player.name.toLowerCase());
  if (exactPlayerName) {
    score += 12;
    if (titleLower.includes(player.name.toLowerCase())) score += 4;
  } else {
    score -= 6;
  }
  if (playerParts.length > 1 && lower.includes(playerParts[playerParts.length - 1])) score += 1;
  const signals = moneySignals(text);
  signals.push(exactPlayerName ? "exact_player_name" : "context_or_team_article");
  score += signals.length * 3;
  if (isAuthoritativeDomain(domain, teamId)) score += 4;
  if (domain.includes("dailytelegraph.com.au") || domain.includes("smh.com.au")) score += 3;
  if (domain.includes("foxsports.com.au") || domain.includes("nine.com.au")) score += 2;
  return { score, signals, exactPlayerName };
}

function parseDuckDuckGoResults(html, player, teamId, maxResults) {
  const chunks = html.split('<div class="result');
  const results = [];
  for (const chunk of chunks) {
    const titleMatch = chunk.match(/class="result__a" href="([^"]+)">([\s\S]*?)<\/a>/);
    if (!titleMatch) continue;
    const snippetMatch = chunk.match(/class="result__snippet" href="[^"]+">([\s\S]*?)<\/a>/);
    const url = normalizeResultUrl(decodeHtml(titleMatch[1]));
    const title = decodeHtml(titleMatch[2]);
    const snippet = snippetMatch ? decodeHtml(snippetMatch[1]) : "";
    const domain = getDomain(url);
    const { score, signals, exactPlayerName } = resultScore({ title, snippet, domain, player, teamId });
    results.push({
      title,
      url,
      domain,
      snippet,
      signals,
      exactPlayerName,
      score,
      authoritative: isAuthoritativeDomain(domain, teamId),
    });
  }
  return results
    .sort((a, b) => b.score - a.score || Number(b.authoritative) - Number(a.authoritative))
    .slice(0, maxResults);
}

function parseGoogleNewsResults(xml, player, teamId, maxResults) {
  const results = [];
  const items = xml.split(/<item>/i).slice(1);
  for (const item of items) {
    const title = extractTag(item, "title");
    const googleNewsUrl = extractTag(item, "link");
    const publishedAt = extractTag(item, "pubDate");
    const snippet = extractTag(item, "description");
    const { sourceUrl, sourceName } = extractSource(item);
    const domain = sourceUrl ? getDomain(sourceUrl) : getDomain(googleNewsUrl);
    const { score, signals, exactPlayerName } = resultScore({ title, snippet, domain, player, teamId });

    results.push({
      title,
      url: googleNewsUrl,
      googleNewsUrl,
      originalUrl: null,
      needsOriginalUrlResolution: true,
      domain,
      sourceName,
      sourceUrl,
      publishedAt,
      snippet,
      signals,
      exactPlayerName,
      score,
      authoritative: isAuthoritativeDomain(domain, teamId),
    });
  }

  return results
    .sort((a, b) => b.score - a.score || Number(b.authoritative) - Number(a.authoritative))
    .slice(0, maxResults);
}

function parseBraveResults(html, player, teamId, maxResults) {
  const results = [];
  const recordPattern =
    /\{title:"((?:\\.|[^"\\])*)",url:"((?:\\.|[^"\\])*)"[\s\S]{0,3000}?description:"((?:\\.|[^"\\])*)"[\s\S]{0,900}?page_age:(?:"((?:\\.|[^"\\])*)"|void 0)[\s\S]{0,700}?profile:\{name:"((?:\\.|[^"\\])*)",url:"((?:\\.|[^"\\])*)",long_name:"((?:\\.|[^"\\])*)"/g;

  for (const match of html.matchAll(recordPattern)) {
    const url = decodeJsString(match[2]);
    const title = decodeHtml(decodeJsString(match[1]));
    const snippet = decodeHtml(decodeJsString(match[3]));
    const pageAge = match[4] ? decodeJsString(match[4]) : "";
    const publisher = decodeHtml(decodeJsString(match[5]));
    const publisherLongName = decodeHtml(decodeJsString(match[7]));
    const domain = getDomain(url);
    const { score, signals, exactPlayerName } = resultScore({ title, snippet, domain, player, teamId });

    results.push({
      title,
      url,
      domain,
      snippet,
      pageAge,
      publisher,
      publisherLongName,
      signals,
      exactPlayerName,
      score,
      authoritative: isAuthoritativeDomain(domain, teamId),
    });
  }

  const seen = new Set();
  return results
    .filter((result) => {
      if (seen.has(result.url)) return false;
      seen.add(result.url);
      return true;
    })
    .sort((a, b) => b.score - a.score || Number(b.authoritative) - Number(a.authoritative))
    .slice(0, maxResults);
}

async function searchBrave(query, player, teamId) {
  const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`;
  const { response, body: html } = await fetchText(url, {
      "user-agent": userAgent,
      accept: "text/html,application/xhtml+xml",
      "accept-language": "en-AU,en;q=0.9",
  });
  return {
    provider: "brave",
    query,
    searchUrl: url,
    status: response.status,
    results: parseBraveResults(html, player, teamId, maxResultsPerQuery),
  };
}

async function searchDuckDuckGo(query, player, teamId) {
  const url = `https://duckduckgo.com/html/?kl=au-en&q=${encodeURIComponent(query)}`;
  const { response, body: html } = await fetchText(url, {
      "user-agent": userAgent,
      accept: "text/html,application/xhtml+xml",
  });
  return {
    provider: "duckduckgo",
    query,
    searchUrl: url,
    status: response.status,
    results: parseDuckDuckGoResults(html, player, teamId, maxResultsPerQuery),
  };
}

async function searchGoogleNews(query, player, teamId) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-AU&gl=AU&ceid=AU:en`;
  const { response, body: xml } = await fetchText(url, {
      "user-agent": userAgent,
      accept: "application/rss+xml,application/xml,text/xml",
      "accept-language": "en-AU,en;q=0.9",
  });
  return {
    provider: "google-news-rss",
    query,
    searchUrl: url,
    status: response.status,
    results: parseGoogleNewsResults(xml, player, teamId, maxResultsPerQuery),
  };
}

function decodeBingNewsUrl(link) {
  try {
    const url = new URL(link);
    const wrapped = url.searchParams.get("url");
    return wrapped ? decodeURIComponent(wrapped) : link;
  } catch {
    return link;
  }
}

function parseBingNewsResults(xml, player, teamId, maxResults) {
  const results = [];
  const items = xml.split(/<item>/i).slice(1);
  for (const item of items) {
    const title = extractTag(item, "title");
    const bingNewsUrl = extractTag(item, "link");
    const originalUrl = decodeBingNewsUrl(bingNewsUrl);
    const publishedAt = extractTag(item, "pubDate");
    const snippet = extractTag(item, "description");
    const sourceName = extractTag(item, "News:Source");
    const domain = getDomain(originalUrl);
    const { score, signals, exactPlayerName } = resultScore({ title, snippet, domain, player, teamId });

    results.push({
      title,
      url: originalUrl,
      bingNewsUrl,
      googleNewsUrl: null,
      originalUrl,
      needsOriginalUrlResolution: false,
      domain,
      sourceName,
      sourceUrl: domain ? `https://${domain}` : "",
      publishedAt,
      snippet,
      signals,
      exactPlayerName,
      score,
      authoritative: isAuthoritativeDomain(domain, teamId),
    });
  }

  return results
    .sort((a, b) => b.score - a.score || Number(b.authoritative) - Number(a.authoritative))
    .slice(0, maxResults);
}

async function searchBingNews(query, player, teamId) {
  const url = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss&cc=au`;
  const { response, body: xml } = await fetchText(url, {
    "user-agent": userAgent,
    accept: "application/rss+xml,application/xml,text/xml",
    "accept-language": "en-AU,en;q=0.9",
  });
  return {
    provider: "bing-news-rss",
    query,
    searchUrl: url,
    status: response.status,
    results: parseBingNewsResults(xml, player, teamId, maxResultsPerQuery),
  };
}

async function searchWithRetry(query, player, teamId) {
  const first = await searchBingNews(query, player, teamId);
  if (first.status === 200 && first.results.length > 0) return first;

  await sleep(retryThrottleMs);
  const second = await searchBingNews(query, player, teamId);
  if (second.results.length > 0) {
    return {
      ...second,
      retriedAfterStatus: first.status,
    };
  }

  if (!enableFallback) {
    return {
      ...second,
      retriedAfterStatus: first.status,
      fallbackSkipped: true,
    };
  }

  await sleep(retryThrottleMs);
  const fallback = await searchBrave(query, player, teamId);
  if (fallback.results.length > 0) {
    return {
      ...fallback,
      retriedAfterProvider: first.provider,
      retriedAfterStatus: first.status,
    };
  }

  await sleep(retryThrottleMs);
  const secondFallback = await searchDuckDuckGo(query, player, teamId);
  if (secondFallback.results.length > 0) {
    return {
      ...secondFallback,
      retriedAfterProvider: first.provider,
      retriedAfterStatus: first.status,
      fallbackProvider: fallback.provider,
      fallbackStatus: fallback.status,
    };
  }

  return {
    ...second,
    retriedAfterStatus: first.status,
    fallbackProvider: fallback.provider,
    fallbackStatus: fallback.status,
    secondFallbackProvider: secondFallback.provider,
    secondFallbackStatus: secondFallback.status,
  };
}

function buildQueries(team, player) {
  const clubDomain = clubDomains.get(team.teamId);
  const base = `"${player.name}" "${team.teamName}" salary contract worth deal extension NRL`;
  const queries = [
    { type: "general", query: base },
    { type: "dailytelegraph", query: `"${player.name}" "Daily Telegraph" NRL contract salary worth` },
    { type: "smh", query: `"${player.name}" "Sydney Morning Herald" NRL contract salary worth` },
    { type: "nine", query: `"${player.name}" "Nine" NRL contract salary worth` },
    { type: "foxsports", query: `"${player.name}" "Fox Sports" NRL contract salary worth` },
    { type: "news", query: `"${player.name}" "news.com.au" NRL contract salary worth` },
    { type: "seven", query: `"${player.name}" "7NEWS" NRL contract salary worth` },
    { type: "yahoo", query: `"${player.name}" "Yahoo Sports" NRL contract salary worth` },
    { type: "zerotackle", query: `"${player.name}" "Zero Tackle" NRL contract salary worth` },
    { type: "nrl", query: `"${player.name}" "NRL.com" contract` },
  ];

  if (clubDomain) {
    queries.push({ type: "club", query: `site:${clubDomain} "${player.name}" contract` });
  }

  return queries;
}

function uniqueCandidates(searches) {
  const seen = new Set();
  const candidates = [];
  for (const search of searches) {
    for (const result of search.results) {
      if (seen.has(result.url)) continue;
      seen.add(result.url);
      const reviewStatus = !result.authoritative
        ? "context_only_untrusted_domain"
        : result.exactPlayerName
          ? "player_focused_candidate_needs_article_review"
          : "team_or_context_candidate_needs_article_review";
      candidates.push({
        ...result,
        foundBy: [search.type],
        reviewStatus,
      });
    }
  }
  return candidates
    .sort((a, b) => b.score - a.score || Number(b.authoritative) - Number(a.authoritative))
    .slice(0, 12);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

const data = JSON.parse(await readFile(inputPath, "utf8"));
const players = [];
for (const team of data.teams) {
  if (teamFilter && team.teamId !== teamFilter) continue;
  for (const player of team.players) {
    players.push({ team, player });
  }
}

const selectedPlayers = players.slice(startAt, Number.isFinite(limit) ? startAt + limit : undefined);
const output = {
  checkedAt: new Date().toISOString(),
  searchProvider:
    "Bing News RSS primary for direct publisher URL discovery; Brave Search HTML and DuckDuckGo HTML fallback only when explicitly enabled.",
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
  totalDatasetPlayers: players.length,
  selectedPlayers: selectedPlayers.length,
  records: [],
};

await mkdir(outputDir, { recursive: true });

if (resume) {
  try {
    const existing = JSON.parse(await readFile(outputJsonPath, "utf8"));
    output.records = Array.isArray(existing.records) ? existing.records : [];
    output.resumedFrom = outputJsonPath;
  } catch {
    output.records = [];
  }
}

const alreadyHarvested = new Set(
  output.records.map((record) => `${record.teamId}::${record.player}`)
);

let completed = 0;
for (const { team, player } of selectedPlayers) {
  const playerKey = `${team.teamId}::${player.name}`;
  if (alreadyHarvested.has(playerKey)) {
    completed++;
    continue;
  }

  const estimate = player.salaryEstimates[0];
  const searches = [];
  for (const search of buildQueries(team, player)) {
    try {
      const result = await searchWithRetry(search.query, player, team.teamId);
      searches.push({ type: search.type, ...result });
    } catch (error) {
      searches.push({
        type: search.type,
        query: search.query,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        results: [],
      });
    }
    await sleep(throttleMs);
  }

  const candidates = uniqueCandidates(searches);
  output.records.push({
    teamId: team.teamId,
    teamName: team.teamName,
    player: player.name,
    position: player.position,
    currentEvidenceRole: estimate.evidenceRole,
    currentEstimateType: estimate.estimateType,
    currentConfidenceScore: estimate.confidenceScore,
    searches: searches.map((search) => ({
      type: search.type,
      provider: search.provider,
      query: search.query,
      status: search.status,
      resultCount: search.results.length,
    })),
    candidates,
  });
  await writeFile(outputJsonPath, JSON.stringify(output, null, 2) + "\n");

  completed++;
  if (completed % 10 === 0 || completed === selectedPlayers.length) {
    console.error(`harvested ${completed}/${selectedPlayers.length}`);
  }
}

await writeFile(outputJsonPath, JSON.stringify(output, null, 2) + "\n");

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

  record.candidates.forEach((candidate, index) => {
    csvRows.push([
      record.teamId,
      record.teamName,
      record.player,
      record.currentEvidenceRole,
      index + 1,
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

await writeFile(outputCsvPath, csvRows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");

console.log(JSON.stringify({
  outputJsonPath,
  outputCsvPath,
  records: output.records.length,
  candidates: output.records.reduce((total, record) => total + record.candidates.length, 0),
}, null, 2));
