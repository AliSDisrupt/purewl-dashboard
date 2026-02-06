import { NextResponse } from "next/server";
import { fetchHubSpotContacts } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    const contacts = await fetchHubSpotContacts(query, limit);
    return NextResponse.json({ contacts });
  } catch (error) {
    return apiError("Failed to fetch HubSpot contacts", 500, error);
  }
}
