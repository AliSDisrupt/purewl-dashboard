"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ExternalLink,
  Bell,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AccountWatchAlert {
  id: string;
  timestamp: string;
  visitorName: string;
  visitorEmail: string;
  linkedinUrl?: string;
  companyName: string;
  companyDomain?: string;
  pageUrl: string;
  dealId: string;
  dealName: string;
  dealStage: string;
  dealValue: number;
  dealOwner?: string;
  notified: boolean;
}

async function fetchAccountWatchAlerts() {
  const res = await fetch("/api/webhooks/rb2b-visitor");
  if (!res.ok) throw new Error("Failed to fetch account watch alerts");
  return res.json();
}

async function notifyRep(alertId: string) {
  const res = await fetch("/api/webhooks/rb2b-visitor/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alertId }),
  });
  if (!res.ok) throw new Error("Failed to send notification");
  return res.json();
}

export function AccountWatch() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["account-watch"],
    queryFn: fetchAccountWatchAlerts,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  const notifyMutation = useMutation({
    mutationFn: notifyRep,
    onSuccess: () => {
      refetch();
    },
  });

  const alerts: AccountWatchAlert[] = data?.alerts || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getStageColor = (stage: string) => {
    const lowerStage = stage.toLowerCase();
    if (lowerStage.includes("proposal") || lowerStage.includes("negotiation")) {
      return "bg-orange-500/20 text-orange-600 dark:text-orange-400";
    }
    if (lowerStage.includes("qualified") || lowerStage.includes("discovery")) {
      return "bg-blue-500/20 text-blue-600 dark:text-blue-400";
    }
    return "bg-green-500/20 text-green-600 dark:text-green-400";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Live Account Watch</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
            </Button>
            <Badge variant="outline" className="text-xs">
              {alerts.length} Active
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time alerts when contacts with open deals visit high-intent pages
        </p>
      </CardHeader>
      <CardContent>
        {isLoading && alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading account watch alerts...
          </div>
        ) : alerts.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No active account watch alerts. Alerts appear when contacts with
              open deals visit pricing, docs, or other high-intent pages.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold">{alert.visitorName}</div>
                        {alert.linkedinUrl && (
                          <a
                            href={alert.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            LinkedIn
                          </a>
                        )}
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getStageColor(alert.dealStage))}
                        >
                          {alert.dealStage}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">{alert.companyName}</span>
                          {alert.companyDomain && (
                            <span className="ml-1">({alert.companyDomain})</span>
                          )}
                        </div>
                        <div className="mt-1">
                          Viewing:{" "}
                          <span className="font-medium text-foreground">
                            {alert.pageUrl}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Deal: </span>
                          <span className="font-medium">{alert.dealName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Value: </span>
                          <span className="font-semibold text-primary">
                            {formatCurrency(alert.dealValue)}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {formatTimeAgo(alert.timestamp)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant={alert.notified ? "outline" : "default"}
                        onClick={() => notifyMutation.mutate(alert.id)}
                        disabled={alert.notified || notifyMutation.isPending}
                        className="whitespace-nowrap"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        {alert.notified ? "Notified" : "Notify Rep"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
