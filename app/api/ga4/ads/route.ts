import { NextResponse } from "next/server";
import { fetchGA4Ads } from "@/lib/mcp/ga4-ads";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    const data = await fetchGA4Ads({ startDate, endDate });
    return NextResponse.json(data);
  } catch (error) {
    return apiError("Failed to fetch GA4 ads data", 500, error);
  }
}
