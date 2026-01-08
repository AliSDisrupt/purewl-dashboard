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
import { formatNumber } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchTerm {
  term: string;
  users: number;
  sessions: number;
  resultViews: number;
}

interface SearchTermsTableProps {
  searchTerms: SearchTerm[];
  isLoading?: boolean;
}

export function SearchTermsTable({ searchTerms, isLoading }: SearchTermsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading search terms...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!searchTerms || searchTerms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              No search data available. Site search may not be configured.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Site Search Terms
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Search Term</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Result Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchTerms.map((term, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{term.term}</TableCell>
                  <TableCell className="text-right">{formatNumber(term.users)}</TableCell>
                  <TableCell className="text-right">{formatNumber(term.sessions)}</TableCell>
                  <TableCell className="text-right">{formatNumber(term.resultViews)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
