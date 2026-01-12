/**
 * Agent 1: Data Aggregator
 * Fetches raw data from selected connectors (GA4, HubSpot, LinkedIn, Reddit)
 * 
 * GA4: Fetches ALL available endpoints (matching Atlas agent capabilities)
 */

import { 
  fetchGA4Overview, 
  fetchGA4Channels, 
  fetchGA4Geography, 
  fetchGA4TopPages 
} from "@/lib/mcp/ga4";
import {
  fetchGA4Campaigns,
  fetchGA4SourceMedium,
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
import { fetchHubSpotDeals } from "@/lib/mcp/hubspot";
import { fetchLinkedInAnalytics, fetchLinkedInAccounts } from "@/lib/mcp/linkedin";
import { searchRedditPosts } from "@/lib/mcp/reddit";

export interface DataAggregatorInput {
  dateRange: { start: string; end: string };
  connectors: string[];
}

export interface DataAggregatorOutput {
  data: {
    ga4?: any;
    hubspot?: any;
    linkedin?: any;
    reddit?: any;
  };
  metadata: {
    timestamp: string;
    completeness: string;
    notes: string[];
  };
}

export async function dataAggregator(
  input: DataAggregatorInput
): Promise<DataAggregatorOutput> {
  const data: any = {};
  const notes: string[] = [];
  const errors: string[] = [];

  // Calculate date range for API calls
  const startDate = new Date(input.dateRange.start);
  const endDate = new Date(input.dateRange.end);
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // For GA4, convert to relative format
  const ga4StartDate = `${daysDiff}daysAgo`;
  const ga4EndDate = "yesterday";
  const ga4Params = { startDate: ga4StartDate, endDate: ga4EndDate };

  // Fetch data in parallel for selected connectors
  const promises: Promise<void>[] = [];

  if (input.connectors.includes('ga4')) {
    // Fetch ALL GA4 endpoints in parallel (matching Atlas agent capabilities)
    promises.push(
      Promise.allSettled([
        // Overview (summary metrics)
        fetchGA4Overview(ga4Params),
        // Campaigns
        fetchGA4Campaigns(ga4Params),
        // Ads (Reddit, FluentForm)
        fetchGA4Ads(ga4Params),
        // Geography
        fetchGA4Geography(ga4Params),
        // Traffic/Channels
        fetchGA4Channels(ga4Params),
        // Top Pages
        fetchGA4TopPages(ga4Params),
        // Source/Medium
        fetchGA4SourceMedium(ga4Params),
        // Events
        fetchGA4Events(ga4Params),
        // Demographics
        fetchGA4Demographics(ga4Params),
        // Technology (browsers, OS)
        fetchGA4Technology(ga4Params),
        // Acquisition
        fetchGA4Acquisition(ga4Params),
        // Content
        fetchGA4Content(ga4Params),
        // Time Patterns
        fetchGA4TimePatterns(ga4Params),
        // Conversion Paths
        fetchGA4ConversionPaths(ga4Params),
        // Retention
        fetchGA4Retention(ga4Params),
        // Search Terms
        fetchGA4SearchTerms(ga4Params),
        // Fluid Fusion
        fetchGA4FluidFusion(ga4Params),
        // Realtime (no date params)
        fetchGA4Realtime(),
      ])
        .then((results) => {
          const [
            overviewResult,
            campaignsResult,
            adsResult,
            geographyResult,
            channelsResult,
            topPagesResult,
            sourceMediumResult,
            eventsResult,
            demographicsResult,
            technologyResult,
            acquisitionResult,
            contentResult,
            timePatternsResult,
            conversionPathsResult,
            retentionResult,
            searchTermsResult,
            fluidFusionResult,
            realtimeResult,
          ] = results;

          // Build comprehensive GA4 data object
          data.ga4 = {
            // Overview (summary metrics)
            overview: overviewResult.status === 'fulfilled' && overviewResult.value?.summary 
              ? overviewResult.value.summary 
              : null,
            
            // Campaigns
            campaigns: campaignsResult.status === 'fulfilled' && campaignsResult.value 
              ? campaignsResult.value 
              : null,
            
            // Ads (Reddit, FluentForm)
            ads: adsResult.status === 'fulfilled' && adsResult.value 
              ? adsResult.value 
              : null,
            
            // Geography (countries)
            geography: geographyResult.status === 'fulfilled' && geographyResult.value 
              ? geographyResult.value 
              : null,
            
            // Traffic/Channels
            channels: channelsResult.status === 'fulfilled' && channelsResult.value 
              ? channelsResult.value 
              : null,
            
            // Top Pages
            topPages: topPagesResult.status === 'fulfilled' && topPagesResult.value 
              ? topPagesResult.value 
              : null,
            
            // Source/Medium breakdown
            sourceMedium: sourceMediumResult.status === 'fulfilled' && sourceMediumResult.value 
              ? sourceMediumResult.value 
              : null,
            
            // Events
            events: eventsResult.status === 'fulfilled' && eventsResult.value 
              ? eventsResult.value 
              : null,
            
            // Demographics (age, gender)
            demographics: demographicsResult.status === 'fulfilled' && demographicsResult.value 
              ? demographicsResult.value 
              : null,
            
            // Technology (browsers, OS)
            technology: technologyResult.status === 'fulfilled' && technologyResult.value 
              ? technologyResult.value 
              : null,
            
            // Acquisition
            acquisition: acquisitionResult.status === 'fulfilled' && acquisitionResult.value 
              ? acquisitionResult.value 
              : null,
            
            // Content
            content: contentResult.status === 'fulfilled' && contentResult.value 
              ? contentResult.value 
              : null,
            
            // Time Patterns (hour, day of week)
            timePatterns: timePatternsResult.status === 'fulfilled' && timePatternsResult.value 
              ? timePatternsResult.value 
              : null,
            
            // Conversion Paths
            conversionPaths: conversionPathsResult.status === 'fulfilled' && conversionPathsResult.value 
              ? conversionPathsResult.value 
              : null,
            
            // Retention
            retention: retentionResult.status === 'fulfilled' && retentionResult.value 
              ? retentionResult.value 
              : null,
            
            // Search Terms
            searchTerms: searchTermsResult.status === 'fulfilled' && searchTermsResult.value 
              ? searchTermsResult.value 
              : null,
            
            // Fluid Fusion (Reddit, Google Ads, Website)
            fluidFusion: fluidFusionResult.status === 'fulfilled' && fluidFusionResult.value 
              ? fluidFusionResult.value 
              : null,
            
            // Realtime
            realtime: realtimeResult.status === 'fulfilled' && realtimeResult.value 
              ? realtimeResult.value 
              : null,
          };

          // Count successful fetches
          const successfulFetches = results.filter(r => r.status === 'fulfilled').length;
          const totalEndpoints = results.length;

          if (successfulFetches > 0) {
            notes.push(`GA4: Fetched ${successfulFetches}/${totalEndpoints} endpoints successfully`);
          } else {
            errors.push("GA4: All endpoints failed");
            data.ga4 = null;
          }

          // Log any failed endpoints
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              const endpointNames = [
                'Overview', 'Campaigns', 'Ads', 'Geography', 'Channels', 
                'TopPages', 'SourceMedium', 'Events', 'Demographics', 
                'Technology', 'Acquisition', 'Content', 'TimePatterns', 
                'ConversionPaths', 'Retention', 'SearchTerms', 
                'FluidFusion', 'Realtime'
              ];
              errors.push(`GA4 ${endpointNames[index]}: ${result.reason?.message || 'Failed'}`);
            }
          });
        })
        .catch((err) => {
          errors.push(`GA4: ${err.message || 'Connection failed'}`);
          data.ga4 = null;
        })
    );
  }

  if (input.connectors.includes('hubspot')) {
    promises.push(
      fetchHubSpotDeals(50)
        .then((result) => {
          if (result && result.deals) {
            const deals = result.deals || [];
            const activeDeals = deals.filter(
              (d: any) => d.stage !== 'closedwon' && d.stage !== 'closedlost'
            );
            const pipelineValue = activeDeals.reduce(
              (sum: number, deal: any) => sum + (deal.amount || 0),
              0
            );
            
            data.hubspot = {
              totalDeals: deals.length,
              activeDeals: activeDeals.length,
              closedWon: deals.filter((d: any) => d.stage === 'closedwon').length,
              closedLost: deals.filter((d: any) => d.stage === 'closedlost').length,
              pipelineValue,
              avgDealSize: activeDeals.length > 0 
                ? pipelineValue / activeDeals.length 
                : 0,
              deals: deals.slice(0, 10).map((deal: any) => ({
                name: deal.name,
                amount: deal.amount,
                stage: deal.stage,
                closeDate: deal.closeDate,
              })),
            };
            notes.push("HubSpot data fetched successfully");
          } else {
            errors.push("HubSpot: No deals found");
            data.hubspot = null;
          }
        })
        .catch((err) => {
          errors.push(`HubSpot: ${err.message || 'Connection failed'}`);
          data.hubspot = null;
        })
    );
  }

  if (input.connectors.includes('linkedin')) {
    promises.push(
      fetchLinkedInAccounts()
        .then((accounts) => {
          if (!accounts || accounts.length === 0) {
            throw new Error("No LinkedIn accounts found");
          }
          // Use the first account
          const accountId = accounts[0].id;
          return fetchLinkedInAnalytics(accountId, daysDiff);
        })
        .then((result) => {
          if (result && result.hasData && result.metrics) {
            const metrics = result.metrics;
            data.linkedin = {
              impressions: metrics.impressions || 0,
              clicks: metrics.clicks || 0,
              spend: metrics.spend || 0,
              ctr: metrics.ctr || 0,
              cpc: metrics.cpc || 0,
              cpm: metrics.cpm || 0,
              conversions: metrics.conversions || 0,
              costPerConversion: metrics.costPerConversion || 0,
              totalEngagements: metrics.totalEngagements || 0,
              likes: metrics.likes || 0,
              comments: metrics.comments || 0,
              shares: metrics.shares || 0,
              leads: metrics.oneClickLeads || 0,
            };
            notes.push("LinkedIn data fetched successfully");
          } else {
            errors.push("LinkedIn: No analytics data available");
            data.linkedin = null;
          }
        })
        .catch((err) => {
          errors.push(`LinkedIn: ${err.message || 'Connection failed'}`);
          data.linkedin = null;
        })
    );
  }

  if (input.connectors.includes('reddit')) {
    promises.push(
      searchRedditPosts(
        ["white label VPN", "Orion", "VPN reseller"],
        ["vpn", "privacy", "networking", "technology"],
        20,
        'week',
        input.dateRange.start,
        input.dateRange.end
      )
        .then((posts) => {
          if (posts && Array.isArray(posts)) {
            data.reddit = {
              totalPosts: posts.length,
              totalComments: posts.reduce((sum, post) => sum + (post.commentCount || 0), 0),
              totalScore: posts.reduce((sum, post) => sum + (post.score || 0), 0),
              avgScore: posts.length > 0 
                ? posts.reduce((sum, post) => sum + (post.score || 0), 0) / posts.length 
                : 0,
              posts: posts.slice(0, 10).map((post) => ({
                title: post.title,
                subreddit: post.subreddit,
                score: post.score,
                numComments: post.commentCount || 0,
                url: post.url,
                createdUtc: post.createdAt || new Date().toISOString(),
                matchedKeywords: post.matchedKeywords || [],
              })),
            };
            notes.push(`Reddit: Found ${posts.length} posts`);
          } else {
            errors.push("Reddit: No posts found");
            data.reddit = null;
          }
        })
        .catch((err) => {
          errors.push(`Reddit: ${err.message || 'Connection failed'}`);
          data.reddit = null;
        })
    );
  }

  // Wait for all promises to complete
  await Promise.allSettled(promises);

  // Calculate completeness
  const requestedConnectors = input.connectors.length;
  const successfulConnectors = Object.keys(data).filter(
    (key) => data[key] !== null && data[key] !== undefined
  ).length;
  const completeness = requestedConnectors > 0 
    ? `${Math.round((successfulConnectors / requestedConnectors) * 100)}%`
    : "0%";

  if (errors.length > 0) {
    notes.push(...errors.map((e) => `⚠️ ${e}`));
  }

  return {
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      completeness,
      notes,
    },
  };
}
