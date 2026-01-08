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

interface SourceMedium {
  source: string;
  medium: string;
  users: number;
  sessions: number;
  engagementRate: number;
}

interface SourceMediumTableProps {
  current: SourceMedium[];
  previous?: SourceMedium[];
  isLoading?: boolean;
}

export function SourceMediumTable({ current, previous, isLoading }: SourceMediumTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Source / Medium Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading source/medium data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!current || current.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Source / Medium Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No source/medium data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const previousMap = new Map<string, SourceMedium>();
  previous?.forEach((item) => {
    previousMap.set(`${item.source}|${item.medium}`, item);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Source / Medium Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Medium</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Engagement Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.map((item, index) => {
                const key = `${item.source}|${item.medium}`;
                const prev = previousMap.get(key);
                const usersChange = prev ? calculateChange(item.users, prev.users) : null;
                const sessionsChange = prev ? calculateChange(item.sessions, prev.sessions) : null;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.source}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.medium}</Badge>
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
                        <span>{formatNumber(item.sessions)}</span>
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
                      {(item.engagementRate * 100).toFixed(1)}%
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
