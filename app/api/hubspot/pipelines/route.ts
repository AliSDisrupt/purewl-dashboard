import { NextResponse } from "next/server";
import { fetchHubSpotPipelines } from "@/lib/mcp/hubspot";

export async function GET() {
  try {
    const pipelines = await fetchHubSpotPipelines();
    return NextResponse.json({ pipelines });
  } catch (error: any) {
    console.error("Error fetching HubSpot pipelines:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch pipelines" },
      { status: 500 }
    );
  }
}
