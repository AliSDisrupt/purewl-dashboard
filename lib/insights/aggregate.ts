/**
 * Orion Daily GTM Insights - Data aggregation layer (Phase 1).
 * Fetches from GA4, HubSpot, and RB2B only. LinkedIn, Reddit, and Google Ads are skipped.
 */

import { getWoWDateRanges } from "./dates";
import type {
  InsightsClaudeInput,
  InsightsDateRange,
  InsightsBusinessContext,
  GoogleAnalyticsInput,
  HubSpotInput,
  LinkedInAdsInput,
  RedditInput,
  RB2BInput,
  HistoricalDataInput,
  WindsorAIAdsInput,
} from "./types";
import { fetchGA4Overview, fetchGA4Geography, fetchGA4TopPages } from "@/lib/mcp/ga4";
import { fetchGA4SourceMedium, fetchGA4Events, fetchGA4Technology } from "@/lib/mcp/ga4-campaigns";
import { fetchHubSpotDealsByStage } from "@/lib/mcp/hubspot";
import { fetchWindsorAIAds } from "@/lib/mcp/windsor-ai";

const DEFAULT_BUSINESS_CONTEXT: InsightsBusinessContext = {
  industry: process.env.INSIGHTS_INDUSTRY || "B2B SaaS",
  targetAudience: process.env.INSIGHTS_TARGET_AUDIENCE || "Marketing and GTM teams",
  currentGoals: (process.env.INSIGHTS_GOALS || "Leads, MQLs, Pipeline").split(",").map((g) => g.trim()),
  monthlyBudget: Number(process.env.INSIGHTS_MONTHLY_BUDGET) || 10000,
  targetCPL: Number(process.env.INSIGHTS_TARGET_CPL) || 50,
  targetLeads: Number(process.env.INSIGHTS_TARGET_LEADS) || 200,
};

function emptyGA4(): GoogleAnalyticsInput {
  return {
    totalSessions: 0,
    totalUsers: 0,
    newUsers: 0,
    conversions: 0,
    conversionRate: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    topPages: [],
    trafficSources: [],
    geoData: [],
    deviceData: [],
    weekOverWeek: { sessions: { current: 0, previous: 0 }, conversions: { current: 0, previous: 0 } },
  };
}

function emptyHubSpot(): HubSpotInput {
  return {
    newLeads: 0,
    mqls: 0,
    sqls: 0,
    opportunities: 0,
    closedWon: 0,
    pipelineValue: 0,
    leadsBySource: [],
    conversionRates: { leadToMql: 0, mqlToSql: 0, sqlToOpp: 0, oppToClose: 0 },
    weekOverWeek: { leads: { current: 0, previous: 0 }, mqls: { current: 0, previous: 0 }, sqls: { current: 0, previous: 0 } },
  };
}

function emptyLinkedIn(): LinkedInAdsInput {
  return { accounts: [], weekOverWeek: { spend: { current: 0, previous: 0 }, leads: { current: 0, previous: 0 }, cpl: { current: 0, previous: 0 } } };
}

function emptyReddit(): RedditInput {
  return {
    posts: [],
    totalEngagement: 0,
    trafficReferred: 0,
    leadsFromReddit: 0,
    weekOverWeek: { engagement: { current: 0, previous: 0 } },
  };
}

function emptyRB2B(): RB2BInput {
  return {
    totalVisitors: 0,
    totalPageViews: 0,
    topCompanies: [],
    weekOverWeek: { visitors: { current: 0, previous: 0 }, pageViews: { current: 0, previous: 0 } },
  };
}

function emptyWindsorAI(): WindsorAIAdsInput {
  return {
    googleAds: { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 },
    redditAds: { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 },
    linkedInAds: { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 },
    totals: { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 },
    weekOverWeek: {
      impressions: { current: 0, previous: 0 },
      clicks: { current: 0, previous: 0 },
      spend: { current: 0, previous: 0 },
      conversions: { current: 0, previous: 0 },
      ctr: { current: 0, previous: 0 },
      cpc: { current: 0, previous: 0 },
    },
  };
}

async function fetchRB2BData(
  currentStart: Date,
  currentEnd: Date,
  previousStart: Date,
  previousEnd: Date
): Promise<RB2BInput> {
  if (!process.env.MONGODB_URI) return emptyRB2B();
  try {
    const connectDB = (await import("@/lib/db/mongodb")).default;
    const RB2BPersonVisit = (await import("@/lib/db/models/RB2BPersonVisit")).default;
    await connectDB();

    const [currentVisitors, previousVisitors, currentTotalViews, previousTotalViews, topCompanies] = await Promise.all([
      RB2BPersonVisit.countDocuments({ last_seen: { $gte: currentStart, $lte: currentEnd } }),
      RB2BPersonVisit.countDocuments({ last_seen: { $gte: previousStart, $lte: previousEnd } }),
      RB2BPersonVisit.aggregate<{ total: number }>([
        { $match: { last_seen: { $gte: currentStart, $lte: currentEnd } } },
        { $group: { _id: null, total: { $sum: "$page_views" } } },
      ]).then((r) => r[0]?.total ?? 0),
      RB2BPersonVisit.aggregate<{ total: number }>([
        { $match: { last_seen: { $gte: previousStart, $lte: previousEnd } } },
        { $group: { _id: null, total: { $sum: "$page_views" } } },
      ]).then((r) => r[0]?.total ?? 0),
      RB2BPersonVisit.aggregate<{ _id: string; pageViews: number; lastSeen: Date }>([
        { $match: { last_seen: { $gte: currentStart, $lte: currentEnd } } },
        {
          $group: {
            _id: { $ifNull: ["$visitor_data.company_name", "Unknown"] },
            pageViews: { $sum: "$page_views" },
            lastSeen: { $max: "$last_seen" },
          },
        },
        { $sort: { pageViews: -1 } },
        { $limit: 15 },
      ]).then((rows) =>
        rows.map((r) => ({
          companyName: r._id ?? "Unknown",
          pageViews: r.pageViews ?? 0,
          lastSeen: (r.lastSeen && new Date(r.lastSeen).toISOString()) ?? "",
        }))
      ),
    ]);

    return {
      totalVisitors: currentVisitors,
      totalPageViews: typeof currentTotalViews === "number" ? currentTotalViews : 0,
      topCompanies,
      weekOverWeek: {
        visitors: { current: currentVisitors, previous: previousVisitors },
        pageViews: {
          current: typeof currentTotalViews === "number" ? currentTotalViews : 0,
          previous: typeof previousTotalViews === "number" ? previousTotalViews : 0,
        },
      },
    };
  } catch (err) {
    console.error("Insights RB2B aggregation error:", err);
    return emptyRB2B();
  }
}

async function fetchGA4Data(
  current: { startDate: string; endDate: string },
  previous: { startDate: string; endDate: string }
): Promise<GoogleAnalyticsInput> {
  try {
    const [overviewCur, overviewPrev, topPagesCur, sourceMediumCur, geoCur, eventsCur, eventsPrev, techCur] = await Promise.all([
      fetchGA4Overview({ startDate: current.startDate, endDate: current.endDate }),
      fetchGA4Overview({ startDate: previous.startDate, endDate: previous.endDate }),
      fetchGA4TopPages({ startDate: current.startDate, endDate: current.endDate }),
      fetchGA4SourceMedium({ startDate: current.startDate, endDate: current.endDate }),
      fetchGA4Geography({ startDate: current.startDate, endDate: current.endDate }),
      fetchGA4Events({ startDate: current.startDate, endDate: current.endDate }),
      fetchGA4Events({ startDate: previous.startDate, endDate: previous.endDate }),
      fetchGA4Technology({ startDate: current.startDate, endDate: current.endDate }),
    ]);

    const conversionsCur = eventsCur.events?.reduce((sum, e) => sum + (e.conversions ?? 0), 0) ?? 0;
    const conversionsPrev = eventsPrev.events?.reduce((sum, e) => sum + (e.conversions ?? 0), 0) ?? 0;
    const sessionsCur = overviewCur.summary.sessions ?? 0;
    const sessionsPrev = overviewPrev.summary.sessions ?? 0;

    return {
      totalSessions: overviewCur.summary.sessions ?? 0,
      totalUsers: overviewCur.summary.totalUsers ?? 0,
      newUsers: overviewCur.summary.newUsers ?? 0,
      conversions: Math.round(conversionsCur),
      conversionRate: sessionsCur > 0 ? (conversionsCur / sessionsCur) * 100 : 0,
      bounceRate: (overviewCur.summary.bounceRate ?? 0) * 100,
      avgSessionDuration: overviewCur.summary.avgSessionDuration ?? 0,
      topPages: (topPagesCur.pages ?? []).slice(0, 20).map((p) => ({
        path: p.path,
        sessions: p.pageViews ?? p.users ?? 0,
        conversions: 0,
        bounceRate: (p.bounceRate ?? 0) * 100,
      })),
      trafficSources: (sourceMediumCur.sourceMedium ?? []).slice(0, 15).map((s) => ({
        source: s.source ?? "",
        medium: s.medium ?? "",
        sessions: s.sessions ?? 0,
        conversions: 0,
      })),
      geoData: (geoCur.countries ?? []).slice(0, 15).map((c) => ({
        country: c.country ?? "",
        sessions: c.sessions ?? 0,
        conversions: 0,
      })),
      deviceData: [...(techCur.browsers ?? []).slice(0, 5).map((d) => ({ device: d.browser ?? "", sessions: d.users ?? 0, conversionRate: 0 }))],
      weekOverWeek: {
        sessions: { current: sessionsCur, previous: sessionsPrev },
        conversions: { current: Math.round(conversionsCur), previous: Math.round(conversionsPrev) },
      },
    };
  } catch (err) {
    console.error("Insights GA4 aggregation error:", err);
    return emptyGA4();
  }
}

/** Map HubSpot deal stages to MQL/SQL/Opp/Closed Won (spec stages). */
function mapDealsByStageToFunnel(summary: { byStage?: Record<string, number>; stageDetails?: Record<string, { count: number; totalValue: number }> }) {
  const byStage = summary.byStage ?? {};
  const details = summary.stageDetails ?? {};
  const stageNames = Object.keys(byStage);
  const mqlStages = ["Lead Generated", "Email sent", "Qualification", "Requirements Received", "Conversation initiated"];
  const sqlStages = ["On trial", "Negotiation"];
  const oppStages = ["Contract sent"];
  const wonStages = ["Won", "Payment Recieved"];
  const lostStages = ["Lost", "Disqualified lead"];

  let mqls = 0,
    sqls = 0,
    opportunities = 0,
    closedWon = 0,
    pipelineValue = 0;
  stageNames.forEach((name) => {
    const count = byStage[name] ?? 0;
    const value = details[name]?.totalValue ?? 0;
    if (mqlStages.some((s) => name.toLowerCase().includes(s.toLowerCase()))) mqls += count;
    else if (sqlStages.some((s) => name.toLowerCase().includes(s.toLowerCase()))) sqls += count;
    else if (oppStages.some((s) => name.toLowerCase().includes(s.toLowerCase()))) opportunities += count;
    else if (wonStages.some((s) => name.toLowerCase().includes(s.toLowerCase()))) closedWon += count;
    if (!lostStages.some((s) => name.toLowerCase().includes(s.toLowerCase()))) pipelineValue += value;
  });
  return { mqls, sqls, opportunities, closedWon, pipelineValue, byStage };
}

async function fetchHubSpotData(
  currentStart: Date,
  currentEnd: Date,
  previousStart: Date,
  previousEnd: Date
): Promise<HubSpotInput> {
  try {
    const [dataCur, dataPrev] = await Promise.all([
      fetchHubSpotDealsByStage(currentStart, currentEnd),
      fetchHubSpotDealsByStage(previousStart, previousEnd),
    ]);
    const cur = mapDealsByStageToFunnel(dataCur.summary);
    const prev = mapDealsByStageToFunnel(dataPrev.summary);
    const totalLeadsCur = dataCur.deals.length;
    const totalLeadsPrev = dataPrev.deals.length;

    return {
      newLeads: totalLeadsCur,
      mqls: cur.mqls,
      sqls: cur.sqls,
      opportunities: cur.opportunities,
      closedWon: cur.closedWon,
      pipelineValue: cur.pipelineValue,
      leadsBySource: [],
      conversionRates: {
        leadToMql: totalLeadsCur ? (cur.mqls / totalLeadsCur) * 100 : 0,
        mqlToSql: cur.mqls ? (cur.sqls / cur.mqls) * 100 : 0,
        sqlToOpp: cur.sqls ? (cur.opportunities / cur.sqls) * 100 : 0,
        oppToClose: cur.opportunities ? (cur.closedWon / cur.opportunities) * 100 : 0,
      },
      weekOverWeek: {
        leads: { current: totalLeadsCur, previous: totalLeadsPrev },
        mqls: { current: cur.mqls, previous: prev.mqls },
        sqls: { current: cur.sqls, previous: prev.sqls },
      },
    };
  } catch (err) {
    console.error("Insights HubSpot aggregation error:", err);
    return emptyHubSpot();
  }
}

function buildHistoricalData(ga4: GoogleAnalyticsInput, hubspot: HubSpotInput): HistoricalDataInput {
  const leadsPerWeek = Math.round((hubspot.weekOverWeek.leads.current + hubspot.weekOverWeek.mqls.current) / 4) || 0;
  return {
    last30Days: {
      avgCPL: 0,
      avgConversionRate: ga4.conversionRate || 0,
      avgLeadsPerWeek: leadsPerWeek,
    },
    last90Days: {
      avgCPL: 0,
      avgConversionRate: ga4.conversionRate || 0,
      avgLeadsPerWeek: leadsPerWeek,
    },
  };
}

/**
 * Aggregate all insights data for the current and previous 7-day periods.
 * Returns payload suitable for Claude (Phase 2) or for testing (Phase 1).
 */
export async function aggregateInsightsData(options?: { asOf?: Date }): Promise<InsightsClaudeInput> {
  const ranges = getWoWDateRanges(options?.asOf);
  const dateRange: InsightsDateRange = {
    start: ranges.current.start,
    end: ranges.current.end,
    comparisonStart: ranges.previous.start,
    comparisonEnd: ranges.previous.end,
  };

  const currentStartDate = new Date(ranges.current.start);
  currentStartDate.setHours(0, 0, 0, 0);
  const currentEndDate = new Date(ranges.current.end);
  currentEndDate.setHours(23, 59, 59, 999);
  const previousStartDate = new Date(ranges.previous.start);
  previousStartDate.setHours(0, 0, 0, 0);
  const previousEndDate = new Date(ranges.previous.end);
  previousEndDate.setHours(23, 59, 59, 999);

  const [googleAnalytics, hubspot, rb2b, windsorAiCurrent, windsorAiPrevious] = await Promise.all([
    fetchGA4Data(ranges.currentGA4, ranges.previousGA4),
    fetchHubSpotData(currentStartDate, currentEndDate, previousStartDate, previousEndDate),
    fetchRB2BData(currentStartDate, currentEndDate, previousStartDate, previousEndDate),
    fetchWindsorAIAds(ranges.current.start, ranges.current.end).catch(() => null),
    fetchWindsorAIAds(ranges.previous.start, ranges.previous.end).catch(() => null),
  ]);

  // Process Windsor AI data
  let windsorAi: WindsorAIAdsInput = emptyWindsorAI();
  if (windsorAiCurrent) {
    const googleAds = windsorAiCurrent.googleAds || { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 };
    const redditAds = windsorAiCurrent.redditAds || { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 };
    const linkedInAds = windsorAiCurrent.linkedInAds || { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 };
    
    const totals = {
      impressions: googleAds.impressions + redditAds.impressions + linkedInAds.impressions,
      clicks: googleAds.clicks + redditAds.clicks + linkedInAds.clicks,
      spend: googleAds.spend + redditAds.spend + linkedInAds.spend,
      conversions: googleAds.conversions + redditAds.conversions + linkedInAds.conversions,
      ctr: 0, // Will calculate below
      cpc: 0, // Will calculate below
    };
    
    totals.ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    totals.cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;

    const previousGoogleAds = windsorAiPrevious?.googleAds || { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 };
    const previousRedditAds = windsorAiPrevious?.redditAds || { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 };
    const previousLinkedInAds = windsorAiPrevious?.linkedInAds || { impressions: 0, clicks: 0, spend: 0, conversions: 0, ctr: 0, cpc: 0 };
    
    const previousTotals = {
      impressions: previousGoogleAds.impressions + previousRedditAds.impressions + previousLinkedInAds.impressions,
      clicks: previousGoogleAds.clicks + previousRedditAds.clicks + previousLinkedInAds.clicks,
      spend: previousGoogleAds.spend + previousRedditAds.spend + previousLinkedInAds.spend,
      conversions: previousGoogleAds.conversions + previousRedditAds.conversions + previousLinkedInAds.conversions,
    };
    
    const previousCtr = previousTotals.impressions > 0 ? (previousTotals.clicks / previousTotals.impressions) * 100 : 0;
    const previousCpc = previousTotals.clicks > 0 ? previousTotals.spend / previousTotals.clicks : 0;

    windsorAi = {
      googleAds,
      redditAds,
      linkedInAds,
      totals,
      weekOverWeek: {
        impressions: { current: totals.impressions, previous: previousTotals.impressions },
        clicks: { current: totals.clicks, previous: previousTotals.clicks },
        spend: { current: totals.spend, previous: previousTotals.spend },
        conversions: { current: totals.conversions, previous: previousTotals.conversions },
        ctr: { current: totals.ctr, previous: previousCtr },
        cpc: { current: totals.cpc, previous: previousCpc },
      },
    };
  }

  const historicalData = buildHistoricalData(googleAnalytics, hubspot);

  return {
    dateRange,
    businessContext: DEFAULT_BUSINESS_CONTEXT,
    linkedInAds: emptyLinkedIn(),
    googleAnalytics,
    hubspot,
    reddit: emptyReddit(),
    rb2b,
    windsorAi,
    historicalData,
  };
}
