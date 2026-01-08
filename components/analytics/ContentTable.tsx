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
import { formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { calculateChange } from "@/lib/dateUtils";

interface Content {
  pageTitle: string;
  pagePath: string;
  users: number;
  pageViews: number;
  engagementRate: number;
  conversions: number;
}

interface ContentTableProps {
  current: Content[];
  previous?: Content[];
  isLoading?: boolean;
}

export function ContentTable({ current, previous, isLoading }: ContentTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading content data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!current || current.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No content data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const previousMap = new Map<string, Content>();
  previous?.forEach((item) => {
    previousMap.set(item.pagePath, item);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Page Title</TableHead>
                <TableHead>Path</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Page Views</TableHead>
                <TableHead className="text-right">Engagement</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.map((item, index) => {
                const prev = previousMap.get(item.pagePath);
                const usersChange = prev ? calculateChange(item.users, prev.users) : null;
                const viewsChange = prev ? calculateChange(item.pageViews, prev.pageViews) : null;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {item.pageTitle}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {item.pagePath}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{formatNumber(item.users)}</span>
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
                        <span>{formatNumber(item.pageViews)}</span>
                        {viewsChange && (
                          <div className={`flex items-center gap-1 text-xs ${viewsChange.trend === "up" ? "text-green-500" : viewsChange.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                            {viewsChange.trend === "up" && <TrendingUp className="h-3 w-3" />}
                            {viewsChange.trend === "down" && <TrendingDown className="h-3 w-3" />}
                            {viewsChange.trend === "neutral" && <Minus className="h-3 w-3" />}
                            <span>{viewsChange.percentage.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {(item.engagementRate * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatNumber(item.conversions)}
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
