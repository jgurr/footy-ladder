import { NextRequest, NextResponse } from "next/server";
import {
  getLadder,
  getNext5ForAllTeams,
  getTotalByesForSeason,
} from "@/lib/queries";
import { getSeasonCacheControl } from "@/lib/cache";
import { getSeasonStatus } from "@/lib/status";

export async function GET(request: NextRequest) {
  try {

    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2026");
    const round = searchParams.get("round")
      ? parseInt(searchParams.get("round")!)
      : undefined;

    // Get current ladder to know positions
    const ladder = await getLadder(season, round);
    const currentRound = round || ladder[0]?.round || 1;
    const firstFutureRound = currentRound + 1;

    // Build position map
    const positions = new Map<string, number>();
    for (const entry of ladder) {
      positions.set(entry.team.id, entry.position);
    }

    // Get next 5 fixtures for all teams
    const next5Map = await getNext5ForAllTeams(season, firstFutureRound, positions);

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

    // Get round numbers for column headers (next 5 rounds)
    const roundNumbers = Array.from({ length: 5 }, (_, i) => firstFutureRound + i).filter(
      (r) => r <= 27
    );

    const status = await getSeasonStatus(season);

    return NextResponse.json({
      season,
      currentRound,
      firstFutureRound,
      roundNumbers,
      totalByes: getTotalByesForSeason(season),
      fixtures: result,
    }, {
      headers: {
        "Cache-Control": getSeasonCacheControl(season, {
          hasLiveGames: status.liveGames > 0,
        }),
      },
    });
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}
