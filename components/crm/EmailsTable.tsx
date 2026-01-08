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
import { Mail, Send, Eye, MousePointerClick, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface Email {
  id: string;
  subject: string;
  from?: string;
  to?: string;
  sentDate?: string;
  status?: string;
  openCount?: number;
  clickCount?: number;
  conversationId?: string;
}

interface EmailsTableProps {
  emails: Email[];
  isLoading?: boolean;
}

async function fetchConversation(conversationId: string) {
  const res = await fetch(`/api/hubspot/conversations?threadId=${conversationId}`);
  if (!res.ok) throw new Error("Failed to fetch conversation");
  const data = await res.json();
  // Find the specific thread
  return data.threads?.find((t: any) => t.id === conversationId) || null;
}

export function EmailsTable({ emails, isLoading }: EmailsTableProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);

  // Fetch conversation when email is selected
  const { data: conversationData, isLoading: conversationLoading } = useQuery({
    queryKey: ["conversation", selectedEmail?.conversationId],
    queryFn: () => selectedEmail?.conversationId ? fetchConversation(selectedEmail.conversationId) : null,
    enabled: !!selectedEmail?.conversationId,
  });

  // Update selected conversation when data arrives
  useEffect(() => {
    if (conversationData) {
      setSelectedConversation(conversationData);
    }
  }, [conversationData]);

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    if (email.conversationId) {
      // Conversation will be fetched via useQuery
      setSelectedConversation(null);
    } else {
      // No conversation ID, just show email details
      setSelectedConversation(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading emails...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No emails found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
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

  const getStatusColor = (status?: string) => {
    if (!status) return "";
    const statusLower = status.toLowerCase();
    if (statusLower.includes("opened") || statusLower.includes("clicked")) {
      return "bg-green-500/10 text-green-500 border-green-500/20";
    }
    if (statusLower.includes("sent")) {
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
    return "";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Emails
          </CardTitle>
          <Badge variant="secondary">{emails.length} emails</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((email) => (
                <TableRow 
                  key={email.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleEmailClick(email)}
                >
                  <TableCell className="font-medium max-w-[300px] truncate">
                    {email.subject}
                  </TableCell>
                  <TableCell className="text-sm">{email.from || "—"}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">
                    {email.to || "—"}
                  </TableCell>
                  <TableCell>
                    {email.status ? (
                      <Badge variant="outline" className={getStatusColor(email.status)}>
                        {email.status}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-sm">
                      {email.openCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span>{email.openCount}</span>
                        </div>
                      )}
                      {email.clickCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                          <span>{email.clickCount}</span>
                        </div>
                      )}
                      {email.openCount === undefined && email.clickCount === undefined && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Send className="h-3 w-3" />
                      {formatDate(email.sentDate)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Email/Conversation Detail Dialog */}
      <Dialog open={!!selectedEmail} onOpenChange={(open) => !open && setSelectedEmail(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {selectedEmail?.subject || "Email Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedEmail?.conversationId 
                ? "Email and associated conversation" 
                : "Email details"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-6 mt-4">
              {/* Email Details */}
              <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/50">
                <h3 className="font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">From: </span>
                    <span>{selectedEmail.from || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">To: </span>
                    <span>{selectedEmail.to || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sent: </span>
                    <span>
                      {selectedEmail.sentDate 
                        ? new Date(selectedEmail.sentDate).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status: </span>
                    {selectedEmail.status ? (
                      <Badge variant="outline" className="ml-2">
                        {selectedEmail.status}
                      </Badge>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                  {selectedEmail.openCount !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Opens: </span>
                      <span>{selectedEmail.openCount}</span>
                    </div>
                  )}
                  {selectedEmail.clickCount !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Clicks: </span>
                      <span>{selectedEmail.clickCount}</span>
                    </div>
                  )}
                </div>
                {selectedEmail.body && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground mb-2">Body:</div>
                    <div className="text-sm whitespace-pre-wrap bg-card p-3 rounded border border-border">
                      {selectedEmail.body}
                    </div>
                  </div>
                )}
              </div>

              {/* Conversation Details */}
              {selectedEmail.conversationId && (
                <div className="space-y-4 p-4 rounded-lg border border-border bg-blue-500/5">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Associated Conversation
                  </h3>
                  {conversationLoading ? (
                    <p className="text-sm text-muted-foreground">Loading conversation...</p>
                  ) : conversationData ? (
                    <div className="space-y-3">
                      {conversationData.subject && (
                        <div>
                          <span className="text-sm text-muted-foreground">Subject: </span>
                          <span className="text-sm font-medium">{conversationData.subject}</span>
                        </div>
                      )}
                      {conversationData.preview && (
                        <div>
                          <span className="text-sm text-muted-foreground">Preview: </span>
                          <p className="text-sm mt-1">{conversationData.preview}</p>
                        </div>
                      )}
                      {conversationData.channel && (
                        <div>
                          <span className="text-sm text-muted-foreground">Channel: </span>
                          <Badge variant="outline" className="ml-2">
                            {conversationData.channel}
                          </Badge>
                        </div>
                      )}
                      {conversationData.status && (
                        <div>
                          <span className="text-sm text-muted-foreground">Status: </span>
                          <Badge 
                            variant="outline"
                            className={`ml-2 ${
                              conversationData.status === "OPEN"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-green-500/10 text-green-500 border-green-500/20"
                            }`}
                          >
                            {conversationData.status}
                          </Badge>
                        </div>
                      )}
                      {conversationData.messages && conversationData.messages.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="text-sm text-muted-foreground mb-2">
                            Messages ({conversationData.messages.length}):
                          </div>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {conversationData.messages.map((msg: any) => (
                              <div key={msg.id} className="p-3 rounded border border-border bg-card text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{msg.from}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {msg.timestamp 
                                      ? new Date(msg.timestamp).toLocaleString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          hour: "numeric",
                                          minute: "2-digit",
                                        })
                                      : "Unknown time"}
                                  </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{msg.text || "(No content)"}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Conversation ID: {selectedEmail.conversationId} (Unable to load details)
                    </p>
                  )}
                </div>
              )}

              {!selectedEmail.conversationId && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No associated conversation found for this email.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
