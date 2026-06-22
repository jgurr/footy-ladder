import { NextRequest, NextResponse } from "next/server";
import { getSeasonCacheControl } from "@/lib/cache";
import { getGamesBySeason, getLadder } from "@/lib/queries";
import { buildRunHomeData } from "@/lib/run-home";

export async function GET(request: NextRequest) {
  try {
    const season = Number(request.nextUrl.searchParams.get("season") || 2026);
    const [ladder, games] = await Promise.all([getLadder(season), getGamesBySeason(season)]);
    return NextResponse.json(buildRunHomeData(season, ladder, games), {
      headers: { "Cache-Control": getSeasonCacheControl(season) },
    });
  } catch (error) {
    console.error("Run home API error:", error);
    return NextResponse.json({ error: "Failed to calculate the run home" }, { status: 500 });
  }
}
