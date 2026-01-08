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
import { Globe } from "lucide-react";
import { WorldMap } from "./WorldMap";

interface ChannelData {
  channel: string;
  users: number;
  percentage: number;
}

interface ChannelBreakdownProps {
  data: ChannelData[];
}

const COLORS = [
  "#0066FF", // chart-1 - Primary blue
  "#10B981", // chart-2 - Success green
  "#F59E0B", // chart-3 - Warning orange
  "#EF4444", // chart-4 - Danger red
  "#A855F7", // chart-5 - Purple accent
  "#64748B", // muted-foreground
  "#334155", // muted
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="mb-2 font-medium text-foreground">{data.channel}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          Users: <span className="font-semibold">{data.users.toLocaleString()}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Percentage: <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ChannelBreakdown({ data }: ChannelBreakdownProps) {
  // Sort by users descending for better visualization
  const sortedData = [...data].sort((a, b) => b.users - a.users);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Channels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#334155" 
              opacity={0.3}
              horizontal={false}
            />
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
              dataKey="channel"
              stroke="#64748B"
              tick={{ fill: "#F8FAFC", fontSize: 12 }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="users" 
              radius={[0, 8, 8, 0]}
              name="Users"
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* World Map Visualization */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">Global Traffic Distribution</h4>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-[140px] w-full rounded-lg bg-muted/20 overflow-hidden border border-border/50">
            <WorldMap />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
