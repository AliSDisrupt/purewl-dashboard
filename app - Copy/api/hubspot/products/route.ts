import { NextResponse } from "next/server";
import { fetchHubSpotProducts } from "@/lib/mcp/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotProducts(limit);
    return NextResponse.json({ products: data });
  } catch (error) {
    console.error("Error fetching HubSpot products:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot products" },
      { status: 500 }
    );
  }
}
