import { getAvailableLadderRounds, getLadder, getLatestLadderRound } from "./queries";
import { getSeasonStatus } from "./status";

export async function getBootstrapData(season: number) {
  const [ladderRounds, latestRound, status] = await Promise.all([
    getAvailableLadderRounds(season),
    getLatestLadderRound(season),
    getSeasonStatus(season),
  ]);

  const rounds =
    ladderRounds.length > 0
      ? ladderRounds
      : Array.from({ length: latestRound }, (_, index) => latestRound - index);
  const selectedRound = status.latestFinalRound || latestRound || rounds[0] || 1;
  const ladder = await getLadder(season, selectedRound);

  return {
    season,
    rounds,
    latestRound: selectedRound,
    ladder,
    status: {
      season,
      ...status,
    },
  };
}
