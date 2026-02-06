"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MousePointerClick, DollarSign, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface RedditAdCampaign {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate?: string;
  budget: number;
  impressions: number;
  clicks: number;
  spend: number;
  conversions?: number;
  ctr: number;
  cpc: number;
}

interface RedditAdsData {
  accountId: string;
  accountName: string;
  campaigns: RedditAdCampaign[];
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalSpend: number;
    totalConversions: number;
    averageCtr: number;
    averageCpc: number;
  };
  source?: string; // "windsor-ai" or undefined
  note?: string; // Optional note about data source
}

interface RedditAdsMetricsProps {
  data: RedditAdsData;
  isLoading?: boolean;
}

export function RedditAdsMetrics({ data, isLoading }: RedditAdsMetricsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            Loading Reddit Ads data...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show helpful message if no data at all
  if (!data) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            No Reddit Ads data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if there's an error in the data
  const hasError = (data as any)?.error;
  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{data?.accountName || "Reddit Ads"}</CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <p className="text-destructive font-medium">
              Reddit Ads API Error
            </p>
            <p className="text-muted-foreground text-sm">
              {(data as any).error}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Account ID: {data?.accountId || "Unknown"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state only if truly no data (no campaigns AND no summary metrics)
  const hasNoData = data.campaigns.length === 0 && 
                    data.summary.totalImpressions === 0 && 
                    data.summary.totalClicks === 0 && 
                    data.summary.totalSpend === 0;
  
  if (hasNoData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{data?.accountName || "Reddit Ads"}</CardTitle>
            {data.source === "windsor-ai" && (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                <span className="text-xs">🔗 Windsor AI</span>
              </Badge>
            )}
          </div>
          {data.note && (
            <p className="text-xs text-muted-foreground mt-2 italic">{data.note}</p>
          )}
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              No campaigns found for this date range.
            </p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Possible reasons:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>No active campaigns in the selected date range</li>
                <li>Account name "{data?.accountName || "admin_PureWL"}" may not match Windsor AI</li>
                <li>Data may not be synced yet in Windsor AI</li>
              </ul>
              <p className="mt-4">
                Account ID: {data?.accountId || "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary, campaigns } = data;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "active" || statusLower === "enabled" || statusLower === "running") {
      return "bg-green-500/20 text-green-600 dark:text-green-400";
    }
    if (statusLower === "paused" || statusLower === "paused_by_user") {
      return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
    }
    if (statusLower === "archived" || statusLower === "deleted" || statusLower === "removed") {
      return "bg-red-500/20 text-red-600 dark:text-red-400";
    }
    return "bg-gray-500/20 text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{data.accountName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Account ID: {data.accountId} • {campaigns.length} Campaigns
              </p>
            </div>
            {data.source === "windsor-ai" && (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                <span className="text-xs">🔗 Windsor AI</span>
              </Badge>
            )}
          </div>
          {data.note && (
            <p className="text-xs text-muted-foreground mt-2 italic">{data.note}</p>
          )}
        </CardHeader>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.totalImpressions)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total impressions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.totalClicks)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              CTR: {summary.averageCtr.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalSpend)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg CPC: {formatCurrency(summary.averageCpc)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.totalConversions)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalConversions > 0
                ? `CPA: ${formatCurrency(summary.totalSpend / summary.totalConversions)}`
                : "No conversions"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns found for this date range
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold text-sm">Campaign</th>
                    <th className="text-right p-3 font-semibold text-sm">Status</th>
                    <th className="text-right p-3 font-semibold text-sm">Budget</th>
                    <th className="text-right p-3 font-semibold text-sm">Impressions</th>
                    <th className="text-right p-3 font-semibold text-sm">Clicks</th>
                    <th className="text-right p-3 font-semibold text-sm">CTR</th>
                    <th className="text-right p-3 font-semibold text-sm">Spend</th>
                    <th className="text-right p-3 font-semibold text-sm">CPC</th>
                    <th className="text-right p-3 font-semibold text-sm">Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {campaign.id}
                          {campaign.startDate && (
                            <>
                              <br />
                              {new Date(campaign.startDate).toLocaleDateString()}
                              {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString()}`}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getStatusColor(campaign.status))}
                        >
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(campaign.budget)}
                      </td>
                      <td className="p-3 text-right">{formatNumber(campaign.impressions)}</td>
                      <td className="p-3 text-right">{formatNumber(campaign.clicks)}</td>
                      <td className="p-3 text-right">
                        <span
                          className={cn(
                            campaign.ctr > summary.averageCtr
                              ? "text-green-600 dark:text-green-400"
                              : campaign.ctr < summary.averageCtr * 0.5
                              ? "text-red-600 dark:text-red-400"
                              : ""
                          )}
                        >
                          {campaign.ctr.toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(campaign.spend)}
                      </td>
                      <td className="p-3 text-right">{formatCurrency(campaign.cpc)}</td>
                      <td className="p-3 text-right">
                        <span className="font-medium">
                          {formatNumber(campaign.conversions || 0)}
                        </span>
                        {campaign.conversions && campaign.conversions > 0 && (
                          <div className="text-xs text-muted-foreground">
                            CPA: {formatCurrency(campaign.spend / campaign.conversions)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
