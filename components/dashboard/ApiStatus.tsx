"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiStatus {
  claude?: { connected: boolean; error: string | null };
  linkedin: { connected: boolean; error: string | null };
  hubspot: { connected: boolean; error: string | null };
  ga4: { connected: boolean; error: string | null };
  reddit: { connected: boolean; error: string | null };
  googleAds?: { connected: boolean; error: string | null };
  redditAds?: { connected: boolean; error: string | null };
}

const apiLabels: Record<string, string> = {
  claude: "Claude API",
  linkedin: "LinkedIn Ads",
  hubspot: "HubSpot CRM",
  ga4: "Google Analytics",
  reddit: "Reddit",
  googleAds: "Google Ads",
  redditAds: "Reddit Ads",
};

export function ApiStatus() {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isMinimized, setIsMinimized] = useState(true); // Start minimized by default

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setStatus(data);
      setLastChecked(new Date());
    } catch (error) {
      console.error("Failed to check API status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Count connected APIs
  const connectedCount = status
    ? Object.values(status).filter((s) => s.connected).length
    : 0;
  const totalCount = status ? Object.keys(status).length : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle>API Status</CardTitle>
          <Badge variant="outline" className="text-xs">
            {connectedCount}/{totalCount} Connected
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0"
          >
            {isMinimized ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkStatus}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      {!isMinimized && (
        <CardContent>
          <div className="space-y-3">
            {status &&
              Object.entries(status).map(([key, value]) => {
                const label = apiLabels[key as keyof typeof apiLabels];
                const isConnected = value.connected;
                const hasError = value.error !== null;

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {isConnected ? (
                        <CheckCircle2 className="h-5 w-5 text-chart-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <div className="font-medium">{label}</div>
                        {hasError && (
                          <div className="text-xs text-muted-foreground">
                            {value.error}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={isConnected ? "default" : "destructive"}
                      className={
                        isConnected
                          ? "bg-chart-2 text-white"
                          : "bg-destructive text-white"
                      }
                    >
                      {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                );
              })}
          </div>
          {lastChecked && (
            <div className="mt-4 text-xs text-muted-foreground text-center">
              Last checked: {lastChecked.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
