/**
 * Orion Daily GTM Insights - data types for aggregation and Claude input/output.
 * Matches orion-insights-spec.md ClaudeInput schema.
 */

export interface InsightsDateRange {
  start: string;
  end: string;
  comparisonStart: string;
  comparisonEnd: string;
}

export interface InsightsBusinessContext {
  industry: string;
  targetAudience: string;
  currentGoals: string[];
  monthlyBudget: number;
  targetCPL: number;
  targetLeads: number;
}

export interface LinkedInCampaignInput {
  name: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  ctr: number;
  cpl: number;
  frequency: number;
  geoBreakdown: Array<{ region: string; spend: number; leads: number; cpl: number }>;
  audienceBreakdown: Array<{ audience: string; spend: number; leads: number; cpl: number }>;
}

export interface LinkedInAccountInput {
  accountName: string;
  campaigns: LinkedInCampaignInput[];
}

export interface LinkedInWoW {
  spend: { current: number; previous: number };
  leads: { current: number; previous: number };
  cpl: { current: number; previous: number };
}

export interface LinkedInAdsInput {
  accounts: LinkedInAccountInput[];
  weekOverWeek: LinkedInWoW;
}

export interface GA4TopPageInput {
  path: string;
  sessions: number;
  conversions: number;
  bounceRate: number;
}

export interface GA4TrafficSourceInput {
  source: string;
  medium: string;
  sessions: number;
  conversions: number;
}

export interface GA4GeoInput {
  country: string;
  sessions: number;
  conversions: number;
}

export interface GA4DeviceInput {
  device: string;
  sessions: number;
  conversionRate: number;
}

export interface GA4WoW {
  sessions: { current: number; previous: number };
  conversions: { current: number; previous: number };
}

export interface GoogleAnalyticsInput {
  totalSessions: number;
  totalUsers: number;
  newUsers: number;
  conversions: number;
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: GA4TopPageInput[];
  trafficSources: GA4TrafficSourceInput[];
  geoData: GA4GeoInput[];
  deviceData: GA4DeviceInput[];
  weekOverWeek: GA4WoW;
}

export interface HubSpotLeadsBySource {
  source: string;
  count: number;
}

export interface HubSpotConversionRates {
  leadToMql: number;
  mqlToSql: number;
  sqlToOpp: number;
  oppToClose: number;
}

export interface HubSpotWoW {
  leads: { current: number; previous: number };
  mqls: { current: number; previous: number };
  sqls: { current: number; previous: number };
}

export interface HubSpotInput {
  newLeads: number;
  mqls: number;
  sqls: number;
  opportunities: number;
  closedWon: number;
  pipelineValue: number;
  leadsBySource: HubSpotLeadsBySource[];
  conversionRates: HubSpotConversionRates;
  weekOverWeek: HubSpotWoW;
}

export interface RedditPostInput {
  title: string;
  subreddit: string;
  upvotes: number;
  comments: number;
  engagement: number;
}

export interface RedditWoW {
  engagement: { current: number; previous: number };
}

export interface RedditInput {
  posts: RedditPostInput[];
  totalEngagement: number;
  trafficReferred: number;
  leadsFromReddit: number;
  weekOverWeek: RedditWoW;
}

/** RB2B identified visitors / person-visits (from MongoDB). */
export interface RB2BVisitorSummary {
  companyName: string;
  pageViews: number;
  lastSeen: string;
}

export interface RB2BWoW {
  visitors: { current: number; previous: number };
  pageViews: { current: number; previous: number };
}

export interface RB2BInput {
  totalVisitors: number;
  totalPageViews: number;
  topCompanies: RB2BVisitorSummary[];
  weekOverWeek: RB2BWoW;
}

export interface WindsorAIAdsWoW {
  impressions: { current: number; previous: number };
  clicks: { current: number; previous: number };
  spend: { current: number; previous: number };
  conversions: { current: number; previous: number };
  ctr: { current: number; previous: number };
  cpc: { current: number; previous: number };
}

export interface WindsorAIAdsInput {
  googleAds: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
  redditAds: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
  linkedInAds: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
  totals: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
  weekOverWeek: WindsorAIAdsWoW;
}

export interface HistoricalDataInput {
  last30Days: {
    avgCPL: number;
    avgConversionRate: number;
    avgLeadsPerWeek: number;
  };
  last90Days: {
    avgCPL: number;
    avgConversionRate: number;
    avgLeadsPerWeek: number;
  };
}

/** Full payload sent to Claude for analysis (orion-insights-spec ClaudeInput). */
export interface InsightsClaudeInput {
  dateRange: InsightsDateRange;
  businessContext: InsightsBusinessContext;
  linkedInAds: LinkedInAdsInput;
  googleAnalytics: GoogleAnalyticsInput;
  hubspot: HubSpotInput;
  reddit: RedditInput;
  /** RB2B identified visitors (from MCP/API). Omitted when not configured. */
  rb2b?: RB2BInput;
  /** Windsor AI ads performance data (Google Ads, Reddit Ads, LinkedIn Ads). */
  windsorAi?: WindsorAIAdsInput;
  historicalData: HistoricalDataInput;
}
