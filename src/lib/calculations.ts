import type { LadderEntry } from "./types";

/**
 * Calculate win percentage using the formula:
 * (wins + 0.5 * draws) / total games * 100
 *
 * This is the core value proposition of Footy Ladder -
 * win percentage removes bye distortion from the ladder.
 */
export function calculateWinPercentage(
  wins: number,
  losses: number,
  draws: number
): number {
  const totalGames = wins + losses + draws;
  if (totalGames === 0) return 0;

  const effectiveWins = wins + draws * 0.5;
  return (effectiveWins / totalGames) * 100;
}

/**
 * Calculate points differential (PF - PA)
 */
export function calculateDifferential(
  pointsFor: number,
  pointsAgainst: number
): number {
  return pointsFor - pointsAgainst;
}

/**
 * Calculate traditional NRL ladder points
 * Win = 2 points, Draw = 1 point, Loss = 0 points
 */
export function calculateNRLPoints(wins: number, draws: number): number {
  return wins * 2 + draws;
}

/**
 * Sort ladder entries by win percentage with tiebreakers:
 * 1. Win percentage (primary)
 * 2. NRL points
 * 3. Points differential
 * 4. Points for
 */
export function sortLadder(entries: LadderEntry[]): LadderEntry[] {
  return [...entries].sort((a, b) => {
    // Primary: Win percentage (descending)
    if (b.winPct !== a.winPct) {
      return b.winPct - a.winPct;
    }

    // Secondary: NRL Points (descending)
    if (b.nrlPoints !== a.nrlPoints) {
      return b.nrlPoints - a.nrlPoints;
    }

    // Tertiary: Points differential (descending)
    if (b.differential !== a.differential) {
      return b.differential - a.differential;
    }

    // Quaternary: Points for (descending)
    return b.pointsFor - a.pointsFor;
  });
}

/**
 * Sort ladder by attack (points for)
 */
export function sortByAttack(entries: LadderEntry[]): LadderEntry[] {
  return [...entries].sort((a, b) => b.pointsFor - a.pointsFor);
}

/**
 * Sort ladder by defense (points against - lower is better)
 */
export function sortByDefense(entries: LadderEntry[]): LadderEntry[] {
  return [...entries].sort((a, b) => a.pointsAgainst - b.pointsAgainst);
}

/**
 * Calculate per-game averages
 */
export function calculatePerGameStats(entry: LadderEntry): {
  pfPerGame: number;
  paPerGame: number;
} {
  if (entry.played === 0) {
    return { pfPerGame: 0, paPerGame: 0 };
  }

  return {
    pfPerGame: entry.pointsFor / entry.played,
    paPerGame: entry.pointsAgainst / entry.played,
  };
}

/**
 * Detect bye rounds for a team based on expected games vs actual played
 */
export function detectByeRounds(
  currentRound: number,
  gamesPlayed: number
): number {
  // Each round should have one game, so byes = rounds - games
  return Math.max(0, currentRound - gamesPlayed);
}

/**
 * Assign positions to sorted ladder entries
 */
export function assignPositions(entries: LadderEntry[]): LadderEntry[] {
  return entries.map((entry, index) => ({
    ...entry,
    position: index + 1,
  }));
}
