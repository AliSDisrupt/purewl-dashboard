"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignsTable } from "@/components/linkedin/CampaignsTable";
import { LinkedInMetrics } from "@/components/linkedin/LinkedInMetrics";
import { GoogleAdsMetrics } from "@/components/ads/GoogleAdsMetrics";
import { RedditAdsMetrics } from "@/components/ads/RedditAdsMetrics";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

// Date range helper functions (synced with DateRangePicker)
const DATE_RANGE_KEY = "dashboard-date-range";
const DATE_RANGE_TYPE_KEY = "dashboard-date-range-type";
const CUSTOM_START_DATE_KEY = "dashboard-custom-start-date";
const CUSTOM_END_DATE_KEY = "dashboard-custom-end-date";

type DateRangeType = "preset" | "custom" | "today" | "yesterday";

function getDateRangeFromStorage(): { startDate: string; endDate: string } {
  if (typeof window === "undefined") {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split("T")[0]!,
      endDate: end.toISOString().split("T")[0]!,
    };
  }

  const savedType = localStorage.getItem(DATE_RANGE_TYPE_KEY) as DateRangeType | null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (savedType === "today") {
    const todayStr = format(today, "yyyy-MM-dd");
    return { startDate: todayStr, endDate: todayStr };
  }

  if (savedType === "yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");
    return { startDate: yesterdayStr, endDate: yesterdayStr };
  }

  if (savedType === "custom") {
    const savedStart = localStorage.getItem(CUSTOM_START_DATE_KEY);
    const savedEnd = localStorage.getItem(CUSTOM_END_DATE_KEY);
    if (savedStart && savedEnd) {
      return {
        startDate: format(new Date(savedStart), "yyyy-MM-dd"),
        endDate: format(new Date(savedEnd), "yyyy-MM-dd"),
      };
    }
  }

  // Default to preset (last 30 days)
  const savedDays = localStorage.getItem(DATE_RANGE_KEY);
  const days = savedDays ? parseInt(savedDays) : 30;
  const start = new Date(today);
  start.setDate(start.getDate() - days);
  return {
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(today, "yyyy-MM-dd"),
  };
}

// Convert YYYY-MM-DD to format expected by API (30daysAgo, yesterday, or YYYY-MM-DD)
function formatDateForAPI(date: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  
  if (dateObj.getTime() === today.getTime()) {
    return "today";
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateObj.getTime() === yesterday.getTime()) {
    return "yesterday";
  }
  
  const daysDiff = Math.ceil((today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 0 && daysDiff <= 365) {
    return `${daysDiff}daysAgo`;
  }
  
  return date;
}

// Fetch functions
async function fetchWindsorAIGoogleAds(startDate: string, endDate: string, accountName?: string) {
  const accountParam = accountName ? `&accountName=${encodeURIComponent(accountName)}` : "";
  const res = await fetch(`/api/windsor-ai/google-ads?startDate=${startDate}&endDate=${endDate}${accountParam}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch Windsor AI Google Ads data");
  }
  return res.json();
}

async function fetchWindsorAIRedditAds(startDate: string, endDate: string, accountName?: string) {
  const accountParam = accountName ? `&accountName=${encodeURIComponent(accountName)}` : "";
  const url = `/api/windsor-ai/reddit-ads?startDate=${startDate}&endDate=${endDate}${accountParam}`;
  console.log("Fetching Reddit Ads from:", url);
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    console.error("Reddit Ads API Error:", error);
    // Include details in error message if available
    const errorMsg = error.error || error.message || "Failed to fetch Windsor AI Reddit Ads data";
    const detailsMsg = error.details ? ` Details: ${typeof error.details === 'string' ? error.details : JSON.stringify(error.details)}` : "";
    throw new Error(`${errorMsg}${detailsMsg}`);
  }
  const data = await res.json();
  console.log("Reddit Ads API Response:", { 
    hasData: !!data, 
    campaignsCount: data.campaigns?.length || 0,
    summary: data.summary 
  });
  return data;
}

async function fetchWindsorAILinkedInAds(startDate: string, endDate: string, accountName?: string) {
  const accountParam = accountName ? `&accountName=${encodeURIComponent(accountName)}` : "";
  const res = await fetch(`/api/windsor-ai/linkedin-ads?startDate=${startDate}&endDate=${endDate}${accountParam}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch Windsor AI LinkedIn Ads data");
  }
  return res.json();
}

export default function AdsPage() {
  // Get date range from localStorage (synced with DateRangePicker)
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>(() => 
    getDateRangeFromStorage()
  );

  // Listen for date range changes
  useEffect(() => {
    const handleDateRangeChange = () => {
      setDateRange(getDateRangeFromStorage());
    };

    window.addEventListener("storage", handleDateRangeChange);
    window.addEventListener("dateRangeChange", handleDateRangeChange);
    
    // Also check on mount and periodically
    const interval = setInterval(() => {
      const newRange = getDateRangeFromStorage();
      if (newRange.startDate !== dateRange.startDate || newRange.endDate !== dateRange.endDate) {
        setDateRange(newRange);
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleDateRangeChange);
      window.removeEventListener("dateRangeChange", handleDateRangeChange);
      clearInterval(interval);
    };
  }, [dateRange.startDate, dateRange.endDate]);

  const { startDate, endDate } = dateRange;
  
  const {
    data: windsorAILinkedInData,
    isLoading: windsorAILinkedInLoading,
    error: windsorAILinkedInError,
  } = useQuery({
    queryKey: ["windsor-ai-linkedin-ads", startDate, endDate, "PureVPN - Partner & Enterprise Solution"],
    queryFn: () => fetchWindsorAILinkedInAds(startDate, endDate, "PureVPN - Partner & Enterprise Solution"),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch all LinkedIn campaigns (including inactive) from LinkedIn API
  const LINKEDIN_ACCOUNT_ID = "514469053"; // PureVPN - Partner & Enterprise Solutions
  const LINKEDIN_ACCOUNT_URN = `urn:li:sponsoredAccount:${LINKEDIN_ACCOUNT_ID}`;
  
  const {
    data: linkedInCampaignsData,
    isLoading: linkedInCampaignsLoading,
  } = useQuery({
    queryKey: ["linkedin-campaigns-all", LINKEDIN_ACCOUNT_ID],
    queryFn: async () => {
      const res = await fetch(`/api/linkedin/campaigns?accountId=${encodeURIComponent(LINKEDIN_ACCOUNT_URN)}&includeAnalytics=true`);
      if (!res.ok) throw new Error("Failed to fetch LinkedIn campaigns");
      return res.json();
    },
    refetchInterval: 300000,
  });

  // Prepare metrics from Windsor AI LinkedIn data
  const metrics = windsorAILinkedInData?.metrics || {
    impressions: 0,
    clicks: 0,
    spend: 0,
    conversions: 0,
    ctr: 0,
    cpc: 0,
    cpm: 0,
  };

  // Fetch Google Ads data (Windsor AI only)
  const { data: windsorAIGoogleAdsData, isLoading: windsorAIGoogleAdsLoading, error: windsorAIGoogleAdsError } = useQuery({
    queryKey: ["windsor-ai-google-ads", startDate, endDate, "PureVPN B2B - Business VPN"],
    queryFn: () => fetchWindsorAIGoogleAds(formatDateForAPI(startDate), formatDateForAPI(endDate), "PureVPN B2B - Business VPN"),
    refetchInterval: 300000,
    retry: false,
  });

  // Fetch Reddit Ads data (Windsor AI only)
  // Using "admin_PureWL" as account name (matches Windsor AI dashboard)
  const { data: windsorAIRedditAdsData, isLoading: windsorAIRedditLoading, error: windsorAIRedditError } = useQuery({
    queryKey: ["windsor-ai-reddit-ads", startDate, endDate, "admin_PureWL"],
    queryFn: () => fetchWindsorAIRedditAds(formatDateForAPI(startDate), formatDateForAPI(endDate), "admin_PureWL"),
    refetchInterval: 300000,
    retry: false,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Ads Performance</h1>
        <p className="text-muted-foreground mt-1">
          LinkedIn Ads, Reddit Ads, and FluentForm Ads performance data
        </p>
      </div>

      {/* Tabs for different ad sources */}
      <Tabs defaultValue="google" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="google">
            Google Ads
          </TabsTrigger>
          <TabsTrigger value="reddit">
            Reddit Ads
          </TabsTrigger>
          <TabsTrigger value="linkedin">
            LinkedIn Ads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="linkedin" className="mt-6 space-y-6">
          {windsorAILinkedInError && !windsorAILinkedInData ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <p className="font-medium">LinkedIn Ads Data Unavailable</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {windsorAILinkedInError instanceof Error ? windsorAILinkedInError.message : "Failed to fetch LinkedIn Ads data from Windsor AI"}
                </p>
              </CardContent>
            </Card>
          ) : windsorAILinkedInData ? (
            <>
              {windsorAILinkedInData.note && (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">🔗 Windsor AI</Badge>
                      <p className="text-sm text-muted-foreground">{windsorAILinkedInData.note}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              <LinkedInMetrics
                metrics={metrics}
                isLoading={windsorAILinkedInLoading}
                hasData={!!windsorAILinkedInData && (windsorAILinkedInData.summary?.totalClicks > 0 || windsorAILinkedInData.summary?.totalSpend > 0)}
                dateRange={`${format(new Date(startDate), "MMM d")} - ${format(new Date(endDate), "MMM d")}`}
              />
              {/* Show all campaigns from LinkedIn API, merged with Windsor AI performance data */}
              {linkedInCampaignsData?.campaigns && linkedInCampaignsData.campaigns.length > 0 ? (
                <CampaignsTable
                  campaigns={linkedInCampaignsData.campaigns.map((c: any) => {
                    // Try to find matching Windsor AI campaign data by name
                    const windsorCampaign = windsorAILinkedInData?.campaigns?.find(
                      (wc: any) => wc.name?.toLowerCase() === c.name?.toLowerCase()
                    );
                    
                    // Use Windsor AI data if available, otherwise use LinkedIn API analytics
                    const analytics = windsorCampaign ? {
                      impressions: windsorCampaign.impressions || 0,
                      clicks: windsorCampaign.clicks || 0,
                      spend: windsorCampaign.spend || 0,
                      conversions: windsorCampaign.conversions || 0,
                      ctr: windsorCampaign.ctr || 0,
                      cpc: windsorCampaign.cpc || 0,
                    } : c.analytics || {
                      impressions: 0,
                      clicks: 0,
                      spend: 0,
                      conversions: 0,
                    };
                    
                    return {
                      id: c.id,
                      name: c.name,
                      status: c.status,
                      objective: c.objective || "",
                      createdAt: c.createdAt || "",
                      accountId: c.accountId || LINKEDIN_ACCOUNT_ID,
                      accountName: c.accountName || "PureVPN - Partner & Enterprise Solutions",
                      analytics,
                    };
                  })}
                  isLoading={windsorAILinkedInLoading || linkedInCampaignsLoading}
                />
              ) : windsorAILinkedInData?.campaigns && windsorAILinkedInData.campaigns.length > 0 ? (
                // Fallback to Windsor AI campaigns if LinkedIn API is not available
                <CampaignsTable
                  campaigns={windsorAILinkedInData.campaigns.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    status: c.status,
                    objective: "",
                    createdAt: "",
                    accountId: LINKEDIN_ACCOUNT_ID,
                    accountName: "PureVPN - Partner & Enterprise Solutions",
                    analytics: {
                      impressions: c.impressions,
                      clicks: c.clicks,
                      spend: c.spend,
                      conversions: c.conversions,
                      ctr: c.ctr,
                      cpc: c.cpc,
                    },
                  }))}
                  isLoading={windsorAILinkedInLoading}
                />
              ) : null}
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-muted-foreground text-center">
                  {windsorAILinkedInLoading
                    ? "Loading LinkedIn Ads data..."
                    : "No LinkedIn Ads data available"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="google" className="mt-6">
          {windsorAIGoogleAdsError && !windsorAIGoogleAdsData ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <p className="font-medium">Google Ads Data Unavailable</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {windsorAIGoogleAdsError instanceof Error ? windsorAIGoogleAdsError.message : "Failed to fetch Google Ads data from Windsor AI"}
                </p>
              </CardContent>
            </Card>
          ) : windsorAIGoogleAdsData ? (
            <GoogleAdsMetrics
              data={windsorAIGoogleAdsData}
              isLoading={windsorAIGoogleAdsLoading}
            />
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-muted-foreground text-center">
                  {windsorAIGoogleAdsLoading
                    ? "Loading Google Ads data..."
                    : "No Google Ads data available"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reddit" className="mt-6">
          {windsorAIRedditLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  Loading Reddit Ads data...
                </div>
              </CardContent>
            </Card>
          ) : windsorAIRedditError && !windsorAIRedditAdsData ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <p className="font-medium">Reddit Ads Data Unavailable</p>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {windsorAIRedditError instanceof Error ? windsorAIRedditError.message : "Failed to fetch Reddit Ads data from Windsor AI"}
                </p>
                {windsorAIRedditError instanceof Error && windsorAIRedditError.message.includes("400") && (
                  <div className="mt-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <p className="text-xs font-medium mb-1 text-yellow-600 dark:text-yellow-400">400 Bad Request Error</p>
                    <p className="text-xs text-muted-foreground">
                      This usually means:
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>One or more field names are invalid for Reddit Ads</li>
                        <li>The date_preset format might be incorrect</li>
                        <li>The API key might not have access to Reddit Ads data</li>
                      </ul>
                      Check server logs for the detailed error message from Windsor AI.
                    </p>
                  </div>
                )}
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium mb-1">Debug Info:</p>
                  <p className="text-xs text-muted-foreground">
                    Account: admin_PureWL<br />
                    Date Range: Last 30 days<br />
                    Check browser console and server logs for available account names
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : windsorAIRedditAdsData ? (
            <RedditAdsMetrics
              data={windsorAIRedditAdsData}
              isLoading={windsorAIRedditLoading}
            />
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-muted-foreground text-center">
                  No Reddit Ads data available
                </p>
                {windsorAIRedditError && (
                  <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      Error: {windsorAIRedditError instanceof Error ? windsorAIRedditError.message : "Unknown error"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
