"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { MCPStatus } from "./MCPStatus";
import { ThinkingStatus } from "./ThinkingStatus";
import { ConversationSidebar } from "./ConversationSidebar";
import { ModelSelector } from "./ModelSelector";
import { useConversation } from "@/lib/contexts/ConversationContext";
import type { ClaudeModel } from "./ModelSelector";
import { Loader2, AlertCircle, Bot } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: number;
  toolCallsInfo?: Array<{ name: string; status: string }>;
}

interface ThinkingState {
  status: string;
  toolName?: string;
  thinking?: string;
}

const MAX_MESSAGES = 15; // Limit conversation history

async function sendMessage(
  messages: Message[],
  conversationId: string | null,
  model: ClaudeModel,
  onStatusUpdate?: (status: string, toolName?: string, thinking?: string) => void
): Promise<{
  content: any[];
  stop_reason: string;
  usage: { input_tokens: number; output_tokens: number };
  estimatedCost: string;
  toolCalls: number;
  toolCallsInfo?: Array<{ name: string; status: string }>;
}> {
  const response = await fetch("/api/claude/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream", // Request streaming
    },
    body: JSON.stringify({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      conversationId: conversationId || undefined,
      model: model,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send message");
  }

  // Check if response is streaming (text/event-stream) or JSON
  const contentType = response.headers.get("content-type");
  
  if (contentType?.includes("text/event-stream")) {
    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    if (!reader) {
      throw new Error("No response body");
    }

    let result: any = null;
    let hasCompleteEvent = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // If we're done reading but haven't received complete event, wait a bit
        if (!hasCompleteEvent && result) {
          // We have a result but no complete event - use it anyway
          hasCompleteEvent = true;
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === "status") {
              // Update thinking status in real-time
              onStatusUpdate?.(data.status, data.toolName, data.thinking);
            } else if (data.type === "thinking") {
              // Update thinking text in real-time
              onStatusUpdate?.("", undefined, data.thinking);
            } else if (data.type === "complete") {
              result = data;
              hasCompleteEvent = true;
            } else if (data.type === "error") {
              throw new Error(data.error);
            }
          } catch (e) {
            // Skip invalid JSON - log for debugging
            console.warn('Failed to parse SSE data:', line, e);
          }
        } else if (line.trim() && !line.startsWith("data: ")) {
          // Handle potential incomplete data lines
          console.warn('Unexpected SSE line format:', line);
        }
      }
    }

    // If we still don't have a result, check if we can construct one from what we have
    if (!result && !hasCompleteEvent) {
      console.error('No complete event received from stream');
      throw new Error("No result received from server. The response may have been incomplete.");
    }

    if (!result) {
      throw new Error("No result received");
    }

    return result;
  } else {
    // Handle regular JSON response
    return response.json();
  }
}

export function ChatInterface() {
  const {
    messages,
    addMessage,
    saveConversation,
    currentConversationId,
    selectedModel,
    setSelectedModel,
  } = useConversation();
  const [thinkingStatus, setThinkingStatus] = useState<ThinkingState | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (msgs: Message[]) => sendMessage(msgs, currentConversationId, selectedModel, (status, toolName, thinking) => {
      // Update thinking status in real-time
      setThinkingStatus((prev) => ({
        status: status || prev?.status || "",
        toolName: toolName || prev?.toolName,
        thinking: thinking || prev?.thinking,
      }));
    }),
    onMutate: () => {
      setThinkingStatus({ status: "Analyzing your question..." });
    },
    onSuccess: (data) => {
      setThinkingStatus(null);
      
      // Extract text content from Claude's response
      const assistantMessage = data.content
        .map((item: any) => {
          if (item.type === "text") {
            return item.text;
          }
          return "";
        })
        .join("\n");

      addMessage({
        role: "assistant" as const,
        content: assistantMessage,
        toolCalls: data.toolCalls && data.toolCalls > 0 ? data.toolCalls : undefined,
        toolCallsInfo: data.toolCallsInfo && data.toolCallsInfo.length > 0 ? data.toolCallsInfo : undefined
      });

      // Auto-save conversation after response (if not already saved)
      if (!currentConversationId && messages.length > 0) {
        saveConversation();
      }
    },
    onError: (error: Error) => {
      setThinkingStatus(null);
      addMessage({
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}`,
      });
    },
  });

  const handleSend = async (message: string) => {
    const userMessage: Message = { role: "user", content: message };
    addMessage(userMessage);
    
    // Show initial thinking status
    setThinkingStatus({ status: "Analyzing your question..." });

    mutation.mutate([...messages, userMessage]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* MCP Status Bar */}
      <div className="px-4 pt-4 pb-2 border-b border-border flex-shrink-0 flex items-center justify-between gap-2">
        <MCPStatus />
        <div className="flex items-center gap-2">
          <ModelSelector 
            selectedModel={selectedModel} 
            onModelChange={setSelectedModel} 
          />
          <ConversationSidebar />
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation with Atlas</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
                toolCalls={message.toolCalls}
                toolCallsInfo={message.toolCallsInfo}
              />
            ))}
            {thinkingStatus && (
              <ThinkingStatus 
                status={thinkingStatus.status} 
                toolName={thinkingStatus.toolName}
                thinking={thinkingStatus.thinking}
              />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Alert */}
      {mutation.isError && (
        <div className="px-4 pb-2 flex-shrink-0">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {mutation.error?.message || "An error occurred"}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border">
        <ChatInput
          onSend={handleSend}
          isLoading={mutation.isPending}
          disabled={mutation.isError}
        />
      </div>
    </div>
  );
}
