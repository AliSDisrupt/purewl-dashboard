"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FunnelChart } from "@/components/funnel/FunnelChart";
import { ConversionFunnelChart } from "@/components/funnel/ConversionFunnelChart";
import { ContentROITable } from "@/components/funnel/ContentROITable";
import { AccountWatch } from "@/components/funnel/AccountWatch";
import { DateRangePicker } from "@/components/dashboard/DateRangePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  TrendingDown, 
  TrendingUp, 
  Info, 
  Users, 
  DollarSign, 
  Target,
  BarChart3,
  Globe,
  Smartphone,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";

interface DateRange {
  startDate: string;
  endDate: string;
}

async function fetchFunnelData(startDate: string, endDate: string) {
  const res = await fetch(
    `/api/funnel?startDate=${startDate}&endDate=${endDate}`
  );
  if (!res.ok) throw new Error("Failed to fetch funnel data");
  return res.json();
}

async function fetchContentROI(startDate: string, endDate: string) {
  const res = await fetch(
    `/api/content-roi?startDate=${startDate}&endDate=${endDate}`
  );
  if (!res.ok) throw new Error("Failed to fetch Content ROI data");
  return res.json();
}

async function fetchGA4Overview(startDate: string, endDate: string) {
  const res = await fetch(
    `/api/ga4/overview?startDate=${startDate}&endDate=${endDate}`
  );
  if (!res.ok) throw new Error("Failed to fetch GA4 overview");
  return res.json();
}

async function fetchGA4SourceMedium(startDate: string, endDate: string) {
  const res = await fetch(
    `/api/ga4/source-medium?startDate=${startDate}&endDate=${endDate}`
  );
  if (!res.ok) throw new Error("Failed to fetch source/medium data");
  return res.json();
}

async function fetchGA4Geography(startDate: string, endDate: string) {
  const res = await fetch(
    `/api/ga4/geography?startDate=${startDate}&endDate=${endDate}`
  );
  if (!res.ok) throw new Error("Failed to fetch geography data");
  return res.json();
}

async function fetchGA4Technology(startDate: string, endDate: string) {
  const res = await fetch(
    `/api/ga4/technology?startDate=${startDate}&endDate=${endDate}`
  );
  if (!res.ok) throw new Error("Failed to fetch technology data");
  return res.json();
}

async function fetchHubSpotDeals() {
  const res = await fetch(`/api/hubspot/deals`);
  if (!res.ok) throw new Error("Failed to fetch HubSpot deals");
  return res.json();
}

export default function FullFunnelPage() {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
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
        const days = saved ? parseInt(saved) : 30;
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
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  });

  // Listen for date range changes
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
        const days = saved ? parseInt(saved) : 30;
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        setDateRange({
          startDate: start.toISOString().split("T")[0],
          endDate: end.toISOString().split("T")[0],
        });
      }
    };

    window.addEventListener("storage", handleDateRangeChange);
    window.addEventListener("dateRangeChange", handleDateRangeChange);
    return () => {
      window.removeEventListener("storage", handleDateRangeChange);
      window.removeEventListener("dateRangeChange", handleDateRangeChange);
    };
  }, []);

  // Fetch all data with cache-first strategy
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["funnel", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchFunnelData(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000, // Refresh every 5 minutes in background
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    placeholderData: (previousData) => previousData, // Show cached data immediately
  });

  const { data: contentROIData, isLoading: contentROILoading, isFetching: contentROIFetching } = useQuery({
    queryKey: ["content-roi", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchContentROI(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const { data: ga4Overview, isLoading: ga4OverviewLoading, isFetching: ga4OverviewFetching } = useQuery({
    queryKey: ["ga4-overview", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Overview(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const { data: sourceMediumData, isLoading: sourceMediumLoading, isFetching: sourceMediumFetching } = useQuery({
    queryKey: ["ga4-source-medium", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4SourceMedium(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const { data: geographyData, isLoading: geographyLoading, isFetching: geographyFetching } = useQuery({
    queryKey: ["ga4-geography", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Geography(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const { data: technologyData, isLoading: technologyLoading, isFetching: technologyFetching } = useQuery({
    queryKey: ["ga4-technology", dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchGA4Technology(dateRange.startDate, dateRange.endDate),
    refetchInterval: 300000,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const { data: hubspotDeals, isLoading: dealsLoading, isFetching: dealsFetching } = useQuery({
    queryKey: ["hubspot-deals"],
    queryFn: () => fetchHubSpotDeals(),
    refetchInterval: 300000,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const funnel = data?.funnel;
  const conversionRates = data?.conversionRates;
  const contentROI = contentROIData?.contentROI || [];
  const overview = ga4Overview?.summary || {};
  const sourceMedium = sourceMediumData?.sourceMedium || [];
  const geography = geographyData?.countries || [];
  const browsers = technologyData?.browsers || [];
  const operatingSystems = technologyData?.operatingSystems || [];
  const deals = hubspotDeals?.deals || [];

  // Calculate additional metrics
  const calculateMetrics = () => {
    if (!funnel || !overview) return null;

    const avgDealValue = funnel.level3.value > 0 
      ? funnel.level4.value / funnel.level3.value 
      : 0;
    
    const leadValue = funnel.level2.value > 0
      ? funnel.level4.value / funnel.level2.value
      : 0;

    const trafficValue = funnel.level1.value > 0
      ? funnel.level4.value / funnel.level1.value
      : 0;

    // Filter deals by date range (created within the selected period)
    const parseDate = (dateStr: string): Date => {
      const date = new Date(dateStr);
      return date;
    };

    const startDate = parseDate(dateRange.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = parseDate(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999);

    // Calculate pipeline value from deals created in the date range
    const pipelineValue = deals
      .filter((deal: any) => {
        if (!deal.createdAt) return false;
        const dealDate = new Date(deal.createdAt);
        return dealDate >= startDate && dealDate <= endDate;
      })
      .reduce((sum: number, deal: any) => {
        return sum + (deal.amount || 0);
      }, 0);

    return {
      avgDealValue,
      leadValue,
      trafficValue,
      pipelineValue,
      totalUsers: overview.users || 0,
      avgSessionDuration: overview.averageSessionDuration || 0,
      bounceRate: overview.bounceRate || 0,
    };
  };

  const metrics = calculateMetrics();

  // Enhanced insights
  const getInsights = () => {
    if (!funnel || !conversionRates) return [];

    const insights = [];

    // Level 1 to Level 2: Landing page/messaging issues
    if (funnel.level1.value > 0 && conversionRates.sessionToLead < 2) {
      insights.push({
        type: "warning",
        icon: TrendingDown,
        title: "Low Traffic-to-Lead Conversion",
        message: `Only ${conversionRates.sessionToLead.toFixed(1)}% of sessions are converting to leads. This suggests landing pages may need optimization or messaging adjustments.`,
      });
    }

    // Level 2 to Level 3: Integration issues
    if (
      funnel.level2.value > 0 &&
      conversionRates.leadToDeal < 50 &&
      funnel.level2.value > funnel.level3.value * 2
    ) {
      insights.push({
        type: "error",
        icon: AlertCircle,
        title: "Potential Integration Gap",
        message: `${funnel.level2.value} leads generated but only ${funnel.level3.value} deals created. The Lead_Generated event is firing, but HubSpot may not be creating deals (check integration).`,
      });
    }

    // Level 3 to Level 4: Sales performance
    if (
      funnel.level3.value > 0 &&
      conversionRates.dealToClose < 10 &&
      funnel.level3.value > funnel.level4.count * 5
    ) {
      insights.push({
        type: "warning",
        icon: TrendingDown,
        title: "Low Deal Close Rate",
        message: `Only ${conversionRates.dealToClose.toFixed(1)}% of deals are closing. This may indicate sales team performance issues or low-quality leads.`,
      });
    }

    // Positive insights
    if (conversionRates.sessionToLead >= 5) {
      insights.push({
        type: "success",
        icon: TrendingUp,
        title: "Strong Traffic Conversion",
        message: `${conversionRates.sessionToLead.toFixed(1)}% session-to-lead conversion is excellent!`,
      });
    }

    if (conversionRates.dealToClose >= 20) {
      insights.push({
        type: "success",
        icon: TrendingUp,
        title: "High Close Rate",
        message: `${conversionRates.dealToClose.toFixed(1)}% deal close rate is performing well!`,
      });
    }

    // Bounce rate insights
    if (metrics && metrics.bounceRate > 70) {
      insights.push({
        type: "warning",
        icon: AlertCircle,
        title: "High Bounce Rate",
        message: `Bounce rate of ${metrics.bounceRate.toFixed(1)}% is above optimal. Consider improving landing page relevance and user experience.`,
      });
    }

    return insights;
  };

  const insights = getInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Full Funnel Analysis</h1>
            {(isFetching || contentROIFetching || ga4OverviewFetching || sourceMediumFetching || geographyFetching || technologyFetching || dealsFetching) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Updating...</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Comprehensive view of your entire customer journey from Traffic → Leads → Deals → Revenue
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Loading funnel data...
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load funnel data"}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Overview */}
      {funnel && metrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Traffic</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{funnel.level1.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Generated</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{funnel.level2.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {conversionRates?.sessionToLead.toFixed(1)}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deals Created</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{funnel.level3.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {conversionRates?.leadToDeal.toFixed(1)}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closed-Won Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${funnel.level4.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {funnel.level4.count} deals closed
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Additional Metrics */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Deal Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.avgDealValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Value per Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.leadValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.pipelineValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Funnel Chart */}
      {funnel && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ConversionFunnelChart
            stages={[
              {
                number: 1,
                name: funnel.level1.label || "Total Traffic",
                count: funnel.level1.value,
                percentage: 100,
                color: "#3b82f6",
                breakdown: funnel.level1.breakdown || {},
              },
              {
                number: 2,
                name: funnel.level2.label || "Leads Generated",
                count: funnel.level2.value,
                percentage: conversionRates?.sessionToLead || 0,
                color: "#a855f7",
                breakdown: funnel.level2.breakdown || {},
              },
              {
                number: 3,
                name: funnel.level3.label || "Deals Created",
                count: funnel.level3.value,
                percentage: conversionRates?.leadToDeal || 0,
                color: "#14b8a6",
                breakdown: funnel.level3.breakdown || {},
              },
              {
                number: 4,
                name: funnel.level4.label || "Closed-Won Revenue",
                count: funnel.level4.count || 0,
                percentage: conversionRates?.dealToClose || 0,
                color: "#f59e0b",
                breakdown: funnel.level4.breakdown || {},
              },
            ]}
            dateRange={{
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            }}
          />
        </motion.div>
      )}

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="traffic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="traffic">
            <Globe className="h-4 w-4 mr-2" />
            Traffic
          </TabsTrigger>
          <TabsTrigger value="geography">
            <Globe className="h-4 w-4 mr-2" />
            Geography
          </TabsTrigger>
          <TabsTrigger value="technology">
            <Smartphone className="h-4 w-4 mr-2" />
            Technology
          </TabsTrigger>
          <TabsTrigger value="pipeline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="content">
            <Calendar className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
        </TabsList>

        {/* Traffic Sources Tab */}
        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources & Mediums</CardTitle>
            </CardHeader>
            <CardContent>
              {sourceMediumLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading...</div>
              ) : sourceMedium.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 font-medium text-sm pb-2 border-b">
                    <div>Source</div>
                    <div>Medium</div>
                    <div className="text-right">Sessions</div>
                    <div className="text-right">% of Total</div>
                  </div>
                  {sourceMedium.slice(0, 10).map((item: any, index: number) => {
                    const percentage = funnel?.level1.value > 0
                      ? (item.sessions / funnel.level1.value) * 100
                      : 0;
                    return (
                      <div key={index} className="grid grid-cols-4 gap-4 text-sm">
                        <div>{item.source || "direct"}</div>
                        <div>{item.medium || "none"}</div>
                        <div className="text-right">{item.sessions.toLocaleString()}</div>
                        <div className="text-right">{percentage.toFixed(1)}%</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">No data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {geographyLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading...</div>
              ) : geography.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 font-medium text-sm pb-2 border-b">
                    <div>Country</div>
                    <div className="text-right">Sessions</div>
                    <div className="text-right">% of Total</div>
                  </div>
                  {geography.slice(0, 15).map((item: any, index: number) => {
                    const percentage = funnel?.level1.value > 0
                      ? (item.sessions / funnel.level1.value) * 100
                      : 0;
                    return (
                      <div key={index} className="grid grid-cols-3 gap-4 text-sm">
                        <div>{item.country}</div>
                        <div className="text-right">{item.sessions.toLocaleString()}</div>
                        <div className="text-right">{percentage.toFixed(1)}%</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">No data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technology Tab */}
        <TabsContent value="technology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Browser & Operating System Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {technologyLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading...</div>
              ) : (browsers.length > 0 || operatingSystems.length > 0) ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Browser</h3>
                    <div className="space-y-2">
                      {browsers.slice(0, 10).map((item: any, index: number) => {
                        const percentage = overview?.users > 0
                          ? (item.users / overview.users) * 100
                          : 0;
                        return (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.browser}</span>
                            <div className="flex items-center gap-4">
                              <span>{item.users.toLocaleString()}</span>
                              <span className="text-muted-foreground w-16 text-right">{percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Operating System</h3>
                    <div className="space-y-2">
                      {operatingSystems.slice(0, 10).map((item: any, index: number) => {
                        const percentage = overview?.users > 0
                          ? (item.users / overview.users) * 100
                          : 0;
                        return (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.os}</span>
                            <div className="flex items-center gap-4">
                              <span>{item.users.toLocaleString()}</span>
                              <span className="text-muted-foreground w-16 text-right">{percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">No data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {dealsLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading...</div>
              ) : deals.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 font-medium text-sm pb-2 border-b">
                    <div>Stage</div>
                    <div className="text-right">Deal Count</div>
                    <div className="text-right">Total Value</div>
                  </div>
                  {(Object.entries(
                    deals.reduce((acc: any, deal: any) => {
                      const stage = deal.stage || "Unknown";
                      if (!acc[stage]) {
                        acc[stage] = { count: 0, value: 0 };
                      }
                      acc[stage].count += 1;
                      acc[stage].value += deal.amount || 0;
                      return acc;
                    }, {} as Record<string, { count: number; value: number }>)
                  ) as [string, { count: number; value: number }][])
                    .sort((a, b) => {
                      return b[1].value - a[1].value;
                    })
                    .map(([stage, data]) => (
                      <div key={stage} className="grid grid-cols-3 gap-4 text-sm">
                        <div>{stage}</div>
                        <div className="text-right">{data.count}</div>
                        <div className="text-right">${data.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">No data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <ContentROITable
            data={contentROI}
            isLoading={contentROILoading}
          />
        </TabsContent>
      </Tabs>

      {/* Business Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Info className="h-5 w-5" />
            Business Insights
          </h2>
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Alert
                  variant={
                    insight.type === "error"
                      ? "destructive"
                      : insight.type === "success"
                      ? "default"
                      : "default"
                  }
                  className={
                    insight.type === "success"
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : ""
                  }
                >
                  <Icon className="h-4 w-4" />
                  <AlertTitle>{insight.title}</AlertTitle>
                  <AlertDescription>{insight.message}</AlertDescription>
                </Alert>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Account Watch Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <AccountWatch />
      </motion.div>
    </div>
  );
}
