import { NextResponse } from "next/server";
import { fetchHubSpotTickets } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotTickets(limit);
    return NextResponse.json({ tickets: data });
  } catch (error) {
    return apiError("Failed to fetch HubSpot tickets", 500, error);
  }
}
