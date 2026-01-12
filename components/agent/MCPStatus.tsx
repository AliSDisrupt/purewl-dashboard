"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MCPStatus {
  linkedin: { connected: boolean; error: string | null };
  hubspot: { connected: boolean; error: string | null };
  ga4: { connected: boolean; error: string | null };
  reddit: { connected: boolean; error: string | null };
}

async function fetchMCPStatus(): Promise<MCPStatus> {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error("Failed to fetch MCP status");
  return res.json();
}

export function MCPStatus() {
  const { data: status, isLoading } = useQuery<MCPStatus>({
    queryKey: ["mcp-status"],
    queryFn: fetchMCPStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Checking connections...</span>
      </div>
    );
  }

  if (!status) return null;

  const services = [
    { name: "LinkedIn", status: status.linkedin },
    { name: "HubSpot", status: status.hubspot },
    { name: "GA4", status: status.ga4 },
    { name: "Reddit", status: status.reddit },
  ];

  return (
    <div className="flex items-center gap-3 text-xs flex-wrap">
      <span className="text-muted-foreground font-medium">MCP Status:</span>
      {services.map((service) => (
        <div
          key={service.name}
          className="flex items-center gap-1.5"
          title={service.status.error || `${service.name} connected`}
        >
          {service.status.connected ? (
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-red-500" />
          )}
          <span
            className={cn(
              "font-medium",
              service.status.connected
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {service.name}
          </span>
        </div>
      ))}
    </div>
  );
}
