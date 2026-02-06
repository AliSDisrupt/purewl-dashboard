"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import { Eye, MousePointerClick, DollarSign, Target, AlertCircle } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface LinkedInMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  totalEngagements?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  reactions?: number;
  follows?: number;
  companyPageClicks?: number;
  landingPageClicks?: number;
  externalWebsiteConversions?: number;
  oneClickLeads?: number;
  qualifiedLeads?: number;
  validWorkEmailLeads?: number;
  videoStarts?: number;
  videoViews?: number;
  videoCompletions?: number;
  conversionValueInLocalCurrency?: number;
  sends?: number;
  opens?: number;
  replies?: number;
  clicksOnSend?: number;
  jobApplies?: number;
  jobViews?: number;
  jobSaves?: number;
  textUrlClicks?: number;
  cardClicks?: number;
  cardImpressions?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  costPerConversion?: number;
}

interface LinkedInMetricsProps {
  metrics: LinkedInMetrics;
  isLoading?: boolean;
  hasData?: boolean;
  dateRange?: string; // e.g., "Last 30 days"
}

export function LinkedInMetrics({ metrics, isLoading, hasData = true, dateRange = "Last 30 days" }: LinkedInMetricsProps) {
  // Only calculate essential metrics: CTR and CPC
  const ctr = metrics.ctr !== undefined 
    ? metrics.ctr.toFixed(2)
    : metrics.impressions > 0 
      ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2) 
      : "0.00";
  
  const cpc = metrics.cpc !== undefined
    ? metrics.cpc.toFixed(2)
    : metrics.clicks > 0 
      ? (metrics.spend / metrics.clicks).toFixed(2) 
      : "0.00";
  
  // Form submissions (using oneClickLeads or conversions)
  const formSubmissions = metrics.oneClickLeads || metrics.conversions || 0;

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            No Activity Found
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              No ad activity found for {dateRange}
            </p>
            <div className="text-sm text-muted-foreground space-y-1 max-w-md mx-auto">
              <p>This could mean:</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>No active campaigns during this period</li>
                <li>Campaigns are paused or scheduled for future dates</li>
                <li>All campaigns are in draft status</li>
              </ul>
              <p className="mt-4">Try checking a different date range or verify campaign status.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Metrics - Only Essential: Form Submissions, Cost, Impressions, Clicks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Form Submissions"
          value={formatNumber(formSubmissions)}
          change={0}
          changeLabel={dateRange}
          trend="neutral"
          loading={isLoading}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Cost"
          value={`$${formatNumber(metrics.spend)}`}
          change={0}
          changeLabel={dateRange}
          trend="neutral"
          loading={isLoading}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Impressions"
          value={formatNumber(metrics.impressions)}
          change={0}
          changeLabel={dateRange}
          trend="neutral"
          loading={isLoading}
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Clicks"
          value={formatNumber(metrics.clicks)}
          change={0}
          changeLabel={dateRange}
          trend="neutral"
          loading={isLoading}
          icon={<MousePointerClick className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Performance Metrics - Only CTR and CPC */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              CTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctr}%</div>
            <p className="text-xs text-muted-foreground mt-1">Click-through rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">CPC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cpc}</div>
            <p className="text-xs text-muted-foreground mt-1">Cost per click</p>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Data - Placeholder for geos data */}
      {(metrics as any).geos && (metrics as any).geos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Geographic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(metrics as any).geos.map((geo: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{geo.country || geo.region || "Unknown"}</span>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Impressions: {formatNumber(geo.impressions || 0)}</span>
                    <span>Clicks: {formatNumber(geo.clicks || 0)}</span>
                    <span>Cost: ${formatNumber(geo.spend || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
