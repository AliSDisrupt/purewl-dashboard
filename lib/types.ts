// Type definitions for the dashboard

export interface GA4OverviewResponse {
  summary: {
    totalUsers: number;
    newUsers: number;
    sessions: number;
    pageViews: number;
    engagementRate: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  trend: Array<{
    date: string;
    totalUsers: number;
    sessions: number;
  }>;
}

export interface ChannelData {
  channel: string;
  users: number;
  sessions: number;
  engagementRate: number;
  bounceRate: number;
}

export interface GeoData {
  country: string;
  countryCode: string;
  users: number;
  sessions: number;
}

export interface TopPage {
  path: string;
  users: number;
  pageViews: number;
  engagementRate: number;
}

export interface Deal {
  id: string;
  name: string;
  amount: number | null;
  stage: string;
  closeDate: string | null;
  contactEmail?: string;
}

export interface HubSpotDealsResponse {
  deals: Deal[];
  summary: {
    totalDeals: number;
    totalValue: number;
    byStage: Record<string, number>;
  };
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
}

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  commentCount: number;
  url: string;
  createdAt: string;
  content: string | null;
}

export interface LinkedInCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  createdAt: string;
  accountId: string;
  accountName: string;
}

export interface LinkedInAnalyticsResponse {
  hasData: boolean;
  metrics?: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  };
}
