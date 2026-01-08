import { NextResponse } from "next/server";
import { fetchHubSpotDeals } from "@/lib/mcp/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    // If no limit is provided, fetch ALL deals (undefined = fetch all)
    // If limit is provided, use it (useful for testing or limiting display)
    const limit = limitParam ? parseInt(limitParam) : undefined;

    const data = await fetchHubSpotDeals(limit);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching HubSpot deals:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot deals" },
      { status: 500 }
    );
  }
}
