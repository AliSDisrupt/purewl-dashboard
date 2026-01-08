import { NextResponse } from "next/server";
import { fetchHubSpotLineItems } from "@/lib/mcp/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotLineItems(limit);
    return NextResponse.json({ lineItems: data });
  } catch (error) {
    console.error("Error fetching HubSpot line items:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot line items" },
      { status: 500 }
    );
  }
}
