"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RetentionData {
  date: string;
  userType: string;
  users: number;
  sessions: number;
  engagementRate: number;
}

interface RetentionChartProps {
  retention: RetentionData[];
  isLoading?: boolean;
}

export function RetentionChart({ retention, isLoading }: RetentionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading retention data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!retention || retention.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No retention data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group by date and user type
  const dates = Array.from(new Set(retention.map((r) => r.date))).sort();
  const newUsers = dates.map((date) => {
    const data = retention.find((r) => r.date === date && r.userType === "New Visitor");
    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      users: data?.users || 0,
    };
  });
  const returningUsers = dates.map((date) => {
    const data = retention.find((r) => r.date === date && r.userType === "Returning Visitor");
    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      users: data?.users || 0,
    };
  });

  const combined = dates.map((date) => {
    const newData = retention.find((r) => r.date === date && r.userType === "New Visitor");
    const returnData = retention.find((r) => r.date === date && r.userType === "Returning Visitor");
    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      newUsers: newData?.users || 0,
      returningUsers: returnData?.users || 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Retention</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="combined" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="combined">Combined</TabsTrigger>
            <TabsTrigger value="new">New Users</TabsTrigger>
            <TabsTrigger value="returning">Returning Users</TabsTrigger>
          </TabsList>
          <TabsContent value="combined" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={combined}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="date"
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
                  dataKey="newUsers"
                  stroke="#0066FF"
                  strokeWidth={2}
                  name="New Users"
                  dot={{ fill: "#0066FF", r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="returningUsers"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Returning Users"
                  dot={{ fill: "#10B981", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="new" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={newUsers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  tick={{ fill: "#F8FAFC", fontSize: 12 }}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#0066FF"
                  strokeWidth={2}
                  name="New Users"
                  dot={{ fill: "#0066FF", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="returning" className="mt-4">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={returningUsers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  tick={{ fill: "#F8FAFC", fontSize: 12 }}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Returning Users"
                  dot={{ fill: "#10B981", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
