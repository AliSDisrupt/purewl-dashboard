"use client";

import { useState } from "react";
import { useConversation } from "@/lib/contexts/ConversationContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Plus,
  Trash2,
  Save,
  History,
} from "lucide-react";

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return "Today";
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function ConversationSidebar() {
  const {
    savedConversations,
    loadConversation,
    deleteConversation,
    startNewConversation,
    currentConversationId,
    saveConversation,
  } = useConversation();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Conversations">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Conversations</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-2 mb-4">
          <Button
            onClick={() => {
              startNewConversation();
              setOpen(false);
            }}
            className="w-full"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
          
          <Button
            onClick={() => {
              saveConversation();
            }}
            className="w-full"
            variant="outline"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Current Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {savedConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No saved conversations yet
            </div>
          ) : (
            savedConversations
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentConversationId === conv.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted border-border"
                  }`}
                >
                  <div
                    className="flex items-start justify-between gap-2"
                    onClick={() => {
                      loadConversation(conv.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                        <p className="text-sm font-medium truncate">
                          {conv.title}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(conv.updatedAt)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this conversation?")) {
                          deleteConversation(conv.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
