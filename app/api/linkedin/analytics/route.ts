import { NextResponse } from "next/server";
import { fetchLinkedInAnalytics } from "@/lib/mcp/linkedin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const daysBack = parseInt(searchParams.get("daysBack") || "30");

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId parameter is required" },
        { status: 400 }
      );
    }

    const data = await fetchLinkedInAnalytics(accountId, daysBack);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching LinkedIn analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch LinkedIn analytics" },
      { status: 500 }
    );
  }
}
