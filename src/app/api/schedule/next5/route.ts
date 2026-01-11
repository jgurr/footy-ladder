import { NextRequest, NextResponse } from "next/server";
import {
  getLadder,
  getNext5ForAllTeams,
  getTotalByesForSeason,
  initializeDatabase,
} from "@/lib/queries";

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();

    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2026");
    const round = searchParams.get("round")
      ? parseInt(searchParams.get("round")!)
      : undefined;

    // Get current ladder to know positions
    const ladder = getLadder(season, round);
    const currentRound = ladder[0]?.round || 0;

    // Build position map
    const positions = new Map<string, number>();
    for (const entry of ladder) {
      positions.set(entry.team.id, entry.position);
    }

    // Get next 5 fixtures for all teams
    const next5Map = getNext5ForAllTeams(season, currentRound, positions);

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

    // Get round numbers for column headers
    const roundNumbers = Array.from({ length: 5 }, (_, i) => currentRound + 1 + i).filter(
      (r) => r <= 27
    );

    return NextResponse.json({
      season,
      currentRound,
      roundNumbers,
      totalByes: getTotalByesForSeason(season),
      fixtures: result,
    });
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}
