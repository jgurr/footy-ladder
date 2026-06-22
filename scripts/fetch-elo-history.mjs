import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const NRL_DRAW_URL = "https://www.nrl.com/draw/";
const COMPETITION_ID = 111;
const SEASONS = [2022, 2023, 2024, 2025];
const OUTPUT_PATH = resolve("src/data/elo-history.json");

const TEAM_IDS = {
  Broncos: "bri",
  Raiders: "can",
  Bulldogs: "cby",
  Sharks: "cro",
  Dolphins: "dol",
  Titans: "gld",
  "Sea Eagles": "man",
  Storm: "mel",
  Knights: "new",
  Cowboys: "nql",
  Warriors: "nzl",
  Eels: "par",
  Panthers: "pen",
  Rabbitohs: "sou",
  Dragons: "sti",
  Roosters: "syd",
  "Wests Tigers": "wst",
};

function decodeHtmlAttribute(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

async function fetchDraw(season, round) {
  const params = new URLSearchParams({
    competition: String(COMPETITION_ID),
    season: String(season),
  });
  if (round) params.set("round", String(round));

  const response = await fetch(`${NRL_DRAW_URL}?${params}`, {
    headers: { "User-Agent": "Mozilla/5.0 (Footy Ladder historical model)" },
  });
  if (!response.ok) throw new Error(`NRL draw returned ${response.status}`);

  const html = await response.text();
  const match = html.match(/id="vue-draw"[\s\S]*?\sq-data="([^"]+)"/);
  if (!match) throw new Error(`No draw payload for ${season} round ${round || "latest"}`);
  return JSON.parse(decodeHtmlAttribute(match[1]));
}

function teamId(nickname) {
  const id = TEAM_IDS[nickname];
  if (!id) throw new Error(`Unknown NRL team: ${nickname}`);
  return id;
}

const games = [];

for (const season of SEASONS) {
  const latest = await fetchDraw(season);
  const rounds = [...new Set(latest.filterRounds.map(({ value }) => Number(value)))].sort(
    (a, b) => a - b
  );

  for (const round of rounds) {
    const data = round === Number(latest.selectedRoundId) ? latest : await fetchDraw(season, round);
    for (const fixture of data.fixtures.filter(({ type }) => type === "Match")) {
      if (fixture.matchState !== "FullTime") continue;

      games.push({
        season,
        round,
        stage: fixture.roundTitle,
        kickoff: fixture.clock?.kickOffTimeLong || null,
        venue: fixture.venue || fixture.venueCity || "TBD",
        homeTeamId: teamId(fixture.homeTeam.nickName),
        awayTeamId: teamId(fixture.awayTeam.nickName),
        homeScore: Number(fixture.homeTeam.score),
        awayScore: Number(fixture.awayTeam.score),
      });
    }
  }
}

games.sort(
  (a, b) =>
    a.season - b.season ||
    a.round - b.round ||
    String(a.kickoff).localeCompare(String(b.kickoff))
);

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(games, null, 2)}\n`);

const counts = Object.fromEntries(
  SEASONS.map((season) => {
    const seasonGames = games.filter((game) => game.season === season);
    return [
      season,
      {
        games: seasonGames.length,
        finals: seasonGames.filter((game) => !/^Round \d+$/.test(game.stage)).length,
      },
    ];
  })
);

console.log(JSON.stringify({ output: OUTPUT_PATH, total: games.length, seasons: counts }, null, 2));
