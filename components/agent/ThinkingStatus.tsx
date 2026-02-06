"use client";

import { Loader2, Database, BarChart3, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingStatusProps {
  status: string;
  toolName?: string;
  thinking?: string;
}

const toolIcons: Record<string, { icon: any; label: string }> = {
  linkedin: { icon: Database, label: "LinkedIn Ads" },
  hubspot: { icon: Users, label: "HubSpot CRM" },
  ga4: { icon: BarChart3, label: "Google Analytics" },
  reddit: { icon: MessageSquare, label: "Reddit" },
};

function getToolInfo(toolName?: string) {
  if (!toolName) return null;
  
  // Map tool names to their service
  const toolNameLower = toolName.toLowerCase();
  
  if (toolNameLower.includes("linkedin")) {
    return toolIcons.linkedin;
  }
  if (toolNameLower.includes("hubspot")) {
    return toolIcons.hubspot;
  }
  if (toolNameLower.includes("ga4") || toolNameLower.includes("analytics")) {
    return toolIcons.ga4;
  }
  if (toolNameLower.includes("reddit")) {
    return toolIcons.reddit;
  }
  
  return null;
}

function formatToolName(toolName?: string): string {
  if (!toolName) return "";
  
  // Convert snake_case to readable format
  return toolName
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function ThinkingStatus({ status, toolName, thinking }: ThinkingStatusProps) {
  const toolInfo = getToolInfo(toolName);
  const Icon = toolInfo?.icon || Loader2;
  const formattedToolName = formatToolName(toolName);

  return (
    <div className="flex gap-3 p-4 rounded-2xl bg-muted/50 mr-10 border border-border/50 shadow-sm animate-in fade-in duration-200">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-4 w-4 animate-spin text-primary" />
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="text-sm font-medium text-foreground">Atlas</div>
        <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
          {status}
          {toolName && (
            <>
              <br />
              <span className="text-primary font-medium text-xs mt-1 block">
                {toolInfo ? `${toolInfo.label} • ` : ""}
                {formattedToolName}
              </span>
            </>
          )}
        </div>
        {thinking && (
          <div className="text-xs text-muted-foreground/80 italic border-l-2 border-primary/30 pl-2 mt-2 bg-muted/30 p-2 rounded-r-md">
            <span className="font-medium text-primary/80">Thinking:</span> {thinking}
          </div>
        )}
      </div>
    </div>
  );
}
