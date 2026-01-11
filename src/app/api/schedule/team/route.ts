import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/database";
import { initializeDatabase } from "@/lib/queries";

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
    initializeDatabase();

    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2025");
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json({ error: "teamId required" }, { status: 400 });
    }

    const db = getDb();

    // Get all games for this team in the season
    const rows = db
      .prepare(
        `
        SELECT
          g.id,
          g.round,
          g.home_team_id as homeTeamId,
          ht.short_code as homeTeamCode,
          g.away_team_id as awayTeamId,
          at.short_code as awayTeamCode,
          g.home_score as homeScore,
          g.away_score as awayScore,
          g.venue,
          g.kickoff,
          g.status
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.id
        JOIN teams at ON g.away_team_id = at.id
        WHERE g.season = ? AND (g.home_team_id = ? OR g.away_team_id = ?)
        ORDER BY g.round ASC
      `
      )
      .all(season, teamId, teamId) as {
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
      }[];

    const games: Game[] = rows.map((row) => {
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
    const team = db
      .prepare(
        `SELECT id, name, short_code as shortCode, primary_color as primaryColor, secondary_color as secondaryColor
         FROM teams WHERE id = ?`
      )
      .get(teamId) as { id: string; name: string; shortCode: string; primaryColor: string; secondaryColor: string } | undefined;

    // Get latest completed round for highlighting
    const latestRoundRow = db
      .prepare(
        `SELECT MAX(round) as latestRound FROM games WHERE season = ? AND status = 'final'`
      )
      .get(season) as { latestRound: number | null };

    return NextResponse.json({
      season,
      teamId,
      team,
      games,
      latestRound: latestRoundRow?.latestRound || 1,
    });
  } catch (error) {
    console.error("Team schedule API error:", error);
    return NextResponse.json({ error: "Failed to fetch team schedule" }, { status: 500 });
  }
}
