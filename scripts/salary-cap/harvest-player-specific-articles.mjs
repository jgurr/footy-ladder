#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const inputPath = path.join(process.cwd(), "src/data/salary-cap/all-teams-2026.json");
const outputDir = path.join(process.cwd(), "docs/research/player-specific-article-review");

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

const teamFilter = args.get("--team")?.toLowerCase();
const limit = args.has("--limit") ? Number(args.get("--limit")) : Infinity;
const startAt = args.has("--start-at") ? Number(args.get("--start-at")) : 0;
const throttleMs = args.has("--throttle-ms") ? Number(args.get("--throttle-ms")) : 250;
const requestTimeoutMs = args.has("--timeout-ms") ? Number(args.get("--timeout-ms")) : 9000;
const maxResultsPerSearch = args.has("--max-results") ? Number(args.get("--max-results")) : 6;
const maxCandidatesPerPlayer = args.has("--max-candidates") ? Number(args.get("--max-candidates")) : 18;
const fetchTopArticles = args.has("--fetch-top") ? Number(args.get("--fetch-top")) : 4;
const searchConcurrency = args.has("--search-concurrency")
  ? Number(args.get("--search-concurrency"))
  : 6;
const resume = args.get("--resume") === "true";
const providers = (args.get("--providers") ?? "bing-news-rss,duckduckgo")
  .split(",")
  .map((provider) => provider.trim())
  .filter(Boolean);
const querySet = args.get("--query-set") ?? "deep";
const fromReviewPath = args.get("--from-review");
const needsFilter = args.get("--needs");
const includeContextOnly = args.get("--include-context") === "true";
const outputSuffixRaw = args.get("--output-suffix") ?? "";
const outputSuffix = outputSuffixRaw
  ? `-${outputSuffixRaw.replace(/[^a-zA-Z0-9_-]/g, "-")}`
  : "";
const outputJsonPath = path.join(
  outputDir,
  `player-specific-article-review-2026${outputSuffix}.json`,
);
const outputCsvPath = path.join(
  outputDir,
  `player-specific-article-review-2026${outputSuffix}.csv`,
);

const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

const reputableDomains = [
  "dailytelegraph.com.au",
  "smh.com.au",
  "nine.com.au",
  "wwos.nine.com.au",
  "foxsports.com.au",
  "news.com.au",
  "codesports.com.au",
  "theaustralian.com.au",
  "couriermail.com.au",
  "heraldsun.com.au",
  "goldcoastbulletin.com.au",
  "townsvillebulletin.com.au",
  "themercury.com.au",
  "geelongadvertiser.com.au",
  "ntnews.com.au",
  "weeklytimesnow.com.au",
  "cairnspost.com.au",
  "adelaidenow.com.au",
  "perthnow.com.au",
  "thewest.com.au",
  "thenightly.com.au",
  "7news.com.au",
  "abc.net.au",
  "espn.com",
  "rnz.co.nz",
  "au.sports.yahoo.com",
  "au.news.yahoo.com",
  "zerotackle.com",
  "sportingnews.com",
  "racingandsports.com.au",
  "centralwesterndaily.com.au",
  "theqldr.com.au",
  "loverugbyleague.com",
  "rugby-league.com",
  "nrl.com",
];

const preferredPrimaryDomains = [
  "dailytelegraph.com.au",
  "smh.com.au",
  "nine.com.au",
  "wwos.nine.com.au",
  "foxsports.com.au",
  "news.com.au",
  "codesports.com.au",
  "couriermail.com.au",
  "theaustralian.com.au",
  "nrl.com",
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

const teamSearchAliases = new Map([
  ["bri", ["Broncos"]],
  ["can", ["Raiders", "Canberra"]],
  ["cby", ["Bulldogs", "Canterbury"]],
  ["cro", ["Sharks", "Cronulla"]],
  ["dol", ["Dolphins"]],
  ["gld", ["Titans", "Gold Coast"]],
  ["man", ["Sea Eagles", "Manly"]],
  ["mel", ["Storm", "Melbourne"]],
  ["new", ["Knights", "Newcastle"]],
  ["nql", ["Cowboys", "North Queensland"]],
  ["nzl", ["Warriors"]],
  ["par", ["Eels", "Parramatta"]],
  ["pen", ["Panthers", "Penrith"]],
  ["sou", ["Rabbitohs", "South Sydney"]],
  ["sti", ["Dragons", "St George Illawarra"]],
  ["syd", ["Roosters", "Sydney Roosters"]],
  ["wst", ["Tigers", "Wests Tigers"]],
]);

let knownPlayerNames = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(input) {
  return normalizeText(input)
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&#0183;", " ")
    .replaceAll("&#32;", " ")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(input, tagName) {
  const match = input.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function sameOrSubdomain(domain, allowed) {
  return domain === allowed || domain.endsWith(`.${allowed}`);
}

function isReputableDomain(domain, teamId) {
  const clubDomain = clubDomains.get(teamId);
  return (
    reputableDomains.some((allowed) => sameOrSubdomain(domain, allowed)) ||
    Boolean(clubDomain && sameOrSubdomain(domain, clubDomain))
  );
}

function isPreferredPrimaryDomain(domain) {
  return preferredPrimaryDomains.some((allowed) => sameOrSubdomain(domain, allowed));
}

function decodeWrappedUrl(url) {
  try {
    const parsed = new URL(url.startsWith("//") ? `https:${url}` : url);
    const bingWrapped = parsed.searchParams.get("u");
    if (parsed.hostname.endsWith("bing.com") && bingWrapped) {
      const encoded = bingWrapped.startsWith("a1") ? bingWrapped.slice(2) : bingWrapped;
      try {
        return Buffer.from(encoded, "base64url").toString("utf8");
      } catch {
        return bingWrapped;
      }
    }
    return (
      parsed.searchParams.get("uddg") ||
      parsed.searchParams.get("url") ||
      bingWrapped ||
      url
    );
  } catch {
    return url;
  }
}

function canonicalizeUrl(url) {
  const decoded = decodeWrappedUrl(url);
  try {
    const parsed = new URL(decoded);
    for (const param of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gaa_at",
      "gaa_n",
      "gaa_ts",
      "gaa_sig",
      "output",
    ]) {
      parsed.searchParams.delete(param);
    }
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return decoded;
  }
}

async function fetchText(url, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": userAgent,
        "accept-language": "en-AU,en;q=0.9",
        ...headers,
      },
      signal: controller.signal,
    });
    const body = await response.text();
    return { response, body };
  } finally {
    clearTimeout(timeout);
  }
}

function playerNameAliases(name) {
  const normalized = normalizeText(name);
  const parts = normalized.split(/\s+/).filter(Boolean);
  const aliases = new Set([normalized]);
  if (parts.length >= 2) {
    aliases.add(`${parts[0]} ${parts.at(-1)}`);
    aliases.add(parts.at(-1));
  }
  return [...aliases].map((alias) => alias.toLowerCase());
}

function hasExactPlayerName(text, player) {
  const lower = normalizeText(text).toLowerCase();
  return playerNameAliases(player.name).some((alias) => alias.includes(" ") && lower.includes(alias));
}

function hasDifferentKnownPlayerName(text, player) {
  const lower = normalizeText(text).toLowerCase();
  const currentName = normalizeText(player.name).toLowerCase();
  return knownPlayerNames.some((name) => name !== currentName && lower.includes(name));
}

function hasSignalNearPlayer(text, player, signalPattern, windowSize = 140) {
  const lower = normalizeText(text).toLowerCase();
  for (const alias of playerNameAliases(player.name)) {
    if (!alias.includes(" ")) continue;
    let index = lower.indexOf(alias);
    while (index !== -1) {
      const start = Math.max(0, index - windowSize);
      const end = Math.min(lower.length, index + alias.length + windowSize);
      if (signalPattern.test(lower.slice(start, end))) return true;
      index = lower.indexOf(alias, index + alias.length);
    }
  }
  return false;
}

function textSignals(text) {
  const normalized = normalizeText(text);
  const signals = [];
  if (/\$ ?\d+(?:\.\d+)?\s?(?:m|million|k|,000)/i.test(normalized)) signals.push("money");
  if (/\b(?:contract|deal|extension|salary|worth|value|cap|option|aav|pay|upgrade|offer)\b/i.test(normalized)) {
    signals.push("contract_or_salary_language");
  }
  if (/\b(?:signed|re-signed|resigned|extended|joins|join|lands|rejects|agreed|accepted)\b/i.test(normalized)) {
    signals.push("signing_language");
  }
  if (/\b(?:until|through|end of|to the end of|expires|expiry)\s+(?:20\d{2}|the \d{4} season)\b/i.test(normalized)) {
    signals.push("term_language");
  }
  if (/\b(?:one|two|three|four|five|six|seven)-year\b/i.test(normalized) || /\b\d+-year\b/i.test(normalized)) {
    signals.push("term_length_language");
  }
  return signals;
}

function classifyArticle({ title, snippet, articleText = "", domain, player, teamId }) {
  const evidenceText = `${title} ${snippet} ${articleText}`;
  const titleSnippet = `${title} ${snippet}`;
  const titleHasPlayer = hasExactPlayerName(title, player);
  const titleHasDifferentPlayer = !titleHasPlayer && hasDifferentKnownPlayerName(title, player);
  const snippetHasPlayer = hasExactPlayerName(snippet, player);
  const exactPlayerNameInTitleSnippet = hasExactPlayerName(titleSnippet, player);
  const exactPlayerNameInArticle = hasExactPlayerName(articleText, player);
  const exactPlayerName = exactPlayerNameInTitleSnippet || exactPlayerNameInArticle;
  const signals = [...new Set(textSignals(evidenceText))];
  const moneyNearPlayer =
    titleHasPlayer ||
    hasSignalNearPlayer(titleSnippet, player, /\$ ?\d+(?:\.\d+)?\s?(?:m|million|k|,000)/i);
  const contractNearPlayer =
    titleHasPlayer ||
    hasSignalNearPlayer(
      titleSnippet,
      player,
      /\b(?:contract|deal|extension|salary|worth|value|cap|option|pay|upgrade|offer|signed|re-signed|extended|until|expires|\d+-year|one-year|two-year|three-year|four-year|five-year|six-year)\b/i,
    );
  const reputable = isReputableDomain(domain, teamId);
  const primaryPreferred = isPreferredPrimaryDomain(domain);
  let articleUse = "context_only";

  if (
    !titleHasDifferentPlayer &&
    exactPlayerNameInTitleSnippet &&
    signals.includes("money") &&
    moneyNearPlayer
  ) {
    articleUse = "player_specific_salary_candidate";
  } else if (
    !titleHasDifferentPlayer &&
    exactPlayerNameInTitleSnippet &&
    contractNearPlayer &&
    (signals.includes("contract_or_salary_language") ||
      signals.includes("signing_language") ||
      signals.includes("term_language") ||
      signals.includes("term_length_language"))
  ) {
    articleUse = "player_specific_contract_candidate";
  } else if (titleHasPlayer || snippetHasPlayer) {
    articleUse = "player_specific_profile_candidate";
  } else if (exactPlayerNameInArticle) {
    articleUse = "player_mentioned_context_candidate";
  }

  let score = 0;
  if (exactPlayerName) score += 20;
  if (normalizeText(title).toLowerCase().includes(normalizeText(player.name).toLowerCase())) score += 7;
  if (signals.includes("money")) score += 15;
  if (signals.includes("contract_or_salary_language")) score += 8;
  if (signals.includes("term_language") || signals.includes("term_length_language")) score += 8;
  if (signals.includes("signing_language")) score += 5;
  if (reputable) score += 8;
  if (primaryPreferred) score += 4;
  if (!exactPlayerName) score -= 15;
  if (!reputable) score -= 6;

  return {
    articleUse,
    exactPlayerName,
    titleHasPlayer,
    titleHasDifferentPlayer,
    snippetHasPlayer,
    exactPlayerNameInTitleSnippet,
    exactPlayerNameInArticle,
    moneyNearPlayer,
    contractNearPlayer,
    signals,
    reputable,
    primaryPreferred,
    score,
  };
}

function parseBingNewsResults(xml, player, teamId, maxResults) {
  const results = [];
  const items = xml.split(/<item>/i).slice(1);
  for (const item of items) {
    const title = extractTag(item, "title");
    const bingNewsUrl = extractTag(item, "link");
    const url = canonicalizeUrl(bingNewsUrl);
    const publishedAt = extractTag(item, "pubDate");
    const snippet = extractTag(item, "description");
    const sourceName = extractTag(item, "News:Source");
    const domain = getDomain(url);
    const classification = classifyArticle({ title, snippet, domain, player, teamId });
    results.push({
      title,
      url,
      searchResultUrl: bingNewsUrl,
      domain,
      sourceName,
      publishedAt,
      snippet,
      provider: "bing-news-rss",
      ...classification,
    });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

function parseBingWebResults(xml, player, teamId, maxResults) {
  const results = [];
  const items = xml.split(/<item>/i).slice(1);
  for (const item of items) {
    const title = extractTag(item, "title");
    const resultUrl = extractTag(item, "link");
    const url = canonicalizeUrl(resultUrl);
    const snippet = extractTag(item, "description");
    const domain = getDomain(url);
    const classification = classifyArticle({ title, snippet, domain, player, teamId });
    results.push({
      title,
      url,
      searchResultUrl: resultUrl,
      domain,
      snippet,
      provider: "bing-web-rss",
      ...classification,
    });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

function parseBingHtmlResults(html, player, teamId, maxResults) {
  const chunks = html.split('<li class="b_algo"').slice(1);
  const results = [];
  for (const chunk of chunks) {
    const h2 = chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1] ?? "";
    const h2Anchor = h2.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!h2Anchor) continue;
    const title = decodeHtml(h2Anchor[2]);
    const resultUrl = decodeHtml(h2Anchor[1]);
    const url = canonicalizeUrl(resultUrl);
    if (!url.startsWith("http")) continue;
    const snippet = decodeHtml(chunk.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "");
    const domain = getDomain(url);
    const classification = classifyArticle({ title, snippet, domain, player, teamId });
    results.push({
      title,
      url,
      searchResultUrl: resultUrl,
      domain,
      snippet,
      provider: "bing-html",
      ...classification,
    });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

function parseGoogleNewsResults(xml, player, teamId, maxResults) {
  const results = [];
  const items = xml.split(/<item>/i).slice(1);
  for (const item of items) {
    const title = extractTag(item, "title");
    const googleNewsUrl = extractTag(item, "link");
    const publishedAt = extractTag(item, "pubDate");
    const snippet = extractTag(item, "description");
    const sourceName = extractTag(item, "source");
    const domain = getDomain(googleNewsUrl);
    const classification = classifyArticle({ title, snippet, domain, player, teamId });
    results.push({
      title,
      url: canonicalizeUrl(googleNewsUrl),
      searchResultUrl: googleNewsUrl,
      domain,
      sourceName,
      publishedAt,
      snippet,
      provider: "google-news-rss",
      needsOriginalUrlResolution: true,
      ...classification,
    });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

function parseDuckDuckGoResults(html, player, teamId, maxResults) {
  const chunks = html.split('<div class="result');
  const results = [];
  for (const chunk of chunks) {
    const titleMatch = chunk.match(/class="result__a" href="([^"]+)">([\s\S]*?)<\/a>/);
    if (!titleMatch) continue;
    const snippetMatch = chunk.match(/class="result__snippet" href="[^"]+">([\s\S]*?)<\/a>/);
    const title = decodeHtml(titleMatch[2]);
    const url = canonicalizeUrl(decodeHtml(titleMatch[1]));
    const snippet = snippetMatch ? decodeHtml(snippetMatch[1]) : "";
    const domain = getDomain(url);
    const classification = classifyArticle({ title, snippet, domain, player, teamId });
    results.push({
      title,
      url,
      domain,
      snippet,
      provider: "duckduckgo",
      ...classification,
    });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

async function searchBingNews(query, player, teamId) {
  const url = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss&cc=au`;
  const { response, body } = await fetchText(url, {
    accept: "application/rss+xml,application/xml,text/xml",
  });
  return {
    provider: "bing-news-rss",
    query,
    searchUrl: url,
    status: response.status,
    results: parseBingNewsResults(body, player, teamId, maxResultsPerSearch),
  };
}

async function searchBingWeb(query, player, teamId) {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&format=rss&cc=au`;
  const { response, body } = await fetchText(url, {
    accept: "application/rss+xml,application/xml,text/xml",
  });
  return {
    provider: "bing-web-rss",
    query,
    searchUrl: url,
    status: response.status,
    results: parseBingWebResults(body, player, teamId, maxResultsPerSearch),
  };
}

async function searchBingHtml(query, player, teamId) {
  const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&cc=au`;
  const { response, body } = await fetchText(url, {
    accept: "text/html,application/xhtml+xml",
  });
  return {
    provider: "bing-html",
    query,
    searchUrl: url,
    status: response.status,
    results: parseBingHtmlResults(body, player, teamId, maxResultsPerSearch),
  };
}

async function searchGoogleNews(query, player, teamId) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-AU&gl=AU&ceid=AU:en`;
  const { response, body } = await fetchText(url, {
    accept: "application/rss+xml,application/xml,text/xml",
  });
  return {
    provider: "google-news-rss",
    query,
    searchUrl: url,
    status: response.status,
    results: parseGoogleNewsResults(body, player, teamId, maxResultsPerSearch),
  };
}

async function searchDuckDuckGo(query, player, teamId) {
  const url = `https://duckduckgo.com/html/?kl=au-en&q=${encodeURIComponent(query)}`;
  const { response, body } = await fetchText(url, {
    accept: "text/html,application/xhtml+xml",
  });
  return {
    provider: "duckduckgo",
    query,
    searchUrl: url,
    status: response.status,
    results: parseDuckDuckGoResults(body, player, teamId, maxResultsPerSearch),
  };
}

async function runProvider(provider, query, player, teamId) {
  if (provider === "bing-news-rss") return searchBingNews(query, player, teamId);
  if (provider === "bing-web-rss") return searchBingWeb(query, player, teamId);
  if (provider === "bing-html") return searchBingHtml(query, player, teamId);
  if (provider === "google-news-rss") return searchGoogleNews(query, player, teamId);
  if (provider === "duckduckgo") return searchDuckDuckGo(query, player, teamId);
  throw new Error(`Unsupported provider: ${provider}`);
}

function siteQuery(domain, playerName, terms = "NRL contract salary worth deal extension") {
  return `site:${domain} "${playerName}" ${terms}`;
}

function buildQueries(team, player) {
  const playerName = player.name;
  const clubDomain = clubDomains.get(team.teamId);
  const [primaryTeamAlias] = teamSearchAliases.get(team.teamId) ?? [team.teamName];
  const compactQueries = [
    { type: "simple_alias_contract", query: `"${playerName}" NRL contract extension ${primaryTeamAlias}` },
    { type: "simple_alias_signed", query: `"${playerName}" signed extension ${primaryTeamAlias}` },
    { type: "simple_contract", query: `"${playerName}" NRL contract extension` },
    { type: "simple_team_contract", query: `"${playerName}" "${team.teamName}" contract extension` },
    { type: "salary_contract", query: `"${playerName}" NRL contract salary worth deal extension` },
    { type: "team_contract", query: `"${playerName}" "${team.teamName}" NRL contract deal extension` },
    { type: "signed_until", query: `"${playerName}" NRL signed extension until contract expires` },
    { type: "dailytelegraph", query: siteQuery("dailytelegraph.com.au/sport/nrl", playerName) },
    { type: "smh", query: siteQuery("smh.com.au/sport/nrl", playerName) },
    { type: "foxsports", query: siteQuery("foxsports.com.au/nrl", playerName) },
    { type: "nine", query: siteQuery("nine.com.au/sport/nrl", playerName) },
    { type: "newscomau", query: siteQuery("news.com.au/sport/nrl", playerName) },
    { type: "nrl", query: siteQuery("nrl.com/news", playerName, "contract signed extension") },
  ];

  if (clubDomain) {
    compactQueries.push({
      type: "club_news_exact",
      query: `site:${clubDomain}/news "${playerName}"`,
    });
    compactQueries.push({
      type: "club",
      query: siteQuery(clubDomain, playerName, "contract signed extension"),
    });
  }

  if (querySet === "bing-html-lite") {
    return compactQueries.filter((query) =>
      ["simple_alias_contract", "simple_alias_signed", "club_news_exact"].includes(query.type),
    );
  }

  if (querySet === "bing-html-source-sites") {
    const queries = [
      { type: "simple_alias_contract", query: `"${playerName}" NRL contract extension ${primaryTeamAlias}` },
      { type: "source_zerotackle", query: `site:zerotackle.com "${playerName}" NRL contract` },
      {
        type: "source_sportingnews",
        query: `site:sportingnews.com/au/rugby-league "${playerName}" NRL contract`,
      },
      {
        type: "source_love_rugby_league",
        query: `site:loverugbyleague.com "${playerName}" NRL contract`,
      },
      {
        type: "source_foxsports",
        query: `site:foxsports.com.au/nrl "${playerName}" contract salary`,
      },
      { type: "source_nrl", query: `site:nrl.com/news "${playerName}" contract signed` },
    ];
    if (clubDomain) {
      queries.push({ type: "club_news_exact", query: `site:${clubDomain}/news "${playerName}"` });
    }
    return queries;
  }

  if (querySet === "compact") return compactQueries;

  return [
    ...compactQueries,
    { type: "codesports", query: siteQuery("codesports.com.au/nrl", playerName) },
    { type: "couriermail", query: siteQuery("couriermail.com.au/sport/nrl", playerName) },
    { type: "theaustralian", query: siteQuery("theaustralian.com.au/sport/nrl", playerName) },
    { type: "espn", query: siteQuery("espn.com.au/nrl", playerName, "contract signed extension") },
    { type: "seven", query: siteQuery("7news.com.au/sport/rugby-league", playerName) },
    { type: "yahoo", query: siteQuery("au.sports.yahoo.com/nrl", playerName) },
    { type: "zerotackle", query: siteQuery("zerotackle.com", playerName, "contract signed salary") },
    { type: "publisher_text_dt", query: `"${playerName}" "Daily Telegraph" NRL contract salary worth` },
    { type: "publisher_text_smh", query: `"${playerName}" "Sydney Morning Herald" NRL contract salary worth` },
    { type: "rich_list_crosscheck", query: `"${playerName}" "NRL Rich List" salary contract` },
  ];
}

function mergeCandidates(searches) {
  const byUrl = new Map();
  for (const search of searches) {
    for (const result of search.results ?? []) {
      const url = canonicalizeUrl(result.url);
      const existing = byUrl.get(url);
      const foundBy = existing?.foundBy ?? [];
      const foundByQueries = existing?.foundByQueries ?? [];
      const merged = {
        ...(existing ?? result),
        ...result,
        url,
        foundBy: [...new Set([...foundBy, search.type])],
        foundByQueries: [...new Set([...foundByQueries, search.query])],
        providers: [...new Set([...(existing?.providers ?? []), result.provider ?? search.provider])],
      };
      if (existing && existing.score > result.score) merged.score = existing.score;
      byUrl.set(url, merged);
    }
  }
  return [...byUrl.values()]
    .filter((candidate) => includeContextOnly || candidate.articleUse !== "context_only")
    .sort((a, b) => {
      const articleOrder = {
        player_specific_salary_candidate: 4,
        player_specific_contract_candidate: 3,
        player_specific_profile_candidate: 2,
        context_only: 1,
      };
      return (
        (articleOrder[b.articleUse] ?? 0) - (articleOrder[a.articleUse] ?? 0) ||
        b.score - a.score ||
        Number(b.primaryPreferred) - Number(a.primaryPreferred) ||
        Number(b.reputable) - Number(a.reputable)
      );
    })
    .slice(0, maxCandidatesPerPlayer);
}

function extractArticleText(html) {
  const metaDescription =
    html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:description|og:description)["']/i)?.[1] ??
    "";
  const articleMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => decodeHtml(match[1]))
    .filter((text) => text.length > 40);
  return decodeHtml(`${metaDescription} ${articleMatches.slice(0, 12).join(" ")}`).slice(0, 5000);
}

async function reviewArticlePage(candidate, player, teamId) {
  const domain = getDomain(candidate.url);
  if (!candidate.url.startsWith("http") || domain === "news.google.com") {
    return {
      fetchStatus: "skipped",
      fetchReason: "non_direct_url_or_google_news_redirect",
    };
  }

  try {
    const { response, body } = await fetchText(candidate.url, {
      accept: "text/html,application/xhtml+xml",
    });
    const articleText = extractArticleText(body);
    const classification = classifyArticle({
      title: candidate.title,
      snippet: candidate.snippet,
      articleText,
      domain,
      player,
      teamId,
    });
    return {
      fetchStatus: response.status,
      reviewedTextChars: articleText.length,
      reviewedTextSample: articleText.slice(0, 700),
      pageSignals: classification.signals,
      pageArticleUse: classification.articleUse,
      pageExactPlayerName: classification.exactPlayerName,
    };
  } catch (error) {
    return {
      fetchStatus: "error",
      fetchError: error instanceof Error ? error.message : String(error),
    };
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

function candidateSummary(candidates) {
  return {
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
  };
}

async function writeOutputs(output) {
  await writeFile(outputJsonPath, JSON.stringify(output, null, 2) + "\n");

  const csvRows = [[
    "teamId",
    "teamName",
    "player",
    "position",
    "currentEvidenceRole",
    "candidateRank",
    "articleUse",
    "domain",
    "reputable",
    "primaryPreferred",
    "score",
    "signals",
    "providers",
    "foundBy",
    "publishedAt",
    "sourceName",
    "fetchStatus",
    "pageArticleUse",
    "title",
    "url",
    "snippet",
  ]];

  for (const record of output.records) {
    if (!record.candidates.length) {
      csvRows.push([
        record.teamId,
        record.teamName,
        record.player,
        record.position,
        record.currentEvidenceRole,
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
        record.position,
        record.currentEvidenceRole,
        index + 1,
        candidate.articleUse,
        candidate.domain,
        candidate.reputable,
        candidate.primaryPreferred,
        candidate.score,
        candidate.signals,
        candidate.providers,
        candidate.foundBy,
        candidate.publishedAt ?? "",
        candidate.sourceName ?? "",
        candidate.articleReview?.fetchStatus ?? "",
        candidate.articleReview?.pageArticleUse ?? "",
        candidate.title,
        candidate.url,
        candidate.snippet,
      ]);
    });
  }

  await writeFile(outputCsvPath, csvRows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n");
}

const data = JSON.parse(await readFile(inputPath, "utf8"));
const allPlayers = [];
for (const team of data.teams) {
  if (teamFilter && team.teamId.toLowerCase() !== teamFilter) continue;
  for (const player of team.players) allPlayers.push({ team, player });
}
knownPlayerNames = [
  ...new Set(allPlayers.map(({ player }) => normalizeText(player.name).toLowerCase())),
].filter((name) => name.includes(" "));

let filteredPlayers = allPlayers;
let filterSourceRecords = [];
if (fromReviewPath && needsFilter) {
  const review = JSON.parse(await readFile(path.resolve(process.cwd(), fromReviewPath), "utf8"));
  filterSourceRecords = Array.isArray(review.records) ? review.records : [];
  const sourceByKey = new Map(
    filterSourceRecords.map((record) => [`${record.teamId}::${record.player}`, record]),
  );
  filteredPlayers = allPlayers.filter(({ team, player }) => {
    const record = sourceByKey.get(`${team.teamId}::${player.name}`);
    if (!record) return true;
    const summary = record.summary ?? {};
    if (needsFilter === "no-candidate") return Number(summary.totalCandidates ?? 0) === 0;
    if (needsFilter === "no-player-specific") {
      return (
        Number(summary.playerSpecificSalaryCandidates ?? 0) +
          Number(summary.playerSpecificContractCandidates ?? 0) +
          Number(summary.playerSpecificProfileCandidates ?? 0) ===
        0
      );
    }
    if (needsFilter === "no-salary-or-contract") {
      return (
        Number(summary.playerSpecificSalaryCandidates ?? 0) +
          Number(summary.playerSpecificContractCandidates ?? 0) ===
        0
      );
    }
    if (needsFilter === "no-salary") {
      return Number(summary.playerSpecificSalaryCandidates ?? 0) === 0;
    }
    throw new Error(`Unsupported --needs filter: ${needsFilter}`);
  });
}

const selectedPlayers = filteredPlayers.slice(
  startAt,
  Number.isFinite(limit) ? startAt + limit : undefined,
);

await mkdir(outputDir, { recursive: true });

const output = {
  checkedAt: new Date().toISOString(),
  searchMode:
    "Per-player direct search across salary, contract, term, signed-extension, publisher-site, major-media, NRL.com, and club-domain query families.",
  sourcePolicy:
    "Links are evidence leads for direct article review. Paywalled Daily Telegraph, SMH, and News Corp pages are captured as direct URLs, but restricted article text is not copied into this repository.",
  providers,
  querySet,
  includeContextOnly,
  requestedPrimarySources: [
    "dailytelegraph.com.au",
    "smh.com.au",
    "nine.com.au",
    "foxsports.com.au",
    "news.com.au",
    "codesports.com.au",
    "nrl.com",
    "club domains",
  ],
  totalDatasetPlayers: allPlayers.length,
  filteredDatasetPlayers: filteredPlayers.length,
  fromReviewPath: fromReviewPath ?? null,
  needsFilter: needsFilter ?? null,
  selectedPlayers: selectedPlayers.length,
  records: [],
};

if (resume) {
  try {
    const existing = JSON.parse(await readFile(outputJsonPath, "utf8"));
    output.records = Array.isArray(existing.records) ? existing.records : [];
    output.resumedFrom = outputJsonPath;
  } catch {
    output.records = [];
  }
}

const completedKeys = new Set(output.records.map((record) => `${record.teamId}::${record.player}`));
let completed = 0;

for (const { team, player } of selectedPlayers) {
  const playerKey = `${team.teamId}::${player.name}`;
  if (completedKeys.has(playerKey)) {
    completed += 1;
    continue;
  }

  const estimate = player.salaryEstimates?.[0] ?? {};
  const queries = buildQueries(team, player);
  const searchTasks = queries.flatMap((queryDef) =>
    providers.map((provider) => ({ queryDef, provider })),
  );

  const searches = await runWithConcurrency(
    searchTasks,
    async ({ queryDef, provider }) => {
      try {
        const result = await runProvider(provider, queryDef.query, player, team.teamId);
        return { type: queryDef.type, ...result };
      } catch (error) {
        return {
          type: queryDef.type,
          provider,
          query: queryDef.query,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
          results: [],
        };
      } finally {
        if (throttleMs > 0) await sleep(throttleMs);
      }
    },
    searchConcurrency,
  );

  const candidates = mergeCandidates(searches);
  for (const candidate of candidates.slice(0, fetchTopArticles)) {
    candidate.articleReview = await reviewArticlePage(candidate, player, team.teamId);
    if (candidate.articleReview?.pageArticleUse && candidate.articleReview.pageArticleUse !== "context_only") {
      candidate.articleUse = candidate.articleReview.pageArticleUse;
    }
    if (candidate.articleReview?.pageSignals?.length) {
      candidate.signals = [...new Set([...candidate.signals, ...candidate.articleReview.pageSignals])];
    }
  }

  const record = {
    teamId: team.teamId,
    teamName: team.teamName,
    player: player.name,
    position: player.position,
    currentEvidenceRole: estimate.evidenceRole ?? "",
    currentEstimateType: estimate.estimateType ?? "",
    currentConfidenceScore: estimate.confidenceScore ?? "",
    currentConfidenceBand: estimate.confidenceBand ?? "",
    searchCount: searches.length,
    searches: searches.map((search) => ({
      type: search.type,
      provider: search.provider,
      query: search.query,
      searchUrl: search.searchUrl,
      status: search.status,
      error: search.error,
      resultCount: search.results?.length ?? 0,
    })),
    candidates,
    summary: candidateSummary(candidates),
  };

  output.records.push(record);
  await writeOutputs(output);

  completed += 1;
  if (completed % 5 === 0 || completed === selectedPlayers.length) {
    const totals = output.records.reduce(
      (acc, current) => {
        acc.candidates += current.candidates.length;
        if (current.summary.playerSpecificSalaryCandidates > 0) acc.salary += 1;
        if (current.summary.playerSpecificContractCandidates > 0) acc.contract += 1;
        if (current.summary.totalCandidates === 0) acc.none += 1;
        return acc;
      },
      { candidates: 0, salary: 0, contract: 0, none: 0 },
    );
    console.error(
      `searched ${completed}/${selectedPlayers.length}; records=${output.records.length}; candidates=${totals.candidates}; playersWithSalary=${totals.salary}; playersWithContract=${totals.contract}; noCandidates=${totals.none}`,
    );
  }
}

output.completedAt = new Date().toISOString();
output.totals = output.records.reduce(
  (acc, record) => {
    acc.records += 1;
    acc.candidates += record.candidates.length;
    if (record.summary.playerSpecificSalaryCandidates > 0) acc.playersWithSalaryCandidate += 1;
    if (record.summary.playerSpecificContractCandidates > 0) acc.playersWithContractCandidate += 1;
    if (record.summary.playerSpecificProfileCandidates > 0) acc.playersWithProfileCandidate += 1;
    if (record.summary.preferredPrimaryCandidates > 0) acc.playersWithPreferredPrimaryCandidate += 1;
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
    playersWithNoCandidate: 0,
  },
);

await writeOutputs(output);

console.log(
  JSON.stringify(
    {
      outputJsonPath,
      outputCsvPath,
      totals: output.totals,
    },
    null,
    2,
  ),
);
