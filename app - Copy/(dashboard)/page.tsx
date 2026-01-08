"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { KPICard } from "@/components/dashboard/KPICard";
import { TrafficChart } from "@/components/charts/TrafficChart";
import { ChannelBreakdown } from "@/components/charts/ChannelBreakdown";
import { GeoMap } from "@/components/charts/GeoMap";
import { TopPages } from "@/components/ga4/TopPages";
import { ApiStatus } from "@/components/dashboard/ApiStatus";
import { FluidFusionMetrics } from "@/components/analytics/FluidFusionMetrics";
import { Users, Activity, TrendingDown, DollarSign } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";

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

async function fetchHubSpotDeals() {
  const res = await fetch("/api/hubspot/deals");
  if (!res.ok) throw new Error("Failed to fetch HubSpot deals");
  return res.json();
}

async function fetchGA4FluidFusion(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/fluid-fusion?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 traffic data");
  return res.json();
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function DashboardPage() {
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
    // Default: last 7 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  });

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

  const { data: ga4Overview, isLoading: ga4Loading } = useQuery({
    queryKey: ["ga4-overview", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Overview(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const { data: ga4Channels, isLoading: channelsLoading } = useQuery({
    queryKey: ["ga4-channels", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Channels(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const { data: ga4Geography, isLoading: geoLoading } = useQuery({
    queryKey: ["ga4-geography", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Geography(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const { data: ga4Pages, isLoading: pagesLoading } = useQuery({
    queryKey: ["ga4-pages", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Pages(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const { data: hubspotDeals, isLoading: dealsLoading } = useQuery({
    queryKey: ["hubspot-deals"],
    queryFn: fetchHubSpotDeals,
    refetchInterval: 300000,
  });

  const { data: fluidFusionData, isLoading: fluidFusionLoading } = useQuery({
    queryKey: ["ga4-fluid-fusion", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4FluidFusion(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
  });

  const summary = ga4Overview?.summary;
  const trend = ga4Overview?.trend || [];
  const channels = ga4Channels?.byChannel || [];
  const countries = ga4Geography?.countries || [];
  const pages = ga4Pages?.pages || [];
  const pipelineValue = hubspotDeals?.summary?.totalValue || 0;

  const channelsWithPercentage = channels.map((ch: any) => {
    const total = channels.reduce((sum: number, c: any) => sum + (c.users || 0), 0);
    return {
      ...ch,
      percentage: total > 0 ? (ch.users / total) * 100 : 0,
    };
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <ApiStatus />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Users"
          value={ga4Loading ? "..." : formatNumber(summary?.totalUsers || 0)}
          change={12.5}
          changeLabel="vs last week"
          trend="up"
          loading={ga4Loading}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Sessions"
          value={ga4Loading ? "..." : formatNumber(summary?.sessions || 0)}
          change={8.2}
          changeLabel="vs last week"
          trend="up"
          loading={ga4Loading}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Bounce Rate"
          value={
            ga4Loading
              ? "..."
              : `${((summary?.bounceRate || 0) * 100).toFixed(1)}%`
          }
          change={-3.2}
          changeLabel="vs last week"
          trend="down"
          loading={ga4Loading}
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Pipeline Value"
          value={dealsLoading ? "..." : `$${formatNumber(pipelineValue)}`}
          change={15.0}
          changeLabel="vs last week"
          trend="up"
          loading={dealsLoading}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
      </motion.div>

      {trend.length > 0 && (
        <motion.div variants={item}>
          <TrafficChart data={trend} />
        </motion.div>
      )}

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {channelsWithPercentage.length > 0 ? (
          <ChannelBreakdown data={channelsWithPercentage} />
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-border bg-card p-8">
            <p className="text-muted-foreground">
              {channelsLoading ? "Loading channels..." : "No channel data available"}
            </p>
          </div>
        )}

        {countries.length > 0 ? (
          <GeoMap data={countries} />
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-border bg-card p-8">
            <p className="text-muted-foreground">
              {geoLoading ? "Loading geography..." : "No geographic data available"}
            </p>
          </div>
        )}
      </motion.div>

      <motion.div variants={item}>
        {pages.length > 0 ? (
          <TopPages pages={pages} />
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-border bg-card p-8">
            <p className="text-muted-foreground">
              {pagesLoading ? "Loading pages..." : "No page data available"}
            </p>
          </div>
        )}
      </motion.div>

      {/* Total Traffic Metrics */}
      <motion.div variants={item}>
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Total Traffic</h2>
            <p className="text-muted-foreground mt-1">
              Traffic and conversions from Reddit, Google Ads, and Website/Direct
            </p>
          </div>
          {fluidFusionData ? (
            <FluidFusionMetrics data={fluidFusionData} isLoading={fluidFusionLoading} />
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-border bg-card p-8">
              <p className="text-muted-foreground">
                {fluidFusionLoading ? "Loading traffic data..." : "No traffic data available"}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
