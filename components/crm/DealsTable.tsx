"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import { DollarSign, Calendar, TrendingUp } from "lucide-react";

interface Deal {
  id: string;
  name: string;
  amount: number | null;
  stage: string;
  closeDate: string | null;
}

interface DealsTableProps {
  deals: Deal[];
  summary: {
    totalDeals: number;
    totalValue: number;
    byStage: Record<string, number>;
  };
  isLoading?: boolean;
}

export function DealsTable({ deals, summary, isLoading }: DealsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Deals Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading deals...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Deals Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No deals found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStageColor = (stage: string) => {
    const stageLower = stage.toLowerCase();
    if (stageLower.includes("closed") || stageLower.includes("won")) {
      return "bg-green-500/10 text-green-500 border-green-500/20";
    }
    if (stageLower.includes("lost") || stageLower.includes("cancelled")) {
      return "bg-red-500/10 text-red-500 border-red-500/20";
    }
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  // Sort deals: upcoming/recent first, then older ones
  const sortedDeals = [...deals].sort((a, b) => {
    // If no close date, put at the end
    if (!a.closeDate && !b.closeDate) return 0;
    if (!a.closeDate) return 1;
    if (!b.closeDate) return -1;
    
    try {
      const dateA = new Date(a.closeDate).getTime();
      const dateB = new Date(b.closeDate).getTime();
      const now = new Date().getTime();
      
      // Both in the future - sort by closest first
      if (dateA > now && dateB > now) {
        return dateA - dateB;
      }
      // Both in the past - sort by most recent first
      if (dateA <= now && dateB <= now) {
        return dateB - dateA;
      }
      // One future, one past - future first
      return dateA > now ? -1 : 1;
    } catch {
      return 0;
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Deals Pipeline
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Total Value:</span>
              <span className="font-semibold text-green-500">
                ${formatNumber(summary.totalValue)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Deals:</span>
              <span className="font-semibold ml-1">{summary.totalDeals}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Deal Name</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Close Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDeals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStageColor(deal.stage)}
                    >
                      {deal.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {deal.amount !== null ? (
                      <span className="text-green-500">
                        ${formatNumber(deal.amount)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(deal.closeDate)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Stage Breakdown */}
        {Object.keys(summary.byStage).length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium mb-3">Deals by Stage</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(summary.byStage).map(([stage, count]) => (
                <div
                  key={stage}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                >
                  <span className="text-sm text-muted-foreground truncate">
                    {stage}
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
