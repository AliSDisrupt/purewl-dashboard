"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { Activity, Globe, Monitor, Smartphone, Tablet } from "lucide-react";
import { useEffect, useState } from "react";

interface RealtimeData {
  totalActiveUsers: number;
  totalPageViews: number;
  byCountry: Array<{ country: string; users: number }>;
  byDevice: Array<{ device: string; users: number }>;
  topPages: Array<{ page: string; views: number }>;
}

interface RealtimeWidgetProps {
  data: RealtimeData | null;
  isLoading?: boolean;
}

export function RealtimeWidget({ data, isLoading }: RealtimeWidgetProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
            Real-Time Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading real-time data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Real-Time Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No real-time data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes("mobile")) return <Smartphone className="h-4 w-4" />;
    if (device.toLowerCase().includes("tablet")) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
            Real-Time Activity
          </div>
          <Badge variant="outline" className="text-xs">
            {time.toLocaleTimeString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold text-green-500">
              {formatNumber(data.totalActiveUsers)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Page Views</p>
            <p className="text-2xl font-bold">{formatNumber(data.totalPageViews)}</p>
          </div>
        </div>

        {/* Top Countries */}
        {data.byCountry && data.byCountry.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Top Countries</p>
            <div className="space-y-1">
              {data.byCountry.slice(0, 5).map((country, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span>{country.country}</span>
                  </div>
                  <span className="font-semibold">{formatNumber(country.users)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Devices */}
        {data.byDevice && data.byDevice.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">By Device</p>
            <div className="space-y-1">
              {data.byDevice.map((device, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(device.device)}
                    <span>{device.device}</span>
                  </div>
                  <span className="font-semibold">{formatNumber(device.users)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Pages */}
        {data.topPages && data.topPages.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Top Pages</p>
            <div className="space-y-1">
              {data.topPages.slice(0, 5).map((page, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="truncate text-muted-foreground">{page.page}</span>
                  <span className="font-semibold">{formatNumber(page.views)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
