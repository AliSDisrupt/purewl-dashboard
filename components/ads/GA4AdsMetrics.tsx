"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import { formatNumber } from "@/lib/utils";
import { Eye, MousePointerClick, DollarSign, TrendingUp, MessageSquare, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdSourceData {
  source: string;
  medium: string;
  campaign?: string;
  impressions: number;
  clicks: number;
  users: number;
  sessions: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
}

interface GA4AdsData {
  reddit: AdSourceData;
  fluentForm: AdSourceData;
  total: {
    impressions: number;
    clicks: number;
    users: number;
    sessions: number;
    conversions: number;
    revenue: number;
  };
}

interface GA4AdsMetricsProps {
  data: GA4AdsData;
  isLoading?: boolean;
}

export function GA4AdsMetrics({ data, isLoading }: GA4AdsMetricsProps) {
  const renderSourceCard = (
    title: string,
    source: AdSourceData,
    icon: React.ReactNode,
    color: string
  ) => {
    return (
      <Card className={`border-2 ${color}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          {source.campaign && (
            <Badge variant="outline" className="w-fit mt-2">
              {source.campaign}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Impressions</div>
              <div className="text-2xl font-bold">{formatNumber(source.impressions)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Clicks</div>
              <div className="text-2xl font-bold">{formatNumber(source.clicks)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Users</div>
              <div className="text-xl font-semibold">{formatNumber(source.users)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sessions</div>
              <div className="text-xl font-semibold">{formatNumber(source.sessions)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Conversions</div>
              <div className="text-xl font-semibold text-green-500">{formatNumber(source.conversions)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Revenue</div>
              <div className="text-xl font-semibold text-green-500">${formatNumber(source.revenue)}</div>
            </div>
            {source.impressions > 0 && (
              <>
                <div>
                  <div className="text-sm text-muted-foreground">CTR</div>
                  <div className="text-lg font-semibold">{source.ctr.toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">CPC</div>
                  <div className="text-lg font-semibold">${source.cpc.toFixed(2)}</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Total Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Impressions"
          value={formatNumber(data.total.impressions)}
          change={0}
          changeLabel=""
          trend="neutral"
          loading={isLoading}
          icon={<Eye className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Total Clicks"
          value={formatNumber(data.total.clicks)}
          change={0}
          changeLabel=""
          trend="neutral"
          loading={isLoading}
          icon={<MousePointerClick className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Total Conversions"
          value={formatNumber(data.total.conversions)}
          change={0}
          changeLabel=""
          trend="neutral"
          loading={isLoading}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Total Revenue"
          value={`$${formatNumber(data.total.revenue)}`}
          change={0}
          changeLabel=""
          trend="neutral"
          loading={isLoading}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Source Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderSourceCard(
          "Reddit Ads",
          data.reddit,
          <MessageSquare className="h-5 w-5" />,
          "border-orange-500/50 bg-orange-500/5"
        )}
        {renderSourceCard(
          "FluentForm Ads",
          data.fluentForm,
          <FileText className="h-5 w-5" />,
          "border-purple-500/50 bg-purple-500/5"
        )}
      </div>
    </div>
  );
}
