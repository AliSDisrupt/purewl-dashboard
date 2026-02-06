import { NextResponse } from "next/server";
import { fetchHubSpotTasks } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const data = await fetchHubSpotTasks(limit);
    return NextResponse.json({ tasks: data });
  } catch (error) {
    return apiError("Failed to fetch HubSpot tasks", 500, error);
  }
}
