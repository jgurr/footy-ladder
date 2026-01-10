import { NextRequest } from "next/server";
import { getGamesByRound, initializeDatabase } from "@/lib/queries";
import { getTeamById } from "@/lib/teams";

/**
 * Server-Sent Events endpoint for live score updates
 *
 * Usage:
 * const eventSource = new EventSource('/api/live?season=2026&round=1');
 * eventSource.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 *   // Update UI with live scores
 * };
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const season = parseInt(searchParams.get("season") || "2026");
  const round = searchParams.get("round")
    ? parseInt(searchParams.get("round")!)
    : undefined;

  // Initialize database
  initializeDatabase();

  // Create a readable stream for SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial data immediately
      const sendUpdate = () => {
        try {
          // Get current round's games (if round not specified, find current live round)
          let currentRound = round;

          if (!currentRound) {
            // Find the round with live games, or the latest round
            for (let r = 1; r <= 27; r++) {
              const games = getGamesByRound(season, r);
              const hasLive = games.some((g) => g.status === "live");
              if (hasLive) {
                currentRound = r;
                break;
              }
            }
            // Default to round 1 if no live games
            if (!currentRound) currentRound = 1;
          }

          const games = getGamesByRound(season, currentRound);

          // Enrich with team data
          const enrichedGames = games.map((game) => ({
            id: game.id,
            round: game.round,
            homeTeam: getTeamById(game.homeTeamId),
            awayTeam: getTeamById(game.awayTeamId),
            homeScore: game.homeScore,
            awayScore: game.awayScore,
            status: game.status,
            minute: game.minute,
            venue: game.venue,
            kickoff: game.kickoff,
          }));

          const data = JSON.stringify({
            type: "games",
            season,
            round: currentRound,
            games: enrichedGames,
            timestamp: new Date().toISOString(),
          });

          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch (error) {
          console.error("SSE update error:", error);
        }
      };

      // Send initial update
      sendUpdate();

      // Poll every 30 seconds for updates
      const interval = setInterval(sendUpdate, 30000);

      // Send heartbeat every 15 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          // Connection closed
        }
      }, 15000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  });
}
