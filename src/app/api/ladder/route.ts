import { NextRequest, NextResponse } from "next/server";
import { getLadder } from "@/lib/queries";
import { sortByAttack, sortByDefense } from "@/lib/calculations";

export async function GET(request: NextRequest) {
  try {

    const searchParams = request.nextUrl.searchParams;
    const season = parseInt(searchParams.get("season") || "2026");
    const round = searchParams.get("round")
      ? parseInt(searchParams.get("round")!)
      : undefined;
    const view = searchParams.get("view") || "ladder";

    let ladder = await getLadder(season, round);

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

    // Cache headers: 2025 is immutable, 2026 revalidates hourly
    const cacheControl = season === 2025
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600, stale-while-revalidate=86400";

    return NextResponse.json(ladder, {
      headers: { "Cache-Control": cacheControl },
    });
  } catch (error) {
    console.error("Ladder API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ladder" },
      { status: 500 }
    );
  }
}
