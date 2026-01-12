"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  RefreshCw, 
  Building2, 
  User, 
  Mail, 
  ExternalLink, 
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  Search
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CompanySignal {
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

async function fetchSignals() {
  const res = await fetch('/api/webhooks/rb2b-visitor');
  if (!res.ok) {
    throw new Error("Failed to fetch signals");
  }
  return res.json();
}

export default function SignalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "value" | "company">("newest");

  const { data, isLoading, error, refetch } = useQuery<{ alerts: CompanySignal[]; total: number }>({
    queryKey: ["rb2b-signals"],
    queryFn: fetchSignals,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const signals = data?.alerts || [];
  const total = data?.total || 0;

  // Filter and sort signals
  const filteredSignals = signals
    .filter((signal) => {
      const matchesSearch = 
        signal.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        signal.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        signal.visitorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        signal.dealName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStage = filterStage === "all" || signal.dealStage.toLowerCase() === filterStage.toLowerCase();
      
      return matchesSearch && matchesStage;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === "value") {
        return b.dealValue - a.dealValue;
      } else {
        return a.companyName.localeCompare(b.companyName);
      }
    });

  // Get unique deal stages for filter
  const uniqueStages = Array.from(new Set(signals.map(s => s.dealStage)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Signals</h1>
          <p className="text-muted-foreground mt-1">
            High-intent visitor signals from Rb2b webhook
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSignals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deal Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredSignals.reduce((sum, s) => sum + s.dealValue, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredSignals.map(s => s.companyName)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Signals</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search companies, visitors, deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Stage: {filterStage === "all" ? "All" : filterStage}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterStage("all")}>
                    All Stages
                  </DropdownMenuItem>
                  {uniqueStages.map((stage) => (
                    <DropdownMenuItem key={stage} onClick={() => setFilterStage(stage)}>
                      {stage}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sort: {sortBy === "newest" ? "Newest" : sortBy === "value" ? "Value" : "Company"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("newest")}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("value")}>
                    Highest Value
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("company")}>
                    Company Name
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="py-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading signals...</p>
            </div>
          )}

          {error && (
            <div className="py-8 text-center">
              <p className="text-red-500">Failed to load signals</p>
            </div>
          )}

          {!isLoading && !error && filteredSignals.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No signals found</p>
            </div>
          )}

          {!isLoading && !error && filteredSignals.length > 0 && (
            <div className="space-y-4">
              {filteredSignals.map((signal) => (
                <Card key={signal.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        {/* Company Info */}
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{signal.companyName}</h3>
                              {signal.companyDomain && (
                                <Badge variant="outline" className="text-xs">
                                  {signal.companyDomain}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{signal.visitorName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{signal.visitorEmail}</span>
                              </div>
                              {signal.linkedinUrl && (
                                <a
                                  href={signal.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 hover:text-primary"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Deal Info */}
                        <div className="pl-11 space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{signal.dealName}</span>
                            </div>
                            <Badge variant="secondary">{signal.dealStage}</Badge>
                            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                              <DollarSign className="h-4 w-4" />
                              <span>${signal.dealValue.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" />
                              <a
                                href={signal.pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary truncate max-w-md"
                              >
                                {signal.pageUrl}
                              </a>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                            {signal.dealOwner && (
                              <Badge variant="outline" className="text-xs">
                                Owner: {signal.dealOwner}
                              </Badge>
                            )}
                            {signal.notified && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                Notified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
