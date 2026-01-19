"use client";

import { LinkedInCampaignPerformance } from "@/types/ads";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CampaignPerformanceTableProps {
  campaigns: LinkedInCampaignPerformance[];
  isLoading?: boolean;
}

export function CampaignPerformanceTable({
  campaigns,
  isLoading = false,
}: CampaignPerformanceTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No campaign data available. LinkedIn Ads metrics (impressions, clicks, spend) 
            need to be fetched from LinkedIn Ads API and integrated with HubSpot contact data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">CPL</TableHead>
                <TableHead className="text-right">Deals</TableHead>
                <TableHead className="text-right">Deal Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {campaign.campaignName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        campaign.status === "ACTIVE"
                          ? "default"
                          : campaign.status === "PAUSED"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(campaign.impressions)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(campaign.clicks)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {campaign.ctr.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${formatNumber(campaign.spend)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(campaign.leads)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${campaign.cpl.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(campaign.deals)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${formatNumber(campaign.dealValue)}
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
