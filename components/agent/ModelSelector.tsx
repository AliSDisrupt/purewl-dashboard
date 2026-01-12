"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles } from "lucide-react";

export type ClaudeModel = 
  | "claude-opus-4-5-20251101"
  | "claude-sonnet-4-5-20250929"
  | "claude-3-haiku-20240307";

interface ModelSelectorProps {
  selectedModel: ClaudeModel;
  onModelChange: (model: ClaudeModel) => void;
}

const MODEL_LABELS: Record<ClaudeModel, string> = {
  "claude-opus-4-5-20251101": "Claude Opus 4.5",
  "claude-sonnet-4-5-20250929": "Claude Sonnet 4.5",
  "claude-3-haiku-20240307": "Claude Haiku 3",
};

const MODEL_DESCRIPTIONS: Record<ClaudeModel, string> = {
  "claude-opus-4-5-20251101": "Most capable, slower",
  "claude-sonnet-4-5-20250929": "Balanced performance",
  "claude-3-haiku-20240307": "Fastest, most cost-effective",
};

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">{MODEL_LABELS[selectedModel]}</span>
          <span className="sm:hidden">Model</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>AI Model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={selectedModel} onValueChange={(value) => onModelChange(value as ClaudeModel)}>
          {(Object.keys(MODEL_LABELS) as ClaudeModel[]).map((model) => (
            <DropdownMenuRadioItem key={model} value={model}>
              <div className="flex flex-col">
                <span className="font-medium">{MODEL_LABELS[model]}</span>
                <span className="text-xs text-muted-foreground">
                  {MODEL_DESCRIPTIONS[model]}
                </span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
