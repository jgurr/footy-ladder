import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

interface Game {
  id: string;
  round: number;
  homeTeamId: string;
  homeTeamCode: string;
  awayTeamId: string;
  awayTeamCode: string;
  homeScore: number | null;
  awayScore: number | null;
  venue: string;
  kickoff: string;
  status: string;
  isHome: boolean;
  opponentId: string;
  opponentCode: string;
  teamScore: number | null;
  opponentScore: number | null;
  result: "W" | "L" | "D" | null;
}

export async function GET(request: NextRequest) {
  try {

    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2025");
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json({ error: "teamId required" }, { status: 400 });
    }

    // Get all games for this team in the season
    const { rows } = await sql`
      SELECT
        g.id,
        g.round,
        g.home_team_id as "homeTeamId",
        ht.short_code as "homeTeamCode",
        g.away_team_id as "awayTeamId",
        at.short_code as "awayTeamCode",
        g.home_score as "homeScore",
        g.away_score as "awayScore",
        g.venue,
        g.kickoff,
        g.status
      FROM games g
      JOIN teams ht ON g.home_team_id = ht.id
      JOIN teams at ON g.away_team_id = at.id
      WHERE g.season = ${season} AND (g.home_team_id = ${teamId} OR g.away_team_id = ${teamId})
      ORDER BY g.round ASC
    `;

    const games: Game[] = rows.map((row: any) => {
      const isHome = row.homeTeamId === teamId;
      const teamScore = isHome ? row.homeScore : row.awayScore;
      const opponentScore = isHome ? row.awayScore : row.homeScore;

      let result: "W" | "L" | "D" | null = null;
      if (teamScore !== null && opponentScore !== null) {
        if (teamScore > opponentScore) result = "W";
        else if (teamScore < opponentScore) result = "L";
        else result = "D";
      }

      return {
        ...row,
        isHome,
        opponentId: isHome ? row.awayTeamId : row.homeTeamId,
        opponentCode: isHome ? row.awayTeamCode : row.homeTeamCode,
        teamScore,
        opponentScore,
        result,
      };
    });

    // Get team details
    const { rows: teamRows } = await sql`
      SELECT id, name, short_code as "shortCode", primary_color as "primaryColor", secondary_color as "secondaryColor"
      FROM teams WHERE id = ${teamId}
    `;
    const team = teamRows[0];

    // Get latest completed round for highlighting
    const { rows: latestRows } = await sql`
      SELECT MAX(round) as "latestRound" FROM games WHERE season = ${season} AND status = 'final'
    `;

    // Cache headers: 2025 is immutable, 2026 revalidates hourly
    const cacheControl = season === 2025
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600, stale-while-revalidate=86400";

    return NextResponse.json({
      season,
      teamId,
      team,
      games,
      latestRound: latestRows[0]?.latestRound || 1,
    }, {
      headers: { "Cache-Control": cacheControl },
    });
  } catch (error) {
    console.error("Team schedule API error:", error);
    return NextResponse.json({ error: "Failed to fetch team schedule" }, { status: 500 });
  }
}
