import { NextResponse } from "next/server";
import { fetchHubSpotQuotes } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotQuotes(limit);
    return NextResponse.json({ quotes: data });
  } catch (error) {
    return apiError("Failed to fetch HubSpot quotes", 500, error);
  }
}
