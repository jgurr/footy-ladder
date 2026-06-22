import { NextRequest, NextResponse } from "next/server";
import { getGamesByRound, getGamesBySeason } from "@/lib/queries";
import { getTeamById } from "@/lib/teams";
import { getSeasonCacheControl } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {

    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2026");
    const round = searchParams.get("round")
      ? parseInt(searchParams.get("round")!)
      : undefined;

    let games;

    if (round) {
      games = await getGamesByRound(season, round);
    } else {
      games = await getGamesBySeason(season);
    }

    // Enrich games with team data
    const enrichedGames = games.map((game) => ({
      ...game,
      homeTeam: getTeamById(game.homeTeamId),
      awayTeam: getTeamById(game.awayTeamId),
    }));

    const hasLiveGames = enrichedGames.some((g: any) => g.status === "live");

    return NextResponse.json(enrichedGames, {
      headers: {
        "Cache-Control": getSeasonCacheControl(season, { hasLiveGames }),
      },
    });
  } catch (error) {
    console.error("Games API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
