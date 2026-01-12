"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { getFlagFromCode, getFlagFromCountryName } from "@/lib/countryFlags";

interface GeoData {
  country: string;
  countryCode?: string;
  users: number;
  sessions?: number;
}

interface GeoMapProps {
  data: GeoData[];
}

// Use the centralized flag utility from lib/countryFlags
// This function is kept for backward compatibility but now uses the centralized utility
const getCountryFlag = (country: string): string => {
  return getFlagFromCountryName(country);
};

// Get color intensity based on user count
const getIntensityColor = (users: number, maxUsers: number): string => {
  if (maxUsers === 0) return '#334155';
  const intensity = users / maxUsers;
  if (intensity > 0.7) return '#0066FF'; // chart-1 - Primary blue
  if (intensity > 0.4) return '#10B981'; // chart-2 - Success green
  if (intensity > 0.2) return '#F59E0B'; // chart-3 - Warning orange
  return '#EF4444'; // chart-4 - Danger red
};

export function GeoMap({ data }: GeoMapProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-muted-foreground">No geographic data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxUsers = Math.max(...data.map(d => d.users));
  const sortedData = [...data].sort((a, b) => b.users - a.users);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Geographic Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item, index) => {
              // Use flag from country code if available, otherwise from country name
              const flag = item.countryCode 
                ? getFlagFromCode(item.countryCode) 
                : getFlagFromCountryName(item.country);
              const percentage = (item.users / maxUsers) * 100;
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{flag}</span>
                      <span>{item.country}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: getIntensityColor(item.users, maxUsers),
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatNumber(item.users)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(item.sessions || 0)}
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
