"use client";

import {
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

interface Browser {
  browser: string;
  users: number;
}

interface OS {
  os: string;
  users: number;
}

interface TechnologyChartProps {
  browsers: Browser[];
  operatingSystems: OS[];
  isLoading?: boolean;
}

const COLORS = ["#0066FF", "#10B981", "#F59E0B", "#EF4444", "#A855F7", "#64748B"];

export function TechnologyChart({
  browsers,
  operatingSystems,
  isLoading,
}: TechnologyChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technology</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading technology data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="browser" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browser">Browsers</TabsTrigger>
            <TabsTrigger value="os">Operating Systems</TabsTrigger>
          </TabsList>
          <TabsContent value="browser" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={browsers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748B"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                    return value.toString();
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="browser"
                  stroke="#64748B"
                  tick={{ fill: "#F8FAFC", fontSize: 12 }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="users" name="Users" radius={[0, 8, 8, 0]}>
                  {browsers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="os" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={operatingSystems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748B"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                    return value.toString();
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="os"
                  stroke="#64748B"
                  tick={{ fill: "#F8FAFC", fontSize: 12 }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="users" name="Users" radius={[0, 8, 8, 0]}>
                  {operatingSystems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
