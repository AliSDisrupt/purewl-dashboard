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
import { TopPage } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface TopPagesProps {
  pages: TopPage[];
}

export function TopPages({ pages }: TopPagesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Landing Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Page Views</TableHead>
                <TableHead className="text-right">Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{page.path}</TableCell>
                  <TableCell className="text-right">{formatNumber(page.users)}</TableCell>
                  <TableCell className="text-right">{formatNumber(page.pageViews)}</TableCell>
                  <TableCell className="text-right">
                    {(page.engagementRate * 100).toFixed(1)}%
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
