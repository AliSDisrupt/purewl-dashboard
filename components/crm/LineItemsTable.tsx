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
import { ShoppingCart, DollarSign } from "lucide-react";

interface LineItem {
  id: string;
  name: string;
  quantity?: number;
  price?: number;
  amount?: number;
}

interface LineItemsTableProps {
  lineItems: LineItem[];
  isLoading?: boolean;
}

export function LineItemsTable({ lineItems, isLoading }: LineItemsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Line Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading line items...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!lineItems || lineItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Line Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No line items found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Line Items
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold text-green-500">
                ${formatNumber(totalAmount)}
              </span>
            </div>
            <Badge variant="secondary">{lineItems.length} items</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">
                    {item.quantity !== undefined ? item.quantity : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.price !== undefined ? (
                      <span>${formatNumber(item.price)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {item.amount !== undefined ? (
                      <span className="text-green-500">
                        ${formatNumber(item.amount)}
                      </span>
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
