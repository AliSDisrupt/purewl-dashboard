"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { ClaudeModel } from "@/components/agent/ModelSelector";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: number;
  toolCallsInfo?: Array<{ name: string; status: string }>;
}

interface SavedConversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ConversationContextType {
  currentConversationId: string | null;
  messages: Message[];
  savedConversations: SavedConversation[];
  selectedModel: ClaudeModel;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  saveConversation: (title?: string) => string;
  loadConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  startNewConversation: () => void;
  getCurrentConversationTitle: () => string;
  setSelectedModel: (model: ClaudeModel) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

const STORAGE_KEY = "atlas_conversations";
const CURRENT_CONVERSATION_KEY = "atlas_current_conversation";
const SELECTED_MODEL_KEY = "atlas_selected_model";

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessagesState] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm Atlas, your AI assistant. I can help you analyze your LinkedIn Ads, HubSpot CRM, Google Analytics, and Reddit data. What would you like to know?",
    },
  ]);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [selectedModel, setSelectedModelState] = useState<ClaudeModel>("claude-3-haiku-20240307");

  // Load saved conversations and model on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSavedConversations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load conversations:", e);
      }
    }

    // Load current conversation
    const currentId = localStorage.getItem(CURRENT_CONVERSATION_KEY);
    if (currentId) {
      const conversations = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const conversation = conversations.find((c: SavedConversation) => c.id === currentId);
      if (conversation) {
        setCurrentConversationId(currentId);
        setMessagesState(conversation.messages);
      }
    }

    // Load selected model
    const savedModel = localStorage.getItem(SELECTED_MODEL_KEY);
    if (savedModel && ["claude-opus-4-5-20251101", "claude-sonnet-4-5-20250929", "claude-3-haiku-20240307"].includes(savedModel)) {
      setSelectedModelState(savedModel as ClaudeModel);
    }
  }, []);

  // Auto-save current conversation
  useEffect(() => {
    if (currentConversationId && messages.length > 1) {
      const conversations = [...savedConversations];
      const index = conversations.findIndex(c => c.id === currentConversationId);
      
      if (index >= 0) {
        conversations[index] = {
          ...conversations[index],
          messages,
          updatedAt: Date.now(),
        };
      } else {
        conversations.push({
          id: currentConversationId,
          title: getConversationTitle(messages),
          messages,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
      
      setSavedConversations(conversations);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [messages, currentConversationId]);

  const getConversationTitle = (msgs: Message[]): string => {
    const firstUserMessage = msgs.find(m => m.role === "user");
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "");
    }
    return "New Conversation";
  };

  const setMessages = (newMessages: Message[]) => {
    setMessagesState(newMessages);
  };

  const addMessage = (message: Message) => {
    setMessagesState(prev => [...prev, message]);
  };

  const saveConversation = (title?: string): string => {
    const id = currentConversationId || `conv_${Date.now()}`;
    const conversationTitle = title || getConversationTitle(messages);
    
    const conversations = [...savedConversations];
    const existingIndex = conversations.findIndex(c => c.id === id);
    
    const conversation: SavedConversation = {
      id,
      title: conversationTitle,
      messages,
      createdAt: existingIndex >= 0 ? conversations[existingIndex].createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }

    setSavedConversations(conversations);
    setCurrentConversationId(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
    
    return id;
  };

  const loadConversation = (id: string) => {
    const conversation = savedConversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversationId(id);
      setMessagesState(conversation.messages);
      localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
    }
  };

  const deleteConversation = (id: string) => {
    const conversations = savedConversations.filter(c => c.id !== id);
    setSavedConversations(conversations);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    
    if (currentConversationId === id) {
      startNewConversation();
    }
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessagesState([
      {
        role: "assistant",
        content: "Hello! I'm Atlas, your AI assistant. I can help you analyze your LinkedIn Ads, HubSpot CRM, Google Analytics, and Reddit data. What would you like to know?",
      },
    ]);
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
  };

  const getCurrentConversationTitle = () => {
    if (currentConversationId) {
      const conversation = savedConversations.find(c => c.id === currentConversationId);
      return conversation?.title || "Current Conversation";
    }
    return getConversationTitle(messages);
  };

  const setSelectedModel = (model: ClaudeModel) => {
    setSelectedModelState(model);
    localStorage.setItem(SELECTED_MODEL_KEY, model);
  };

  return (
    <ConversationContext.Provider
      value={{
        currentConversationId,
        messages,
        savedConversations,
        selectedModel,
        setMessages,
        addMessage,
        saveConversation,
        loadConversation,
        deleteConversation,
        startNewConversation,
        getCurrentConversationTitle,
        setSelectedModel,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation must be used within ConversationProvider");
  }
  return context;
}
