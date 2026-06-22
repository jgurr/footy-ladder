import { NextRequest, NextResponse } from "next/server";
import { getSeasonCacheControl } from "@/lib/cache";
import { getSeasonStatus } from "@/lib/status";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2026");
    const status = await getSeasonStatus(season);

    return NextResponse.json(
      {
        season,
        ...status,
      },
      {
        headers: {
          "Cache-Control": getSeasonCacheControl(season, {
            hasLiveGames: status.liveGames > 0,
          }),
        },
      }
    );
  } catch (error) {
    console.error("Status API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
