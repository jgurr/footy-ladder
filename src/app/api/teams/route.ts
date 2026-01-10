import { NextResponse } from "next/server";
import { NRL_TEAMS } from "@/lib/teams";

export async function GET() {
  return NextResponse.json(NRL_TEAMS);
}
