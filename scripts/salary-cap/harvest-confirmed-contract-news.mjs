#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index];
  const value = process.argv[index + 1];
  if (key?.startsWith("--")) args.set(key, value ?? "true");
}

function formatDateInSydney(date) {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  return `${byType.get("year")}-${byType.get("month")}-${byType.get("day")}`;
}

const targetDate = args.get("--date") ?? formatDateInSydney(new Date());
const includeAllTopicArticles = args.get("--all") === "true";
const outputDir = path.join(process.cwd(), "docs/research/contract-news");
const topicUrl = "https://www.nrl.com/news/topic/signings/";
const signingsTrackerUrl =
  "https://www.nrl.com/news/2026/01/01/2026-nrl-signings-tracker-the-latest-from-all-17-clubs/";

const confirmedSignals = [
  /\bconfirmed\b/i,
  /\bsigned\b/i,
  /\bre-signed\b/i,
  /\bextension\b/i,
  /\bannounced\b/i,
  /\bagreed to join\b/i,
  /\bjoins?\b/i,
  /\bwill join\b/i,
  /\bcontract(?:s|ed)?\b/i,
  /\bdeal\b/i,
];

const speculationSignals = [
  /\brumou?r\b/i,
  /\blinked\b/i,
  /\bchasing\b/i,
  /\btarget(?:ing|s)?\b/i,
  /\binterest\b/i,
  /\bcould\b/i,
  /\bmay\b/i,
  /\bset to\b/i,
  /\bpoised\b/i,
  /\bweighing up\b/i,
  /\bshortlist\b/i,
];

function decodeHtml(input) {
  return String(input ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function articleText(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
  );
}

function extractPageData(html) {
  const match = html.match(/window\.NRL_PAGE_DATA = (\{[\s\S]*?\});/);
  if (!match) return {};
  try {
    return JSON.parse(match[1]);
  } catch {
    return {};
  }
}

function extractTitle(html, pageData) {
  return (
    pageData.name ||
    decodeHtml(html.match(/<meta itemprop="name" property="og:title" content="([^"]+)"/)?.[1]) ||
    decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1])
  );
}

function absoluteUrl(url) {
  if (url.startsWith("http")) return url;
  return `https://www.nrl.com${url.startsWith("/") ? "" : "/"}${url}`;
}

async function fetchText(url) {
  const response = await fetch(url);
  const body = await response.text();
  return { status: response.status, body };
}

function extractArticleUrls(topicHtml) {
  const urls = new Set([signingsTrackerUrl]);
  for (const match of topicHtml.matchAll(/href="([^"]*\/news\/20\d{2}\/[^"]+)"/g)) {
    const url = absoluteUrl(match[1]).split("?")[0];
    if (!url.includes("nrlw-signings-tracker")) urls.add(url);
  }
  return [...urls];
}

function articlePublishedDate(pageData) {
  if (!pageData.published) return null;
  return formatDateInSydney(new Date(pageData.published));
}

function hasConfirmedLanguage(text) {
  return confirmedSignals.some((signal) => signal.test(text));
}

function hasSpeculationLanguage(text) {
  return speculationSignals.some((signal) => signal.test(text));
}

function contractYearsFromText(text) {
  const throughMatch = text.match(/\bthrough(?: to)?(?: the end of)?\s+(20[2-3]\d)\b/i);
  const startMatch = text.match(
    /\b(?:from|commencing|inaugural season in|ahead of(?: its)?(?: entry to(?: the NRL)?)?(?: in)?|entry to the NRL in)\s+(20[2-3]\d)\b/i
  );
  const termMatch = text.match(/\b(one|two|three|four|five|\d+)[-\s‑–]year\b/i);
  const wordToNumber = new Map([
    ["one", 1],
    ["two", 2],
    ["three", 3],
    ["four", 4],
    ["five", 5],
  ]);

  if (throughMatch && startMatch) {
    const start = Number(startMatch[1]);
    const end = Number(throughMatch[1]);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  if (startMatch && termMatch) {
    const start = Number(startMatch[1]);
    const term = wordToNumber.get(termMatch[1].toLowerCase()) ?? Number(termMatch[1]);
    if (Number.isFinite(term) && term > 0 && term < 10) {
      return Array.from({ length: term }, (_, index) => start + index);
    }
  }

  if (throughMatch) {
    return [Number(throughMatch[1])];
  }

  return [];
}

function extractPlayerNames(pageData, text) {
  const pagePlayers = Array.isArray(pageData.players)
    ? pageData.players.map((player) => player.replace(/\s+\(\d+\)$/, ""))
    : [];
  if (pagePlayers.length > 0) return pagePlayers;

  const names = new Set();
  for (const match of text.matchAll(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z'’-]+){1,2})\b/g)) {
    const name = match[1];
    if (
      !/National Rugby League|Papua New Guinea|New Zealand|Gold Coast|North Sydney|South Sydney|Wests Tigers|Perth Bears|PNG Chiefs/.test(
        name
      )
    ) {
      names.add(name);
    }
  }
  return [...names].slice(0, 8);
}

function buildConfirmedDeal(article) {
  const isTracker = article.url === signingsTrackerUrl;
  if (!isTracker && /\bNRLW\b|women'?s premiership|female pathway/i.test(article.title + " " + article.text)) {
    return null;
  }

  const text = article.text;
  const confirmed = hasConfirmedLanguage(text);
  const speculative = hasSpeculationLanguage(text) && !/\bofficially sign|officially join|have signed|has signed/i.test(text);
  if (!confirmed || speculative) return null;

  return {
    sourceUrl: article.url,
    sourceTitle: article.title,
    publisher: "NRL.com",
    publishedAt: article.pageData.published ?? null,
    publishedDateAustraliaSydney: article.publishedDate,
    authors: article.pageData.authors ?? [],
    players: isTracker ? [] : extractPlayerNames(article.pageData, text),
    extractedContractYears: isTracker ? [] : contractYearsFromText(text),
    dealStatus: "confirmed_signed_or_announced",
    confidence: "official_nrl_or_club_media_release",
    reviewStatus: isTracker
      ? "live_tracker_needs_manual_daily_diff_before_data_promotion"
      : "needs_manual_player_mapping_before_data_promotion",
    snippet: text.slice(0, 900),
  };
}

const topic = await fetchText(topicUrl);
if (topic.status !== 200) {
  throw new Error(`Unable to fetch NRL signings topic: ${topic.status}`);
}

const articleUrls = extractArticleUrls(topic.body);
const articles = [];
for (const url of articleUrls) {
  const { status, body } = await fetchText(url);
  if (status !== 200) continue;
  const pageData = extractPageData(body);
  const publishedDate = articlePublishedDate(pageData);
  if (!includeAllTopicArticles && publishedDate !== targetDate) continue;
  articles.push({
    url,
    title: extractTitle(body, pageData),
    pageData,
    publishedDate,
    text: articleText(body),
  });
}

const confirmedDeals = articles.map(buildConfirmedDeal).filter(Boolean);
const output = {
  checkedAt: new Date().toISOString(),
  targetDateAustraliaSydney: targetDate,
  mode: includeAllTopicArticles ? "all_official_topic_backfill" : "daily_target_date",
  sourcePolicy:
    "Official NRL signings topic and tracker only. This harvester records confirmed signed/announced deals for manual promotion; speculation language is filtered out.",
  sourceUrls: [topicUrl, signingsTrackerUrl],
  scannedArticles: articles.length,
  confirmedDeals,
};

await mkdir(outputDir, { recursive: true });
const outputPrefix = includeAllTopicArticles ? "all-official-topic-backfill" : targetDate;
const jsonPath = path.join(outputDir, `${outputPrefix}-confirmed-contract-news.json`);
const mdPath = path.join(outputDir, `${outputPrefix}-confirmed-contract-news.md`);
await writeFile(jsonPath, JSON.stringify(output, null, 2) + "\n");
await writeFile(
  mdPath,
  [
    `# Confirmed Contract News - ${includeAllTopicArticles ? "Official Topic Backfill" : targetDate}`,
    "",
    `Checked: ${output.checkedAt}`,
    "",
    "Only official NRL signings topic/tracker articles are scanned. Items remain manual-review candidates until mapped to player/team records.",
    "",
    ...confirmedDeals.map((deal) =>
      [
        `## ${deal.sourceTitle}`,
        "",
        `- Source: ${deal.sourceUrl}`,
        `- Published: ${deal.publishedAt ?? "unknown"}`,
        `- Players: ${deal.players.join(", ") || "manual review required"}`,
        `- Extracted years: ${deal.extractedContractYears.join(", ") || "manual review required"}`,
        `- Confidence: ${deal.confidence}`,
        "",
      ].join("\n")
    ),
  ].join("\n")
);

console.log(JSON.stringify({ jsonPath, mdPath, scannedArticles: articles.length, confirmedDeals: confirmedDeals.length }, null, 2));
