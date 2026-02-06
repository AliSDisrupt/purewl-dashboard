import { NextResponse } from "next/server";
import { fetchGA4Realtime } from "@/lib/mcp/ga4-campaigns";
import { apiError } from "@/lib/api-response";

export async function GET() {
  try {
    const data = await fetchGA4Realtime();
    return NextResponse.json(data);
  } catch (error) {
    return apiError("Failed to fetch GA4 realtime data", 500, error);
  }
}
