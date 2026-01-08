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

interface Event {
  eventName: string;
  eventCount: number;
  totalUsers: number;
  conversions: number;
}

interface EventsTableProps {
  current: Event[];
  previous?: Event[];
  isLoading?: boolean;
}

export function EventsTable({ current, previous, isLoading }: EventsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!current || current.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No event data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const previousMap = new Map<string, Event>();
  previous?.forEach((event) => {
    previousMap.set(event.eventName, event);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead className="text-right">Event Count</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.map((event, index) => {
                const prev = previousMap.get(event.eventName);
                const countChange = prev ? calculateChange(event.eventCount, prev.eventCount) : null;
                const usersChange = prev ? calculateChange(event.totalUsers, prev.totalUsers) : null;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{event.eventName}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{formatNumber(event.eventCount)}</span>
                        {countChange && (
                          <div className={`flex items-center gap-1 text-xs ${countChange.trend === "up" ? "text-green-500" : countChange.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                            {countChange.trend === "up" && <TrendingUp className="h-3 w-3" />}
                            {countChange.trend === "down" && <TrendingDown className="h-3 w-3" />}
                            {countChange.trend === "neutral" && <Minus className="h-3 w-3" />}
                            <span>{countChange.percentage.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{formatNumber(event.totalUsers)}</span>
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
                    <TableCell className="text-right">{formatNumber(event.conversions)}</TableCell>
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
