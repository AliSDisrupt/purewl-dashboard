import { NextResponse } from "next/server";
import { fetchHubSpotTasks } from "@/lib/mcp/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotTasks(limit);
    return NextResponse.json({ tasks: data });
  } catch (error) {
    console.error("Error fetching HubSpot tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot tasks" },
      { status: 500 }
    );
  }
}
