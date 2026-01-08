import { NextResponse } from "next/server";
import { fetchGA4Geography } from "@/lib/mcp/ga4";

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
    console.error("Error fetching GA4 geography:", error);
    return NextResponse.json(
      { error: "Failed to fetch GA4 geography data" },
      { status: 500 }
    );
  }
}
