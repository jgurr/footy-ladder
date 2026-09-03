import { NextRequest, NextResponse } from "next/server";
import { getSeasonCacheControl } from "@/lib/cache";
import { getFinalsData } from "@/lib/finals";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const season = Number(request.nextUrl.searchParams.get("season") || "2026");
    const data = await getFinalsData(season);
    const hasLiveGames = Object.values(data.matches).some(
      (match) => match.status === "live"
    );

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": getSeasonCacheControl(season, { hasLiveGames }),
      },
    });
  } catch (error) {
    console.error("Finals API error:", error);
    return NextResponse.json(
      { error: "Failed to build finals bracket" },
      { status: 500 }
    );
  }
}
