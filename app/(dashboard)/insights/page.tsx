"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Globe,
  Users,
  FileText,
  Palette,
  Funnel,
  DollarSign,
  Target,
  BarChart3,
  Sparkles,
  Loader2,
  Megaphone,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { InsightsClaudeOutput, TrendSummary } from "@/lib/insights/output-types";

async function fetchLatestInsights() {
  const res = await fetch("/api/insights/latest");
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("No insights found. Generate insights first.");
    }
    throw new Error("Failed to fetch insights");
  }
  return res.json();
}

async function generateInsights() {
  const res = await fetch("/api/insights/generate", { method: "POST" });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to generate insights");
  }
  return res.json();
}

function getHealthScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case "excellent":
      return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40";
    case "good":
      return "bg-primary/20 text-primary border-border";
    case "concerning":
      return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/40";
    case "critical":
      return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/** Safe number for display; use before .toLocaleString() or .toFixed() */
function safeNum(v: unknown): number {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Safe string for display; use before .replace(), .toUpperCase(), etc. */
function safeStr(v: unknown): string {
  if (v == null) return "";
  return typeof v === "string" ? v : String(v);
}

/** Build week-over-week summary from API input when Claude did not populate trends.summary. */
function deriveWoWSummaryFromInput(input: {
  googleAnalytics?: { weekOverWeek?: { sessions?: { current?: number; previous?: number }; conversions?: { current?: number; previous?: number } } };
  hubspot?: { weekOverWeek?: { leads?: { current?: number; previous?: number }; mqls?: { current?: number; previous?: number }; sqls?: { current?: number; previous?: number } } };
  rb2b?: { weekOverWeek?: { visitors?: { current?: number; previous?: number }; pageViews?: { current?: number; previous?: number } } };
}): TrendSummary[] {
  const items: TrendSummary[] = [];
  const ga = input?.googleAnalytics?.weekOverWeek;
  
  // Always include GA4 metrics if weekOverWeek exists
  if (ga) {
    if (ga.sessions !== undefined) {
      const cur = ga.sessions.current ?? 0;
      const prev = ga.sessions.previous ?? 0;
      const change = prev ? ((cur - prev) / prev) * 100 : 0;
      items.push({
        metric: "Sessions (GA4)",
        thisWeek: cur,
        lastWeek: prev,
        change,
        changeType: change > 0 ? "positive" : change < 0 ? "negative" : "neutral",
        sparklineData: [],
        trend: "stable",
      });
    }
    if (ga.conversions !== undefined) {
      const cur = ga.conversions.current ?? 0;
      const prev = ga.conversions.previous ?? 0;
      const change = prev ? ((cur - prev) / prev) * 100 : 0;
      items.push({
        metric: "Conversions (GA4)",
        thisWeek: cur,
        lastWeek: prev,
        change,
        changeType: change > 0 ? "positive" : change < 0 ? "negative" : "neutral",
        sparklineData: [],
        trend: "stable",
      });
    }
  }
  
  const hub = input?.hubspot?.weekOverWeek;
  if (hub) {
    if (hub.leads !== undefined) {
      const cur = hub.leads.current ?? 0;
      const prev = hub.leads.previous ?? 0;
      const change = prev ? ((cur - prev) / prev) * 100 : 0;
      items.push({
        metric: "Leads (HubSpot)",
        thisWeek: cur,
        lastWeek: prev,
        change,
        changeType: change > 0 ? "positive" : change < 0 ? "negative" : "neutral",
        sparklineData: [],
        trend: "stable",
      });
    }
    if (hub.mqls !== undefined) {
      const cur = hub.mqls.current ?? 0;
      const prev = hub.mqls.previous ?? 0;
      const change = prev ? ((cur - prev) / prev) * 100 : 0;
      items.push({
        metric: "MQLs (HubSpot)",
        thisWeek: cur,
        lastWeek: prev,
        change,
        changeType: change > 0 ? "positive" : change < 0 ? "negative" : "neutral",
        sparklineData: [],
        trend: "stable",
      });
    }
    if (hub.sqls !== undefined) {
      const cur = hub.sqls.current ?? 0;
      const prev = hub.sqls.previous ?? 0;
      const change = prev ? ((cur - prev) / prev) * 100 : 0;
      items.push({
        metric: "SQLs (HubSpot)",
        thisWeek: cur,
        lastWeek: prev,
        change,
        changeType: change > 0 ? "positive" : change < 0 ? "negative" : "neutral",
        sparklineData: [],
        trend: "stable",
      });
    }
  }
  
  const rb = input?.rb2b?.weekOverWeek;
  if (rb) {
    if (rb.visitors !== undefined) {
      const cur = rb.visitors.current ?? 0;
      const prev = rb.visitors.previous ?? 0;
      const change = prev ? ((cur - prev) / prev) * 100 : 0;
      items.push({
        metric: "Identified visitors (RB2B)",
        thisWeek: cur,
        lastWeek: prev,
        change,
        changeType: change > 0 ? "positive" : change < 0 ? "negative" : "neutral",
        sparklineData: [],
        trend: "stable",
      });
    }
    if (rb.pageViews !== undefined) {
      const cur = rb.pageViews.current ?? 0;
      const prev = rb.pageViews.previous ?? 0;
      const change = prev ? ((cur - prev) / prev) * 100 : 0;
      items.push({
        metric: "Page views (RB2B)",
        thisWeek: cur,
        lastWeek: prev,
        change,
        changeType: change > 0 ? "positive" : change < 0 ? "negative" : "neutral",
        sparklineData: [],
        trend: "stable",
      });
    }
  }
  return items;
}

export default function InsightsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<{
    input: any;
    output: InsightsClaudeOutput;
    date: string;
    generatedAt: string;
  }>({
    queryKey: ["insights-latest"],
    queryFn: fetchLatestInsights,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const generateMutation = useMutation({
    mutationFn: generateInsights,
    onSuccess: (result) => {
      // Use PKT date as report date so it matches storage (one report per day, stays until next run)
      const reportDate = result.output?.generatedAt
        ? format(new Date(result.output.generatedAt), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");
      queryClient.setQueryData(["insights-latest"], {
        input: result.input,
        output: result.output,
        date: reportDate,
        generatedAt: result.output?.generatedAt ?? new Date().toISOString(),
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] rounded-xl bg-muted/30 dark:bg-muted/20 p-6 border border-border/50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading insights...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4 min-h-full rounded-xl bg-muted/30 dark:bg-muted/20 p-4 md:p-6 border border-border/50">
        <Card>
          <CardHeader>
            <CardTitle>Daily GTM Insights</CardTitle>
            <CardDescription>AI-powered daily insights for your GTM team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {generateMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription>
                  {generateMutation.error instanceof Error
                    ? generateMutation.error.message
                    : "Failed to generate insights. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No insights available</p>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "Generate once; this report will stay until the next automatic run (tomorrow 9 AM PKT)."}
              </p>
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                size="lg"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Insights... (This may take 1-2 minutes)
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate first report
                  </>
                )}
              </Button>
              {generateMutation.isPending && (
                <p className="text-sm text-muted-foreground mt-4">
                  Aggregating data from GA4, HubSpot, and RB2B, then analyzing with AI...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const insights = data.output;
  const execSummary = insights?.executiveSummary ?? {};

  return (
    <div className="space-y-6 min-h-full rounded-xl bg-muted/30 dark:bg-muted/20 p-4 md:p-6 border border-border/50">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Daily GTM Insights</h1>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Report for <strong>{data?.date ? format(new Date(data.date + "T12:00:00"), "d MMM yyyy") : "—"}</strong>
              {" · "}
              Generated {formatDistanceToNow(new Date(data?.generatedAt ?? Date.now()), { addSuffix: true })}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This report stays until the next automatic run (tomorrow 9:00 AM PKT). No need to regenerate.
            </p>
            {data?.input?.dateRange && (
              <p className="text-xs text-muted-foreground mt-1">
                Comparing: {safeStr(data.input.dateRange.start) || "—"} – {safeStr(data.input.dateRange.end) || "—"}
                {" vs "}
                {safeStr(data.input.dateRange.comparisonStart) || "—"} – {safeStr(data.input.dateRange.comparisonEnd) || "—"}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              title="Only needed if you want a fresh run before tomorrow 9 AM PKT"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Force update
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Generation Status Alerts */}
        {generateMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Generation Failed</AlertTitle>
            <AlertDescription>
              {generateMutation.error instanceof Error
                ? generateMutation.error.message
                : "Failed to generate insights. Please check your API keys and try again."}
            </AlertDescription>
          </Alert>
        )}

        {generateMutation.isPending && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Generating Insights...</AlertTitle>
            <AlertDescription>
              Aggregating data from all sources and analyzing with AI. This may take 1-2 minutes.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Executive Summary */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Executive Summary</CardTitle>
            <Badge className={getSentimentColor(execSummary.sentiment ?? "good")}>
              {(execSummary.sentiment ?? "good").toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Health Score */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-5xl font-bold ${getHealthScoreColor(safeNum(execSummary.gtmHealthScore))}`}>
                {safeNum(execSummary.gtmHealthScore)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">GTM Health Score</div>
            </div>
            <div className="flex-1">
              <p className="text-lg leading-relaxed">{execSummary.aiSummary ?? ""}</p>
              <p className="text-sm text-muted-foreground mt-2">{execSummary.healthScoreReasoning ?? ""}</p>
            </div>
          </div>

          {/* Key Highlights & Lowlights */}
          <div className="grid md:grid-cols-2 gap-4">
            {Array.isArray(execSummary.keyHighlights) && execSummary.keyHighlights.length > 0 && (
              <div className="border border-border rounded-lg p-4 bg-muted/50 dark:bg-green-500/10 border-green-500/30">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  What Worked This Week
                </h3>
                <ul className="space-y-2">
                  {execSummary.keyHighlights.map((h, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(execSummary.keyLowlights) && execSummary.keyLowlights.length > 0 && (
              <div className="border border-border rounded-lg p-4 bg-muted/50 dark:bg-red-500/10 border-red-500/30">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  What Didn't Work
                </h3>
                <ul className="space-y-2">
                  {execSummary.keyLowlights.map((l, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400 mt-0.5">⚠</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Week-over-Week Key Metrics Comparison — from Claude or derived from input */}
      {(() => {
        const woWSummary: TrendSummary[] =
          Array.isArray(insights.trends?.summary) && insights.trends.summary.length > 0
            ? insights.trends.summary
            : deriveWoWSummaryFromInput(data?.input ?? {});
        if (woWSummary.length === 0) return null;
        const chartData = woWSummary.slice(0, 8).map((t) => ({
          metric: t.metric ?? "—",
          thisWeek: safeNum(t.thisWeek),
          lastWeek: safeNum(t.lastWeek),
        }));
        return (
          <Card className="border-2 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <BarChart3 className="h-6 w-6 text-primary" />
                Week-over-Week Comparison
              </CardTitle>
              <CardDescription>
                Key metrics compared to last week. Green = improvement, Red = decline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bar chart: This week vs Last week */}
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 16, left: 0, bottom: 24 }}
                    layout="vertical"
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#64748B" 
                      opacity={0.2}
                      horizontal={false} 
                    />
                    <XAxis 
                      type="number" 
                      stroke="#64748B"
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      tickFormatter={(value) => {
                        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                        return value.toString();
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="metric"
                      width={140}
                      stroke="#64748B"
                      tick={{ fontSize: 11, fill: "#F8FAFC" }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ 
                        borderRadius: 8, 
                        border: "1px solid #334155",
                        backgroundColor: "#1E293B",
                        color: "#F8FAFC"
                      }}
                      formatter={(value: number | undefined) => [value?.toLocaleString() ?? "0", ""]}
                      labelStyle={{ color: "#F8FAFC" }}
                      labelFormatter={(label) => label}
                    />
                    <Legend 
                      wrapperStyle={{ color: "#F8FAFC" }}
                      iconType="rect"
                    />
                    <Bar 
                      dataKey="thisWeek" 
                      name="This week" 
                      fill="#0066FF" 
                      radius={[0, 4, 4, 0]} 
                    />
                    <Bar 
                      dataKey="lastWeek" 
                      name="Last week" 
                      fill="#10B981" 
                      radius={[0, 4, 4, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {woWSummary.slice(0, 8).map((trend, i) => {
                  const change = safeNum(trend?.change);
                  const isPositive = trend?.changeType === "positive";
                  const changePercent = Math.abs(change);
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border-2 ${
                        isPositive
                          ? "bg-muted/60 dark:bg-green-500/10 border-green-500/40"
                          : change === 0
                          ? "bg-muted/40 border-border"
                          : "bg-muted/60 dark:bg-red-500/10 border-red-500/40"
                      }`}
                    >
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        {trend?.metric ?? "—"}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          {safeNum(trend.thisWeek).toLocaleString()}
                        </span>
                        {safeNum(trend.change) !== 0 && (
                          <span
                            className={`text-sm font-semibold flex items-center gap-1 ${
                              isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {safeNum(changePercent).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last week: {safeNum(trend.lastWeek).toLocaleString()}
                      </div>
                      {trend.trend && (
                        <div className="text-xs mt-2 text-muted-foreground">
                          Trend: {trend.trend}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {insights.trends?.trendNarrative && (
                <div className="p-3 rounded-lg border border-border bg-muted/40">
                  <p className="text-sm font-medium text-foreground">{insights.trends.trendNarrative}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Immediate Actions & Top Priorities */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Immediate Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Immediate Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {((insights.immediateActions?.adsToPause?.length ?? 0) === 0 &&
            (insights.immediateActions?.adsToFix?.length ?? 0) === 0 &&
            (insights.immediateActions?.trackingIssues?.length ?? 0) === 0 &&
            (insights.immediateActions?.budgetAlerts?.length ?? 0) === 0) ? (
              <p className="text-sm text-muted-foreground">No immediate actions required.</p>
            ) : (
              <>
                {(insights.immediateActions?.adsToPause ?? []).map((ad, i) => (
                  <div key={i} className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="font-semibold text-sm">{ad?.campaignName ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{ad?.issue ?? ""}</div>
                    <div className="text-xs mt-1">{ad?.recommendation ?? ""}</div>
                  </div>
                ))}
                {(insights.immediateActions?.adsToFix ?? []).map((ad, i) => (
                  <div key={i} className="border-l-4 border-yellow-500 pl-4 py-2">
                    <div className="font-semibold text-sm">{ad?.campaignName ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{ad?.issue ?? ""}</div>
                    <div className="text-xs mt-1">{ad?.recommendation ?? ""}</div>
                  </div>
                ))}
                {(insights.immediateActions?.trackingIssues ?? []).map((issue, i) => (
                  <div key={i} className="border-l-4 border-orange-500 pl-4 py-2">
                    <div className="font-semibold text-sm">{(issue?.source ?? "").toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground">{issue?.issue ?? ""}</div>
                  </div>
                ))}
                {(insights.immediateActions?.budgetAlerts ?? []).map((alert, i) => (
                  <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="font-semibold text-sm">{alert?.account ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{alert?.alertType ?? ""}</div>
                    <div className="text-xs mt-1">{alert?.recommendation ?? ""}</div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Top 3 Priorities */}
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Target className="h-5 w-5 text-primary" />
              Top Recommendations
            </CardTitle>
            <CardDescription>Prioritized actions from GTM analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {(insights.strategicRecommendations?.priorityActions?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No priority actions defined.</p>
            ) : (
              <div className="space-y-4">
                {(insights.strategicRecommendations?.priorityActions ?? [])
                  .slice(0, 3)
                  .map((action, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-border bg-card/80 dark:bg-muted/30 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {action.priority}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1 text-foreground">{action.title}</div>
                          <div className="text-xs text-muted-foreground mb-2">{action.description}</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                action.effort === "low"
                                  ? "border-green-500/50 text-green-700 dark:text-green-400"
                                  : action.effort === "medium"
                                  ? "border-yellow-500/50 text-yellow-700 dark:text-yellow-400"
                                  : "border-red-500/50 text-red-700 dark:text-red-400"
                              }`}
                            >
                              {action.effort} effort
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {(action.category ?? "").replace(/_/g, " ")}
                            </Badge>
                          </div>
                          {action.expectedImpact && (
                            <div className="text-xs text-foreground mt-2 font-medium">
                              Expected: {action.expectedImpact.improvement} on {action.expectedImpact.metric}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            {insights.strategicRecommendations?.weeklyFocus && (
              <div className="mt-4 p-3 rounded-lg border border-border bg-muted/50">
                <div className="text-xs font-semibold text-muted-foreground mb-1">This Week's Focus:</div>
                <div className="text-sm text-foreground">{insights.strategicRecommendations.weeklyFocus}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Channel Health Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(insights.channelHealth ?? []).map((channel, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{(channel?.channel ?? "").replace(/_/g, " ")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={
                  channel.status === "excellent"
                    ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                    : channel.status === "good"
                    ? "bg-primary/20 text-primary border-border"
                    : channel.status === "needs_attention"
                    ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                    : "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                }
              >
                {(channel?.status ?? "").replace(/_/g, " ")}
              </Badge>
              <div className="mt-3">
                <div className="text-2xl font-bold">{safeNum(channel.primaryMetric?.value).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{channel.primaryMetric?.name ?? "—"}</div>
                {safeNum(channel.primaryMetric?.trend) !== 0 && (
                  <div className={`text-xs mt-1 flex items-center gap-1 ${
                    (channel.primaryMetric?.trend ?? 0) > 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {(channel.primaryMetric?.trend ?? 0) > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(safeNum(channel.primaryMetric?.trend)).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{channel.aiInsight ?? ""}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="geo" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="geo">
            <Globe className="mr-2 h-4 w-4" />
            Geo
          </TabsTrigger>
          <TabsTrigger value="audience">
            <Users className="mr-2 h-4 w-4" />
            Audience
          </TabsTrigger>
          <TabsTrigger value="pages">
            <FileText className="mr-2 h-4 w-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="creative">
            <Palette className="mr-2 h-4 w-4" />
            Creative
          </TabsTrigger>
          <TabsTrigger value="funnel">
            <Funnel className="mr-2 h-4 w-4" />
            Funnel
          </TabsTrigger>
          <TabsTrigger value="budget">
            <DollarSign className="mr-2 h-4 w-4" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="ads">
            <Megaphone className="mr-2 h-4 w-4" />
            Ads
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="mr-2 h-4 w-4" />
            Goals
          </TabsTrigger>
        </TabsList>

        {/* Geo Tab */}
        <TabsContent value="geo" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
              <CardDescription>{insights.geoInsights?.geoSummary ?? "Geographic performance from GA4 traffic and conversions."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(insights.geoInsights?.regionsToScale?.length ?? 0) > 0 ? (
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Regions to Scale</h3>
                  <div className="space-y-2">
                    {(insights.geoInsights?.regionsToScale ?? []).map((r, i) => (
                      <div key={i} className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="font-semibold">{r?.country ?? "—"}</div>
                        <div className="text-sm text-muted-foreground">
                          {safeNum(r?.leads)} leads, CPL: ${safeNum(r?.cpl).toFixed(2)}, {(safeStr(r?.recommendation)).replace(/_/g, " ")}
                        </div>
                        <div className="text-xs mt-1">{safeStr(r?.reasoning)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No specific regions to scale this week. Use the summary above for context.</p>
              )}
              {(insights.geoInsights?.regionsToReduce?.length ?? 0) > 0 ? (
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Regions to Reduce</h3>
                  <div className="space-y-2">
                    {(insights.geoInsights?.regionsToReduce ?? []).map((r, i) => (
                      <div key={i} className="border-l-4 border-red-500 pl-4 py-2">
                        <div className="font-semibold">{r?.country ?? "—"}</div>
                        <div className="text-sm text-muted-foreground">
                          {(safeStr(r?.issue)).replace(/_/g, " ")}, Potential savings: ${safeNum(r?.potentialSavings).toFixed(2)}
                        </div>
                        <div className="text-xs mt-1">{safeStr(r?.reasoning)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No specific regions to reduce this week.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Audience Insights</CardTitle>
              <CardDescription>{insights.audienceInsights?.audienceSummary ?? "Audience and segment performance."}</CardDescription>
            </CardHeader>
            <CardContent>
              {(insights.audienceInsights?.topJobTitles?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {(insights.audienceInsights?.topJobTitles ?? []).map((job, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-semibold">{job.jobTitle}</div>
                        <div className="text-sm text-muted-foreground">
                          {safeNum(job?.leads)} leads, CPL: ${safeNum(job?.cpl).toFixed(2)}
                        </div>
                      </div>
                      <Badge>{(job?.performance ?? "").replace(/_/g, " ")}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No audience segments this week. Use the summary above; insights are derived from RB2B companies and GA4/HubSpot where available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
              <CardDescription>{insights.pageInsights?.pageSummary ?? "Page performance from GA4."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(insights.pageInsights?.topPages?.length ?? 0) > 0 ? (
                <div>
                  <h3 className="font-semibold mb-2">Top Performing Pages</h3>
                  <div className="space-y-2">
                    {(insights.pageInsights?.topPages ?? []).map((page, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-semibold">{page.pageTitle}</div>
                          <div className="text-sm text-muted-foreground">{page.pagePath}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {safeNum(page?.sessions)} sessions, {safeNum(page?.conversions)} conversions ({safeNum(page?.conversionRate).toFixed(1)}%)
                          </div>
                        </div>
                        <Badge>{(page?.status ?? "").replace(/_/g, " ")}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No top pages listed this week. See summary above.</p>
              )}
              {(insights.pageInsights?.problemPages?.length ?? 0) > 0 ? (
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Pages Needing Attention</h3>
                  <div className="space-y-2">
                    {(insights.pageInsights?.problemPages ?? []).map((page, i) => (
                      <div key={i} className="border-l-4 border-yellow-500 pl-4 py-2">
                        <div className="font-semibold">{page?.pageTitle ?? "—"}</div>
                        <div className="text-sm text-muted-foreground">{(safeStr(page?.issue)).replace(/_/g, " ")}</div>
                        <div className="text-xs mt-1">{safeStr(page?.potentialImpact)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No problem pages flagged. Focus on top pages and conversion goals.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creative Tab */}
        <TabsContent value="creative" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Creative Performance</CardTitle>
              <CardDescription>{insights.creativeInsights?.creativeSummary ?? "Creative and campaign performance (when ad data is available)."}</CardDescription>
            </CardHeader>
            <CardContent>
              {(insights.creativeInsights?.topCreatives?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {(insights.creativeInsights?.topCreatives ?? []).map((creative, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="font-semibold">{creative.creativeName}</div>
                      <div className="text-sm text-muted-foreground">{creative.campaignName}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        CTR: {safeNum(creative?.ctr).toFixed(2)}%, CPL: ${safeNum(creative?.cpl).toFixed(2)}
                      </div>
                      <p className="text-xs mt-2">{creative.insight}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No creative data available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Funnel Tab */}
        <TabsContent value="funnel" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Analysis</CardTitle>
              <CardDescription>{insights.funnelInsights?.funnelSummary ?? "Pipeline and stage performance from HubSpot."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(insights.funnelInsights?.stages?.length ?? 0) > 0 ? (
                <div>
                  <h3 className="font-semibold mb-2">Funnel Stages</h3>
                  <div className="space-y-2">
                    {(insights.funnelInsights?.stages ?? []).map((stage, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-semibold">{stage.stageName}</div>
                          <div className="text-sm text-muted-foreground">
                            {safeNum(stage?.count)} leads, {safeNum(stage?.conversionToNext).toFixed(1)}% conversion
                          </div>
                        </div>
                        <Badge
                          className={
                            stage.status === "healthy"
                              ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                              : stage.status === "bottleneck"
                              ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                              : "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                          }
                        >
                          {stage.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No funnel stages listed. Summary above is from HubSpot pipeline data.</p>
              )}
              {(insights.funnelInsights?.bottlenecks?.length ?? 0) > 0 ? (
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Bottlenecks</h3>
                  <div className="space-y-2">
                    {(insights.funnelInsights?.bottlenecks ?? []).map((b, i) => (
                      <div key={i} className="border-l-4 border-red-500 pl-4 py-2">
                        <div className="font-semibold">{safeStr(b?.fromStage)} → {safeStr(b?.toStage)}</div>
                        <div className="text-sm text-muted-foreground">
                          {safeNum(b?.leadsLost)} leads lost, ${safeNum(b?.potentialRevenue).toFixed(2)} potential revenue
                        </div>
                        <div className="text-xs mt-1">
                          {Array.isArray(b?.recommendations) && b.recommendations.length > 0
                            ? b.recommendations.join(", ")
                            : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No bottlenecks flagged. Review conversion rates between stages in the summary.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Analysis</CardTitle>
              <CardDescription>{insights.budgetInsights?.budgetSummary ?? ""}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(insights.budgetInsights?.overview?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  {(insights.budgetInsights?.overview ?? []).map((budget, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="font-semibold">{safeStr(budget?.account)}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Spent: ${safeNum(budget?.spentToDate).toFixed(2)} / ${safeNum(budget?.monthlyBudget).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Projected: ${safeNum(budget?.projectedMonthEndSpend).toFixed(2)}, Status: {(budget?.pacingStatus ?? "").replace(/_/g, " ")}
                      </div>
                      <div className="text-xs mt-1">{safeStr(budget?.recommendation)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ads Tab */}
        <TabsContent value="ads" className="space-y-4 mt-4">
          {insights.adsInsights ? (
            <>
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Ads Performance Summary</CardTitle>
                  <CardDescription>{insights.adsInsights.adsSummary ?? "Performance across Google Ads, Reddit Ads, and LinkedIn Ads."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Overall Metrics */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Spend</div>
                      <div className="text-2xl font-bold">${safeNum(insights.adsInsights.totalSpend).toLocaleString()}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Conversions</div>
                      <div className="text-2xl font-bold">{safeNum(insights.adsInsights.totalConversions).toLocaleString()}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Average CPA</div>
                      <div className="text-2xl font-bold">${safeNum(insights.adsInsights.averageCpa).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Average CTR</div>
                      <div className="text-2xl font-bold">{safeNum(insights.adsInsights.averageCtr).toFixed(2)}%</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Average CPC</div>
                      <div className="text-2xl font-bold">${safeNum(insights.adsInsights.averageCpc).toFixed(2)}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Efficiency Trend</div>
                      <div className="text-2xl font-bold flex items-center gap-2">
                        {insights.adsInsights.efficiencyTrend === "improving" ? (
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        ) : insights.adsInsights.efficiencyTrend === "declining" ? (
                          <TrendingDown className="h-6 w-6 text-red-600" />
                        ) : null}
                        <span className="capitalize">{safeStr(insights.adsInsights.efficiencyTrend)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top/Underperforming Platforms */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {insights.adsInsights.topPerformingPlatform && (
                      <div className="p-4 border border-green-500/30 rounded-lg bg-green-500/10">
                        <div className="text-sm text-muted-foreground">Top Performing Platform</div>
                        <div className="text-xl font-bold mt-1">{safeStr(insights.adsInsights.topPerformingPlatform).replace(/_/g, " ")}</div>
                      </div>
                    )}
                    {insights.adsInsights.underperformingPlatform && (
                      <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/10">
                        <div className="text-sm text-muted-foreground">Needs Attention</div>
                        <div className="text-xl font-bold mt-1">{safeStr(insights.adsInsights.underperformingPlatform).replace(/_/g, " ")}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Platform Performance */}
              {(insights.adsInsights.platformPerformance?.length ?? 0) > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Performance</CardTitle>
                    <CardDescription>Detailed performance metrics for each ad platform</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insights.adsInsights.platformPerformance.map((platform: any, i: number) => (
                      <div key={i} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold capitalize">{safeStr(platform.platform).replace(/_/g, " ")}</h3>
                          <Badge
                            className={
                              platform.performance === "excellent"
                                ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                                : platform.performance === "good"
                                ? "bg-primary/20 text-primary border-border"
                                : platform.performance === "needs_attention"
                                ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                                : "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                            }
                          >
                            {safeStr(platform.performance).replace(/_/g, " ")}
                          </Badge>
                        </div>

                        {/* Current Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <div className="text-xs text-muted-foreground">Impressions</div>
                            <div className="font-semibold">{safeNum(platform.impressions).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Clicks</div>
                            <div className="font-semibold">{safeNum(platform.clicks).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Spend</div>
                            <div className="font-semibold">${safeNum(platform.spend).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Conversions</div>
                            <div className="font-semibold">{safeNum(platform.conversions).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">CTR</div>
                            <div className="font-semibold">{safeNum(platform.ctr).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">CPC</div>
                            <div className="font-semibold">${safeNum(platform.cpc).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Conv. Rate</div>
                            <div className="font-semibold">{safeNum(platform.conversionRate).toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">CPA</div>
                            <div className="font-semibold">${safeNum(platform.cpa).toFixed(2)}</div>
                          </div>
                        </div>

                        {/* Week-over-Week Changes */}
                        {platform.weekOverWeek && (
                          <div className="pt-3 border-t">
                            <div className="text-xs font-semibold text-muted-foreground mb-2">Week-over-Week Changes</div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span>Impressions:</span>
                                <span className={`font-semibold ${safeNum(platform.weekOverWeek.impressions?.change) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {safeNum(platform.weekOverWeek.impressions?.change) >= 0 ? "+" : ""}
                                  {safeNum(platform.weekOverWeek.impressions?.change).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Clicks:</span>
                                <span className={`font-semibold ${safeNum(platform.weekOverWeek.clicks?.change) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {safeNum(platform.weekOverWeek.clicks?.change) >= 0 ? "+" : ""}
                                  {safeNum(platform.weekOverWeek.clicks?.change).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Spend:</span>
                                <span className={`font-semibold ${safeNum(platform.weekOverWeek.spend?.change) >= 0 ? "text-red-600" : "text-green-600"}`}>
                                  {safeNum(platform.weekOverWeek.spend?.change) >= 0 ? "+" : ""}
                                  {safeNum(platform.weekOverWeek.spend?.change).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Conversions:</span>
                                <span className={`font-semibold ${safeNum(platform.weekOverWeek.conversions?.change) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {safeNum(platform.weekOverWeek.conversions?.change) >= 0 ? "+" : ""}
                                  {safeNum(platform.weekOverWeek.conversions?.change).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>CTR:</span>
                                <span className={`font-semibold ${safeNum(platform.weekOverWeek.ctr?.change) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {safeNum(platform.weekOverWeek.ctr?.change) >= 0 ? "+" : ""}
                                  {safeNum(platform.weekOverWeek.ctr?.change).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>CPC:</span>
                                <span className={`font-semibold ${safeNum(platform.weekOverWeek.cpc?.change) >= 0 ? "text-red-600" : "text-green-600"}`}>
                                  {safeNum(platform.weekOverWeek.cpc?.change) >= 0 ? "+" : ""}
                                  {safeNum(platform.weekOverWeek.cpc?.change).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Insights */}
                        {Array.isArray(platform.insights) && platform.insights.length > 0 && (
                          <div className="pt-3 border-t">
                            <div className="text-xs font-semibold text-muted-foreground mb-2">Insights</div>
                            <ul className="space-y-1">
                              {platform.insights.map((insight: string, idx: number) => (
                                <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span>
                                  <span>{insight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recommendations */}
                        {Array.isArray(platform.recommendations) && platform.recommendations.length > 0 && (
                          <div className="pt-3 border-t">
                            <div className="text-xs font-semibold text-muted-foreground mb-2">Recommendations</div>
                            <ul className="space-y-1">
                              {platform.recommendations.map((rec: string, idx: number) => (
                                <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                                  <span className="text-green-600 dark:text-green-400 mt-0.5">→</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Key Findings */}
              {Array.isArray(insights.adsInsights.keyFindings) && insights.adsInsights.keyFindings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Findings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.adsInsights.keyFindings.map((finding: string, i: number) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Actionable Recommendations */}
              {Array.isArray(insights.adsInsights.actionableRecommendations) && insights.adsInsights.actionableRecommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actionable Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {insights.adsInsights.actionableRecommendations.map((rec: string, i: number) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-0.5">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No ads insights available. Generate insights to see ads performance analysis.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Goal Tracking</CardTitle>
              <CardDescription>{insights.goalTracking?.overallStatus ?? ""}</CardDescription>
            </CardHeader>
            <CardContent>
              {(insights.goalTracking?.goals?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {(insights.goalTracking?.goals ?? []).map((goal, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{goal?.goalName ?? "—"}</div>
                        <Badge
                          className={
                            (goal?.status ?? "") === "on_track"
                              ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                              : (goal?.status ?? "") === "at_risk"
                              ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                              : (goal?.status ?? "") === "behind"
                              ? "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                              : "bg-primary/20 text-primary border-border"
                          }
                        >
                          {(goal?.status ?? "").replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {safeNum(goal?.current).toLocaleString()} / {safeNum(goal?.target).toLocaleString()} ({safeNum(goal?.progressPercentage).toFixed(1)}%)
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{goal?.recommendation ?? ""}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No goals configured.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Strategic Recommendations Section */}
      {(insights.strategicRecommendations != null) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Strategic Recommendations
            </CardTitle>
            <CardDescription>
              AI-generated action items prioritized by impact and effort
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(insights.strategicRecommendations?.priorityActions ?? []).map((action, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                          {action.priority}
                        </span>
                        <h4 className="font-semibold">{action.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {(action?.category ?? "").replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        <strong>Reasoning:</strong> {action.reasoning}
                      </p>
                      {action.expectedImpact && (
                        <div className="text-xs p-2 rounded border border-border bg-muted/50 mb-2 text-foreground">
                          <strong>Expected Impact:</strong> {action.expectedImpact.improvement} on{" "}
                          {action.expectedImpact.metric}
                        </div>
                      )}
                      {(action?.steps?.length ?? 0) > 0 && (
                        <div className="mt-2">
                          <div className="text-xs font-semibold mb-1">Steps:</div>
                          <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                            {(action?.steps ?? []).map((step, stepIdx) => (
                              <li key={stepIdx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge
                        className={`${
                          action.effort === "low"
                            ? "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
                            : action.effort === "medium"
                            ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                            : "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                        }`}
                      >
                        {action.effort} effort
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {action.timeToImplement}
                      </div>
                      {action.owner && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Owner: {action.owner}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Opportunities Identified</h3>
              {(insights.strategicRecommendations?.opportunities?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {(insights.strategicRecommendations?.opportunities ?? []).map((opp, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border bg-muted/50 dark:bg-green-500/10 border-green-500/30">
                      <div className="font-semibold text-sm mb-1 text-foreground">{safeStr(opp?.title)}</div>
                      <div className="text-xs text-muted-foreground mb-2">{safeStr(opp?.description)}</div>
                      <div className="text-xs text-foreground">
                        <strong>Potential Impact:</strong> {safeStr(opp?.potentialImpact)}
                      </div>
                      {opp?.confidence && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Confidence: {opp.confidence}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No opportunities listed. Regenerate insights for suggestions based on your data and GTM best practices.</p>
              )}
            </div>
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3 text-foreground">Risks & Warnings</h3>
              {(insights.strategicRecommendations?.risks?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {(insights.strategicRecommendations?.risks ?? []).map((risk, i) => (
                    <div
                      key={i}
                      className={`p-3 border rounded-lg ${
                        risk.severity === "high"
                          ? "bg-muted/50 dark:bg-red-500/10 border-red-500/40"
                          : risk.severity === "medium"
                          ? "bg-muted/50 dark:bg-yellow-500/10 border-yellow-500/40"
                          : "bg-muted/50 border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-sm">{safeStr(risk?.title)}</div>
                        <Badge
                          className={
                            risk.severity === "high"
                              ? "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
                              : risk.severity === "medium"
                              ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                              : "bg-muted text-muted-foreground border-border"
                          }
                        >
                          {risk.severity} severity
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{safeStr(risk?.description)}</div>
                      {(risk?.mitigationSteps?.length ?? 0) > 0 && (
                        <div className="text-xs">
                          <strong>Mitigation:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-0.5">
                            {(risk?.mitigationSteps ?? []).map((step, stepIdx) => (
                              <li key={stepIdx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {risk.deadline && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Address by: {risk.deadline}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No risks listed. Regenerate insights for risks inferred from your data and common GTM pitfalls.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
