import { NextResponse } from "next/server";
import { fetchGA4Geography } from "@/lib/mcp/ga4";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";
    const limit = parseInt(searchParams.get("limit") || "20");

    const data = await fetchGA4Geography({ startDate, endDate });
    return NextResponse.json({
      countries: data.countries.slice(0, limit),
    });
  } catch (error) {
    return apiError("Failed to fetch GA4 geography data", 500, error);
  }
}
