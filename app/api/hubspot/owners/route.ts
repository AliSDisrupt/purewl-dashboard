import { NextResponse } from "next/server";
import { fetchHubSpotOwners } from "@/lib/mcp/hubspot";

export async function GET() {
  try {
    const data = await fetchHubSpotOwners();
    return NextResponse.json({ owners: data });
  } catch (error) {
    console.error("Error fetching HubSpot owners:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot owners" },
      { status: 500 }
    );
  }
}
