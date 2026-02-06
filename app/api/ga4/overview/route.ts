import { NextResponse } from "next/server";
import { fetchGA4Overview } from "@/lib/mcp/ga4";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "7daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    const data = await fetchGA4Overview({ startDate, endDate });
    return NextResponse.json(data);
  } catch (error) {
    return apiError("Failed to fetch GA4 data", 500, error);
  }
}
