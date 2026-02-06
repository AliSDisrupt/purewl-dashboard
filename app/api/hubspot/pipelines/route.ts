import { NextResponse } from "next/server";
import { fetchHubSpotPipelines } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

export async function GET() {
  try {
    const pipelines = await fetchHubSpotPipelines();
    return NextResponse.json({ pipelines });
  } catch (error) {
    return apiError("Failed to fetch pipelines", 500, error);
  }
}
