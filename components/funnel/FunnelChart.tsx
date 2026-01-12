"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FunnelLevel {
  label: string;
  value: number;
  count?: number;
  source: string;
  metric: string;
  conversionRate?: number;
}

interface FunnelChartProps {
  level1: FunnelLevel;
  level2: FunnelLevel;
  level3: FunnelLevel;
  level4: FunnelLevel;
}

const colors = {
  level1: "bg-blue-600",
  level2: "bg-purple-600",
  level3: "bg-orange-600",
  level4: "bg-green-600",
};

const hoverColors = {
  level1: "hover:bg-blue-700",
  level2: "hover:bg-purple-700",
  level3: "hover:bg-orange-700",
  level4: "hover:bg-green-700",
};

export function FunnelChart({ level1, level2, level3, level4 }: FunnelChartProps) {
  const levels = [level1, level2, level3, level4];
  const maxValue = Math.max(...levels.map((l) => l.value));
  
  // Check if all values are zero
  const allZero = levels.every((l) => l.value === 0);

  const formatValue = (value: number, level: FunnelLevel) => {
    if (level.label === "Closed-Won Revenue") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat("en-US").format(value);
  };

  // If all values are zero, show empty state
  if (allZero) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Full-Funnel Conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium mb-2">No data available for this date range</p>
            <p className="text-sm">Try selecting a different date range or check back later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Full-Funnel Conversion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {levels.map((level, index) => {
            const widthPercentage = (level.value / maxValue) * 100;
            const prevLevel = index > 0 ? levels[index - 1] : null;
            const conversionRate = level.conversionRate || 0;
            const colorKey = `level${index + 1}` as keyof typeof colors;
            const hoverColorKey = `level${index + 1}` as keyof typeof hoverColors;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{level.label}</span>
                    <span className="text-muted-foreground text-xs">({level.source})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {prevLevel && conversionRate > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {conversionRate.toFixed(1)}% conversion
                      </span>
                    )}
                    <span className="font-semibold">{formatValue(level.value, level)}</span>
                    {level.count !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        ({level.count} deals)
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-8 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2",
                      colors[colorKey],
                      hoverColors[hoverColorKey]
                    )}
                    style={{ width: `${Math.max(widthPercentage, 2)}%` }}
                  >
                    {widthPercentage > 10 && (
                      <span className="text-white text-xs font-medium">
                        {formatValue(level.value, level)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Session → Lead</div>
            <div className="text-lg font-semibold">
              {level2.conversionRate?.toFixed(1) || "0.0"}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Lead → Deal</div>
            <div className="text-lg font-semibold">
              {level3.conversionRate?.toFixed(1) || "0.0"}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Deal → Close</div>
            <div className="text-lg font-semibold">
              {level4.conversionRate?.toFixed(1) || "0.0"}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
