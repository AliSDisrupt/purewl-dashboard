import { NextRequest, NextResponse } from "next/server";
import { fetchHubSpotConversations } from "@/lib/mcp/hubspot";
import { apiError } from "@/lib/api-response";

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

    console.log(`Fetched ${allThreads.length} conversations from HubSpot`);
    
    // Log sample threads to debug date fields
    if (allThreads.length > 0) {
      const threadsWithDates = allThreads.filter((t: any) => t.createdAt && t.updatedAt);
      console.log("Conversations date analysis:", {
        total: allThreads.length,
        withCreatedAt: allThreads.filter((t: any) => t.createdAt).length,
        withUpdatedAt: allThreads.filter((t: any) => t.updatedAt).length,
        withBothDates: threadsWithDates.length,
        sampleThread: {
          id: allThreads[0].id,
          status: allThreads[0].status,
          createdAt: allThreads[0].createdAt,
          updatedAt: allThreads[0].updatedAt,
        },
        sampleWithDates: threadsWithDates[0] ? {
          id: threadsWithDates[0].id,
          status: threadsWithDates[0].status,
          createdAt: threadsWithDates[0].createdAt,
          updatedAt: threadsWithDates[0].updatedAt,
        } : null,
      });
    }

    // Parse date range
    const start = parseDate(startDate);
    start.setHours(0, 0, 0, 0);
    const end = parseDate(endDate);
    end.setHours(23, 59, 59, 999);

    console.log(`Filtering conversations from ${start.toISOString()} to ${end.toISOString()}`);

    // Helper to parse date safely
    const parseThreadDate = (dateStr: string | undefined | null): Date | null => {
      if (!dateStr || dateStr === "" || dateStr === "null" || dateStr === "undefined") return null;
      try {
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) return null;
        return parsed;
      } catch {
        return null;
      }
    };

    // Filter conversations started in range (by createdAt)
    const conversationsStarted = allThreads.filter((thread: any) => {
      const threadDate = parseThreadDate(thread.createdAt);
      if (!threadDate) return false;
      return threadDate >= start && threadDate <= end;
    });

    // Filter conversations closed in range (by updatedAt where status is CLOSED)
    // For closed conversations, we check when they were updated (closed)
    const conversationsClosed = allThreads.filter((thread: any) => {
      if (thread.status !== "CLOSED") return false;
      const closedDate = parseThreadDate(thread.updatedAt);
      if (!closedDate) return false;
      return closedDate >= start && closedDate <= end;
    });

    console.log(`Filtered results: ${conversationsStarted.length} started, ${conversationsClosed.length} closed`);

    return NextResponse.json({
      conversationsStarted: conversationsStarted.length,
      conversationsClosed: conversationsClosed.length,
      total: allThreads.length,
      summary: {
        started: conversationsStarted.length,
        closed: conversationsClosed.length,
        open: allThreads.filter((t: any) => t.status === "OPEN").length,
      },
      // Debug info (remove in production if needed)
      debug: {
        dateRange: { start: start.toISOString(), end: end.toISOString() },
        totalThreads: allThreads.length,
        threadsWithCreatedAt: allThreads.filter((t: any) => t.createdAt).length,
        threadsWithUpdatedAt: allThreads.filter((t: any) => t.updatedAt).length,
        sampleThread: allThreads[0] ? {
          id: allThreads[0].id,
          status: allThreads[0].status,
          createdAt: allThreads[0].createdAt,
          updatedAt: allThreads[0].updatedAt,
        } : null,
      },
    });
  } catch (error) {
    return apiError("Failed to fetch conversations", 500, error);
  }
}
