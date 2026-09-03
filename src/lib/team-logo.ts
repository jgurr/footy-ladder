export const COMPACT_TEAM_LOGO_MAX_SIZE = 24;

export const TEAM_LOGO_IDS = [
  "bri",
  "can",
  "cby",
  "cro",
  "dol",
  "gld",
  "man",
  "mel",
  "new",
  "nql",
  "nzl",
  "par",
  "pen",
  "sou",
  "sti",
  "syd",
  "wst",
] as const;

export type TeamLogoId = (typeof TEAM_LOGO_IDS)[number];
export type TeamLogoVariant = "auto" | "compact" | "full";

const TEAM_LOGO_ID_SET = new Set<string>(TEAM_LOGO_IDS);

export function isTeamLogoId(teamId: string): teamId is TeamLogoId {
  return TEAM_LOGO_ID_SET.has(teamId.toLowerCase());
}

export function getTeamLogoSrc(
  teamId: string,
  size: number,
  variant: TeamLogoVariant = "auto"
): string | null {
  const normalizedTeamId = teamId.toLowerCase();
  if (!isTeamLogoId(normalizedTeamId)) return null;

  const useCompactAsset =
    variant === "compact" || (variant === "auto" && size <= COMPACT_TEAM_LOGO_MAX_SIZE);

  return `/team-logos/${normalizedTeamId}/${useCompactAsset ? "badge-24.svg" : "badge.svg"}`;
}
