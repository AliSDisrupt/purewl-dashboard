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
  onStatusUpdate?: (status: string, toolName?: string, thinking?: string) => void,
  onTextDelta?: (text: string) => void
): Promise<{
  content: any[];
  stop_reason: string;
  usage: { input_tokens: number; output_tokens: number };
  estimatedCost: string;
  toolCalls: number;
  toolCallsInfo?: Array<{ name: string; status: string }>;
}> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.tsx:sendMessage',message:'fetch start',data:{messageCount:messages.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
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

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.tsx:afterFetch',message:'response received',data:{ok:response.ok,status:response.status,contentType:response.headers.get('content-type')},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send message");
  }

  // Check if response is streaming (text/event-stream) or JSON
  const contentType = response.headers.get("content-type");
  
  if (contentType?.includes("text/event-stream")) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.tsx:streamBranch',message:'entering stream branch',data:{hasBody:!!response.body},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
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
        if (!hasCompleteEvent && result) {
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
              onStatusUpdate?.(data.status, data.toolName, data.thinking);
            } else if (data.type === "thinking") {
              onStatusUpdate?.("", undefined, data.thinking);
            } else if (data.type === "text_delta" && data.text) {
              onTextDelta?.(data.text);
            } else if (data.type === "complete") {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.tsx:completeEvent',message:'got complete event',data:{hasContent:!!data.content},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
              // #endregion
              result = data;
              hasCompleteEvent = true;
            } else if (data.type === "error") {
              throw new Error(data.error);
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', line, e);
          }
        } else if (line.trim() && !line.startsWith("data: ")) {
          console.warn('Unexpected SSE line format:', line);
        }
      }
    }

    if (!result && !hasCompleteEvent) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.tsx:noComplete',message:'no complete event',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      console.error('No complete event received from stream');
      throw new Error("No result received from server. The response may have been incomplete.");
    }

    if (!result) {
      throw new Error("No result received");
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ChatInterface.tsx:returnResult',message:'returning result',data:{contentLength:result?.content?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    return result;
  } else {
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
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (msgs: Message[]) =>
      sendMessage(
        msgs,
        currentConversationId,
        selectedModel,
        (status, toolName, thinking) => {
          setThinkingStatus((prev) => ({
            status: status || prev?.status || "",
            toolName: toolName || prev?.toolName,
            thinking: thinking || prev?.thinking,
          }));
        },
        (text) => {
          setStreamingContent((prev) => prev + text);
        }
      ),
    onMutate: () => {
      setThinkingStatus({ status: "Analyzing your question..." });
      setStreamingContent("");
    },
    onSuccess: (data) => {
      setThinkingStatus(null);
      setStreamingContent("");

      const assistantMessage = data.content
        .map((item: any) => (item.type === "text" ? item.text : ""))
        .join("\n");

      addMessage({
        role: "assistant" as const,
        content: assistantMessage,
        toolCalls: data.toolCalls && data.toolCalls > 0 ? data.toolCalls : undefined,
        toolCallsInfo: data.toolCallsInfo && data.toolCallsInfo.length > 0 ? data.toolCallsInfo : undefined,
      });

      if (!currentConversationId && messages.length > 0) {
        saveConversation();
      }
    },
    onError: (error: Error) => {
      setThinkingStatus(null);
      setStreamingContent("");
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
  }, [messages, streamingContent]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* MCP Status Bar */}
      <div className="px-4 pt-4 pb-2 border-b border-border flex-shrink-0 flex items-center justify-between gap-2 bg-muted/30">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground animate-in fade-in duration-300">
            <div className="text-center max-w-sm">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
                <Bot className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Start a conversation with Atlas</h2>
              <p className="text-sm mb-6">Ask about LinkedIn Ads, HubSpot, GA4, or Reddit—or try a suggestion below.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Show GA4 traffic overview",
                  "List my HubSpot deals",
                  "Search Reddit for my brand",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="px-3 py-2 rounded-xl text-sm bg-muted hover:bg-muted/80 text-foreground border border-border/60 hover:border-border transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
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
            {streamingContent ? (
              <ChatMessage role="assistant" content={streamingContent} isStreaming />
            ) : null}
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
