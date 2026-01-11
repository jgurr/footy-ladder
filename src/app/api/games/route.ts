import { NextRequest, NextResponse } from "next/server";
import {
  getGamesByRound,
  getGamesBySeason,
  initializeDatabase,
} from "@/lib/queries";
import { getTeamById } from "@/lib/teams";

export async function GET(request: NextRequest) {
  try {
    // Initialize database on first request
    await initializeDatabase();

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

    // Cache headers: 2025 is immutable, 2026 uses shorter cache for live updates
    const hasLiveGames = enrichedGames.some((g: any) => g.status === "live");
    const cacheControl = season === 2025
      ? "public, max-age=31536000, immutable"
      : hasLiveGames
        ? "public, max-age=30, stale-while-revalidate=60"
        : "public, max-age=3600, stale-while-revalidate=86400";

    return NextResponse.json(enrichedGames, {
      headers: { "Cache-Control": cacheControl },
    });
  } catch (error) {
    console.error("Games API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
