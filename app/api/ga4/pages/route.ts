import { NextResponse } from "next/server";
import { fetchGA4TopPages } from "@/lib/mcp/ga4";

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
    console.error("Error fetching GA4 pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch GA4 pages data" },
      { status: 500 }
    );
  }
}
