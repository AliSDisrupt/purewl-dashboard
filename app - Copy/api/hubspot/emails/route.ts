import { NextResponse } from "next/server";
import { fetchHubSpotEmails } from "@/lib/mcp/hubspot";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotEmails(limit);
    return NextResponse.json({ emails: data });
  } catch (error) {
    console.error("Error fetching HubSpot emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot emails" },
      { status: 500 }
    );
  }
}
