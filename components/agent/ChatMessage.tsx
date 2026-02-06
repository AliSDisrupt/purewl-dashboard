"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssistantMarkdown } from "./AssistantMarkdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  toolCalls?: number;
  toolCallsInfo?: Array<{ name: string; status: string }>;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, toolCalls, toolCallsInfo, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-2xl shadow-sm",
        isUser
          ? "bg-primary/10 ml-10 rounded-br-md"
          : "bg-muted/60 mr-10 rounded-bl-md border border-border/50"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          isUser ? "h-9 w-9 bg-primary text-primary-foreground" : "h-9 w-9 bg-primary/15 text-primary"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="text-sm font-medium text-foreground">
          {isUser ? "You" : "Atlas"}
        </div>
        <div className="text-sm leading-relaxed">
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{content}</div>
          ) : (
            <>
              <AssistantMarkdown content={content} />
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-0.5 bg-primary animate-pulse rounded align-middle" aria-hidden />
              )}
            </>
          )}
        </div>
        {toolCalls && toolCalls > 0 && (
          <div className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50 space-y-2">
            <div className="font-medium">Used {toolCalls} tool{toolCalls > 1 ? "s" : ""}</div>
            {toolCallsInfo && toolCallsInfo.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {toolCallsInfo.map((tool, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
                      tool.status === "completed"
                        ? "bg-green-500/20 text-green-700 dark:text-green-400"
                        : tool.status === "error"
                        ? "bg-red-500/20 text-red-700 dark:text-red-400"
                        : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                    )}
                  >
                    {tool.name.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
