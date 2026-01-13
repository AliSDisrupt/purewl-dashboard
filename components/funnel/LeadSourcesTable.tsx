"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Globe, Target, TrendingUp, DollarSign, Briefcase } from "lucide-react";

interface LeadSource {
  landingPage: string;
  source: string;
  medium: string;
  eventCount: number;
  users: number;
  sessions: number;
}

interface SourceBreakdown {
  source: string;
  medium: string;
  leads: number;
  users: number;
}

interface TopLandingPage {
  page: string;
  leads: number;
  users: number;
}

interface DealSource {
  source: string;
  count: number;
  deals: string[];
}

interface RevenueSource {
  source: string;
  count: number;
  revenue: number;
  deals: string[];
}

interface LeadSourcesTableProps {
  leadSources: LeadSource[];
  sourceBreakdown: SourceBreakdown[];
  topLandingPages: TopLandingPage[];
  summary: {
    totalLeads: number;
    uniqueSources: number;
    uniquePages: number;
  };
  // HubSpot deal sources
  dealSources?: DealSource[];
  revenueSources?: RevenueSource[];
  dealSummary?: {
    totalDeals: number;
    totalClosedWon: number;
    totalRevenue: number;
  };
  isLoading?: boolean;
}

// Helper to get a cleaner page title
function getPageTitle(url: string): string {
  if (!url || url === "Unknown") return "Unknown Page";
  
  // Remove query string for display
  const path = url.split("?")[0];
  
  // Get the last meaningful segment
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return "Homepage";
  
  // Get the last segment and format it
  const lastSegment = segments[segments.length - 1];
  return lastSegment
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper to format source/medium
function formatSourceMedium(source: string, medium: string): string {
  const s = source === "(direct)" ? "Direct" : source;
  const m = medium === "(none)" ? "" : ` / ${medium}`;
  return `${s}${m}`;
}

// Helper to get source color for GA4 sources
function getSourceColor(source: string, medium: string): string {
  const sourceLower = source.toLowerCase();
  const mediumLower = medium.toLowerCase();
  
  if (sourceLower.includes("linkedin")) return "bg-blue-500";
  if (sourceLower.includes("reddit")) return "bg-orange-500";
  if (sourceLower === "google" && mediumLower === "cpc") return "bg-yellow-500";
  if (mediumLower === "organic") return "bg-green-500";
  if (sourceLower === "(direct)") return "bg-purple-500";
  if (mediumLower === "email") return "bg-pink-500";
  if (mediumLower === "referral") return "bg-cyan-500";
  return "bg-gray-500";
}

// Helper to get source color for HubSpot sources
function getHubSpotSourceColor(source: string): string {
  const sourceLower = source.toLowerCase();
  
  if (sourceLower.includes("organic")) return "bg-green-500";
  if (sourceLower.includes("paid search")) return "bg-yellow-500";
  if (sourceLower.includes("paid social")) return "bg-blue-400";
  if (sourceLower.includes("social")) return "bg-blue-500";
  if (sourceLower.includes("direct")) return "bg-purple-500";
  if (sourceLower.includes("email")) return "bg-pink-500";
  if (sourceLower.includes("referral")) return "bg-cyan-500";
  if (sourceLower.includes("campaign")) return "bg-indigo-500";
  if (sourceLower.includes("offline")) return "bg-gray-600";
  return "bg-gray-500";
}

export function LeadSourcesTable({
  leadSources,
  sourceBreakdown,
  topLandingPages,
  summary,
  dealSources = [],
  revenueSources = [],
  dealSummary,
  isLoading = false,
}: LeadSourcesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Funnel Attribution Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Loading attribution data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasLeadData = leadSources.length > 0 || sourceBreakdown.length > 0 || topLandingPages.length > 0;
  const hasDealData = dealSources.length > 0 || revenueSources.length > 0;

  if (!hasLeadData && !hasDealData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Funnel Attribution Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No attribution data available for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Funnel Attribution Sources
        </CardTitle>
        <CardDescription>
          First touchpoints for leads (GA4) and deal/revenue attribution (HubSpot)
        </CardDescription>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold">{summary.totalLeads.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Leads (GA4)</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold">{summary.uniquePages}</div>
            <div className="text-xs text-muted-foreground">Landing Pages</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold">{dealSummary?.totalDeals?.toLocaleString() || 0}</div>
            <div className="text-xs text-muted-foreground">Deals (HubSpot)</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold">{dealSummary?.totalClosedWon?.toLocaleString() || 0}</div>
            <div className="text-xs text-muted-foreground">Closed Won</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold">${(dealSummary?.totalRevenue || 0).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Revenue</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="lead-sources" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="lead-sources" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Lead Sources
            </TabsTrigger>
            <TabsTrigger value="landing-pages" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Landing Pages
            </TabsTrigger>
            <TabsTrigger value="deal-sources" className="text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              Deal Sources
            </TabsTrigger>
            <TabsTrigger value="revenue-sources" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              Revenue Sources
            </TabsTrigger>
            <TabsTrigger value="detailed" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Detailed
            </TabsTrigger>
          </TabsList>

          {/* Lead Sources Tab (GA4) */}
          <TabsContent value="lead-sources" className="mt-4">
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs">GA4</span>
              First touch traffic sources for lead generation
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                <div>Source / Medium</div>
                <div className="text-right">Leads</div>
                <div className="text-right">Users</div>
                <div className="text-right">% of Total</div>
              </div>
              {sourceBreakdown.length > 0 ? sourceBreakdown.slice(0, 10).map((item, index) => {
                const percentage = summary.totalLeads > 0
                  ? (item.leads / summary.totalLeads) * 100
                  : 0;
                return (
                  <div key={index} className="grid grid-cols-4 gap-4 text-sm items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getSourceColor(item.source, item.medium)}`} />
                      <span className="font-medium">{formatSourceMedium(item.source, item.medium)}</span>
                    </div>
                    <div className="text-right font-semibold">{item.leads.toLocaleString()}</div>
                    <div className="text-right text-muted-foreground">{item.users.toLocaleString()}</div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getSourceColor(item.source, item.medium)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-12 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center text-muted-foreground py-4">No lead source data available</div>
              )}
            </div>
          </TabsContent>

          {/* Landing Pages Tab (GA4) */}
          <TabsContent value="landing-pages" className="mt-4">
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs">GA4</span>
              Pages where leads converted
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                <div className="col-span-2">Landing Page</div>
                <div className="text-right">Leads</div>
                <div className="text-right">% of Total</div>
              </div>
              {topLandingPages.length > 0 ? topLandingPages.slice(0, 10).map((item, index) => {
                const percentage = summary.totalLeads > 0
                  ? (item.leads / summary.totalLeads) * 100
                  : 0;
                return (
                  <div key={index} className="grid grid-cols-4 gap-4 text-sm items-center">
                    <div className="col-span-2">
                      <div className="font-medium truncate" title={item.page}>
                        {getPageTitle(item.page)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate" title={item.page}>
                        {item.page.split("?")[0]}
                      </div>
                    </div>
                    <div className="text-right font-semibold">{item.leads.toLocaleString()}</div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-12 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center text-muted-foreground py-4">No landing page data available</div>
              )}
            </div>
          </TabsContent>

          {/* Deal Sources Tab (HubSpot) */}
          <TabsContent value="deal-sources" className="mt-4">
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
              <span className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded text-xs">HubSpot</span>
              Original sources for deals created
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                <div className="col-span-2">Source</div>
                <div className="text-right">Deals</div>
                <div className="text-right">% of Total</div>
              </div>
              {dealSources.length > 0 ? dealSources.slice(0, 10).map((item, index) => {
                const percentage = dealSummary?.totalDeals && dealSummary.totalDeals > 0
                  ? (item.count / dealSummary.totalDeals) * 100
                  : 0;
                return (
                  <div key={index} className="grid grid-cols-4 gap-4 text-sm items-center">
                    <div className="col-span-2 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getHubSpotSourceColor(item.source)}`} />
                      <span className="font-medium">{item.source}</span>
                    </div>
                    <div className="text-right font-semibold">{item.count.toLocaleString()}</div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getHubSpotSourceColor(item.source)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-12 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center text-muted-foreground py-4">No deal source data available</div>
              )}
            </div>
          </TabsContent>

          {/* Revenue Sources Tab (HubSpot) */}
          <TabsContent value="revenue-sources" className="mt-4">
            <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
              <span className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded text-xs">HubSpot</span>
              Revenue attribution by original source
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                <div>Source</div>
                <div className="text-right">Deals</div>
                <div className="text-right">Revenue</div>
                <div className="text-right">% of Revenue</div>
              </div>
              {revenueSources.length > 0 ? revenueSources.slice(0, 10).map((item, index) => {
                const percentage = dealSummary?.totalRevenue && dealSummary.totalRevenue > 0
                  ? (item.revenue / dealSummary.totalRevenue) * 100
                  : 0;
                return (
                  <div key={index} className="grid grid-cols-4 gap-4 text-sm items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getHubSpotSourceColor(item.source)}`} />
                      <span className="font-medium truncate">{item.source}</span>
                    </div>
                    <div className="text-right">{item.count.toLocaleString()}</div>
                    <div className="text-right font-semibold">${item.revenue.toLocaleString()}</div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getHubSpotSourceColor(item.source)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-12 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center text-muted-foreground py-4">No revenue source data available</div>
              )}
            </div>
          </TabsContent>

          {/* Detailed View Tab (Combined) */}
          <TabsContent value="detailed" className="mt-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-5 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b sticky top-0 bg-card">
                <div className="col-span-2">Landing Page</div>
                <div>Source</div>
                <div className="text-right">Leads</div>
                <div className="text-right">Sessions</div>
              </div>
              {leadSources.length > 0 ? leadSources.slice(0, 20).map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 text-sm items-center py-1 border-b border-muted/50">
                  <div className="col-span-2">
                    <div className="font-medium truncate text-xs" title={item.landingPage}>
                      {getPageTitle(item.landingPage)}
                    </div>
                    <div className="text-xs text-muted-foreground truncate" title={item.landingPage}>
                      {item.landingPage.split("?")[0].substring(0, 40)}...
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getSourceColor(item.source, item.medium)}`} />
                    <span className="text-xs truncate">{formatSourceMedium(item.source, item.medium)}</span>
                  </div>
                  <div className="text-right font-semibold">{item.eventCount.toLocaleString()}</div>
                  <div className="text-right text-muted-foreground">{item.sessions.toLocaleString()}</div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-4">No detailed data available</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
