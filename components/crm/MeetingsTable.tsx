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
import { Calendar, MapPin, Video, ExternalLink } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingUrl?: string;
  notes?: string;
}

interface MeetingsTableProps {
  meetings: Meeting[];
  isLoading?: boolean;
}

export function MeetingsTable({ meetings, isLoading }: MeetingsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading meetings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!meetings || meetings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No meetings found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const isUpcoming = (startTime?: string) => {
    if (!startTime) return false;
    try {
      return new Date(startTime) > new Date();
    } catch {
      return false;
    }
  };

  // Sort meetings: upcoming first, then past (most recent past first)
  const sortedMeetings = [...meetings].sort((a, b) => {
    if (!a.startTime && !b.startTime) return 0;
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    
    try {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
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
            <Calendar className="h-5 w-5" />
            Meetings
          </CardTitle>
          <Badge variant="secondary">{meetings.length} meetings</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Meeting Title</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMeetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {meeting.title}
                      {isUpcoming(meeting.startTime) && (
                        <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {formatDateTime(meeting.startTime)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(meeting.endTime)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {meeting.location ? (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {meeting.location}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {meeting.meetingUrl ? (
                      <a
                        href={meeting.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-500 hover:underline text-sm"
                      >
                        <Video className="h-3 w-3" />
                        Join
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
