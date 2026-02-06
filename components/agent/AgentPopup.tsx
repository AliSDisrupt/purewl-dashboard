"use client";

import { useState } from "react";
import { Bot, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "./ChatInterface";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AgentPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentPopup({ open, onOpenChange }: AgentPopupProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={isMinimized ? "h-20" : "h-[640px] max-w-3xl"}
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Atlas Agent
          </DialogTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8"
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        {!isMinimized && (
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
