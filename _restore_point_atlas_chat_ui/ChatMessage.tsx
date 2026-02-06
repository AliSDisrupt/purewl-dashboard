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
        "flex gap-3 p-4 rounded-lg",
        isUser
          ? "bg-primary/10 ml-12"
          : "bg-muted/50 mr-12"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="text-sm font-medium">
          {isUser ? "You" : "Atlas"}
        </div>
        <div className="text-sm leading-relaxed">
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{content}</div>
          ) : (
            <>
              <AssistantMarkdown content={content} />
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-0.5 bg-primary animate-pulse align-middle" aria-hidden />
              )}
            </>
          )}
        </div>
        {toolCalls && toolCalls > 0 && (
          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <div>Used {toolCalls} tool{toolCalls > 1 ? "s" : ""}</div>
            {toolCallsInfo && toolCallsInfo.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {toolCallsInfo.map((tool, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      "px-2 py-0.5 rounded text-xs",
                      tool.status === "completed"
                        ? "bg-green-500/20 text-green-600 dark:text-green-400"
                        : tool.status === "error"
                        ? "bg-red-500/20 text-red-600 dark:text-red-400"
                        : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
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
