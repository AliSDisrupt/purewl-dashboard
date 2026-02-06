import { NextResponse } from "next/server";
import { fetchHubSpotDeals } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : undefined;

    const data = await fetchHubSpotDeals(limit);
    return NextResponse.json(data);
  } catch (error) {
    return apiError("Failed to fetch HubSpot deals", 500, error);
  }
}
