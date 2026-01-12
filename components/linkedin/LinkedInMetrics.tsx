"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import { Eye, MousePointerClick, DollarSign, TrendingUp, Target, AlertCircle, Heart, MessageSquare, Share2, Users, Video, UserCheck } from "lucide-react";
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
  // Use calculated metrics from API if available, otherwise calculate
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

  const cpm = metrics.cpm !== undefined
    ? metrics.cpm.toFixed(2)
    : metrics.impressions > 0 
      ? ((metrics.spend / metrics.impressions) * 1000).toFixed(2) 
      : "0.00";

  const conversionRate = metrics.clicks > 0 
    ? ((metrics.conversions / metrics.clicks) * 100).toFixed(2)
    : "0.00";

  const costPerConversion = metrics.costPerConversion !== undefined
    ? metrics.costPerConversion.toFixed(2)
    : metrics.conversions > 0
      ? (metrics.spend / metrics.conversions).toFixed(2)
      : "0.00";

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
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <KPICard
          title="Spend"
          value={`$${formatNumber(metrics.spend)}`}
          change={0}
          changeLabel={dateRange}
          trend="neutral"
          loading={isLoading}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Conversions"
          value={formatNumber(metrics.conversions)}
          change={0}
          changeLabel={dateRange}
          trend="neutral"
          loading={isLoading}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">CPM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${cpm}</div>
            <p className="text-xs text-muted-foreground mt-1">Cost per 1,000 impressions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Conv. Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Conversion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cost/Conv.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.conversions > 0 ? `$${costPerConversion}` : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cost per conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">{dateRange}</div>
            <p className="text-xs text-muted-foreground mt-1">Analytics period</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      {((metrics.totalEngagements ?? 0) || (metrics.likes ?? 0) || (metrics.comments ?? 0) || (metrics.shares ?? 0)) > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Engagement Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(metrics.totalEngagements ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Engagements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.totalEngagements ?? 0)}</div>
                </CardContent>
              </Card>
            )}
            
            {(metrics.likes ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Likes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.likes ?? 0)}</div>
                </CardContent>
              </Card>
            )}
            
            {(metrics.comments ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.comments ?? 0)}</div>
                </CardContent>
              </Card>
            )}
            
            {(metrics.shares ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Shares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.shares ?? 0)}</div>
                </CardContent>
              </Card>
            )}
            
            {(metrics.follows ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Follows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.follows ?? 0)}</div>
                </CardContent>
              </Card>
            )}
            
            {(metrics.companyPageClicks ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Company Page Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.companyPageClicks ?? 0)}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Video Metrics */}
      {((metrics.videoViews ?? 0) || (metrics.videoStarts ?? 0) || (metrics.videoCompletions ?? 0)) > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Video Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(metrics.videoViews ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.videoViews ?? 0)}</div>
                </CardContent>
              </Card>
            )}
            
            {(metrics.videoStarts ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Video Starts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.videoStarts ?? 0)}</div>
                </CardContent>
              </Card>
            )}
            
            {(metrics.videoCompletions ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Video Completions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.videoCompletions ?? 0)}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Lead Metrics */}
      {((metrics.qualifiedLeads ?? 0) || (metrics.oneClickLeads ?? 0) || (metrics.validWorkEmailLeads ?? 0)) > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Lead Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(metrics.qualifiedLeads ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Qualified Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.qualifiedLeads ?? 0)}</div>
                </CardContent>
              </Card>
            )}
            
            {(metrics.oneClickLeads ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">One-Click Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.oneClickLeads ?? 0)}</div>
                </CardContent>
              </Card>
            )}
            
            {(metrics.validWorkEmailLeads ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Valid Work Email Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.validWorkEmailLeads ?? 0)}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      {((metrics.landingPageClicks ?? 0) || (metrics.externalWebsiteConversions ?? 0) || (metrics.conversionValueInLocalCurrency ?? 0)) > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(metrics.landingPageClicks ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Landing Page Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.landingPageClicks ?? 0)}</div>
                </CardContent>
              </Card>
            )}
            
            {metrics.externalWebsiteConversions !== undefined && metrics.externalWebsiteConversions > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">External Website Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.externalWebsiteConversions || 0)}</div>
                </CardContent>
              </Card>
            )}
            
            {metrics.conversionValueInLocalCurrency !== undefined && metrics.conversionValueInLocalCurrency > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Conversion Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${formatNumber(metrics.conversionValueInLocalCurrency || 0)}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
