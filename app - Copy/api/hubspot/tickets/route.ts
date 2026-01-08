import { NextResponse } from "next/server";
import { fetchHubSpotTickets } from "@/lib/mcp/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotTickets(limit);
    return NextResponse.json({ tickets: data });
  } catch (error) {
    console.error("Error fetching HubSpot tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot tickets" },
      { status: 500 }
    );
  }
}
