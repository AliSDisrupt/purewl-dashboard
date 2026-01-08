import { NextResponse } from "next/server";
import { fetchLinkedInAccounts } from "@/lib/mcp/linkedin";
import { fetchHubSpotDeals } from "@/lib/mcp/hubspot";

export async function GET() {
  const status = {
    linkedin: { connected: false, error: null as string | null },
    hubspot: { connected: false, error: null as string | null },
    ga4: { connected: false, error: null as string | null },
    reddit: { connected: false, error: null as string | null },
  };

  // Check LinkedIn Ads
  if (!process.env.LINKEDIN_ACCESS_TOKEN) {
    status.linkedin.error = "LINKEDIN_ACCESS_TOKEN not configured";
  } else {
    try {
      const accounts = await fetchLinkedInAccounts();
      // If we get accounts or no error, it's connected
      // Even if empty, the API call succeeded
      status.linkedin.connected = true;
    } catch (error: any) {
      status.linkedin.error = error.message || "Connection failed";
      status.linkedin.connected = false;
    }
  }

  // Check HubSpot
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    status.hubspot.error = "HUBSPOT_ACCESS_TOKEN not configured";
  } else {
    try {
      const result = await fetchHubSpotDeals(1);
      // If we get a result (even if empty), the API call succeeded
      status.hubspot.connected = true;
    } catch (error: any) {
      status.hubspot.error = error.message || "Connection failed";
      status.hubspot.connected = false;
    }
  }

  // Check GA4
  if (!process.env.GA4_PROPERTY_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    status.ga4.error = !process.env.GA4_PROPERTY_ID 
      ? "GA4_PROPERTY_ID not configured"
      : "GOOGLE_APPLICATION_CREDENTIALS not configured";
  } else {
    try {
      const { fetchGA4Overview } = await import("@/lib/mcp/ga4");
      await fetchGA4Overview({ startDate: "7daysAgo", endDate: "yesterday" });
      status.ga4.connected = true;
    } catch (error: any) {
      status.ga4.error = error.message || "Connection failed";
    }
  }

  // Check Reddit
  try {
    const { fetchRedditPosts } = await import("@/lib/mcp/reddit");
    const posts = await fetchRedditPosts({ subreddit: "vpn", limit: 1 });
    status.reddit.connected = posts.length >= 0; // Reddit API is public, always works
  } catch (error: any) {
    status.reddit.error = error.message || "Connection failed";
  }

  return NextResponse.json(status);
}
