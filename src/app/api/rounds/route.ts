import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(request: NextRequest) {
  try {

    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2025");

    // Get distinct rounds that have games (any status)
    const { rows } = await sql`
      SELECT DISTINCT round
      FROM games
      WHERE season = ${season}
      ORDER BY round DESC
    `;

    // Also get the latest round with final games for default selection
    const { rows: finalRows } = await sql`
      SELECT DISTINCT round
      FROM games
      WHERE season = ${season} AND status = 'final'
      ORDER BY round DESC
      LIMIT 1
    `;

    const rounds = rows.map((r) => r.round);
    const latestFinalRound = finalRows[0]?.round || 1;

    // Cache headers: 2025 is immutable, 2026 revalidates hourly
    const cacheControl = season === 2025
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600, stale-while-revalidate=86400";

    return NextResponse.json({
      season,
      rounds,
      latestRound: latestFinalRound || rounds[0] || 1,
    }, {
      headers: { "Cache-Control": cacheControl },
    });
  } catch (error) {
    console.error("Rounds API error:", error);
    return NextResponse.json({ error: "Failed to fetch rounds" }, { status: 500 });
  }
}
