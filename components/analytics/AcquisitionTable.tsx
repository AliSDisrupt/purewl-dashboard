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

interface Acquisition {
  source: string;
  medium: string;
  campaign: string;
  totalUsers: number;
  newUsers: number;
  sessions: number;
}

interface AcquisitionTableProps {
  current: Acquisition[];
  previous?: Acquisition[];
  isLoading?: boolean;
}

export function AcquisitionTable({ current, previous, isLoading }: AcquisitionTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Acquisition Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading acquisition data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!current || current.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Acquisition Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No acquisition data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const previousMap = new Map<string, Acquisition>();
  previous?.forEach((item) => {
    previousMap.set(`${item.source}|${item.medium}|${item.campaign}`, item);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Acquisition Path (First Touch)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Medium</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead className="text-right">Total Users</TableHead>
                <TableHead className="text-right">New Users</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.map((item, index) => {
                const key = `${item.source}|${item.medium}|${item.campaign}`;
                const prev = previousMap.get(key);
                const usersChange = prev ? calculateChange(item.totalUsers, prev.totalUsers) : null;
                const newUsersChange = prev ? calculateChange(item.newUsers, prev.newUsers) : null;

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
                        <span>{formatNumber(item.totalUsers)}</span>
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
                        <span>{formatNumber(item.newUsers)}</span>
                        {newUsersChange && (
                          <div className={`flex items-center gap-1 text-xs ${newUsersChange.trend === "up" ? "text-green-500" : newUsersChange.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                            {newUsersChange.trend === "up" && <TrendingUp className="h-3 w-3" />}
                            {newUsersChange.trend === "down" && <TrendingDown className="h-3 w-3" />}
                            {newUsersChange.trend === "neutral" && <Minus className="h-3 w-3" />}
                            <span>{newUsersChange.percentage.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(item.sessions)}</TableCell>
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
