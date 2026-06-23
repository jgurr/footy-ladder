import { NextRequest, NextResponse } from "next/server";
import { getSeasonCacheControl } from "@/lib/cache";
import { calculateEloRatings, calculateEloRoundSnapshots, rankEloRatings } from "@/lib/elo";
import { buildEloModelGames, HISTORICAL_ELO_SEASONS } from "@/lib/elo-history";
import { getGamesBySeason } from "@/lib/queries";
import { NRL_TEAMS } from "@/lib/teams";

export async function GET(request: NextRequest) {
  try {
    const season = Number(request.nextUrl.searchParams.get("season") || 2026);
    const games = await getGamesBySeason(season);
    const modelGames = buildEloModelGames(season, games);
    const teamIds = NRL_TEAMS.map((team) => team.id);
    const snapshots = calculateEloRoundSnapshots(modelGames, teamIds);
    const { ratings, gamesProcessed } = calculateEloRatings(modelGames);
    const powerRanks = rankEloRatings(ratings, teamIds);

    return NextResponse.json({
      season,
      model: {
        gamesProcessed,
        historicalSeasons: HISTORICAL_ELO_SEASONS,
        currentSeasonIncluded: season > 2025,
        snapshots: snapshots.length,
      },
      teams: NRL_TEAMS.map((team) => ({
        ...team,
        powerRank: powerRanks.get(team.id),
        currentElo: Math.round(ratings.get(team.id) ?? 1500),
      })),
      snapshots,
    }, {
      headers: { "Cache-Control": getSeasonCacheControl(season) },
    });
  } catch (error) {
    console.error("Elo history API error:", error);
    return NextResponse.json({ error: "Failed to calculate Elo history" }, { status: 500 });
  }
}
