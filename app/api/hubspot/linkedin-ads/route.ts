import { NextResponse } from "next/server";
import {
  fetchLinkedInAdsContacts,
  fetchLinkedInAdsDeals,
  fetchLinkedInAdsConversations,
} from "@/lib/fetchHubSpotLinkedInData";
import {
  calculateSummaryMetrics,
  groupContactsByCampaign,
  groupDealsByStage,
  generateDailyTrends,
} from "@/utils/calculateMetrics";
import { LinkedInAdsData, LinkedInAdsDeal, LinkedInAdsConversation } from "@/types/ads";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const daysBack = parseInt(searchParams.get("daysBack") || "30", 10);

    // Calculate date range
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const startDateStr = start.toISOString().split("T")[0];
    const endDateStr = end.toISOString().split("T")[0];

    // Fetch LinkedIn-sourced contacts from HubSpot
    const contacts = await fetchLinkedInAdsContacts(
      startDateStr,
      endDateStr,
      1000
    );

    // Get contact IDs for fetching associated deals and conversations
    const contactIds = contacts.map((c) => c.id);

    // Fetch deals associated with LinkedIn contacts
    const deals = await fetchLinkedInAdsDeals(
      contactIds,
      startDateStr,
      endDateStr
    );

    // Fetch conversations from LinkedIn leads
    const conversations = await fetchLinkedInAdsConversations(contactIds, 100);

    // Group contacts by campaign
    const contactsByCampaign = groupContactsByCampaign(contacts);

    // Calculate campaign performance
    // Note: Actual LinkedIn Ads metrics (impressions, clicks, spend) would come from LinkedIn API
    // For now, we'll create placeholder campaigns based on contact data
    const campaigns = Object.entries(contactsByCampaign).map(
      ([campaignName, campaignContacts]) => {
        const campaignDeals = deals.filter((deal) =>
          campaignContacts.some((contact) =>
            deal.contactEmail === contact.email
          )
        );

        // Placeholder values - these would come from LinkedIn Ads API
        const impressions = 0; // Would come from LinkedIn API
        const clicks = campaignContacts.length * 10; // Estimate
        const spend = campaignContacts.length * 5; // Estimate $5 per lead

        return {
          campaignName,
          status: "ACTIVE" as const,
          impressions,
          clicks,
          ctr: calculateCTR(clicks, impressions),
          spend,
          leads: campaignContacts.length,
          cpl: calculateCPL(spend, campaignContacts.length),
          deals: campaignDeals.length,
          dealValue: campaignDeals.reduce(
            (sum, d) => sum + (d.amount || 0),
            0
          ),
        };
      }
    );

    // Group deals by pipeline stage
    // Convert HubSpotDeal[] to LinkedInAdsDeal[] format
    const linkedInDealsFormatted: LinkedInAdsDeal[] = deals.map((deal) => ({
      id: deal.id,
      name: deal.name,
      amount: deal.amount,
      stage: deal.stage,
      closeDate: deal.closeDate,
      createdAt: deal.createdAt || new Date().toISOString(),
      contactEmail: deal.contactEmail,
      source: deal.source || undefined,
      sourceData1: deal.sourceData1 || undefined,
      sourceData2: deal.sourceData2 || undefined,
    }));
    const pipelineBreakdown = groupDealsByStage(linkedInDealsFormatted);

    // Generate daily trends
    const dailyTrends = generateDailyTrends(contacts, start, end);

    // Calculate summary metrics
    const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalImpressions = campaigns.reduce(
      (sum, c) => sum + c.impressions,
      0
    );
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalLeads = contacts.length;
    const totalDeals = deals.length;
    const totalDealValue = deals.reduce((sum, d) => sum + (d.amount || 0), 0);

    const summary = calculateSummaryMetrics(
      totalSpend,
      totalImpressions,
      totalClicks,
      totalLeads,
      totalDeals,
      totalDealValue
    );

    // Convert HubSpotConversation[] to LinkedInAdsConversation[] format
    const linkedInConversationsFormatted: LinkedInAdsConversation[] = conversations
      .slice(0, 20)
      .map((conv) => ({
        id: conv.id,
        status: conv.status,
        createdAt: conv.createdAt || new Date().toISOString(),
        updatedAt: conv.updatedAt || conv.createdAt || new Date().toISOString(),
        subject: conv.subject,
        preview: conv.preview,
        channel: conv.channel,
        associatedContact: conv.associatedContact,
        associatedDeal: conv.associatedDeal,
        participantCount: conv.participantCount,
      }));

    const data: LinkedInAdsData = {
      summary,
      campaigns,
      dailyTrends,
      contacts: contacts.slice(0, 20), // Return last 20 contacts
      deals: linkedInDealsFormatted,
      conversations: linkedInConversationsFormatted,
      pipelineBreakdown,
    };

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching LinkedIn Ads data from HubSpot:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch LinkedIn Ads data",
        summary: {
          totalSpend: 0,
          totalImpressions: 0,
          totalClicks: 0,
          cpc: 0,
          ctr: 0,
          totalLeads: 0,
          conversionRate: 0,
          totalDealValue: 0,
          totalDeals: 0,
          dealConversionRate: 0,
        },
        campaigns: [],
        dailyTrends: [],
        contacts: [],
        deals: [],
        conversations: [],
        pipelineBreakdown: [],
      },
      { status: 500 }
    );
  }
}

// Helper function for CTR calculation
function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
}

// Helper function for CPL calculation
function calculateCPL(spend: number, leads: number): number {
  if (leads === 0) return 0;
  return spend / leads;
}
