"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { CampaignsTable } from "@/components/analytics/CampaignsTable";
import { SourceMediumTable } from "@/components/analytics/SourceMediumTable";
import { EventsTable } from "@/components/analytics/EventsTable";
import { DemographicsChart } from "@/components/analytics/DemographicsChart";
import { TechnologyChart } from "@/components/analytics/TechnologyChart";
import { AcquisitionTable } from "@/components/analytics/AcquisitionTable";
import { ContentTable } from "@/components/analytics/ContentTable";
import { TimePatternsChart } from "@/components/analytics/TimePatternsChart";
import { ConversionPathsTable } from "@/components/analytics/ConversionPathsTable";
import { RetentionChart } from "@/components/analytics/RetentionChart";
import { SearchTermsTable } from "@/components/analytics/SearchTermsTable";
import { RealtimeWidget } from "@/components/analytics/RealtimeWidget";
import { FluidFusionMetrics } from "@/components/analytics/FluidFusionMetrics";
import { TrafficChart } from "@/components/charts/TrafficChart";
import { ChannelBreakdown } from "@/components/charts/ChannelBreakdown";
import { GeoMap } from "@/components/charts/GeoMap";
import { TopPages } from "@/components/ga4/TopPages";
import { Users, Activity, TrendingUp, DollarSign, Target, MousePointerClick } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { getComparisonPeriod, formatDateRangeLabel } from "@/lib/dateUtils";

// Fetch functions
async function fetchGA4Overview(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/overview?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 overview");
  return res.json();
}

async function fetchGA4Channels(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/traffic?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 channels");
  return res.json();
}

async function fetchGA4Geography(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/geography?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 geography");
  return res.json();
}

async function fetchGA4Pages(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/pages?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 pages");
  return res.json();
}

async function fetchGA4Campaigns(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/campaigns?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 campaigns");
  return res.json();
}

async function fetchGA4SourceMedium(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/source-medium?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 source/medium");
  return res.json();
}

async function fetchGA4Events(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/events?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 events");
  return res.json();
}

async function fetchGA4Demographics(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/demographics?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 demographics");
  return res.json();
}

async function fetchGA4Technology(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/technology?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 technology");
  return res.json();
}

// Phase 1: User Acquisition, Content, Time Patterns
async function fetchGA4Acquisition(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/acquisition?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 acquisition");
  return res.json();
}

async function fetchGA4Content(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/content?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 content");
  return res.json();
}

async function fetchGA4TimePatterns(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/time-patterns?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 time patterns");
  return res.json();
}

// Phase 2: Conversion Paths, Retention
async function fetchGA4ConversionPaths(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/conversion-paths?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 conversion paths");
  return res.json();
}

async function fetchGA4Retention(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/retention?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 retention");
  return res.json();
}

// Phase 3: Search Terms, Real-Time
async function fetchGA4SearchTerms(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/search-terms?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 search terms");
  return res.json();
}

async function fetchGA4Realtime() {
  const res = await fetch(`/api/ga4/realtime`);
  if (!res.ok) throw new Error("Failed to fetch GA4 realtime");
  return res.json();
}

async function fetchGA4FluidFusion(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/fluid-fusion?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 traffic data");
  return res.json();
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>(() => {
    if (typeof window !== "undefined") {
      const savedType = localStorage.getItem("dashboard-date-range-type");
      if (savedType === "custom") {
        const savedStart = localStorage.getItem("dashboard-custom-start-date");
        const savedEnd = localStorage.getItem("dashboard-custom-end-date");
        if (savedStart && savedEnd) {
          return {
            startDate: new Date(savedStart).toISOString().split("T")[0],
            endDate: new Date(savedEnd).toISOString().split("T")[0],
          };
        }
      } else if (savedType === "today") {
        const today = new Date().toISOString().split("T")[0];
        return { startDate: today, endDate: today };
      } else if (savedType === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        return { startDate: yesterdayStr, endDate: yesterdayStr };
      } else {
        const saved = localStorage.getItem("dashboard-date-range");
        const days = saved ? parseInt(saved) : 7;
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        return {
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
        };
      }
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  });

  // Calculate comparison period
  const comparisonPeriod = getComparisonPeriod(dateRange);

  useEffect(() => {
    const handleDateRangeChange = () => {
      const savedType = localStorage.getItem("dashboard-date-range-type");
      if (savedType === "custom") {
        const savedStart = localStorage.getItem("dashboard-custom-start-date");
        const savedEnd = localStorage.getItem("dashboard-custom-end-date");
        if (savedStart && savedEnd) {
          setDateRange({
            startDate: new Date(savedStart).toISOString().split("T")[0],
            endDate: new Date(savedEnd).toISOString().split("T")[0],
          });
        }
      } else if (savedType === "today") {
        const today = new Date().toISOString().split("T")[0];
        setDateRange({ startDate: today, endDate: today });
      } else if (savedType === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        setDateRange({ startDate: yesterdayStr, endDate: yesterdayStr });
      } else {
        const saved = localStorage.getItem("dashboard-date-range");
        const days = saved ? parseInt(saved) : 7;
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        setDateRange({
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
        });
      }
    };

    window.addEventListener("dateRangeChange", handleDateRangeChange);
    return () => window.removeEventListener("dateRangeChange", handleDateRangeChange);
  }, []);

  // Current period queries
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["ga4-overview", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Overview(dateRange.startDate, dateRange.endDate),
  });

  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ["ga4-channels", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Channels(dateRange.startDate, dateRange.endDate),
  });

  const { data: geography, isLoading: geoLoading } = useQuery({
    queryKey: ["ga4-geography", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Geography(dateRange.startDate, dateRange.endDate),
  });

  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ["ga4-pages", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Pages(dateRange.startDate, dateRange.endDate),
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["ga4-campaigns", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Campaigns(dateRange.startDate, dateRange.endDate),
  });

  const { data: sourceMedium, isLoading: sourceMediumLoading } = useQuery({
    queryKey: ["ga4-source-medium", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4SourceMedium(dateRange.startDate, dateRange.endDate),
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["ga4-events", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Events(dateRange.startDate, dateRange.endDate),
  });

  const { data: demographics, isLoading: demographicsLoading } = useQuery({
    queryKey: ["ga4-demographics", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Demographics(dateRange.startDate, dateRange.endDate),
  });

  const { data: technology, isLoading: technologyLoading } = useQuery({
    queryKey: ["ga4-technology", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Technology(dateRange.startDate, dateRange.endDate),
  });

  // Phase 1 queries
  const { data: acquisition, isLoading: acquisitionLoading } = useQuery({
    queryKey: ["ga4-acquisition", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Acquisition(dateRange.startDate, dateRange.endDate),
  });

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ["ga4-content", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Content(dateRange.startDate, dateRange.endDate),
  });

  const { data: timePatterns, isLoading: timePatternsLoading } = useQuery({
    queryKey: ["ga4-time-patterns", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4TimePatterns(dateRange.startDate, dateRange.endDate),
  });

  // Phase 2 queries
  const { data: conversionPaths, isLoading: conversionPathsLoading } = useQuery({
    queryKey: ["ga4-conversion-paths", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4ConversionPaths(dateRange.startDate, dateRange.endDate),
  });

  const { data: retention, isLoading: retentionLoading } = useQuery({
    queryKey: ["ga4-retention", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Retention(dateRange.startDate, dateRange.endDate),
  });

  // Phase 3 queries
  const { data: searchTerms, isLoading: searchTermsLoading } = useQuery({
    queryKey: ["ga4-search-terms", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4SearchTerms(dateRange.startDate, dateRange.endDate),
  });

  const { data: realtime, isLoading: realtimeLoading } = useQuery({
    queryKey: ["ga4-realtime"],
    queryFn: () => fetchGA4Realtime(),
    refetchInterval: 30000, // Refresh every 30 seconds for real-time data
  });

  const { data: fluidFusion, isLoading: fluidFusionLoading } = useQuery({
    queryKey: ["ga4-fluid-fusion", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4FluidFusion(dateRange.startDate, dateRange.endDate),
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });

  // Previous period queries for comparison
  const { data: prevOverview } = useQuery({
    queryKey: ["ga4-overview", comparisonPeriod.startDate, comparisonPeriod.endDate],
    queryFn: () => fetchGA4Overview(comparisonPeriod.startDate, comparisonPeriod.endDate),
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });

  const { data: prevCampaigns } = useQuery({
    queryKey: ["ga4-campaigns", comparisonPeriod.startDate, comparisonPeriod.endDate],
    queryFn: () => fetchGA4Campaigns(comparisonPeriod.startDate, comparisonPeriod.endDate),
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });

  const { data: prevSourceMedium } = useQuery({
    queryKey: ["ga4-source-medium", comparisonPeriod.startDate, comparisonPeriod.endDate],
    queryFn: () => fetchGA4SourceMedium(comparisonPeriod.startDate, comparisonPeriod.endDate),
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });

  const { data: prevEvents } = useQuery({
    queryKey: ["ga4-events", comparisonPeriod.startDate, comparisonPeriod.endDate],
    queryFn: () => fetchGA4Events(comparisonPeriod.startDate, comparisonPeriod.endDate),
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });

  const { data: prevAcquisition } = useQuery({
    queryKey: ["ga4-acquisition", comparisonPeriod.startDate, comparisonPeriod.endDate],
    queryFn: () => fetchGA4Acquisition(comparisonPeriod.startDate, comparisonPeriod.endDate),
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });

  const { data: prevContent } = useQuery({
    queryKey: ["ga4-content", comparisonPeriod.startDate, comparisonPeriod.endDate],
    queryFn: () => fetchGA4Content(comparisonPeriod.startDate, comparisonPeriod.endDate),
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });

  const { data: prevConversionPaths } = useQuery({
    queryKey: ["ga4-conversion-paths", comparisonPeriod.startDate, comparisonPeriod.endDate],
    queryFn: () => fetchGA4ConversionPaths(comparisonPeriod.startDate, comparisonPeriod.endDate),
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });

  // Calculate comparison metrics
  const calculateComparison = (current: number, previous: number) => {
    if (previous === 0) return { percentage: current > 0 ? 100 : 0, trend: current > 0 ? "up" : "neutral" };
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(change),
      trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
    };
  };

  const summary = overview?.summary;
  const prevSummary = prevOverview?.summary;
  const usersChange = summary && prevSummary
    ? calculateComparison(summary.totalUsers, prevSummary.totalUsers)
    : null;
  const sessionsChange = summary && prevSummary
    ? calculateComparison(summary.sessions, prevSummary.sessions)
    : null;
  const pageViewsChange = summary && prevSummary
    ? calculateComparison(summary.pageViews, prevSummary.pageViews)
    : null;

  return (
    <div className="space-y-6">
      {/* Header with Date Picker */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            {formatDateRangeLabel(dateRange)} vs {formatDateRangeLabel(comparisonPeriod)}
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* KPI Cards with Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Users"
          value={overviewLoading ? "..." : formatNumber(summary?.totalUsers || 0)}
          change={usersChange?.percentage || 0}
          changeLabel={`vs ${formatDateRangeLabel(comparisonPeriod)}`}
          trend={usersChange?.trend || "neutral"}
          loading={overviewLoading}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Sessions"
          value={overviewLoading ? "..." : formatNumber(summary?.sessions || 0)}
          change={sessionsChange?.percentage || 0}
          changeLabel={`vs ${formatDateRangeLabel(comparisonPeriod)}`}
          trend={sessionsChange?.trend || "neutral"}
          loading={overviewLoading}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Page Views"
          value={overviewLoading ? "..." : formatNumber(summary?.pageViews || 0)}
          change={pageViewsChange?.percentage || 0}
          changeLabel={`vs ${formatDateRangeLabel(comparisonPeriod)}`}
          trend={pageViewsChange?.trend || "neutral"}
          loading={overviewLoading}
          icon={<MousePointerClick className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Engagement Rate"
          value={
            overviewLoading
              ? "..."
              : `${((summary?.engagementRate || 0) * 100).toFixed(1)}%`
          }
          change={0}
          changeLabel=""
          trend="neutral"
          loading={overviewLoading}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Traffic Trend */}
      {overview?.trend && overview.trend.length > 0 && (
        <TrafficChart data={overview.trend} />
      )}

      {/* Phase 1: User Acquisition, Content, Time Patterns */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Phase 1: User Acquisition & Content</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AcquisitionTable
            current={acquisition?.acquisition || []}
            previous={prevAcquisition?.acquisition}
            isLoading={acquisitionLoading}
          />
          <ContentTable
            current={content?.content || []}
            previous={prevContent?.content}
            isLoading={contentLoading}
          />
        </div>
        <TimePatternsChart
          hours={timePatterns?.hours || []}
          daysOfWeek={timePatterns?.daysOfWeek || []}
          isLoading={timePatternsLoading}
        />
      </div>

      {/* Campaigns and Source/Medium */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CampaignsTable
          current={campaigns?.campaigns || []}
          previous={prevCampaigns?.campaigns}
          isLoading={campaignsLoading}
        />
        <SourceMediumTable
          current={sourceMedium?.sourceMedium || []}
          previous={prevSourceMedium?.sourceMedium}
          isLoading={sourceMediumLoading}
        />
      </div>

      {/* Events */}
      <EventsTable
        current={events?.events || []}
        previous={prevEvents?.events}
        isLoading={eventsLoading}
      />

      {/* Demographics and Technology */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DemographicsChart
          ageGroups={demographics?.ageGroups || []}
          genders={demographics?.genders || []}
          isLoading={demographicsLoading}
        />
        <TechnologyChart
          browsers={technology?.browsers || []}
          operatingSystems={technology?.operatingSystems || []}
          isLoading={technologyLoading}
        />
      </div>

      {/* Channels and Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {channels?.byChannel && channels.byChannel.length > 0 ? (
          <ChannelBreakdown data={channels.byChannel} />
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-border bg-card p-8">
            <p className="text-muted-foreground">
              {channelsLoading ? "Loading channels..." : "No channel data available"}
            </p>
          </div>
        )}

        {geography?.countries && geography.countries.length > 0 ? (
          <GeoMap data={geography.countries} />
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-border bg-card p-8">
            <p className="text-muted-foreground">
              {geoLoading ? "Loading geography..." : "No geographic data available"}
            </p>
          </div>
        )}
      </div>

      {/* Top Pages */}
      {pages?.pages && pages.pages.length > 0 ? (
        <TopPages pages={pages.pages} />
      ) : (
        <div className="flex items-center justify-center rounded-lg border border-border bg-card p-8">
          <p className="text-muted-foreground">
            {pagesLoading ? "Loading pages..." : "No page data available"}
          </p>
        </div>
      )}

      {/* Phase 2: Conversion Paths and Retention */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Phase 2: Conversion & Retention</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConversionPathsTable
            current={conversionPaths?.paths || []}
            previous={prevConversionPaths?.paths}
            isLoading={conversionPathsLoading}
          />
          <RetentionChart
            retention={retention?.retention || []}
            isLoading={retentionLoading}
          />
        </div>
      </div>

      {/* Total Traffic */}
      {fluidFusion && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Total Traffic</h2>
          <p className="text-muted-foreground">
            Traffic and conversions from Reddit, Google Ads, and Website/Direct sources
          </p>
          <FluidFusionMetrics data={fluidFusion} isLoading={fluidFusionLoading} />
        </div>
      )}

      {/* Phase 3: Search Terms and Real-Time */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Phase 3: Search & Real-Time</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SearchTermsTable
            searchTerms={searchTerms?.searchTerms || []}
            isLoading={searchTermsLoading}
          />
          <RealtimeWidget
            data={realtime}
            isLoading={realtimeLoading}
          />
        </div>
      </div>
    </div>
  );
}
