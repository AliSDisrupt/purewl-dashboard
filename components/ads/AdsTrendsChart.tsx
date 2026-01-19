"use client";

import { DailyTrend } from "@/types/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AdsTrendsChartProps {
  trends: DailyTrend[];
  isLoading?: boolean;
}

export function AdsTrendsChart({ trends, isLoading = false }: AdsTrendsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No trend data available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Format dates for display
  const chartData = trends.map((trend) => ({
    ...trend,
    date: new Date(trend.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="impressions"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Impressions"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#10b981"
              strokeWidth={2}
              name="Clicks"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="spend"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Spend ($)"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="leads"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Leads"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
