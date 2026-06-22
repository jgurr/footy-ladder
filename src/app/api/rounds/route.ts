import { NextRequest, NextResponse } from "next/server";
import {
  getAvailableLadderRounds,
  getLatestLadderRound,
} from "@/lib/queries";
import { getSeasonCacheControl } from "@/lib/cache";
import { getSeasonStatus } from "@/lib/status";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2026");

    const [ladderRounds, latestRound, status] = await Promise.all([
      getAvailableLadderRounds(season),
      getLatestLadderRound(season),
      getSeasonStatus(season),
    ]);
    const rounds =
      ladderRounds.length > 0
        ? ladderRounds
        : Array.from({ length: latestRound }, (_, index) => latestRound - index);

    return NextResponse.json({
      season,
      rounds,
      latestRound,
    }, {
      headers: {
        "Cache-Control": getSeasonCacheControl(season, {
          hasLiveGames: status.liveGames > 0,
        }),
      },
    });
  } catch (error) {
    console.error("Rounds API error:", error);
    return NextResponse.json({ error: "Failed to fetch rounds" }, { status: 500 });
  }
}
