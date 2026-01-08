import { NextResponse } from "next/server";
import { fetchHubSpotMeetings } from "@/lib/mcp/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotMeetings(limit);
    return NextResponse.json({ meetings: data });
  } catch (error) {
    console.error("Error fetching HubSpot meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot meetings" },
      { status: 500 }
    );
  }
}
