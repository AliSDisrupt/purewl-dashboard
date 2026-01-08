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

interface ConversionPath {
  source: string;
  medium: string;
  campaign: string;
  conversions: number;
  revenue: number;
  sessions: number;
  conversionRate: number;
}

interface ConversionPathsTableProps {
  current: ConversionPath[];
  previous?: ConversionPath[];
  isLoading?: boolean;
}

export function ConversionPathsTable({ current, previous, isLoading }: ConversionPathsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Paths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading conversion paths...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!current || current.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Paths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No conversion path data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const previousMap = new Map<string, ConversionPath>();
  previous?.forEach((item) => {
    previousMap.set(`${item.source}|${item.medium}|${item.campaign}`, item);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Paths (Multi-Touch Attribution)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Medium</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Conv. Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.map((item, index) => {
                const key = `${item.source}|${item.medium}|${item.campaign}`;
                const prev = previousMap.get(key);
                const conversionsChange = prev ? calculateChange(item.conversions, prev.conversions) : null;
                const revenueChange = prev ? calculateChange(item.revenue, prev.revenue) : null;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.source}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.medium}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.campaign}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold">{formatNumber(item.conversions)}</span>
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
                      <div className="flex items-center justify-end gap-2">
                        <span>${formatNumber(item.revenue)}</span>
                        {revenueChange && (
                          <div className={`flex items-center gap-1 text-xs ${revenueChange.trend === "up" ? "text-green-500" : revenueChange.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                            {revenueChange.trend === "up" && <TrendingUp className="h-3 w-3" />}
                            {revenueChange.trend === "down" && <TrendingDown className="h-3 w-3" />}
                            {revenueChange.trend === "neutral" && <Minus className="h-3 w-3" />}
                            <span>{revenueChange.percentage.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(item.sessions)}</TableCell>
                    <TableCell className="text-right">
                      {item.conversionRate.toFixed(2)}%
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
