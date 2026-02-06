import { NextResponse } from "next/server";
import { fetchHubSpotCalls } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotCalls(limit);
    return NextResponse.json({ calls: data });
  } catch (error) {
    return apiError("Failed to fetch HubSpot calls", 500, error);
  }
}
