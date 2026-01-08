import { NextResponse } from "next/server";
import { fetchGA4Events } from "@/lib/mcp/ga4-campaigns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    const data = await fetchGA4Events({ startDate, endDate });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching GA4 events:", error);
    return NextResponse.json(
      { error: "Failed to fetch GA4 events data" },
      { status: 500 }
    );
  }
}
