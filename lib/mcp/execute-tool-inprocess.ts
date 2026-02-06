/**
 * Execute MCP tools in-process (no HTTP). Used by Atlas chat so tool calls work
 * on local and in serverless without fetching localhost.
 */

import {
  fetchGA4Overview,
  fetchGA4Channels,
  fetchGA4Geography,
  fetchGA4TopPages,
} from "@/lib/mcp/ga4";
import {
  fetchGA4Campaigns,
  fetchGA4SourceMedium,
  fetchGA4GeographySourceMedium,
  fetchGA4Events,
  fetchGA4Demographics,
  fetchGA4Technology,
  fetchGA4Acquisition,
  fetchGA4Content,
  fetchGA4TimePatterns,
  fetchGA4ConversionPaths,
  fetchGA4Retention,
  fetchGA4SearchTerms,
  fetchGA4Realtime,
} from "@/lib/mcp/ga4-campaigns";
import { fetchGA4Ads } from "@/lib/mcp/ga4-ads";
import { fetchGA4FluidFusion } from "@/lib/mcp/ga4-fluid-fusion";
import {
  fetchHubSpotDeals,
  fetchHubSpotDealsByStage,
  fetchHubSpotContacts,
  fetchHubSpotCompanies,
  fetchHubSpotConversations,
  fetchHubSpotCalls,
  fetchHubSpotEmails,
  fetchHubSpotMeetings,
  fetchHubSpotTasks,
  fetchHubSpotTickets,
  fetchHubSpotProducts,
  fetchHubSpotLineItems,
  fetchHubSpotQuotes,
  fetchHubSpotOwners,
  fetchHubSpotPipelines,
} from "@/lib/mcp/hubspot";
import {
  fetchLinkedInAccounts,
  fetchLinkedInCampaigns,
  fetchLinkedInAnalytics,
} from "@/lib/mcp/linkedin";
import { fetchRedditPosts } from "@/lib/mcp/reddit";
import {
  fetchWindsorAIGoogleAds,
  fetchWindsorAIRedditAds,
  fetchWindsorAILinkedInAds,
  fetchWindsorAIAds,
} from "@/lib/mcp/windsor-ai";
import { trackRequest } from "@/lib/usage-tracker";

const params = (p: Record<string, unknown> | undefined) => p ?? {};

export async function executeToolInProcess(
  toolName: string,
  parameters: Record<string, unknown> | undefined
): Promise<unknown> {
  const p = params(parameters);

  switch (toolName) {
    // GA4
    case "get_ga4_overview": {
      trackRequest("ga4");
      const { startDate = "7daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4Overview({ startDate, endDate });
    }
    case "get_ga4_campaigns": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4Campaigns({ startDate, endDate });
    }
    case "get_ga4_ads": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4Ads({ startDate, endDate });
    }
    case "get_ga4_geography": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4Geography({ startDate, endDate });
    }
    case "get_ga4_traffic": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4Channels({ startDate, endDate });
    }
    case "get_ga4_top_pages": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4TopPages({ startDate, endDate });
    }
    case "get_ga4_acquisition": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4Acquisition({ startDate, endDate });
    }
    case "get_ga4_content": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4Content({ startDate, endDate });
    }
    case "get_ga4_conversion_paths": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4ConversionPaths({ startDate, endDate });
    }
    case "get_ga4_demographics": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4Demographics({ startDate, endDate });
    }
    case "get_ga4_events": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4Events({ startDate, endDate });
    }
    case "get_ga4_fluid_fusion": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4FluidFusion({ startDate, endDate });
    }
    case "get_ga4_realtime": {
      trackRequest("ga4");
      return fetchGA4Realtime();
    }
    case "get_ga4_retention": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4Retention({ startDate, endDate });
    }
    case "get_ga4_search_terms": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4SearchTerms({ startDate, endDate });
    }
    case "get_ga4_source_medium": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4SourceMedium({ startDate, endDate });
    }
    case "get_ga4_technology": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4Technology({ startDate, endDate });
    }
    case "get_ga4_time_patterns": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday" } = p as { startDate?: string; endDate?: string };
      return fetchGA4TimePatterns({ startDate, endDate });
    }
    case "get_ga4_geography_source_medium": {
      trackRequest("ga4");
      const { startDate = "30daysAgo", endDate = "yesterday", country } = p as {
        startDate?: string;
        endDate?: string;
        country?: string;
      };
      return fetchGA4GeographySourceMedium({ startDate, endDate, country });
    }

    // HubSpot
    case "get_hubspot_deals": {
      trackRequest("hubspot");
      const { limit = 10, query } = p as { limit?: number; query?: string };
      const deals = await fetchHubSpotDeals(limit);
      if (query) {
        return {
          ...deals,
          deals: deals.deals.filter((d: { name?: string }) =>
            d.name?.toLowerCase().includes(query.toLowerCase())
          ),
        };
      }
      return deals;
    }
    case "search_hubspot_contacts": {
      trackRequest("hubspot");
      const { query = "", limit = 10 } = p as { query?: string; limit?: number };
      const contacts = await fetchHubSpotContacts(query, limit);
      return { contacts };
    }
    case "get_hubspot_companies": {
      trackRequest("hubspot");
      const { limit = 10, query } = p as { limit?: number; query?: string };
      const companies = await fetchHubSpotCompanies(limit);
      const list = query
        ? companies.filter((c: { name?: string }) =>
            c.name?.toLowerCase().includes(query.toLowerCase())
          )
        : companies;
      return { companies: list };
    }
    case "get_hubspot_conversations": {
      trackRequest("hubspot");
      const { threadId, limit = 10 } = p as { threadId?: string; limit?: number };
      const conversations = await fetchHubSpotConversations(limit);
      if (threadId) {
        const thread = conversations.threads?.find((t: { id?: string }) => t.id === threadId) ?? null;
        return { thread };
      }
      return { threads: conversations.threads, summary: conversations.summary };
    }
    case "get_hubspot_calls": {
      trackRequest("hubspot");
      const { limit = 10 } = p as { limit?: number };
      const calls = await fetchHubSpotCalls(limit);
      return { calls };
    }
    case "get_hubspot_emails": {
      trackRequest("hubspot");
      const { limit = 10 } = p as { limit?: number };
      const emails = await fetchHubSpotEmails(limit);
      return { emails };
    }
    case "get_hubspot_meetings": {
      trackRequest("hubspot");
      const { limit = 10 } = p as { limit?: number };
      const meetings = await fetchHubSpotMeetings(limit);
      return { meetings };
    }
    case "get_hubspot_tasks": {
      trackRequest("hubspot");
      const { limit = 10 } = p as { limit?: number };
      const tasks = await fetchHubSpotTasks(limit);
      return { tasks };
    }
    case "get_hubspot_tickets": {
      trackRequest("hubspot");
      const { limit = 10 } = p as { limit?: number };
      const tickets = await fetchHubSpotTickets(limit);
      return { tickets };
    }
    case "get_hubspot_products": {
      trackRequest("hubspot");
      const { limit = 10 } = p as { limit?: number };
      const products = await fetchHubSpotProducts(limit);
      return { products };
    }
    case "get_hubspot_line_items": {
      trackRequest("hubspot");
      const { limit = 10 } = p as { limit?: number };
      const lineItems = await fetchHubSpotLineItems(limit);
      return { lineItems };
    }
    case "get_hubspot_quotes": {
      trackRequest("hubspot");
      const { limit = 10 } = p as { limit?: number };
      const quotes = await fetchHubSpotQuotes(limit);
      return { quotes };
    }
    case "get_hubspot_owners": {
      trackRequest("hubspot");
      const owners = await fetchHubSpotOwners();
      return { owners };
    }
    case "get_hubspot_pipelines": {
      trackRequest("hubspot");
      const pipelines = await fetchHubSpotPipelines();
      return { pipelines };
    }
    case "get_hubspot_deals_by_stage": {
      trackRequest("hubspot");
      const { startDate = "30daysAgo", endDate = "yesterday", stage } = p as {
        startDate?: string;
        endDate?: string;
        stage?: string;
      };
      const parseDate = (dateStr: string): Date => {
        if (dateStr === "yesterday") {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          return d;
        }
        if (dateStr === "today") {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          return d;
        }
        if (dateStr.endsWith("daysAgo")) {
          const days = parseInt(dateStr, 10);
          const d = new Date();
          d.setDate(d.getDate() - days);
          return d;
        }
        return new Date(dateStr);
      };
      const start = parseDate(startDate);
      start.setHours(0, 0, 0, 0);
      const end = parseDate(endDate);
      end.setHours(23, 59, 59, 999);
      const data = await fetchHubSpotDealsByStage(start, end, stage);
      return {
        deals: data.deals,
        summary: data.summary,
        dateRange: { start: start.toISOString(), end: end.toISOString() },
      };
    }

    // LinkedIn
    case "list_linkedin_accounts": {
      trackRequest("linkedin");
      return fetchLinkedInAccounts();
    }
    case "get_linkedin_account_details": {
      trackRequest("linkedin");
      const accounts = await fetchLinkedInAccounts();
      const accountsWithDetails = await Promise.all(
        accounts.map(async (account: { id: string }) => {
          try {
            const campaigns = await fetchLinkedInCampaigns(account.id);
            const analytics = await fetchLinkedInAnalytics(account.id, 30);
            const activeCampaigns = campaigns.filter(
              (c: { status?: string }) =>
                c.status?.toUpperCase() === "ACTIVE" || c.status?.toUpperCase() === "RUNNING"
            );
            return {
              ...account,
              totalCampaigns: campaigns.length,
              activeCampaigns: activeCampaigns.length,
              campaigns: campaigns.map((c: { id: string; name: string; status: string; objective?: string }) => ({
                id: c.id,
                name: c.name,
                status: c.status,
                objective: c.objective,
              })),
              analytics: analytics.metrics,
              hasData: analytics.hasData,
            };
          } catch (error: unknown) {
            return {
              ...account,
              error: error instanceof Error ? error.message : String(error),
              totalCampaigns: 0,
              activeCampaigns: 0,
              campaigns: [],
              analytics: null,
              hasData: false,
            };
          }
        })
      );
      return { accounts: accountsWithDetails, totalAccounts: accountsWithDetails.length };
    }
    case "get_linkedin_campaigns": {
      trackRequest("linkedin");
      const { accountId, includeAnalytics } = p as { accountId: string; includeAnalytics?: boolean };
      const campaigns = await fetchLinkedInCampaigns(accountId);
      if (includeAnalytics && campaigns.length > 0) {
        const { fetchLinkedInCampaignsAnalytics } = await import("@/lib/mcp/linkedin-campaign-analytics");
        const analyticsMap = await fetchLinkedInCampaignsAnalytics(
          campaigns.map((c: { id: string; accountId: string; status: string }) => ({
            id: c.id,
            accountId: c.accountId,
            status: c.status,
          })),
          30
        );
        campaigns.forEach((campaign: { id: string; analytics?: unknown }) => {
          const analytics = analyticsMap.get(campaign.id);
          if (analytics !== undefined) campaign.analytics = analytics;
        });
      }
      return campaigns;
    }
    case "get_linkedin_analytics": {
      trackRequest("linkedin");
      const { accountId, daysBack = 30 } = p as { accountId: string; daysBack?: number };
      return fetchLinkedInAnalytics(accountId, daysBack);
    }
    case "get_linkedin_campaign_analytics": {
      trackRequest("linkedin");
      const { campaignIds, accountId, daysBack = 30 } = p as {
        campaignIds: string[];
        accountId: string;
        daysBack?: number;
      };
      const { fetchLinkedInCampaignsAnalytics } = await import("@/lib/mcp/linkedin-campaign-analytics");
      const campaigns = campaignIds.map((id: string) => ({ id, accountId, status: "ACTIVE" }));
      const analyticsMap = await fetchLinkedInCampaignsAnalytics(campaigns, daysBack);
      return Array.from(analyticsMap.entries()).map(([campaignId, metrics]) => ({
        campaignId,
        metrics,
      }));
    }

    // Reddit
    case "get_reddit_posts": {
      const { subreddit = "vpn", limit = 10, query } = p as { subreddit?: string; limit?: number; query?: string };
      const posts = await fetchRedditPosts({ subreddit, limit });
      if (query) {
        return posts.filter(
          (post: { title?: string; content?: string }) =>
            post.title?.toLowerCase().includes(query.toLowerCase()) ||
            post.content?.toLowerCase().includes(query.toLowerCase())
        );
      }
      return posts;
    }

    // Windsor AI Ads
    case "get_windsor_ai_google_ads": {
      trackRequest("windsor-ai");
      const { startDate = "30daysAgo", endDate = "yesterday", accountName = "PureVPN B2B - Business VPN" } = p as {
        startDate?: string;
        endDate?: string;
        accountName?: string;
      };
      return fetchWindsorAIGoogleAds(startDate, endDate, accountName);
    }
    case "get_windsor_ai_reddit_ads": {
      trackRequest("windsor-ai");
      const { startDate = "30daysAgo", endDate = "yesterday", accountName = "admin_PureWL" } = p as {
        startDate?: string;
        endDate?: string;
        accountName?: string;
      };
      return fetchWindsorAIRedditAds(startDate, endDate, accountName);
    }
    case "get_windsor_ai_linkedin_ads": {
      trackRequest("windsor-ai");
      const { startDate, endDate, accountName = "PureVPN - Partner & Enterprise Solution" } = p as {
        startDate?: string;
        endDate?: string;
        accountName?: string;
      };
      // Convert relative dates to YYYY-MM-DD format
      const parseDate = (dateStr: string): string => {
        if (dateStr === "yesterday") {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          return d.toISOString().split("T")[0]!;
        }
        if (dateStr === "today") {
          return new Date().toISOString().split("T")[0]!;
        }
        if (dateStr.endsWith("daysAgo")) {
          const days = parseInt(dateStr.replace("daysAgo", ""));
          const d = new Date();
          d.setDate(d.getDate() - days);
          return d.toISOString().split("T")[0]!;
        }
        return dateStr;
      };
      const finalStartDate = startDate ? parseDate(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!;
      const finalEndDate = endDate ? parseDate(endDate) : new Date().toISOString().split("T")[0]!;
      return fetchWindsorAILinkedInAds(finalStartDate, finalEndDate, accountName);
    }
    case "get_windsor_ai_all_ads": {
      trackRequest("windsor-ai");
      const { startDate, endDate } = p as { startDate?: string; endDate?: string };
      const parseDate = (dateStr: string): string => {
        if (dateStr === "yesterday") {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          return d.toISOString().split("T")[0]!;
        }
        if (dateStr === "today") {
          return new Date().toISOString().split("T")[0]!;
        }
        if (dateStr.endsWith("daysAgo")) {
          const days = parseInt(dateStr.replace("daysAgo", ""));
          const d = new Date();
          d.setDate(d.getDate() - days);
          return d.toISOString().split("T")[0]!;
        }
        return dateStr;
      };
      const finalStartDate = startDate ? parseDate(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!;
      const finalEndDate = endDate ? parseDate(endDate) : new Date().toISOString().split("T")[0]!;
      return fetchWindsorAIAds(finalStartDate, finalEndDate);
    }

    default:
      throw new Error(
        `Unknown tool: ${toolName}. Available: get_ga4_overview, get_hubspot_deals, list_linkedin_accounts, get_reddit_posts, get_windsor_ai_google_ads, get_windsor_ai_reddit_ads, get_windsor_ai_linkedin_ads, get_windsor_ai_all_ads, etc.`
      );
  }
}
