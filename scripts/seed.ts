#!/usr/bin/env npx tsx

/**
 * Database seed script
 * Run with: npx tsx scripts/seed.ts
 */

import { initializeDatabase } from "../src/lib/queries";
import { seed2025Season } from "../src/lib/seed-2025";
import { getLadder } from "../src/lib/queries";

console.log("Initializing database...");
initializeDatabase();

console.log("Seeding 2025 season data...");
seed2025Season();

console.log("\nVerifying import...");
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

console.log("\nDone!");
