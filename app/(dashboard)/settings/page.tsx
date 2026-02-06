"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, Activity, Server, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StatusData {
  claude: {
    configured: boolean;
    adminKeyConfigured?: boolean;
    apiKey: string | null;
    connected: boolean;
    error: string | null;
    usage: {
      requests: number;
      tokensUsed: number;
      inputTokens?: number;
      outputTokens?: number;
      cachedInputTokens?: number;
      cacheCreationTokens?: number;
      lastRequest: string | null;
      cacheHitRate?: number;
      byModel?: {
        [model: string]: {
          inputTokens: number;
          outputTokens: number;
          cachedInputTokens: number;
          cacheCreationTokens: number;
          totalTokens: number;
        };
      };
      period?: {
        startingAt: string;
        endingAt: string;
        daysBack: number;
      } | null;
    };
    costs?: {
      totalCost: number;
      tokenCosts: number;
      webSearchCosts: number;
      codeExecutionCosts: number;
      byModel: {
        [model: string]: {
          totalCost: number;
          tokenCosts: number;
          webSearchCosts: number;
          codeExecutionCosts: number;
        };
      };
    } | null;
    limits: {
      rateLimit: number;
      maxTokens: number;
      maxMessages: number;
    };
    currentModel: string;
  };
  mcpServers: {
    [key: string]: {
      name: string;
      configured: boolean;
      connected: boolean;
      error: string | null;
      tools: number;
      usage: {
        requests: number;
        lastRequest: string | null;
      };
      propertyId?: string | null;
    };
  };
  directApis: {
    [key: string]: {
      name: string;
      configured: boolean;
      connected: boolean;
      error: string | null;
      usage: {
        requests: number;
        lastRequest: string | null;
      };
      customerId?: string | null;
    };
  };
}

async function fetchStatus() {
  const res = await fetch('/api/settings/status');
  if (!res.ok) {
    throw new Error("Failed to fetch status");
  }
  return res.json();
}

export default function SettingsPage() {
  const { data, isLoading, error, refetch } = useQuery<StatusData>({
    queryKey: ["settings-status"],
    queryFn: fetchStatus,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusIcon = (connected: boolean, configured: boolean) => {
    if (!configured) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
    return connected ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (connected: boolean, configured: boolean) => {
    if (!configured) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Not Configured</Badge>;
    }
    return connected ? (
      <Badge variant="outline" className="bg-green-50 text-green-700">Connected</Badge>
    ) : (
      <Badge variant="outline" className="bg-red-50 text-red-700">Disconnected</Badge>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    try {
      return new Date(date).toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Monitor API status, MCP servers, and usage statistics
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading status...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <XCircle className="h-8 w-8 mx-auto text-red-500" />
            <p className="mt-2 text-red-500">Failed to load status</p>
          </CardContent>
        </Card>
      )}

      {data && (
        <>
          {/* Claude API Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Claude API Usage
              </CardTitle>
              <CardDescription>Anthropic Claude API usage and costs (costs require ANTHROPIC_ADMIN_KEY)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(data.claude.connected, data.claude.configured)}
                  <span className="font-medium">Status</span>
                </div>
                {getStatusBadge(data.claude.connected, data.claude.configured)}
              </div>
              
              {data.claude.error && (
                <div className="p-3 bg-red-50 rounded-md text-sm text-red-700">
                  {data.claude.error}
                </div>
              )}

              {/* Summary: Total cost, Input, Output, Total tokens - always visible */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">API usage summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total cost (USD)</p>
                    <p className="text-xl font-bold">
                      {data.claude.costs != null
                        ? `$${data.claude.costs.totalCost.toFixed(2)}`
                        : "—"}
                    </p>
                    {!data.claude.costs && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {data.claude.adminKeyConfigured
                          ? "Cost data unavailable (API may not support cost report for this account)"
                          : "Set ANTHROPIC_ADMIN_KEY for cost data"}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Input tokens</p>
                    <p className="text-xl font-bold">
                      {(data.claude.usage.inputTokens ?? data.claude.usage.tokensUsed ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Output tokens</p>
                    <p className="text-xl font-bold">
                      {(data.claude.usage.outputTokens ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total tokens</p>
                    <p className="text-xl font-bold">
                      {(data.claude.usage.tokensUsed ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Model</p>
                  <p className="font-medium">{data.claude.currentModel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">API Key</p>
                  <p className="font-medium font-mono text-xs">{data.claude.apiKey || "Not set"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Rate Limit Usage</span>
                  <span>{data.claude.usage.requests} / {data.claude.limits.rateLimit} per minute</span>
                </div>
                <Progress 
                  value={getUsagePercentage(data.claude.usage.requests, data.claude.limits.rateLimit)} 
                  className="h-2"
                />
              </div>

              {data.claude.usage.period && (
                <div className="p-3 bg-blue-50 rounded-md text-sm">
                  <p className="text-muted-foreground">
                    Usage period: Last {data.claude.usage.period.daysBack} days
                    ({new Date(data.claude.usage.period.startingAt).toLocaleDateString()} - {new Date(data.claude.usage.period.endingAt).toLocaleDateString()})
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{data.claude.usage.requests}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tokens</p>
                  <p className="text-2xl font-bold">{data.claude.usage.tokensUsed?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Input Tokens</p>
                  <p className="text-2xl font-bold">{(data.claude.usage.inputTokens ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Output Tokens</p>
                  <p className="text-2xl font-bold">{(data.claude.usage.outputTokens ?? 0).toLocaleString()}</p>
                </div>
              </div>

              {data.claude.usage.cacheHitRate !== undefined && data.claude.usage.cacheHitRate > 0 && (
                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Cache Hit Rate</span>
                    <span>{data.claude.usage.cacheHitRate.toFixed(2)}%</span>
                  </div>
                  <Progress value={data.claude.usage.cacheHitRate} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Cached tokens: {data.claude.usage.cachedInputTokens?.toLocaleString() || 0}
                    {data.claude.usage.cacheCreationTokens !== undefined && data.claude.usage.cacheCreationTokens > 0 && (
                      <> • Cache creation: {data.claude.usage.cacheCreationTokens.toLocaleString()}</>
                    )}
                  </p>
                </div>
              )}

              {data.claude.costs && (
                <div className="pt-2 border-t space-y-3">
                  <h4 className="font-semibold text-sm">Costs (USD)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-xl font-bold">${data.claude.costs.totalCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Token Costs</p>
                      <p className="text-xl font-bold">${data.claude.costs.tokenCosts.toFixed(2)}</p>
                    </div>
                    {data.claude.costs.webSearchCosts > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Web Search</p>
                        <p className="text-xl font-bold">${data.claude.costs.webSearchCosts.toFixed(2)}</p>
                      </div>
                    )}
                    {data.claude.costs.codeExecutionCosts > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Code Execution</p>
                        <p className="text-xl font-bold">${data.claude.costs.codeExecutionCosts.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {data.claude.usage.byModel && Object.keys(data.claude.usage.byModel).length > 0 && (
                <div className="pt-2 border-t space-y-3">
                  <h4 className="font-semibold text-sm">Usage by Model</h4>
                  <div className="space-y-2">
                    {Object.entries(data.claude.usage.byModel).map(([model, metrics]) => (
                      <div key={model} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{model}</span>
                          {data.claude.costs?.byModel?.[model] && (
                            <span className="text-sm font-semibold">
                              ${data.claude.costs.byModel[model].totalCost.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Input:</span> {metrics.inputTokens.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Output:</span> {metrics.outputTokens.toLocaleString()}
                          </div>
                          {metrics.cachedInputTokens > 0 && (
                            <div>
                              <span className="text-muted-foreground">Cached:</span> {metrics.cachedInputTokens.toLocaleString()}
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Total:</span> {metrics.totalTokens.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Last Request</p>
                <p className="text-sm font-medium">{formatDate(data.claude.usage.lastRequest)}</p>
              </div>
            </CardContent>
          </Card>

          {/* MCP Servers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                MCP Servers
              </CardTitle>
              <CardDescription>Model Context Protocol server status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(data.mcpServers).map(([key, server]) => (
                <div key={key} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(server.connected, server.configured)}
                      <span className="font-medium">{server.name}</span>
                    </div>
                    {getStatusBadge(server.connected, server.configured)}
                  </div>

                  {server.error && (
                    <div className="p-2 bg-red-50 rounded text-xs text-red-700">
                      {server.error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Available Tools</p>
                      <p className="font-medium">{server.tools}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Requests</p>
                      <p className="font-medium">{server.usage.requests}</p>
                    </div>
                    {server.propertyId && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Property ID</p>
                        <p className="font-medium font-mono text-xs">{server.propertyId}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Direct APIs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Direct APIs
              </CardTitle>
              <CardDescription>Direct API integrations status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(data.directApis).map(([key, api]) => (
                <div key={key} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(api.connected, api.configured)}
                      <span className="font-medium">{api.name}</span>
                    </div>
                    {getStatusBadge(api.connected, api.configured)}
                  </div>

                  {api.error && (
                    <div className="p-2 bg-red-50 rounded text-xs text-red-700">
                      {api.error}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Requests</p>
                      <p className="font-medium">{api.usage.requests}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Request</p>
                      <p className="font-medium text-xs">{formatDate(api.usage.lastRequest)}</p>
                    </div>
                    {api.customerId && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Customer ID</p>
                        <p className="font-medium font-mono text-xs">{api.customerId}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
