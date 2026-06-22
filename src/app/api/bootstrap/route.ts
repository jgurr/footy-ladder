import { NextRequest, NextResponse } from "next/server";
import { getBootstrapData } from "@/lib/bootstrap";
import { getSeasonCacheControl } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const season = Number(request.nextUrl.searchParams.get("season") || "2026");
    const data = await getBootstrapData(season);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": getSeasonCacheControl(season, {
          hasLiveGames: data.status.liveGames > 0,
        }),
      },
    });
  } catch (error) {
    console.error("Bootstrap API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bootstrap data" },
      { status: 500 }
    );
  }
}
