import { NextRequest, NextResponse } from "next/server";
import { getGamesBySeason } from "@/lib/queries";
import { getTeamById } from "@/lib/teams";
import { getSeasonCacheControl } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2026");

    const games = await getGamesBySeason(season);

    // Only return scheduled games (not yet played)
    const scheduledGames = games.filter((game) => game.status === "scheduled");

    // Group by round and enrich with team data
    const byRound: Record<
      number,
      Array<{
        id: string;
        homeTeam: ReturnType<typeof getTeamById>;
        awayTeam: ReturnType<typeof getTeamById>;
        venue: string;
        kickoff: string | null;
        status: string;
      }>
    > = {};

    for (const game of scheduledGames) {
      if (!byRound[game.round]) {
        byRound[game.round] = [];
      }
      byRound[game.round].push({
        id: game.id,
        homeTeam: getTeamById(game.homeTeamId),
        awayTeam: getTeamById(game.awayTeamId),
        venue: game.venue,
        kickoff: game.kickoff,
        status: game.status,
      });
    }

    return NextResponse.json({
      season,
      totalGames: scheduledGames.length,
      rounds: Object.entries(byRound).map(([round, games]) => ({
        round: parseInt(round),
        games,
      })),
    }, {
      headers: {
        "Cache-Control": getSeasonCacheControl(season),
      },
    });
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
