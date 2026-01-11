import { NextRequest, NextResponse } from "next/server";
import {
  getLadder,
  getNext5ForAllTeams,
  getTotalByesForSeason,
  initializeDatabase,
} from "@/lib/queries";

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();

    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2026");
    const round = searchParams.get("round")
      ? parseInt(searchParams.get("round")!)
      : undefined;

    // Get current ladder to know positions
    const ladder = await getLadder(season, round);
    const currentRound = ladder[0]?.round || 0;

    // Build position map
    const positions = new Map<string, number>();
    for (const entry of ladder) {
      positions.set(entry.team.id, entry.position);
    }

    // Get next 5 fixtures for all teams
    const next5Map = await getNext5ForAllTeams(season, currentRound, positions);

    // Format response
    const result: Record<
      string,
      Array<{
        round: number;
        opponentId: string | null;
        isHome: boolean;
        opponentPosition: number;
      }>
    > = {};

    for (const [teamId, fixtures] of next5Map) {
      result[teamId] = fixtures;
    }

    // Get round numbers for column headers (current round + next 4)
    const roundNumbers = Array.from({ length: 5 }, (_, i) => currentRound + i).filter(
      (r) => r <= 27
    );

    // Cache headers: 2025 is immutable, 2026 revalidates hourly
    const cacheControl = season === 2025
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600, stale-while-revalidate=86400";

    return NextResponse.json({
      season,
      currentRound,
      roundNumbers,
      totalByes: getTotalByesForSeason(season),
      fixtures: result,
    }, {
      headers: { "Cache-Control": cacheControl },
    });
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}
