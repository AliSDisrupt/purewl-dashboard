"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import { formatNumber } from "@/lib/utils";
import { Eye, MousePointerClick, DollarSign, TrendingUp, Globe, MessageSquare, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FluidFusionSource {
  source: string;
  medium: string;
  users: number;
  sessions: number;
  impressions?: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

interface FluidFusionData {
  reddit: FluidFusionSource;
  googleAds: FluidFusionSource;
  website: FluidFusionSource;
  total: {
    users: number;
    sessions: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

interface FluidFusionMetricsProps {
  data: FluidFusionData;
  isLoading?: boolean;
}

export function FluidFusionMetrics({ data, isLoading }: FluidFusionMetricsProps) {
  const renderSourceCard = (
    title: string,
    source: FluidFusionSource,
    icon: React.ReactNode,
    color: string
  ) => {
    const ctr = source.impressions && source.impressions > 0
      ? ((source.clicks / source.impressions) * 100).toFixed(2)
      : "0.00";

    return (
      <Card className={`border-2 ${color}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Impressions</div>
              <div className="text-2xl font-bold">{formatNumber(source.impressions || 0)}</div>
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
            {source.impressions && source.impressions > 0 && (
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground">CTR</div>
                <div className="text-lg font-semibold">{ctr}%</div>
              </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderSourceCard(
          "Reddit",
          data.reddit,
          <MessageSquare className="h-5 w-5" />,
          "border-orange-500/50 bg-orange-500/5"
        )}
        {renderSourceCard(
          "Google Ads",
          data.googleAds,
          <Search className="h-5 w-5" />,
          "border-blue-500/50 bg-blue-500/5"
        )}
        {renderSourceCard(
          "Website/Direct",
          data.website,
          <Globe className="h-5 w-5" />,
          "border-green-500/50 bg-green-500/5"
        )}
      </div>
    </div>
  );
}
