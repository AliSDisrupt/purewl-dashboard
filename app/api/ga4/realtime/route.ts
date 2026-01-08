import { NextResponse } from "next/server";
import { fetchGA4Realtime } from "@/lib/mcp/ga4-campaigns";

export async function GET() {
  try {
    const data = await fetchGA4Realtime();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching GA4 realtime:", error);
    return NextResponse.json(
      { error: "Failed to fetch GA4 realtime data" },
      { status: 500 }
    );
  }
}
