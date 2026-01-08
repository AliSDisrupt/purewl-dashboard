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
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, Play } from "lucide-react";

interface Call {
  id: string;
  title: string;
  duration?: number;
  direction?: string;
  status?: string;
  recordingUrl?: string;
  startTime?: string;
}

interface CallsTableProps {
  calls: Call[];
  isLoading?: boolean;
}

export function CallsTable({ calls, isLoading }: CallsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading calls...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!calls || calls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No calls found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
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
            <Phone className="h-5 w-5" />
            Calls
          </CardTitle>
          <Badge variant="secondary">{calls.length} calls</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Call Title</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Recording</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell className="font-medium">{call.title}</TableCell>
                  <TableCell>
                    {call.direction ? (
                      <div className="flex items-center gap-2">
                        {call.direction === "INBOUND" ? (
                          <PhoneIncoming className="h-4 w-4 text-green-500" />
                        ) : (
                          <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {call.direction}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDuration(call.duration)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {call.status ? (
                      <Badge variant="outline" className="text-xs">
                        {call.status}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(call.startTime)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {call.recordingUrl ? (
                      <a
                        href={call.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:underline text-sm"
                      >
                        <Play className="h-3 w-3" />
                        Play
                      </a>
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
