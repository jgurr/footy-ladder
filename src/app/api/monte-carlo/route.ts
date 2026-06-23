import { NextRequest, NextResponse } from "next/server";
import { getSeasonCacheControl } from "@/lib/cache";
import { buildMonteCarloData } from "@/lib/monte-carlo";
import { getGamesBySeason, getLadder } from "@/lib/queries";

export async function GET(request: NextRequest) {
  try {
    const season = Number(request.nextUrl.searchParams.get("season") || 2026);
    const iterations = Number(request.nextUrl.searchParams.get("iterations") || 20_000);
    const [ladder, games] = await Promise.all([getLadder(season), getGamesBySeason(season)]);

    return NextResponse.json(buildMonteCarloData(season, ladder, games, iterations), {
      headers: { "Cache-Control": getSeasonCacheControl(season) },
    });
  } catch (error) {
    console.error("Monte Carlo API error:", error);
    return NextResponse.json({ error: "Failed to run Monte Carlo simulation" }, { status: 500 });
  }
}
