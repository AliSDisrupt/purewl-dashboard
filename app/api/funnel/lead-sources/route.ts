import { NextResponse } from "next/server";
import { fetchGA4LeadSources } from "@/lib/mcp/ga4-campaigns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    const data = await fetchGA4LeadSources({ startDate, endDate });
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching lead sources:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch lead sources" },
      { status: 500 }
    );
  }
}
