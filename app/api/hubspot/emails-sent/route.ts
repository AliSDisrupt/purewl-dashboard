import { NextRequest, NextResponse } from "next/server";
import { fetchHubSpotEmails } from "@/lib/mcp/hubspot";

// Helper function to parse date strings
function parseDate(dateStr: string): Date {
  if (dateStr === "yesterday") {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }
  if (dateStr === "today") {
    // Use yesterday for today (data not available for current day)
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

    // Fetch all emails (we'll filter by date)
    const allEmails = await fetchHubSpotEmails(1000); // Get up to 1000 emails

    // Parse date range
    const start = parseDate(startDate);
    start.setHours(0, 0, 0, 0);
    const end = parseDate(endDate);
    end.setHours(23, 59, 59, 999);

    // Filter emails sent in date range
    // Only count emails that were actually sent (status: SENT or similar)
    const emailsSent = allEmails.filter((email: any) => {
      if (!email.sentDate) return false;
      const emailDate = new Date(email.sentDate);
      return emailDate >= start && emailDate <= end;
    });

    return NextResponse.json({
      emailsSent: emailsSent.length,
      total: allEmails.length,
      emails: emailsSent.slice(0, 100), // Return first 100 for reference
      summary: {
        sent: emailsSent.length,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching HubSpot emails sent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch emails sent" },
      { status: 500 }
    );
  }
}
