"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, CheckCircle2, Clock, User, Calendar, Hash, Mail, ExternalLink } from "lucide-react";

interface Conversation {
  id: string;
  status: "OPEN" | "CLOSED";
  createdAt?: string;
  updatedAt?: string;
  assignedTo?: string;
  subject?: string;
  preview?: string;
  channel?: string;
  participantCount?: number;
  messages?: Array<{
    id: string;
    text: string;
    from: string;
    timestamp: string;
  }>;
  participants?: Array<{
    id: string;
    name?: string;
    email?: string;
  }>;
  associatedContact?: string;
  associatedDeal?: string;
}

interface ConversationsTableProps {
  threads: Conversation[];
  summary: {
    total: number;
    open: number;
    closed: number;
  };
  isLoading?: boolean;
}

export function ConversationsTable({
  threads,
  summary,
  isLoading,
}: ConversationsTableProps) {
  const [selectedThread, setSelectedThread] = useState<Conversation | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Open:</span>
              <span className="font-semibold text-blue-500">{summary.open}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Closed:</span>
              <span className="font-semibold text-green-500">{summary.closed}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold ml-1">{summary.total}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!threads || threads.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No conversations found</p>
          </div>
        ) : (
          <>
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Subject / Preview</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {threads.map((thread) => {
                    const formatDate = (dateStr?: string) => {
                      if (!dateStr) return "—";
                      try {
                        const date = new Date(dateStr);
                        const now = new Date();
                        const diffMs = now.getTime() - date.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        const diffDays = Math.floor(diffMs / 86400000);

                        if (diffMins < 1) return "Just now";
                        if (diffMins < 60) return `${diffMins}m ago`;
                        if (diffHours < 24) return `${diffHours}h ago`;
                        if (diffDays < 7) return `${diffDays}d ago`;
                        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      } catch {
                        return dateStr;
                      }
                    };

                    return (
                      <TableRow 
                        key={thread.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedThread(thread)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            {thread.subject ? (
                              <div className="font-medium">{thread.subject}</div>
                            ) : (
                              <div className="font-mono text-xs text-muted-foreground">
                                {thread.id.substring(0, 8)}...
                              </div>
                            )}
                            {thread.preview && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {thread.preview}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {thread.channel ? (
                            <Badge variant="outline" className="text-xs">
                              {thread.channel}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {thread.participantCount || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(thread.updatedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              thread.status === "OPEN"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-green-500/10 text-green-500 border-green-500/20"
                            }
                          >
                            <div className="flex items-center gap-2">
                              {thread.status === "OPEN" ? (
                                <Clock className="h-3 w-3" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              {thread.status}
                            </div>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg border border-border bg-card">
                  <p className="text-2xl font-bold">{summary.total}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total</p>
                </div>
                <div className="text-center p-4 rounded-lg border border-blue-500/20 bg-blue-500/10">
                  <p className="text-2xl font-bold text-blue-500">{summary.open}</p>
                  <p className="text-sm text-muted-foreground mt-1">Open</p>
                </div>
                <div className="text-center p-4 rounded-lg border border-green-500/20 bg-green-500/10">
                  <p className="text-2xl font-bold text-green-500">{summary.closed}</p>
                  <p className="text-sm text-muted-foreground mt-1">Closed</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Conversation Detail Dialog */}
      <Dialog open={!!selectedThread} onOpenChange={(open) => !open && setSelectedThread(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedThread?.subject || `Conversation ${selectedThread?.id.substring(0, 8)}`}
            </DialogTitle>
            <DialogDescription>
              Complete conversation details and message history
            </DialogDescription>
          </DialogHeader>
          
          {selectedThread && (
            <div className="space-y-6 mt-4">
              {/* Status and Channel */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Status
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      selectedThread.status === "OPEN"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : "bg-green-500/10 text-green-500 border-green-500/20"
                    }
                  >
                    {selectedThread.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    Channel
                  </div>
                  {selectedThread.channel ? (
                    <Badge variant="outline">{selectedThread.channel}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Unknown</span>
                  )}
                </div>
              </div>

              {/* Participants */}
              {selectedThread.participants && selectedThread.participants.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Participants ({selectedThread.participants.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedThread.participants.map((p) => (
                      <Badge key={p.id} variant="outline" className="bg-blue-500/10 text-blue-500">
                        {p.name || p.email || p.id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Associated Records */}
              {(selectedThread.associatedContact || selectedThread.associatedDeal) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                    Associated Records
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedThread.associatedContact && (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                        Contact: {selectedThread.associatedContact}
                      </Badge>
                    )}
                    {selectedThread.associatedDeal && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        Deal: {selectedThread.associatedDeal}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Messages */}
              {selectedThread.messages && selectedThread.messages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Messages ({selectedThread.messages.length})
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {selectedThread.messages.map((msg) => (
                      <div key={msg.id} className="p-4 rounded-lg border border-border bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{msg.from}</span>
                          <span className="text-xs text-muted-foreground">
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }) : "Unknown time"}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.text || "(No content)"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview if no messages */}
              {(!selectedThread.messages || selectedThread.messages.length === 0) && selectedThread.preview && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Preview
                  </div>
                  <div className="p-4 rounded-lg border border-border bg-muted/50">
                    <p className="text-sm">{selectedThread.preview}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-4 border-t border-border space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedThread.createdAt && (
                    <div>
                      <span className="text-muted-foreground">Created: </span>
                      <span>{new Date(selectedThread.createdAt).toLocaleString("en-US")}</span>
                    </div>
                  )}
                  {selectedThread.updatedAt && (
                    <div>
                      <span className="text-muted-foreground">Updated: </span>
                      <span>{new Date(selectedThread.updatedAt).toLocaleString("en-US")}</span>
                    </div>
                  )}
                </div>
                {selectedThread.assignedTo && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Assigned to: </span>
                    <span>{selectedThread.assignedTo}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Thread ID:</span>
                    <code className="px-2 py-1 rounded bg-muted font-mono">{selectedThread.id}</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
