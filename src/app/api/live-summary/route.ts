import { after, NextRequest, NextResponse } from "next/server";
import { getSeasonCacheControl } from "@/lib/cache";
import { refreshLiveGamesIfNeeded } from "@/lib/live-refresh";
import { getLiveSummary } from "@/lib/live-summary";

export async function GET(request: NextRequest) {
  try {
    const season = Number(request.nextUrl.searchParams.get("season") || "2026");
    const summary = await getLiveSummary(season);

    // Return the current snapshot immediately, then refresh canonical scores in
    // the function's post-response lifetime. The next 30-second client poll
    // receives the new scores without making this request wait on NRL.com.
    after(async () => {
      try {
        await refreshLiveGamesIfNeeded(season);
      } catch (error) {
        console.error("Visitor-triggered live refresh failed:", error);
      }
    });

    return NextResponse.json(summary, {
      headers: {
        "Cache-Control": getSeasonCacheControl(season, {
          hasLiveGames: summary.liveGames.length > 0,
        }),
      },
    });
  } catch (error) {
    console.error("Live summary API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch live summary" },
      { status: 500 }
    );
  }
}
