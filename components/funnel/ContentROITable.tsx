"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface ContentROIRow {
  pageTitle: string;
  pageUrl: string;
  uniqueVisitors: number;
  pageViews: number;
  engagementRate?: number;
  avgEngagementTime?: number;
  bounceRate?: number;
}

interface ContentROITableProps {
  data: ContentROIRow[];
  isLoading?: boolean;
}

type SortColumn = "uniqueVisitors" | "pageViews";
type SortDirection = "asc" | "desc";

export function ContentROITable({ data, isLoading }: ContentROITableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("leadsGenerated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    const multiplier = sortDirection === "asc" ? 1 : -1;
    return (aValue - bValue) * multiplier;
  });


  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            Loading Content ROI data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blog Content Performance</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Blog posts and their traffic performance from GA4
        </p>
      </CardHeader>
      <CardContent>
        {sortedData.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No blog content data available. Make sure blog pages are being tracked in GA4.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold text-sm">
                    Blog Post / URL
                  </th>
                  <th
                    className="text-right p-3 font-semibold text-sm cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("uniqueVisitors")}
                  >
                    <div className="flex items-center justify-end">
                      Unique Visitors
                      <SortIcon column="uniqueVisitors" />
                    </div>
                  </th>
                  <th
                    className="text-right p-3 font-semibold text-sm cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort("pageViews")}
                  >
                    <div className="flex items-center justify-end">
                      Page Views
                      <SortIcon column="pageViews" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3">
                      <div className="max-w-md">
                        <div className="font-medium truncate">{row.pageTitle}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {row.pageUrl}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      {row.uniqueVisitors.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {row.pageViews.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        {sortedData.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Blog Posts</div>
              <div className="text-lg font-semibold">{sortedData.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Visitors</div>
              <div className="text-lg font-semibold">
                {sortedData
                  .reduce((sum, p) => sum + p.uniqueVisitors, 0)
                  .toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Page Views</div>
              <div className="text-lg font-semibold">
                {sortedData
                  .reduce((sum, p) => sum + p.pageViews, 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
