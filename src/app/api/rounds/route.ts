import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { initializeDatabase } from "@/lib/queries";

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();

    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2025");

    const db = getDb();

    // Get distinct rounds that have completed games
    const rows = db
      .prepare(
        `
        SELECT DISTINCT round
        FROM games
        WHERE season = ? AND status = 'final'
        ORDER BY round DESC
      `
      )
      .all(season) as { round: number }[];

    const rounds = rows.map((r) => r.round);

    return NextResponse.json({
      season,
      rounds,
      latestRound: rounds[0] || 1,
    });
  } catch (error) {
    console.error("Rounds API error:", error);
    return NextResponse.json({ error: "Failed to fetch rounds" }, { status: 500 });
  }
}
