import { NextResponse } from "next/server";
import { fetchHubSpotLineItems } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotLineItems(limit);
    return NextResponse.json({ lineItems: data });
  } catch (error) {
    return apiError("Failed to fetch HubSpot line items", 500, error);
  }
}
