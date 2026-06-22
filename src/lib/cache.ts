export function getSeasonCacheControl(
  season: number,
  options: { hasLiveGames?: boolean } = {}
): string {
  if (season < new Date().getFullYear()) {
    return "public, max-age=31536000, immutable";
  }

  if (options.hasLiveGames) {
    return "public, max-age=10, s-maxage=15, stale-while-revalidate=45";
  }

  return "public, max-age=30, s-maxage=60, stale-while-revalidate=300";
}
