"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Eye, MousePointerClick, DollarSign, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
}

interface GoogleAdsData {
  customerId: string;
  currencyCode: string;
  descriptiveName: string;
  campaigns: GoogleAdsCampaign[];
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalCost: number;
    totalConversions: number;
    averageCtr: number;
    averageCpc: number;
  };
}

interface GoogleAdsMetricsProps {
  data: GoogleAdsData;
  isLoading?: boolean;
}

export function GoogleAdsMetrics({ data, isLoading }: GoogleAdsMetricsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            Loading Google Ads data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary, campaigns } = data;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.currencyCode || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ENABLED":
        return "bg-green-500/20 text-green-600 dark:text-green-400";
      case "PAUSED":
        return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
      case "REMOVED":
        return "bg-red-500/20 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-500/20 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>{data.descriptiveName}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Customer ID: {data.customerId} • {campaigns.length} Campaigns
          </p>
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
            <CardTitle className="text-sm font-medium">Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalCost)}</div>
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
                ? `CPA: ${formatCurrency(summary.totalCost / summary.totalConversions)}`
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
                    <th className="text-right p-3 font-semibold text-sm">Impressions</th>
                    <th className="text-right p-3 font-semibold text-sm">Clicks</th>
                    <th className="text-right p-3 font-semibold text-sm">CTR</th>
                    <th className="text-right p-3 font-semibold text-sm">Cost</th>
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
                        <div className="text-xs text-muted-foreground">ID: {campaign.id}</div>
                      </td>
                      <td className="p-3 text-right">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getStatusColor(campaign.status))}
                        >
                          {campaign.status}
                        </Badge>
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
                        {formatCurrency(campaign.cost)}
                      </td>
                      <td className="p-3 text-right">{formatCurrency(campaign.cpc)}</td>
                      <td className="p-3 text-right">
                        <span className="font-medium">{formatNumber(campaign.conversions)}</span>
                        {campaign.conversions > 0 && (
                          <div className="text-xs text-muted-foreground">
                            CPA: {formatCurrency(campaign.cpa)}
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
