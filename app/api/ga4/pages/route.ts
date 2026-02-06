import { NextResponse } from "next/server";
import { fetchGA4TopPages } from "@/lib/mcp/ga4";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";
    const limit = parseInt(searchParams.get("limit") || "15");

    const data = await fetchGA4TopPages({ startDate, endDate });
    return NextResponse.json({
      pages: data.pages.slice(0, limit),
    });
  } catch (error) {
    return apiError("Failed to fetch GA4 pages data", 500, error);
  }
}
