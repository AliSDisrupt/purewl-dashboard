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

    // Fetch all emails
    const allEmails = await fetchHubSpotEmails(1000);

    // Parse date range
    const start = parseDate(startDate);
    start.setHours(0, 0, 0, 0);
    const end = parseDate(endDate);
    end.setHours(23, 59, 59, 999);

    // Group emails by conversation/thread and recipient
    // For first response, we need to find the first outbound email after an inbound email
    const emailThreads: Record<string, Array<{ email: any; isOutbound: boolean; date: Date }>> = {};

    allEmails.forEach((email: any) => {
      if (!email.sentDate || !email.to) return;
      
      const emailDate = new Date(email.sentDate);
      if (emailDate < start || emailDate > end) return;

      // Use recipient email as thread identifier
      // In a real scenario, you'd use conversationId if available
      const threadKey = email.to.toLowerCase();
      
      if (!emailThreads[threadKey]) {
        emailThreads[threadKey] = [];
      }

      // Determine if email is outbound (from us) or inbound (to us)
      // This is a simplified check - in reality, you'd check if 'from' is your domain
      // For now, we'll assume emails with a 'from' field are outbound
      const isOutbound = !!email.from;

      emailThreads[threadKey].push({
        email,
        isOutbound,
        date: emailDate,
      });
    });

    // Calculate first responses
    // A first response is when we send an email (outbound) after receiving one (inbound)
    let firstResponseCount = 0;
    const firstResponseDetails: Array<{ thread: string; firstInbound: Date; firstOutbound: Date; responseTime: number }> = [];

    Object.keys(emailThreads).forEach((threadKey) => {
      const thread = emailThreads[threadKey];
      // Sort by date
      thread.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Find first inbound email
      const firstInbound = thread.find((e) => !e.isOutbound);
      if (!firstInbound) return;

      // Find first outbound email after the first inbound
      const firstOutbound = thread.find((e) => e.isOutbound && e.date > firstInbound.date);
      if (!firstOutbound) return;

      // Calculate response time in hours
      const responseTime = (firstOutbound.date.getTime() - firstInbound.date.getTime()) / (1000 * 60 * 60);

      // Only count if first outbound is within the date range
      if (firstOutbound.date >= start && firstOutbound.date <= end) {
        firstResponseCount++;
        firstResponseDetails.push({
          thread: threadKey,
          firstInbound: firstInbound.date,
          firstOutbound: firstOutbound.date,
          responseTime,
        });
      }
    });

    return NextResponse.json({
      firstResponseCount,
      total: firstResponseCount,
      averageResponseTime: firstResponseCount > 0
        ? firstResponseDetails.reduce((sum, d) => sum + d.responseTime, 0) / firstResponseCount
        : 0,
      details: firstResponseDetails.slice(0, 50), // Return first 50 for reference
      summary: {
        count: firstResponseCount,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    });
  } catch (error: any) {
    console.error("Error calculating first response:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate first response" },
      { status: 500 }
    );
  }
}
