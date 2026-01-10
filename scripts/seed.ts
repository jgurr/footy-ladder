#!/usr/bin/env npx tsx

/**
 * Database seed script
 * Run with: npx tsx scripts/seed.ts
 */

import { initializeDatabase, getGamesBySeason } from "../src/lib/queries";
import { seed2025Season } from "../src/lib/seed-2025";
import { seed2026Season } from "../src/lib/seed-2026";
import { getLadder } from "../src/lib/queries";

console.log("Initializing database...");
initializeDatabase();

console.log("\nSeeding 2025 season data...");
seed2025Season();

console.log("\nSeeding 2026 season schedule...");
seed2026Season();

console.log("\n--- Verification ---");

// 2025 verification
const ladder = getLadder(2025, 27);
console.log(`\n2025 Final Ladder (Top 8):`);
console.log("Pos | Team         | W  | L  | D  | Win%   | Pts");
console.log("----|--------------|----|----|----|---------");

for (const entry of ladder.slice(0, 8)) {
  const pos = String(entry.position).padStart(2, " ");
  const team = entry.team.name.padEnd(12, " ");
  const wins = String(entry.wins).padStart(2, " ");
  const losses = String(entry.losses).padStart(2, " ");
  const draws = String(entry.draws).padStart(2, " ");
  const winPct = entry.winPct.toFixed(2).padStart(6, " ");
  const pts = String(entry.nrlPoints).padStart(3, " ");
  console.log(`${pos}  | ${team} | ${wins} | ${losses} | ${draws} | ${winPct} | ${pts}`);
}

// 2026 verification
const games2026 = getGamesBySeason(2026);
console.log(`\n2026 Schedule: ${games2026.length} games imported`);
console.log(`\nRound 1 matchups:`);
const round1 = games2026.filter(g => g.round === 1);
for (const game of round1) {
  console.log(`  ${game.homeTeamId.toUpperCase()} vs ${game.awayTeamId.toUpperCase()} @ ${game.venue}`);
}

console.log("\nDone!");
