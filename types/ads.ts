/**
 * TypeScript interfaces for LinkedIn Ads data from HubSpot
 */

export interface LinkedInAdsContact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  jobTitle: string | null;
  createdAt: string;
  sourceCampaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  associatedDeals?: string[];
  linkedInProfileUrl?: string;
  detectedSource?: string; // How we detected it (e.g., "PAID_SOCIAL", "linkedin", etc.)
}

export interface LinkedInAdsDeal {
  id: string;
  name: string;
  amount: number | null;
  stage: string;
  closeDate: string | null;
  createdAt: string;
  contactEmail?: string;
  source?: string;
  sourceData1?: string;
  sourceData2?: string;
}

export interface LinkedInAdsConversation {
  id: string;
  status: 'OPEN' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  subject?: string;
  preview?: string;
  channel?: string;
  associatedContact?: string;
  associatedDeal?: string;
  participantCount?: number;
}

export interface LinkedInCampaignPerformance {
  campaignName: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  leads: number;
  cpl: number;
  deals: number;
  dealValue: number;
}

export interface LinkedInAdsSummary {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  cpc: number;
  ctr: number;
  totalLeads: number;
  conversionRate: number;
  totalDealValue: number;
  totalDeals: number;
  dealConversionRate: number;
}

export interface DailyTrend {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  leads: number;
}

export interface PipelineStageBreakdown {
  stage: string;
  count: number;
  totalValue: number;
  deals: LinkedInAdsDeal[];
}

export interface LinkedInAdsData {
  summary: LinkedInAdsSummary;
  campaigns: LinkedInCampaignPerformance[];
  dailyTrends: DailyTrend[];
  contacts: LinkedInAdsContact[];
  deals: LinkedInAdsDeal[];
  conversations: LinkedInAdsConversation[];
  pipelineBreakdown: PipelineStageBreakdown[];
}
