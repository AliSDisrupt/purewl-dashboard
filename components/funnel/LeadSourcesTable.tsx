"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Globe, Target, TrendingUp, Users } from "lucide-react";

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

interface LeadSourcesTableProps {
  leadSources: LeadSource[];
  sourceBreakdown: SourceBreakdown[];
  topLandingPages: TopLandingPage[];
  summary: {
    totalLeads: number;
    uniqueSources: number;
    uniquePages: number;
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

// Helper to get source color
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

export function LeadSourcesTable({
  leadSources,
  sourceBreakdown,
  topLandingPages,
  summary,
  isLoading = false,
}: LeadSourcesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lead Generation Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Loading lead sources...
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = leadSources.length > 0 || sourceBreakdown.length > 0 || topLandingPages.length > 0;

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lead Generation Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No lead source data available for this period
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
          Lead Generation Sources
        </CardTitle>
        <CardDescription>
          First touchpoints and landing pages where leads were generated
        </CardDescription>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold">{summary.totalLeads.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Leads</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold">{summary.uniqueSources}</div>
            <div className="text-xs text-muted-foreground">Traffic Sources</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-2xl font-bold">{summary.uniquePages}</div>
            <div className="text-xs text-muted-foreground">Landing Pages</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="sources" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sources" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              First Touch Sources
            </TabsTrigger>
            <TabsTrigger value="pages" className="text-xs">
              <ExternalLink className="h-3 w-3 mr-1" />
              Landing Pages
            </TabsTrigger>
            <TabsTrigger value="detailed" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Detailed View
            </TabsTrigger>
          </TabsList>

          {/* First Touch Sources Tab */}
          <TabsContent value="sources" className="mt-4">
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                <div>Source / Medium</div>
                <div className="text-right">Leads</div>
                <div className="text-right">Users</div>
                <div className="text-right">% of Total</div>
              </div>
              {sourceBreakdown.slice(0, 10).map((item, index) => {
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
              })}
            </div>
          </TabsContent>

          {/* Landing Pages Tab */}
          <TabsContent value="pages" className="mt-4">
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b">
                <div className="col-span-2">Landing Page</div>
                <div className="text-right">Leads</div>
                <div className="text-right">% of Total</div>
              </div>
              {topLandingPages.slice(0, 10).map((item, index) => {
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
              })}
            </div>
          </TabsContent>

          {/* Detailed View Tab */}
          <TabsContent value="detailed" className="mt-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-5 gap-4 font-medium text-sm text-muted-foreground pb-2 border-b sticky top-0 bg-card">
                <div className="col-span-2">Landing Page</div>
                <div>Source</div>
                <div className="text-right">Leads</div>
                <div className="text-right">Sessions</div>
              </div>
              {leadSources.slice(0, 20).map((item, index) => (
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
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
