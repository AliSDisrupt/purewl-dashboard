"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrafficData {
  date: string;
  totalUsers: number;
  newUsers: number;
  sessions: number;
}

interface TrafficChartProps {
  data: TrafficData[];
}

const formatDateLabel = (value: string): string => {
  // Handle YYYYMMDD format from GA4
  if (typeof value === 'string' && value.length === 8 && /^\d{8}$/.test(value)) {
    const year = value.substring(0, 4);
    const month = value.substring(4, 6);
    const day = value.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  // Handle ISO date format
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return value; // Return as-is if invalid
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
        <p className="mb-2 font-medium text-foreground">{formatDateLabel(label)}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function TrafficChart({ data }: TrafficChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066FF" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0066FF" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#334155" 
              opacity={0.3}
            />
            <XAxis 
              dataKey="date" 
              stroke="#64748B"
              tick={{ fill: "#64748B", fontSize: 12 }}
              tickFormatter={(value) => {
                // Handle YYYYMMDD format from GA4
                if (typeof value === 'string' && value.length === 8 && /^\d{8}$/.test(value)) {
                  const year = value.substring(0, 4);
                  const month = value.substring(4, 6);
                  const day = value.substring(6, 8);
                  const date = new Date(`${year}-${month}-${day}`);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
                // Handle ISO date format
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                  return value; // Return as-is if invalid
                }
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis 
              stroke="#64748B"
              tick={{ fill: "#64748B", fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toString();
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', color: '#F8FAFC' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="totalUsers"
              stroke="#0066FF"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorUsers)"
              name="Total Users"
            />
            <Area
              type="monotone"
              dataKey="sessions"
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSessions)"
              name="Sessions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
