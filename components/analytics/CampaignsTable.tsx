"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { calculateChange } from "@/lib/dateUtils";

interface Campaign {
  campaign: string;
  source: string;
  medium: string;
  users: number;
  sessions: number;
  conversions: number;
  revenue?: number;
}

interface ComparisonCampaign {
  campaign: string;
  source: string;
  medium: string;
  users: number;
  sessions: number;
  conversions: number;
  revenue?: number;
}

interface CampaignsTableProps {
  current: Campaign[];
  previous?: ComparisonCampaign[];
  isLoading?: boolean;
}

export function CampaignsTable({ current, previous, isLoading }: CampaignsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading campaigns...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!current || current.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No campaign data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create a map of previous period data for comparison
  const previousMap = new Map<string, ComparisonCampaign>();
  previous?.forEach((camp) => {
    previousMap.set(camp.campaign, camp);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaigns Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Medium</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.map((campaign, index) => {
                const prev = previousMap.get(campaign.campaign);
                const usersChange = prev ? calculateChange(campaign.users, prev.users) : null;
                const sessionsChange = prev ? calculateChange(campaign.sessions, prev.sessions) : null;
                const conversionsChange = prev ? calculateChange(campaign.conversions, prev.conversions) : null;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{campaign.campaign || "Unknown"}</TableCell>
                    <TableCell>{campaign.source}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.medium}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{formatNumber(campaign.users)}</span>
                        {usersChange && (
                          <div className={`flex items-center gap-1 text-xs ${usersChange.trend === "up" ? "text-green-500" : usersChange.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                            {usersChange.trend === "up" && <TrendingUp className="h-3 w-3" />}
                            {usersChange.trend === "down" && <TrendingDown className="h-3 w-3" />}
                            {usersChange.trend === "neutral" && <Minus className="h-3 w-3" />}
                            <span>{usersChange.percentage.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{formatNumber(campaign.sessions)}</span>
                        {sessionsChange && (
                          <div className={`flex items-center gap-1 text-xs ${sessionsChange.trend === "up" ? "text-green-500" : sessionsChange.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                            {sessionsChange.trend === "up" && <TrendingUp className="h-3 w-3" />}
                            {sessionsChange.trend === "down" && <TrendingDown className="h-3 w-3" />}
                            {sessionsChange.trend === "neutral" && <Minus className="h-3 w-3" />}
                            <span>{sessionsChange.percentage.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{formatNumber(campaign.conversions)}</span>
                        {conversionsChange && (
                          <div className={`flex items-center gap-1 text-xs ${conversionsChange.trend === "up" ? "text-green-500" : conversionsChange.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                            {conversionsChange.trend === "up" && <TrendingUp className="h-3 w-3" />}
                            {conversionsChange.trend === "down" && <TrendingDown className="h-3 w-3" />}
                            {conversionsChange.trend === "neutral" && <Minus className="h-3 w-3" />}
                            <span>{conversionsChange.percentage.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {campaign.revenue ? `$${formatNumber(campaign.revenue)}` : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
