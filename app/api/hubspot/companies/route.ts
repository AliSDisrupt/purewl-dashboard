import { NextResponse } from "next/server";
import { fetchHubSpotCompanies } from "@/lib/mcp/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotCompanies(limit);
    return NextResponse.json({ companies: data });
  } catch (error) {
    console.error("Error fetching HubSpot companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot companies" },
      { status: 500 }
    );
  }
}
