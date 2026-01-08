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
import { FileText, DollarSign, Calendar, AlertCircle } from "lucide-react";

interface Quote {
  id: string;
  title: string;
  amount?: number;
  expirationDate?: string;
}

interface QuotesTableProps {
  quotes: Quote[];
  isLoading?: boolean;
}

export function QuotesTable({ quotes, isLoading }: QuotesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading quotes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No quotes found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = quotes.reduce((sum, quote) => sum + (quote.amount || 0), 0);
  const expiredCount = quotes.filter((q) => {
    if (!q.expirationDate) return false;
    try {
      return new Date(q.expirationDate) < new Date();
    } catch {
      return false;
    }
  }).length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return false;
    try {
      return new Date(dateStr) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quotes
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Total Value: </span>
              <span className="font-semibold text-green-500">
                ${formatNumber(totalAmount)}
              </span>
            </div>
            <Badge variant="secondary">{quotes.length} quotes</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Quote Title</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Expiration Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {quote.title}
                      {isExpired(quote.expirationDate) && (
                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500">
                          Expired
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {quote.amount !== undefined ? (
                      <span className="text-green-500">
                        ${formatNumber(quote.amount)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {quote.expirationDate ? (
                      <div className={`flex items-center gap-2 text-sm ${isExpired(quote.expirationDate) ? "text-red-500" : ""}`}>
                        <Calendar className="h-3 w-3" />
                        {formatDate(quote.expirationDate)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
