#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const dataPath = path.join(process.cwd(), "src/data/salary-cap/all-teams-2026.json");
const reportDir = path.join(process.cwd(), "docs/research/quality-audits");
const reportPath = path.join(reportDir, "official-terms-and-derived-ranges-2026.json");
const nrlTrackerUrl =
  "https://www.nrl.com/news/2026/01/01/2026-nrl-signings-tracker-the-latest-from-all-17-clubs/";
const minimumSalaryCents = 14000000;
const top30BaseCapCents = 1155000000;
const normalizedAliases = new Map([
  ["matthew timoko", "matt timoko"],
  ["jake clydesdale", "jake clydsdale"],
  ["samuel hughes", "sam hughes"],
  ["braden uele", "braden hamlin-uele"],
  ["sifa talakai", "siosifa talakai"],
  ["will kennedy", "william kennedy"],
  ["tom hazleton", "tom hazelton"],
  ["jaimin joliffe", "jaimin jolliffe"],
  ["josh patson", "josh patston"],
  ["will warbrick", "william warbrick"],
  ["mitch barnett", "mitchell barnett"],
  ["chanel tevita-harris", "chanel harris-tavita"],
  ["dominic young", "dom young"],
  ["pasamu saulo", "pasami saulo"],
  ["thomas jenkins", "tom jenkins"],
  ["linday smith", "lindsay smith"],
  ["bronson carlick", "bronson garlick"],
  ["lachie hubner", "lachlan hubner"],
  ["mat feagai", "mathew feagai"],
  ["loko pasifiki-tonga", "loko pasifiki tonga"],
  ["junior pauga", "fetalaiga junior pauga"],
]);

const manualTrackerEntryCorrections = new Map([
  ["kyle mccarthy lachlan crouch", "lachlan crouch"],
  ["richard penisini ronald volkman", "ronald volkman"],
]);

const teamHeadings = [
  ["bri", "Brisbane Broncos"],
  ["can", "Canberra Raiders"],
  ["cby", "Canterbury Bulldogs"],
  ["cro", "Cronulla Sharks"],
  ["dol", "Dolphins"],
  ["gld", "Gold Coast Titans"],
  ["man", "Manly-Warringah Sea Eagles"],
  ["mel", "Melbourne Storm"],
  ["new", "Newcastle Knights"],
  ["nql", "North Queensland Cowboys"],
  ["par", "Parramatta Eels"],
  ["pen", "Penrith Panthers"],
  ["sti", "St George Illawarra Dragons"],
  ["sou", "South Sydney Rabbitohs"],
  ["syd", "Sydney Roosters"],
  ["nzl", "Warriors"],
  ["wst", "Wests Tigers"],
];

function decodeHtml(input) {
  return String(input ?? "")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&rsquo;", "'")
    .replaceAll("&lsquo;", "'")
    .replaceAll("&ndash;", "-")
    .replaceAll("&mdash;", "-")
    .replace(/\s+/g, " ")
    .trim();
}

function pageText(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<h2[^>]*>/gi, " ## ")
      .replace(/<\/h2>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function normalizeName(name) {
  const normalized = String(name ?? "")
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/te hurinui\s*['"]?apa['"]?\s*twidle/g, "apa twidle")
    .replace(/averillio/g, "averillo")
    .replace(/'junior'/g, "junior")
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9'\s-]/g, "")
    .trim();
  return normalizedAliases.get(normalized) ?? normalized;
}

function centsFromMoney(value) {
  if (!value) return null;
  const match = String(value).match(/\$?([\d.]+)\s*([mk])?/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const multiplier = match[2]?.toLowerCase() === "m" ? 1_000_000 : 1_000;
  return Math.round(amount * multiplier * 100);
}

function expandYearToken(token) {
  const range = token.match(/^(20\d{2})-(20\d{2})$/);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }
  return /^20\d{2}$/.test(token) ? [Number(token)] : [];
}

function parseTracker(text) {
  const start = text.indexOf("Updated NRL Telstra Premiership rosters");
  const end = text.indexOf("PERTH BEARS 2027 signings");
  const rosterText = text.slice(start, end > start ? end : undefined);
  const sections = new Map();

  for (let index = 0; index < teamHeadings.length; index++) {
    const [teamId, heading] = teamHeadings[index];
    const headingMarker = `## ${heading}`;
    const headingIndex = rosterText.indexOf(headingMarker);
    if (headingIndex < 0) continue;
    const nextIndexes = teamHeadings
      .slice(index + 1)
      .map(([, nextHeading]) =>
        rosterText.indexOf(`## ${nextHeading}`, headingIndex + headingMarker.length)
      )
      .filter((nextIndex) => nextIndex > headingIndex);
    const nextIndex = Math.min(...nextIndexes, rosterText.length);
    const section = rosterText
      .slice(headingIndex + headingMarker.length, nextIndex)
      .split(/2026 gains:|2026 losses:|2027 gains:|2027 losses:|2028 gains:|2028 losses:/)[0]
      .trim();

    const entries = new Map();
    const entryPattern =
      /([A-Z][A-Za-zÀ-ž'’‘.\- ]+?\*?)\s+((?:(?:20\d{2}(?:-20\d{2})?|CO|Supp|Dev|-)(?:\s+|$))+)/g;

    for (const match of section.matchAll(entryPattern)) {
      const rawName = match[1].replace(/\*$/, "").trim();
      if (!rawName || rawName.length < 3) continue;
      const tokens = match[2].trim().split(/\s+/);
      const years = tokens.flatMap(expandYearToken);
      const optionCount = tokens.filter((token) => token === "CO").length;
      const lastFirmYear = years.at(-1);
      const optionYears =
        optionCount > 0 && lastFirmYear
          ? Array.from({ length: optionCount }, (_, optionIndex) => lastFirmYear + optionIndex + 1)
          : [];
      entries.set(normalizeName(rawName), {
        rawName,
        contractYears: [...new Set(years)].sort((left, right) => left - right),
        optionYears,
        rosterTokens: tokens,
      });
      const correctedName = manualTrackerEntryCorrections.get(normalizeName(rawName));
      if (correctedName) {
        entries.set(correctedName, {
          rawName: correctedName,
          contractYears: [...new Set(years)].sort((left, right) => left - right),
          optionYears,
          rosterTokens: tokens,
        });
      }
    }

    sections.set(teamId, entries);
  }

  return sections;
}

function buildPlayerLookup(team) {
  const lookup = new Map();
  for (const player of team.players) {
    const names = [player.name, ...(player.aliases ?? [])];
    for (const name of names) {
      lookup.set(normalizeName(name), player);
    }
  }
  return lookup;
}

function deriveRange({ team, player, restCount, restPoolCents }) {
  const knownSpend = team.players.reduce((total, candidate) => {
    const estimate = candidate.salaryEstimates?.[0];
    return total + (estimate?.amountCents ?? 0);
  }, 0);
  const pool = restPoolCents ?? Math.max(top30BaseCapCents - knownSpend, minimumSalaryCents * restCount);
  const high = Math.max(minimumSalaryCents, pool - minimumSalaryCents * Math.max(restCount - 1, 0));
  const midpoint = Math.round(pool / Math.max(restCount, 1));
  const low = Math.min(minimumSalaryCents, high);
  const cappedHigh = Math.max(high, midpoint, minimumSalaryCents);

  return {
    season: 2026,
    estimateType: "derived_range",
    claimShape: "salary_cap_value",
    lowAmountCents: low,
    highAmountCents: cappedHigh,
    confidenceScore: restPoolCents ? 28 : 18,
    confidenceBand: restPoolCents ? "low" : "unknown",
    sources: restPoolCents ? ["dt-rich-list-2026"] : ["nrl-signings-tracker"],
    reasoning: restPoolCents
      ? `No player-specific salary figure found for ${player.name}. Derived a low-confidence range from the Daily Telegraph grouped rest value (${team.groupedRestValue}) and the 2026 Top 30 minimum salary floor. This is a public estimate range, not an individual reported salary.`
      : `No player-specific salary figure or grouped rest bucket was available for ${player.name}. Derived a very low-confidence range from the 2026 Top 30 cap residual and minimum salary floor. Treat as unknown-quality estimate until a player-specific source is found.`,
    evidenceRole: restPoolCents ? "derived_bucket_range" : "derived_cap_residual_range",
  };
}

const data = JSON.parse(await readFile(dataPath, "utf8"));
const trackerHtml = await (await fetch(nrlTrackerUrl)).text();
const tracker = parseTracker(pageText(trackerHtml));
const report = {
  checkedAt: new Date().toISOString(),
  nrlTrackerUrl,
  minimumSalaryCents,
  top30BaseCapCents,
  teams: [],
};

for (const team of data.teams) {
  const entries = tracker.get(team.teamId) ?? new Map();
  const playerLookup = buildPlayerLookup(team);
  const matched = [];
  const unmatched = [];

  for (const player of team.players) {
    const names = [player.name, ...(player.aliases ?? [])].map(normalizeName);
    const match = names.map((name) => entries.get(name)).find(Boolean);
    if (match?.contractYears.length) {
      player.contractYears = match.contractYears;
      player.contractSourceStatus = "official_nrl_tracker";
      player.contractSourceIds = ["nrl-signings-tracker"];
      player.contractSourceName = match.rawName;
      if (match.optionYears.length > 0) {
        player.optionYears = match.optionYears;
      } else {
        delete player.optionYears;
      }
      matched.push(player.name);
    } else {
      player.contractSourceStatus = "not_found_in_official_nrl_tracker";
      unmatched.push(player.name);
    }
  }

  const trackerOnly = [];
  for (const [normalizedName, entry] of entries) {
    if (!playerLookup.has(normalizedName)) {
      trackerOnly.push({
        name: entry.rawName,
        contractYears: entry.contractYears,
        optionYears: entry.optionYears,
      });
    }
  }

  const restPoolCents = centsFromMoney(team.groupedRestValue);
  const unknownPlayers = team.players.filter((player) => {
    const estimate = player.salaryEstimates?.[0];
    return estimate?.estimateType === "unknown";
  });

  for (const player of unknownPlayers) {
    player.salaryEstimates = [
      deriveRange({
        team,
        player,
        restCount: unknownPlayers.length,
        restPoolCents,
      }),
    ];
  }

  team.rosterInterpretation = {
    ...(team.rosterInterpretation ?? {}),
    contractYearMethod:
      "Official NRL Signings Tracker roster table applied player-by-player on 2026-07-12; unmatched names remain flagged for roster reconciliation.",
    salaryRangeMethod:
      "Players without individual salary reporting receive a low-confidence derived range from the reported grouped rest value and the 2026 Top 30 minimum salary floor, or a very low-confidence cap-residual range when no grouped rest value exists.",
  };

  const totalDerivedRanges = team.players.filter((player) =>
    player.salaryEstimates?.some((estimate) => estimate.estimateType === "derived_range")
  ).length;

  report.teams.push({
    teamId: team.teamId,
    teamName: team.teamName,
    matchedContractYears: matched.length,
    unmatchedContractYears: unmatched,
    trackerOnly,
    newlyDerivedSalaryRanges: unknownPlayers.length,
    totalDerivedSalaryRanges: totalDerivedRanges,
  });
}

data.asOfDate = "2026-07-12";
data.status = "official_terms_with_derived_salary_ranges";
data.sourcePolicy =
  "Official NRL Signings Tracker contract-year rows are applied to current roster records. Published individual salary values remain where available. Players without player-specific salary reporting are shown as low-confidence derived ranges from grouped roster buckets or cap residuals; they are not treated as reported salaries.";
data.individualSourcePass = {
  ...(data.individualSourcePass ?? {}),
  checkedAt: "2026-07-12",
  contractTermStatus: "official_nrl_tracker_applied",
  salaryCompletenessStatus: "reported_values_plus_derived_ranges",
  caveat:
    "Derived ranges complete the visualization but do not replace player-specific article review. They must remain visually low confidence.",
};

await writeFile(dataPath, JSON.stringify(data, null, 2) + "\n");
await mkdir(reportDir, { recursive: true });
await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");

console.log(
  JSON.stringify(
    {
      dataPath,
      reportPath,
      teams: report.teams.length,
      matchedContractYears: report.teams.reduce((total, team) => total + team.matchedContractYears, 0),
      unmatchedContractYears: report.teams.reduce(
        (total, team) => total + team.unmatchedContractYears.length,
        0
      ),
      totalDerivedSalaryRanges: report.teams.reduce(
        (total, team) => total + team.totalDerivedSalaryRanges,
        0
      ),
    },
    null,
    2
  )
);
