import { NextResponse } from "next/server";
import { fetchLinkedInAnalytics, fetchLinkedInCampaigns } from "@/lib/mcp/linkedin";
import { fetchLinkedInCampaignsAnalytics } from "@/lib/mcp/linkedin-campaign-analytics";

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

    // First, try account-level analytics
    const accountData = await fetchLinkedInAnalytics(accountId, daysBack);
    
    // If account-level has data, return it
    if (accountData.hasData && accountData.metrics) {
      const response = {
        hasData: true,
        metrics: accountData.metrics
      };
      console.log(`LinkedIn Analytics API Response for ${accountId} (account-level):`, response);
      return NextResponse.json(response);
    }
    
    // If account-level has no data, try aggregating from campaign-level analytics
    console.log(`Account-level analytics returned no data for ${accountId}, trying campaign-level aggregation...`);
    
    try {
      // Fetch campaigns
      const campaigns = await fetchLinkedInCampaigns(accountId);
      
      if (campaigns.length === 0) {
        // No campaigns, return zeros
        const response = {
          hasData: false,
          metrics: {
            impressions: 0,
            clicks: 0,
            spend: 0,
            conversions: 0,
            ctr: 0,
            cpc: 0,
            cpm: 0,
            costPerConversion: 0,
          }
        };
        console.log(`No campaigns found for ${accountId}`);
        return NextResponse.json(response);
      }
      
      // Try ALL campaigns first (not just active), as data might exist for paused/completed campaigns
      // If that doesn't work, we'll try a longer date range
      let campaignsToCheck = campaigns;
      
      // First try: Check all campaigns (not just active) with current date range
      let analyticsMap = await fetchLinkedInCampaignsAnalytics(
        campaignsToCheck.map(c => ({ id: c.id, accountId: c.accountId, status: c.status })),
        daysBack,
        true // includeAllCampaigns = true to check all campaigns, not just active
      );
      
      // Aggregate metrics from all campaigns
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalSpend = 0;
      let totalConversions = 0;
      let totalEngagements = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;
      let totalReactions = 0;
      let totalFollows = 0;
      let totalCompanyPageClicks = 0;
      let totalLandingPageClicks = 0;
      let totalExternalWebsiteConversions = 0;
      let totalPostClickConversions = 0;
      let totalPostViewConversions = 0;
      let totalOneClickLeads = 0;
      let totalQualifiedLeads = 0;
      let totalValidWorkEmailLeads = 0;
      let totalVideoStarts = 0;
      let totalVideoViews = 0;
      let totalVideoCompletions = 0;
      let totalConversionValue = 0;
      
      analyticsMap.forEach((metrics) => {
        totalImpressions += metrics.impressions || 0;
        totalClicks += metrics.clicks || 0;
        totalSpend += metrics.spend || 0;
        totalConversions += metrics.conversions || 0;
        totalEngagements += metrics.totalEngagements || 0;
        totalLikes += metrics.likes || 0;
        totalComments += metrics.comments || 0;
        totalShares += metrics.shares || 0;
        totalReactions += metrics.reactions || 0;
        totalFollows += metrics.follows || 0;
        totalCompanyPageClicks += metrics.companyPageClicks || 0;
        totalLandingPageClicks += metrics.landingPageClicks || 0;
        totalExternalWebsiteConversions += metrics.externalWebsiteConversions || 0;
        totalPostClickConversions += metrics.externalWebsitePostClickConversions || 0;
        totalPostViewConversions += metrics.externalWebsitePostViewConversions || 0;
        totalOneClickLeads += metrics.oneClickLeads || 0;
        totalQualifiedLeads += metrics.qualifiedLeads || 0;
        totalValidWorkEmailLeads += metrics.validWorkEmailLeads || 0;
        totalVideoStarts += metrics.videoStarts || 0;
        totalVideoViews += metrics.videoViews || 0;
        totalVideoCompletions += metrics.videoCompletions || 0;
        totalConversionValue += metrics.conversionValueInLocalCurrency || 0;
      });
      
      // If no data with current range, try longer date range (90 days)
      if (totalImpressions === 0 && totalClicks === 0 && totalSpend === 0 && daysBack < 90) {
        console.log(`No data found with ${daysBack} days, trying 90 days...`);
        analyticsMap = await fetchLinkedInCampaignsAnalytics(
          campaignsToCheck.map(c => ({ id: c.id, accountId: c.accountId, status: c.status })),
          90,
          true // includeAllCampaigns = true
        );
        
        // Reset and recalculate
        totalImpressions = 0;
        totalClicks = 0;
        totalSpend = 0;
        totalConversions = 0;
        totalEngagements = 0;
        totalLikes = 0;
        totalComments = 0;
        totalShares = 0;
        totalReactions = 0;
        totalFollows = 0;
        totalCompanyPageClicks = 0;
        totalLandingPageClicks = 0;
        totalExternalWebsiteConversions = 0;
        totalPostClickConversions = 0;
        totalPostViewConversions = 0;
        totalOneClickLeads = 0;
        totalQualifiedLeads = 0;
        totalValidWorkEmailLeads = 0;
        totalVideoStarts = 0;
        totalVideoViews = 0;
        totalVideoCompletions = 0;
        totalConversionValue = 0;
        
        analyticsMap.forEach((metrics) => {
          totalImpressions += metrics.impressions || 0;
          totalClicks += metrics.clicks || 0;
          totalSpend += metrics.spend || 0;
          totalConversions += metrics.conversions || 0;
          totalEngagements += metrics.totalEngagements || 0;
          totalLikes += metrics.likes || 0;
          totalComments += metrics.comments || 0;
          totalShares += metrics.shares || 0;
          totalReactions += metrics.reactions || 0;
          totalFollows += metrics.follows || 0;
          totalCompanyPageClicks += metrics.companyPageClicks || 0;
          totalLandingPageClicks += metrics.landingPageClicks || 0;
          totalExternalWebsiteConversions += metrics.externalWebsiteConversions || 0;
          totalPostClickConversions += metrics.externalWebsitePostClickConversions || 0;
          totalPostViewConversions += metrics.externalWebsitePostViewConversions || 0;
          totalOneClickLeads += metrics.oneClickLeads || 0;
          totalQualifiedLeads += metrics.qualifiedLeads || 0;
          totalValidWorkEmailLeads += metrics.validWorkEmailLeads || 0;
          totalVideoStarts += metrics.videoStarts || 0;
          totalVideoViews += metrics.videoViews || 0;
          totalVideoCompletions += metrics.videoCompletions || 0;
          totalConversionValue += metrics.conversionValueInLocalCurrency || 0;
        });
      }
      
      // Calculate cost metrics
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
      const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
      const costPerConversion = totalExternalWebsiteConversions > 0 
        ? totalSpend / totalExternalWebsiteConversions 
        : 0;
      
      const hasData = totalImpressions > 0 || totalClicks > 0 || totalSpend > 0;
      
      const response = {
        hasData,
        metrics: {
          impressions: totalImpressions,
          clicks: totalClicks,
          spend: totalSpend,
          conversions: totalExternalWebsiteConversions || totalConversions,
          totalEngagements: totalEngagements,
          likes: totalLikes,
          comments: totalComments,
          shares: totalShares,
          reactions: totalReactions,
          follows: totalFollows,
          companyPageClicks: totalCompanyPageClicks,
          landingPageClicks: totalLandingPageClicks,
          externalWebsiteConversions: totalExternalWebsiteConversions,
          externalWebsitePostClickConversions: totalPostClickConversions,
          externalWebsitePostViewConversions: totalPostViewConversions,
          oneClickLeads: totalOneClickLeads,
          qualifiedLeads: totalQualifiedLeads,
          validWorkEmailLeads: totalValidWorkEmailLeads,
          videoStarts: totalVideoStarts,
          videoViews: totalVideoViews,
          videoCompletions: totalVideoCompletions,
          conversionValueInLocalCurrency: totalConversionValue,
          ctr,
          cpc,
          cpm,
          costPerConversion,
        }
      };
      
      console.log(`LinkedIn Analytics API Response for ${accountId} (campaign-level aggregated):`, {
        ...response,
        campaignsChecked: campaignsToCheck.length
      });
      
      return NextResponse.json(response);
      
    } catch (campaignError: any) {
      // If campaign aggregation fails, fall back to account-level result (even if zeros)
      console.warn(`Campaign-level aggregation failed for ${accountId}:`, campaignError.message);
      const response = {
        hasData: accountData.hasData || false,
        metrics: accountData.metrics || {
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
        }
      };
      return NextResponse.json(response);
    }
    
  } catch (error: any) {
    console.error("Error fetching LinkedIn analytics:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch LinkedIn analytics",
        message: error.message,
        hasData: false,
        metrics: {
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
          costPerConversion: 0,
        }
      },
      { status: 500 }
    );
  }
}
