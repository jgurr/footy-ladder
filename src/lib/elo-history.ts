import historicalGamesJson from "@/data/elo-history.json";
import type { Game } from "./types";
import type { EloGame } from "./elo";

export const HISTORICAL_ELO_SEASONS = "2022-2025";

export const historicalEloGames = historicalGamesJson as EloGame[];

export function buildEloModelGames(season: number, seasonGames: Game[]): EloGame[] {
  const completedCurrentGames = seasonGames
    .filter(
      (game): game is Game & { homeScore: number; awayScore: number } =>
        game.status === "final" && game.homeScore !== null && game.awayScore !== null
    )
    .map((game) => ({
      season: game.season,
      round: game.round,
      kickoff: game.kickoff,
      venue: game.venue,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      stage: `Round ${game.round}`,
    }));

  return [
    ...historicalEloGames,
    ...(season > 2025 ? completedCurrentGames : []),
  ];
}
