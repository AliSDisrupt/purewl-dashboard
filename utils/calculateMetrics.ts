/**
 * Helper functions for calculating LinkedIn Ads metrics
 */

import {
  LinkedInAdsSummary,
  LinkedInCampaignPerformance,
  DailyTrend,
  PipelineStageBreakdown,
  LinkedInAdsContact,
  LinkedInAdsDeal,
} from '@/types/ads';

/**
 * Calculate Cost Per Click (CPC)
 */
export function calculateCPC(spend: number, clicks: number): number {
  if (clicks === 0) return 0;
  return spend / clicks;
}

/**
 * Calculate Click-Through Rate (CTR)
 */
export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
}

/**
 * Calculate Cost Per Lead (CPL)
 */
export function calculateCPL(spend: number, leads: number): number {
  if (leads === 0) return 0;
  return spend / leads;
}

/**
 * Calculate Conversion Rate (Leads / Clicks)
 */
export function calculateConversionRate(leads: number, clicks: number): number {
  if (clicks === 0) return 0;
  return (leads / clicks) * 100;
}

/**
 * Calculate Deal Conversion Rate (Deals / Leads)
 */
export function calculateDealConversionRate(deals: number, leads: number): number {
  if (leads === 0) return 0;
  return (deals / leads) * 100;
}

/**
 * Calculate summary metrics from raw data
 */
export function calculateSummaryMetrics(
  spend: number,
  impressions: number,
  clicks: number,
  leads: number,
  deals: number,
  dealValue: number
): LinkedInAdsSummary {
  return {
    totalSpend: spend,
    totalImpressions: impressions,
    totalClicks: clicks,
    cpc: calculateCPC(spend, clicks),
    ctr: calculateCTR(clicks, impressions),
    totalLeads: leads,
    conversionRate: calculateConversionRate(leads, clicks),
    totalDealValue: dealValue,
    totalDeals: deals,
    dealConversionRate: calculateDealConversionRate(deals, leads),
  };
}

/**
 * Group contacts by campaign name
 */
export function groupContactsByCampaign(
  contacts: LinkedInAdsContact[]
): Record<string, LinkedInAdsContact[]> {
  const grouped: Record<string, LinkedInAdsContact[]> = {};
  
  contacts.forEach((contact) => {
    const campaign = contact.sourceCampaign || contact.utmCampaign || "Unknown";
    if (!grouped[campaign]) {
      grouped[campaign] = [];
    }
    grouped[campaign].push(contact);
  });
  
  return grouped;
}

/**
 * Group deals by pipeline stage
 */
export function groupDealsByStage(
  deals: LinkedInAdsDeal[]
): PipelineStageBreakdown[] {
  const grouped: Record<string, LinkedInAdsDeal[]> = {};
  
  deals.forEach((deal) => {
    const stage = deal.stage || "Unknown";
    if (!grouped[stage]) {
      grouped[stage] = [];
    }
    grouped[stage].push(deal);
  });
  
  return Object.entries(grouped).map(([stage, stageDeals]) => ({
    stage,
    count: stageDeals.length,
    totalValue: stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0),
    deals: stageDeals,
  }));
}

/**
 * Generate daily trends from contacts
 */
export function generateDailyTrends(
  contacts: LinkedInAdsContact[],
  startDate: Date,
  endDate: Date
): DailyTrend[] {
  const trends: Record<string, DailyTrend> = {};
  
  // Initialize all dates in range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    trends[dateStr] = {
      date: dateStr,
      impressions: 0,
      clicks: 0,
      spend: 0,
      leads: 0,
    };
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Count leads per day
  contacts.forEach((contact) => {
    if (contact.createdAt) {
      const contactDate = new Date(contact.createdAt).toISOString().split('T')[0];
      if (trends[contactDate]) {
        trends[contactDate].leads += 1;
      }
    }
  });
  
  return Object.values(trends).sort((a, b) => 
    a.date.localeCompare(b.date)
  );
}
