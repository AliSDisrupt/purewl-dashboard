import { NextResponse } from "next/server";
import { fetchHubSpotMeetings } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotMeetings(limit);
    return NextResponse.json({ meetings: data });
  } catch (error) {
    return apiError("Failed to fetch HubSpot meetings", 500, error);
  }
}
