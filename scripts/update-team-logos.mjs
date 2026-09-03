import { fileURLToPath } from "node:url";
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const NRL_THEME_ROOT = "https://www.nrl.com/.theme";

/**
 * Asset variants currently used by the official NRL clubs directory.
 *
 * `compact` is NRL's basic24 artwork for small UI placements. `full` is the
 * complete club badge used when there is enough room for the additional detail.
 */
export const TEAM_LOGO_SOURCES = [
  { id: "bri", slug: "broncos", compact: "badge-basic24-light.svg", full: "badge-light.svg" },
  { id: "can", slug: "raiders", compact: "badge-basic24.svg", full: "badge-light.svg" },
  { id: "cby", slug: "bulldogs", compact: "badge-basic24.svg", full: "badge-light.svg" },
  { id: "cro", slug: "sharks", compact: "badge-basic24-light.svg", full: "badge-light.svg" },
  { id: "dol", slug: "dolphins", compact: "badge-basic24.svg", full: "badge-light.svg" },
  { id: "gld", slug: "titans", compact: "badge-basic24.svg", full: "badge.svg" },
  { id: "man", slug: "sea-eagles", compact: "badge-basic24.svg", full: "badge-light.svg" },
  { id: "mel", slug: "storm", compact: "badge-basic24-light.svg", full: "badge-light.svg" },
  { id: "new", slug: "knights", compact: "badge-basic24.svg", full: "badge-light.svg" },
  { id: "nql", slug: "cowboys", compact: "badge-basic24-light.svg", full: "badge-light.svg" },
  { id: "nzl", slug: "warriors", compact: "badge-basic24.svg", full: "badge-light.svg" },
  { id: "par", slug: "eels", compact: "badge-basic24.svg", full: "badge.svg" },
  { id: "pen", slug: "panthers", compact: "badge-basic24.svg", full: "badge-light.svg" },
  { id: "sou", slug: "rabbitohs", compact: "badge-basic24-light.svg", full: "badge-light.svg" },
  { id: "sti", slug: "dragons", compact: "badge-basic24-light.svg", full: "badge-light.svg" },
  { id: "syd", slug: "roosters", compact: "badge-basic24.svg", full: "badge.svg" },
  { id: "wst", slug: "wests-tigers", compact: "badge-basic24.svg", full: "badge-light.svg" },
];

function validateSvg(svg, sourceUrl) {
  if (!/<svg(?:\s|>)/i.test(svg)) {
    throw new Error(`Official asset was not SVG: ${sourceUrl}`);
  }

  if (/<(?:script|foreignObject)(?:\s|>)/i.test(svg) || /\son\w+\s*=/i.test(svg)) {
    throw new Error(`Official asset contains unsupported active content: ${sourceUrl}`);
  }
}

async function downloadSvg(sourceUrl, destination) {
  const response = await fetch(sourceUrl, {
    headers: {
      Accept: "image/svg+xml",
      "User-Agent": "Footy Ladder official asset updater",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourceUrl}: ${response.status} ${response.statusText}`);
  }

  const svg = (await response.text()).trim();
  validateSvg(svg, sourceUrl);

  const temporaryDestination = `${destination}.tmp`;
  await writeFile(temporaryDestination, `${svg}\n`, "utf8");
  await rename(temporaryDestination, destination);
}

export async function updateTeamLogos({ rootDir = process.cwd() } = {}) {
  const assetRoot = path.join(rootDir, "public", "team-logos");
  let downloaded = 0;

  await Promise.all(
    TEAM_LOGO_SOURCES.map(async ({ id, slug, compact, full }) => {
      const teamDirectory = path.join(assetRoot, id);
      await mkdir(teamDirectory, { recursive: true });

      await Promise.all([
        downloadSvg(`${NRL_THEME_ROOT}/${slug}/${compact}`, path.join(teamDirectory, "badge-24.svg")),
        downloadSvg(`${NRL_THEME_ROOT}/${slug}/${full}`, path.join(teamDirectory, "badge.svg")),
      ]);

      downloaded += 2;
    })
  );

  return { downloaded, teams: TEAM_LOGO_SOURCES.length };
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  const result = await updateTeamLogos();
  console.log(`Downloaded ${result.downloaded} official NRL logo assets for ${result.teams} teams.`);
}
