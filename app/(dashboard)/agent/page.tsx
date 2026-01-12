"use client";

import { Bot } from "lucide-react";
import { ChatInterface } from "@/components/agent/ChatInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AgentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="h-8 w-8" />
          Atlas Agent
        </h1>
        <p className="text-muted-foreground mt-1">
          Chat with Atlas to analyze your LinkedIn Ads, HubSpot CRM, Google Analytics, and Reddit data
        </p>
      </div>

      {/* Chat Interface */}
      <Card className="flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
        <CardHeader className="flex-shrink-0">
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  );
}
