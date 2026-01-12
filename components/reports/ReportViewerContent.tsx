"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ReportViewerContentProps {
  markdown: string;
}

export function ReportViewerContent({ markdown }: ReportViewerContentProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-muted/30">
      <div className={cn(
        "report-viewer max-w-4xl mx-auto px-8 py-8",
        "prose prose-sm max-w-none dark:prose-invert",
        "prose-headings:text-foreground prose-p:text-foreground/90",
        "prose-strong:text-foreground prose-a:text-primary",
        "prose-table:text-sm prose-code:text-sm"
      )}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headings
            h1: ({ node, ...props }) => (
              <h1 className="text-4xl font-bold text-foreground mt-8 mb-4 border-b border-primary pb-4" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-2xl font-bold text-primary mt-6 mb-3 border-l-4 border-primary pl-4" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-semibold text-foreground/90 mt-4 mb-2" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-base font-semibold text-foreground/80 mt-3 mb-1" {...props} />
            ),

            // Text
            p: ({ node, ...props }) => (
              <p className="text-foreground/90 mb-3 leading-relaxed" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="text-foreground font-semibold" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="text-foreground/80 italic" {...props} />
            ),

            // Lists
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside text-foreground/90 space-y-2 mb-4 ml-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside text-foreground/90 space-y-2 mb-4 ml-2" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-foreground/90" {...props} />
            ),

            // Tables
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto mb-6 rounded-lg border border-border">
                <table className="w-full text-sm" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-gradient-to-r from-primary/20 to-purple-600/20 border-b border-border" {...props} />
            ),
            tbody: ({ node, ...props }) => (
              <tbody className="divide-y divide-border" {...props} />
            ),
            tr: ({ node, ...props }) => (
              <tr className="hover:bg-muted/50 transition" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="px-4 py-3 text-left font-semibold text-foreground" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-4 py-2 text-foreground/90" {...props} />
            ),

            // Code
            code: ({ node, inline, ...props }: any) => {
              if (inline) {
                return <code className="bg-muted px-2 py-1 rounded text-primary font-mono text-sm" {...props} />;
              }
              return <code className="bg-background border border-border rounded p-4 text-foreground block font-mono text-sm overflow-x-auto" {...props} />;
            },
            pre: ({ node, ...props }) => (
              <pre className="bg-background border border-border rounded p-4 overflow-x-auto mb-4" {...props} />
            ),

            // Blockquotes & Other
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 text-muted-foreground italic" {...props} />
            ),
            hr: ({ node, ...props }) => (
              <hr className="my-6 border-border" {...props} />
            ),

            // Links
            a: ({ node, ...props }) => (
              <a className="text-primary hover:text-primary/80 underline" target="_blank" rel="noopener noreferrer" {...props} />
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
