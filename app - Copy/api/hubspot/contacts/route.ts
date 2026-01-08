import { NextResponse } from "next/server";
import { fetchHubSpotContacts } from "@/lib/mcp/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || "10");

    const contacts = await fetchHubSpotContacts(query, limit);
    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Error fetching HubSpot contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot contacts" },
      { status: 500 }
    );
  }
}
