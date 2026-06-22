import { getGamesBySeason } from "./queries";
import { getSeasonStatus } from "./status";
import { getTeamById } from "./teams";
import type { GameWithTeams } from "./types";

export interface LiveSummary {
  season: number;
  lastSyncedAt: string | null;
  latestFinalRound: number;
  nextScheduledRound: number | null;
  liveGames: GameWithTeams[];
}

export async function getLiveSummary(season: number): Promise<LiveSummary> {
  const [games, status] = await Promise.all([
    getGamesBySeason(season),
    getSeasonStatus(season),
  ]);

  const liveGames = games
    .filter((game) => game.status === "live")
    .sort((a, b) => {
      const aKickoff = a.kickoff ? new Date(a.kickoff).getTime() : 0;
      const bKickoff = b.kickoff ? new Date(b.kickoff).getTime() : 0;
      return aKickoff - bKickoff;
    })
    .map((game) => ({
      ...game,
      homeTeam: getTeamById(game.homeTeamId)!,
      awayTeam: getTeamById(game.awayTeamId)!,
    }));

  return {
    season,
    lastSyncedAt: status.lastSyncedAt,
    latestFinalRound: status.latestFinalRound,
    nextScheduledRound: status.nextScheduledRound,
    liveGames,
  };
}
