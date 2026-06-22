import { NextRequest, NextResponse } from "next/server";
import { getSeasonCacheControl } from "@/lib/cache";
import { getLiveSummary } from "@/lib/live-summary";

export async function GET(request: NextRequest) {
  try {
    const season = Number(request.nextUrl.searchParams.get("season") || "2026");
    const summary = await getLiveSummary(season);

    return NextResponse.json(summary, {
      headers: {
        "Cache-Control": getSeasonCacheControl(season, {
          hasLiveGames: summary.liveGames.length > 0,
        }),
      },
    });
  } catch (error) {
    console.error("Live summary API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch live summary" },
      { status: 500 }
    );
  }
}
