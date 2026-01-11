import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase, getGamesBySeason } from "@/lib/queries";
import { seed2025Season } from "@/lib/seed-2025";
import { seed2026Season } from "@/lib/seed-2026";

/**
 * Database seed endpoint
 *
 * POST /api/seed
 *
 * Protected by SYNC_SECRET environment variable
 */
export async function POST(request: NextRequest) {
  // Check authorization
  const authHeader = request.headers.get("authorization");
  const syncSecret = process.env.SYNC_SECRET;

  if (!syncSecret || authHeader !== `Bearer ${syncSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("Initializing database...");
    await initializeDatabase();

    console.log("Seeding 2025 season data...");
    await seed2025Season();

    console.log("Seeding 2026 season schedule...");
    await seed2026Season();

    // Verification
    const games2025 = await getGamesBySeason(2025);
    const games2026 = await getGamesBySeason(2026);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      stats: {
        games2025: games2025.length,
        games2026: games2026.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seed
 * Check current database stats (no auth required)
 */
export async function GET() {
  try {
    await initializeDatabase();

    const games2025 = await getGamesBySeason(2025);
    const games2026 = await getGamesBySeason(2026);

    return NextResponse.json({
      status: "ok",
      games2025: games2025.length,
      games2026: games2026.length,
      needsSeed: games2025.length === 0 || games2026.length === 0,
    });
  } catch (error) {
    console.error("Seed check error:", error);
    return NextResponse.json(
      { error: "Failed to check database", details: String(error) },
      { status: 500 }
    );
  }
}
