import { NextResponse } from "next/server";
import { fetchHubSpotQuotes } from "@/lib/mcp/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotQuotes(limit);
    return NextResponse.json({ quotes: data });
  } catch (error) {
    console.error("Error fetching HubSpot quotes:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot quotes" },
      { status: 500 }
    );
  }
}
