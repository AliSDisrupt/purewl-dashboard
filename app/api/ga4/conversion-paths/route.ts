import { NextResponse } from "next/server";
import { fetchGA4ConversionPaths } from "@/lib/mcp/ga4-campaigns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    const data = await fetchGA4ConversionPaths({ startDate, endDate });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching GA4 conversion paths:", error);
    return NextResponse.json(
      { error: "Failed to fetch GA4 conversion paths data" },
      { status: 500 }
    );
  }
}
