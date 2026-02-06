import { NextResponse } from "next/server";
import { fetchLinkedInAnalytics } from "@/lib/mcp/linkedin";
import { apiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const campaignId = searchParams.get("campaignId");
    const daysBack = parseInt(searchParams.get("daysBack") || "30");

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId parameter is required" },
        { status: 400 }
      );
    }

    // For now, we'll fetch account-level analytics
    // Campaign-level analytics would require a different endpoint
    const data = await fetchLinkedInAnalytics(accountId, daysBack);
    return NextResponse.json(data);
  } catch (error) {
    return apiError("Failed to fetch LinkedIn campaign analytics", 500, error);
  }
}
