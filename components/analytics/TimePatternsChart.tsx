"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HourData {
  hour: number;
  users: number;
  sessions: number;
  conversions: number;
}

interface DayData {
  dayOfWeek: number;
  dayName: string;
  users: number;
  sessions: number;
  conversions: number;
}

interface TimePatternsChartProps {
  hours: HourData[];
  daysOfWeek: DayData[];
  isLoading?: boolean;
}

const COLORS = ["#0066FF", "#10B981", "#F59E0B"];

export function TimePatternsChart({
  hours,
  daysOfWeek,
  isLoading,
}: TimePatternsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time-Based Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading time patterns...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format hours for display
  const formattedHours = hours.map((h) => ({
    ...h,
    hourLabel: `${h.hour}:00`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time-Based Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hours" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hours">Hour of Day</TabsTrigger>
            <TabsTrigger value="days">Day of Week</TabsTrigger>
          </TabsList>
          <TabsContent value="hours" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={formattedHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="hourLabel"
                  stroke="#64748B"
                  tick={{ fill: "#F8FAFC", fontSize: 12 }}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                    return value.toString();
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#0066FF"
                  strokeWidth={2}
                  name="Users"
                  dot={{ fill: "#0066FF", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Sessions"
                  dot={{ fill: "#10B981", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="days" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={daysOfWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="dayName"
                  stroke="#64748B"
                  tick={{ fill: "#F8FAFC", fontSize: 12 }}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                    return value.toString();
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="users" name="Users" radius={[8, 8, 0, 0]}>
                  {daysOfWeek.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <Bar dataKey="sessions" name="Sessions" radius={[8, 8, 0, 0]}>
                  {daysOfWeek.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
