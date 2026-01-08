import { NextResponse } from "next/server";
import { fetchGA4Ads } from "@/lib/mcp/ga4-ads";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    const data = await fetchGA4Ads({ startDate, endDate });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching GA4 ads data:", error);
    return NextResponse.json(
      { error: "Failed to fetch GA4 ads data" },
      { status: 500 }
    );
  }
}
