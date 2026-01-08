import { NextResponse } from "next/server";
import { fetchGA4Overview } from "@/lib/mcp/ga4";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "7daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    const data = await fetchGA4Overview({ startDate, endDate });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching GA4 overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch GA4 data" },
      { status: 500 }
    );
  }
}
