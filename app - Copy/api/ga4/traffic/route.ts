import { NextResponse } from "next/server";
import { fetchGA4Channels } from "@/lib/mcp/ga4";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    const data = await fetchGA4Channels({ startDate, endDate });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching GA4 traffic:", error);
    return NextResponse.json(
      { error: "Failed to fetch GA4 traffic data" },
      { status: 500 }
    );
  }
}
