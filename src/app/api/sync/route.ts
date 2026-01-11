import { NextRequest, NextResponse } from "next/server";
import { updateGameScore, getGamesByRound, initializeDatabase } from "@/lib/queries";
import type { GameStatus } from "@/lib/types";

/**
 * Manual score sync endpoint
 *
 * POST /api/sync
 * Body: {
 *   gameId: string,
 *   homeScore: number,
 *   awayScore: number,
 *   status: "scheduled" | "live" | "final" | "postponed",
 *   minute?: number
 * }
 *
 * Or for bulk updates:
 * Body: {
 *   games: Array<{
 *     gameId: string,
 *     homeScore: number,
 *     awayScore: number,
 *     status: GameStatus,
 *     minute?: number
 *   }>
 * }
 *
 * Protected by SYNC_SECRET environment variable
 */
export async function POST(request: NextRequest) {
  // Check authorization - SYNC_SECRET must be set and match
  const authHeader = request.headers.get("authorization");
  const syncSecret = process.env.SYNC_SECRET;

  if (!syncSecret || authHeader !== `Bearer ${syncSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    initializeDatabase();

    const body = await request.json();

    // Handle bulk updates
    if (body.games && Array.isArray(body.games)) {
      const results = [];
      for (const game of body.games) {
        updateGameScore(
          game.gameId,
          game.homeScore,
          game.awayScore,
          game.status as GameStatus,
          game.minute
        );
        results.push({ gameId: game.gameId, status: "updated" });
      }
      return NextResponse.json({
        success: true,
        updated: results.length,
        results,
      });
    }

    // Handle single update
    if (body.gameId) {
      updateGameScore(
        body.gameId,
        body.homeScore,
        body.awayScore,
        body.status as GameStatus,
        body.minute
      );
      return NextResponse.json({
        success: true,
        gameId: body.gameId,
      });
    }

    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync scores" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync?season=2026&round=1
 * Returns current games for a round (for debugging/admin)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const season = parseInt(searchParams.get("season") || "2026");
  const round = searchParams.get("round")
    ? parseInt(searchParams.get("round")!)
    : 1;

  try {
    initializeDatabase();
    const games = getGamesByRound(season, round);

    return NextResponse.json({
      season,
      round,
      games: games.map((g) => ({
        id: g.id,
        homeTeamId: g.homeTeamId,
        awayTeamId: g.awayTeamId,
        homeScore: g.homeScore,
        awayScore: g.awayScore,
        status: g.status,
        minute: g.minute,
        kickoff: g.kickoff,
      })),
    });
  } catch (error) {
    console.error("Sync GET error:", error);
    return NextResponse.json(
      { error: "Failed to get games" },
      { status: 500 }
    );
  }
}
