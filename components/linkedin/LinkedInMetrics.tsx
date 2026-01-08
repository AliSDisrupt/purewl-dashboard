"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import { Eye, MousePointerClick, DollarSign, TrendingUp, Target, AlertCircle } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface LinkedInMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

interface LinkedInMetricsProps {
  metrics: LinkedInMetrics;
  isLoading?: boolean;
  hasData?: boolean;
  dateRange?: string; // e.g., "Last 30 days"
}

export function LinkedInMetrics({ metrics, isLoading, hasData = true, dateRange = "Last 30 days" }: LinkedInMetricsProps) {
  const ctr = metrics.impressions > 0 
    ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2) 
    : "0.00";
  
  const cpc = metrics.clicks > 0 
    ? (metrics.spend / metrics.clicks).toFixed(2) 
    : "0.00";

  const cpm = metrics.impressions > 0 
    ? ((metrics.spend / metrics.impressions) * 1000).toFixed(2) 
    : "0.00";

  const conversionRate = metrics.clicks > 0 
    ? ((metrics.conversions / metrics.clicks) * 100).toFixed(2)
    : "0.00";

  const costPerConversion = metrics.conversions > 0
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
    </div>
  );
}
