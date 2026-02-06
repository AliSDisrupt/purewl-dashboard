"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_ROWS = 1;
const MAX_ROWS = 4;

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const rows = Math.min(Math.max(MIN_ROWS, ta.value.split("\n").length), MAX_ROWS);
    ta.style.height = `${rows * 24 + 20}px`;
  }, [message]);

  return (
    <div className="p-4 border-t border-border bg-background">
      <div className="flex gap-2 items-end rounded-2xl border border-border bg-muted/30 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-shadow">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Atlas about LinkedIn Ads, HubSpot, GA4, or Reddit..."
          disabled={isLoading || disabled}
          rows={MIN_ROWS}
          className={cn(
            "flex-1 min-h-[40px] max-h-[120px] resize-none bg-transparent px-1 py-2 text-sm placeholder:text-muted-foreground outline-none disabled:opacity-50",
            "border-input focus-visible:outline-none"
          )}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading || disabled}
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
