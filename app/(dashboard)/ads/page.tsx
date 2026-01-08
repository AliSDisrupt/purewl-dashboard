"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignsTable } from "@/components/linkedin/CampaignsTable";
import { LinkedInMetrics } from "@/components/linkedin/LinkedInMetrics";
import { GA4AdsMetrics } from "@/components/ads/GA4AdsMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// PureVPN Partner account ID
const PUREVPN_ACCOUNT_ID = "514469053";
const PUREVPN_ACCOUNT_URN = `urn:li:sponsoredAccount:${PUREVPN_ACCOUNT_ID}`;

// Fetch functions
async function fetchLinkedInAccounts() {
  const res = await fetch("/api/linkedin/accounts");
  if (!res.ok) throw new Error("Failed to fetch LinkedIn accounts");
  return res.json();
}

async function fetchLinkedInAccountsDetail() {
  const res = await fetch("/api/linkedin/accounts-detail");
  if (!res.ok) throw new Error("Failed to fetch LinkedIn accounts detail");
  return res.json();
}

async function fetchLinkedInCampaigns(accountId: string) {
  const res = await fetch(`/api/linkedin/campaigns?accountId=${encodeURIComponent(accountId)}&includeAnalytics=true`);
  if (!res.ok) throw new Error("Failed to fetch LinkedIn campaigns");
  return res.json();
}

async function fetchLinkedInAnalytics(accountId: string, daysBack: number = 30) {
  const res = await fetch(`/api/linkedin/analytics?accountId=${encodeURIComponent(accountId)}&daysBack=${daysBack}`);
  if (!res.ok) throw new Error("Failed to fetch LinkedIn analytics");
  return res.json();
}

async function fetchGA4Ads(startDate: string, endDate: string) {
  const res = await fetch(`/api/ga4/ads?startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error("Failed to fetch GA4 ads data");
  return res.json();
}

export default function AdsPage() {
  // Fetch accounts with detailed info to see which has activity
  const { data: accountsDetailData, isLoading: accountsLoading, refetch: refetchAccounts } = useQuery({
    queryKey: ["linkedin-accounts-detail"],
    queryFn: fetchLinkedInAccountsDetail,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Find PureVPN Partner account (by ID or name containing "PureVPN" or "Partner")
  const purevpnAccount = accountsDetailData?.accounts?.find(
    (acc: any) =>
      acc.simpleId === PUREVPN_ACCOUNT_ID ||
      acc.id === PUREVPN_ACCOUNT_URN ||
      acc.name?.toLowerCase().includes("purevpn") ||
      acc.name?.toLowerCase().includes("partner")
  );

  // Also show all accounts with activity for debugging
  const accountsWithActivity = accountsDetailData?.accounts?.filter(
    (acc: any) => acc.hasData && acc.analytics && (acc.analytics.impressions > 0 || acc.analytics.clicks > 0)
  ) || [];

  const accountId = purevpnAccount?.id || PUREVPN_ACCOUNT_URN;

  // Fetch campaigns for PureWL account
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ["linkedin-campaigns", accountId],
    queryFn: () => fetchLinkedInCampaigns(accountId),
    enabled: !!accountId,
    refetchInterval: 300000,
  });

  // Fetch analytics for PureWL account
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["linkedin-analytics", accountId],
    queryFn: () => fetchLinkedInAnalytics(accountId, 30),
    enabled: !!accountId,
    refetchInterval: 300000,
  });

  const campaigns = campaignsData?.campaigns || [];
  
  // Calculate metrics from campaign-level analytics if account-level shows no data
  let metrics = analyticsData?.metrics || {
    impressions: 0,
    clicks: 0,
    spend: 0,
    conversions: 0,
  };
  
  // If account-level has no data, aggregate from campaign-level analytics
  if (!analyticsData?.hasData && campaigns.length > 0) {
    const campaignMetrics = campaigns.reduce((acc, campaign) => {
      if (campaign.analytics) {
        acc.impressions += campaign.analytics.impressions || 0;
        acc.clicks += campaign.analytics.clicks || 0;
        acc.spend += campaign.analytics.spend || 0;
        acc.conversions += campaign.analytics.conversions || 0;
      }
      return acc;
    }, { impressions: 0, clicks: 0, spend: 0, conversions: 0 });
    
    // Use campaign metrics if they have any data
    if (campaignMetrics.impressions > 0 || campaignMetrics.clicks > 0 || campaignMetrics.spend > 0) {
      metrics = campaignMetrics;
    }
  }
  
  // Check if we have data from either account-level or campaign-level
  const hasAccountData = analyticsData?.hasData || false;
  const hasCampaignData = campaigns.some(c => 
    c.analytics && (c.analytics.impressions > 0 || c.analytics.clicks > 0 || c.analytics.spend > 0)
  );
  const hasActiveCampaigns = campaigns.some(c => 
    c.status === "ACTIVE" || c.status === "RUNNING"
  );
  const activeCampaignsCount = campaigns.filter(c => 
    c.status === "ACTIVE" || c.status === "RUNNING"
  ).length;
  
  // Show data if we have account data, campaign data, or active campaigns
  const hasData = hasAccountData || hasCampaignData || hasActiveCampaigns;

  // Fetch GA4 Ads data (Reddit + FluentForm)
  const { data: ga4AdsData, isLoading: ga4AdsLoading } = useQuery({
    queryKey: ["ga4-ads"],
    queryFn: () => fetchGA4Ads("30daysAgo", "yesterday"),
    refetchInterval: 300000,
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

      {/* Account Info */}
      {accountsLoading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-muted-foreground text-center">Loading account information...</p>
          </CardContent>
        </Card>
      ) : purevpnAccount ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {purevpnAccount.name}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Account ID: {purevpnAccount.simpleId}</span>
                  <span>•</span>
                  <span>Total Campaigns: {purevpnAccount.totalCampaigns || 0}</span>
                  <span>•</span>
                  <span>Active Campaigns: {purevpnAccount.activeCampaigns || 0}</span>
                  {purevpnAccount.hasData && (
                    <>
                      <span>•</span>
                      <span className="text-green-500">Has Activity</span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchAccounts()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          {purevpnAccount.analytics && (
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Last 30 days: {purevpnAccount.analytics.impressions || 0} impressions, {purevpnAccount.analytics.clicks || 0} clicks, ${(purevpnAccount.analytics.spend || 0).toFixed(2)} spent
              </div>
            </CardContent>
          )}
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center gap-2 text-yellow-500">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">
                PureVPN Partner account not found. Using account ID: {PUREVPN_ACCOUNT_ID}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug: Show accounts with activity */}
      {accountsWithActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Accounts with Activity (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {accountsWithActivity.map((acc: any) => (
                <div key={acc.id} className="p-3 rounded-lg border border-border bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{acc.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {acc.simpleId} • {acc.activeCampaigns} active campaigns
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div>Impressions: {acc.analytics?.impressions || 0}</div>
                      <div>Clicks: {acc.analytics?.clicks || 0}</div>
                      <div>Spend: ${(acc.analytics?.spend || 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different ad sources */}
      <Tabs defaultValue="linkedin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="linkedin">
            LinkedIn Ads
          </TabsTrigger>
          <TabsTrigger value="ga4">
            GA4 Ads (Reddit & FluentForm)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="linkedin" className="mt-6 space-y-6">
          {/* LinkedIn Metrics - Only show if we have actual data */}
          {(hasAccountData || hasCampaignData) && (
            <LinkedInMetrics
              metrics={metrics}
              isLoading={analyticsLoading}
              hasData={hasAccountData || hasCampaignData}
              dateRange="Last 30 days"
            />
          )}

          {/* Show message if we have active campaigns but no analytics data yet */}
          {hasActiveCampaigns && !hasAccountData && !hasCampaignData && (
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns Detected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You have {activeCampaignsCount} active campaign(s), 
                  but no analytics data is available for the last 30 days. This could mean:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                  <li>Campaigns were recently activated and haven't generated data yet</li>
                  <li>Campaigns are active but haven't received impressions/clicks in this period</li>
                  <li>Analytics data may be delayed (check back in a few hours)</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* LinkedIn Campaigns - Always show campaigns */}
          <CampaignsTable
            campaigns={campaigns}
            isLoading={campaignsLoading}
          />
        </TabsContent>

        <TabsContent value="ga4" className="mt-6">
          {ga4AdsData ? (
            <GA4AdsMetrics
              data={ga4AdsData}
              isLoading={ga4AdsLoading}
            />
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-muted-foreground text-center">
                  {ga4AdsLoading ? "Loading GA4 ads data..." : "No GA4 ads data available"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
