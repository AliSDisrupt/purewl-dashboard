import { NextResponse } from "next/server";
import { fetchHubSpotProducts } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotProducts(limit);
    return NextResponse.json({ products: data });
  } catch (error) {
    return apiError("Failed to fetch HubSpot products", 500, error);
  }
}
