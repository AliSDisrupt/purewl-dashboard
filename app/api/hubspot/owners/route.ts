import { NextResponse } from "next/server";
import { fetchHubSpotOwners } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET() {
  try {
    const data = await fetchHubSpotOwners();
    return NextResponse.json({ owners: data });
  } catch (error) {
    return apiError("Failed to fetch HubSpot owners", 500, error);
  }
}
