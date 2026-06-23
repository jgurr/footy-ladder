export const ELO_BASELINE = 1500;
export const ELO_K_FACTOR = 8;
export const ELO_HOME_ADVANTAGE = 50;
export const ELO_SEASON_REGRESSION = 0;

export interface EloGame {
  season: number;
  round: number;
  kickoff: string | null;
  venue: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  stage?: string;
}

export interface EloResult {
  ratings: Map<string, number>;
  gamesProcessed: number;
}

export interface EloRoundSnapshot {
  index: number;
  season: number;
  round: number;
  label: string;
  kickoff: string | null;
  ratings: Record<string, number>;
}

export function expectedWinProbability(
  teamRating: number,
  opponentRating: number,
  contextAdvantage = 0
): number {
  return 1 / (1 + 10 ** ((opponentRating - teamRating - contextAdvantage) / 400));
}

function isNeutralGame(game: EloGame): boolean {
  return game.venue === "Allegiant Stadium" || game.stage === "Grand Final";
}

function marginMultiplier(margin: number, ratingDifference: number): number {
  if (margin === 0) return 1;
  return Math.max(
    1,
    (Math.log(margin + 1) * 2.2) / (Math.abs(ratingDifference) * 0.001 + 2.2)
  );
}

export function calculateEloRatings(games: EloGame[]): EloResult {
  const ratings = new Map<string, number>();
  const sortedGames = [...games].sort(
    (a, b) =>
      a.season - b.season ||
      a.round - b.round ||
      String(a.kickoff).localeCompare(String(b.kickoff))
  );
  let currentSeason = sortedGames[0]?.season;

  for (const game of sortedGames) {
    if (currentSeason !== undefined && game.season !== currentSeason) {
      for (const [teamId, rating] of ratings) {
        ratings.set(
          teamId,
          ELO_BASELINE + (rating - ELO_BASELINE) * (1 - ELO_SEASON_REGRESSION)
        );
      }
      currentSeason = game.season;
    }

    const homeRating = ratings.get(game.homeTeamId) ?? ELO_BASELINE;
    const awayRating = ratings.get(game.awayTeamId) ?? ELO_BASELINE;
    const homeAdvantage = isNeutralGame(game) ? 0 : ELO_HOME_ADVANTAGE;
    const expectedHome = expectedWinProbability(homeRating, awayRating, homeAdvantage);
    const actualHome =
      game.homeScore === game.awayScore ? 0.5 : game.homeScore > game.awayScore ? 1 : 0;
    const multiplier = marginMultiplier(
      Math.abs(game.homeScore - game.awayScore),
      homeRating - awayRating
    );
    const change = ELO_K_FACTOR * multiplier * (actualHome - expectedHome);

    ratings.set(game.homeTeamId, homeRating + change);
    ratings.set(game.awayTeamId, awayRating - change);
  }

  return { ratings, gamesProcessed: sortedGames.length };
}

export function calculateEloRoundSnapshots(
  games: EloGame[],
  teamIds: string[]
): EloRoundSnapshot[] {
  const ratings = new Map<string, number>();
  const snapshots: EloRoundSnapshot[] = [];
  const sortedGames = [...games].sort(
    (a, b) =>
      a.season - b.season ||
      a.round - b.round ||
      String(a.kickoff).localeCompare(String(b.kickoff))
  );
  let currentSeason = sortedGames[0]?.season;

  for (let index = 0; index < sortedGames.length; index++) {
    const game = sortedGames[index];
    if (currentSeason !== undefined && game.season !== currentSeason) {
      for (const [teamId, rating] of ratings) {
        ratings.set(
          teamId,
          ELO_BASELINE + (rating - ELO_BASELINE) * (1 - ELO_SEASON_REGRESSION)
        );
      }
      currentSeason = game.season;
    }

    const homeRating = ratings.get(game.homeTeamId) ?? ELO_BASELINE;
    const awayRating = ratings.get(game.awayTeamId) ?? ELO_BASELINE;
    const homeAdvantage = isNeutralGame(game) ? 0 : ELO_HOME_ADVANTAGE;
    const expectedHome = expectedWinProbability(homeRating, awayRating, homeAdvantage);
    const actualHome =
      game.homeScore === game.awayScore ? 0.5 : game.homeScore > game.awayScore ? 1 : 0;
    const multiplier = marginMultiplier(
      Math.abs(game.homeScore - game.awayScore),
      homeRating - awayRating
    );
    const change = ELO_K_FACTOR * multiplier * (actualHome - expectedHome);

    ratings.set(game.homeTeamId, homeRating + change);
    ratings.set(game.awayTeamId, awayRating - change);

    const nextGame = sortedGames[index + 1];
    if (!nextGame || nextGame.season !== game.season || nextGame.round !== game.round) {
      snapshots.push({
        index: snapshots.length,
        season: game.season,
        round: game.round,
        label: game.stage && !/^Round \d+$/.test(game.stage) ? game.stage : `Round ${game.round}`,
        kickoff: game.kickoff,
        ratings: Object.fromEntries(
          teamIds.map((teamId) => [teamId, Math.round(ratings.get(teamId) ?? ELO_BASELINE)])
        ),
      });
    }
  }

  return snapshots;
}

export function rankEloRatings(
  ratings: Map<string, number>,
  teamIds: string[]
): Map<string, number> {
  return new Map(
    teamIds
      .map((teamId) => [teamId, ratings.get(teamId) ?? ELO_BASELINE] as const)
      .sort((a, b) => b[1] - a[1])
      .map(([teamId], index) => [teamId, index + 1])
  );
}
