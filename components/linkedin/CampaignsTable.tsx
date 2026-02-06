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
import { Megaphone, Calendar, Target, CheckCircle2, PauseCircle, XCircle, Eye, MousePointerClick, DollarSign, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  createdAt: string;
  accountId: string;
  accountName: string;
  analytics?: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
  };
}

interface CampaignsTableProps {
  campaigns: Campaign[];
  isLoading?: boolean;
}

export function CampaignsTable({ campaigns, isLoading }: CampaignsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading campaigns...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No campaigns found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "ACTIVE" || statusUpper === "RUNNING") {
      return "bg-green-500/10 text-green-500 border-green-500/20";
    }
    if (statusUpper === "PAUSED") {
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
    if (statusUpper === "ARCHIVED" || statusUpper === "CANCELLED") {
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  const getStatusIcon = (status: string) => {
    const statusUpper = status.toUpperCase();
    if (statusUpper === "ACTIVE" || statusUpper === "RUNNING") {
      return <CheckCircle2 className="h-3 w-3" />;
    }
    if (statusUpper === "PAUSED") {
      return <PauseCircle className="h-3 w-3" />;
    }
    return <XCircle className="h-3 w-3" />;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Campaigns
          </CardTitle>
          <Badge variant="secondary">{campaigns.length} campaigns</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Form Submissions</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Clicks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(campaign.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(campaign.status)}
                        {campaign.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.analytics ? (
                      <span className="font-medium">{formatNumber(campaign.analytics.conversions || 0)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.analytics ? (
                      <span className="font-medium">${formatNumber(campaign.analytics.spend || 0)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.analytics ? (
                      <span className="font-medium">{formatNumber(campaign.analytics.impressions || 0)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {campaign.analytics ? (
                      <span className="font-medium">{formatNumber(campaign.analytics.clicks || 0)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
