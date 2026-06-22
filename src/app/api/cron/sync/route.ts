import { NextRequest, NextResponse } from "next/server";
import { syncOfficialDrawGames } from "@/lib/nrl-draw";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET || process.env.SYNC_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const season = Number(
      request.nextUrl.searchParams.get("season") || new Date().getFullYear()
    );
    const requestedRound = request.nextUrl.searchParams.get("round");
    const round = requestedRound ? Number(requestedRound) : undefined;
    const result = await syncOfficialDrawGames(season, {
      allAvailableRounds: false,
      round,
    });

    return NextResponse.json({
      success: true,
      source: "nrl-official-draw",
      mode: round ? "requested-round" : "current-round",
      ...result,
    });
  } catch (error) {
    console.error("Cron sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync official draw" },
      { status: 500 }
    );
  }
}
