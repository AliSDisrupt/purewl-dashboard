import { NextRequest, NextResponse } from "next/server";
import { fetchHubSpotConversations } from "@/lib/mcp/hubspot";

// Helper function to parse date strings
function parseDate(dateStr: string): Date {
  if (dateStr === "yesterday") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }
  if (dateStr === "today") {
    // GA4 data not available for today, use yesterday
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }
  if (dateStr.endsWith("daysAgo")) {
    const days = parseInt(dateStr);
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }
  // Assume YYYY-MM-DD format
  return new Date(dateStr);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "30daysAgo";
    const endDate = searchParams.get("endDate") || "yesterday";

    // Fetch all conversations (we'll filter by date client-side)
    const conversationsData = await fetchHubSpotConversations(1000); // Get up to 1000 conversations
    const allThreads = conversationsData.threads || [];

    // Parse date range
    const start = parseDate(startDate);
    start.setHours(0, 0, 0, 0);
    const end = parseDate(endDate);
    end.setHours(23, 59, 59, 999);

    // Filter conversations started in range (by createdAt)
    const conversationsStarted = allThreads.filter((thread: any) => {
      if (!thread.createdAt) return false;
      const threadDate = new Date(thread.createdAt);
      return threadDate >= start && threadDate <= end;
    });

    // Filter conversations closed in range (by updatedAt where status is CLOSED)
    const conversationsClosed = allThreads.filter((thread: any) => {
      if (thread.status !== "CLOSED") return false;
      if (!thread.updatedAt) return false;
      const closedDate = new Date(thread.updatedAt);
      return closedDate >= start && closedDate <= end;
    });

    return NextResponse.json({
      conversationsStarted: conversationsStarted.length,
      conversationsClosed: conversationsClosed.length,
      total: allThreads.length,
      summary: {
        started: conversationsStarted.length,
        closed: conversationsClosed.length,
        open: allThreads.filter((t: any) => t.status === "OPEN").length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching HubSpot conversations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
