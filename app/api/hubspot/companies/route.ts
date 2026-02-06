import { NextResponse } from "next/server";
import { fetchHubSpotCompanies } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotCompanies(limit);
    return NextResponse.json({ companies: data });
  } catch (error) {
    return apiError("Failed to fetch HubSpot companies", 500, error);
  }
}
