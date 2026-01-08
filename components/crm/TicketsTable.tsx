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
import { Ticket, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface TicketData {
  id: string;
  subject: string;
  status: string;
  priority?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TicketsTableProps {
  tickets: TicketData[];
  isLoading?: boolean;
}

export function TicketsTable({ tickets, isLoading }: TicketsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No tickets found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("open") || statusLower.includes("new")) {
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
    if (statusLower.includes("closed") || statusLower.includes("resolved")) {
      return "bg-green-500/10 text-green-500 border-green-500/20";
    }
    if (statusLower.includes("pending")) {
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
    return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return "";
    const priorityLower = priority.toLowerCase();
    if (priorityLower.includes("urgent") || priorityLower.includes("high")) {
      return "bg-red-500/10 text-red-500 border-red-500/20";
    }
    if (priorityLower.includes("medium")) {
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Support Tickets
          </CardTitle>
          <Badge variant="secondary">{tickets.length} tickets</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.priority ? (
                      <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {ticket.category ? (
                      <span className="text-sm">{ticket.category}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(ticket.updatedAt || ticket.createdAt)}
                    </div>
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
