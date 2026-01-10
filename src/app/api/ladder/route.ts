import { NextRequest, NextResponse } from "next/server";
import { getLadder, initializeDatabase } from "@/lib/queries";
import { sortByAttack, sortByDefense } from "@/lib/calculations";

export async function GET(request: NextRequest) {
  try {
    // Initialize database on first request
    initializeDatabase();

    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2026");
    const round = searchParams.get("round")
      ? parseInt(searchParams.get("round")!)
      : undefined;
    const view = searchParams.get("view") || "ladder";

    let ladder = getLadder(season, round);

    // Apply view-specific sorting
    if (view === "attack") {
      ladder = sortByAttack(ladder);
      // Reassign positions for attack view
      ladder = ladder.map((entry, index) => ({
        ...entry,
        position: index + 1,
      }));
    } else if (view === "defense") {
      ladder = sortByDefense(ladder);
      // Reassign positions for defense view
      ladder = ladder.map((entry, index) => ({
        ...entry,
        position: index + 1,
      }));
    }

    return NextResponse.json(ladder);
  } catch (error) {
    console.error("Ladder API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ladder" },
      { status: 500 }
    );
  }
}
