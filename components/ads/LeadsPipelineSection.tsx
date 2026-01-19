"use client";

import {
  LinkedInAdsContact,
  LinkedInAdsDeal,
  LinkedInAdsConversation,
  PipelineStageBreakdown,
} from "@/types/ads";
import { formatNumber } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Building2, Calendar, MessageSquare } from "lucide-react";

interface LeadsPipelineSectionProps {
  contacts: LinkedInAdsContact[];
  deals: LinkedInAdsDeal[];
  conversations: LinkedInAdsConversation[];
  pipelineBreakdown: PipelineStageBreakdown[];
  isLoading?: boolean;
}

export function LeadsPipelineSection({
  contacts,
  deals,
  conversations,
  pipelineBreakdown,
  isLoading = false,
}: LeadsPipelineSectionProps) {
  return (
    <div className="space-y-6">
      {/* Pipeline Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Breakdown by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : pipelineBreakdown.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pipeline data available
            </p>
          ) : (
            <div className="space-y-4">
              {pipelineBreakdown.map((stage, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{stage.stage}</div>
                    <div className="text-sm text-muted-foreground">
                      {stage.count} deal{stage.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      ${formatNumber(stage.totalValue)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Value</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Contacts and Conversations */}
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contacts">Recent Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="conversations">
            Conversations ({conversations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent LinkedIn Ads Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : contacts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No contacts from LinkedIn Ads found
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">
                            {contact.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {contact.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {contact.company ? (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                {contact.company}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {contact.sourceCampaign || contact.utmCampaign || (
                              <span className="text-muted-foreground">Unknown</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {contact.createdAt ? (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(contact.createdAt), {
                                  addSuffix: true,
                                })}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations from LinkedIn Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No conversations from LinkedIn Ads leads found
                </p>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {conversation.subject || "No Subject"}
                          </span>
                          <Badge
                            variant={
                              conversation.status === "OPEN"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {conversation.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(conversation.updatedAt || conversation.createdAt),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                      {conversation.preview && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {conversation.preview}
                        </p>
                      )}
                      {conversation.channel && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {conversation.channel}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
