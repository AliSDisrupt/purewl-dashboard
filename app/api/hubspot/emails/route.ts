import { NextResponse } from "next/server";
import { fetchHubSpotEmails } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotEmails(limit);
    return NextResponse.json({ emails: data });
  } catch (error) {
    return apiError("Failed to fetch HubSpot emails", 500, error);
  }
}
