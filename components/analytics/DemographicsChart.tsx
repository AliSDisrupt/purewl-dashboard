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

interface DemographicData {
  ageGroup?: string;
  gender?: string;
  users: number;
  sessions: number;
}

interface DemographicsChartProps {
  ageGroups: DemographicData[];
  genders: DemographicData[];
  previousAgeGroups?: DemographicData[];
  previousGenders?: DemographicData[];
  isLoading?: boolean;
}

const COLORS = ["#0066FF", "#10B981", "#F59E0B", "#EF4444", "#A855F7"];

export function DemographicsChart({
  ageGroups,
  genders,
  previousAgeGroups,
  previousGenders,
  isLoading,
}: DemographicsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading demographics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demographics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="age" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="age">Age Groups</TabsTrigger>
            <TabsTrigger value="gender">Gender</TabsTrigger>
          </TabsList>
          <TabsContent value="age" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageGroups}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="ageGroup"
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
                  {ageGroups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="gender" className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genders}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="gender"
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
                  {genders.map((entry, index) => (
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
