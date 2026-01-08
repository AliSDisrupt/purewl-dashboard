import { NextResponse } from "next/server";
import { fetchHubSpotCalls } from "@/lib/mcp/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotCalls(limit);
    return NextResponse.json({ calls: data });
  } catch (error) {
    console.error("Error fetching HubSpot calls:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot calls" },
      { status: 500 }
    );
  }
}
