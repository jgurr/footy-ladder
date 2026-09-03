import { NextRequest, NextResponse } from "next/server";
import { refreshOfficialGameRounds } from "@/lib/live-refresh";
import { getGamesBySeason, initializeDatabase } from "@/lib/queries";
import { findSyncTargetRounds } from "@/lib/sync-window";

export const dynamic = "force-dynamic";

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
    let rounds = requestedRound ? [Number(requestedRound)] : [];

    if (rounds.length === 0) {
      await initializeDatabase();
      rounds = findSyncTargetRounds(await getGamesBySeason(season));

      if (rounds.length === 0) {
        return NextResponse.json({
          success: true,
          source: "nrl-official-draw",
          mode: "skipped-outside-game-window",
          season,
          syncedRounds: [],
        });
      }

    }

    const refresh = await refreshOfficialGameRounds(season, rounds);

    if (!refresh.refreshed) {
      return NextResponse.json({
        success: true,
        source: "nrl-official-draw",
        mode: `skipped-${refresh.reason}`,
        season,
        syncedRounds: [],
      });
    }

    return NextResponse.json({
      success: true,
      source: "nrl-official-draw",
      mode: requestedRound ? "requested-round" : "target-rounds",
      ...refresh.sync,
    });
  } catch (error) {
    console.error("Cron sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync official draw" },
      { status: 500 }
    );
  }
}
