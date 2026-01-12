"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { marked } from "marked";

interface ReportViewerActionsProps {
  markdown: string;
  reportId: string;
}

export function ReportViewerActions({ markdown, reportId }: ReportViewerActionsProps) {
  const [copied, setCopied] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orion-report-${reportId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    let tempDiv: HTMLDivElement | null = null;
    
    try {
      // Try to dynamically import html2pdf first
      let html2pdf: any;
      try {
        const html2pdfModule = await import("html2pdf.js");
        html2pdf = html2pdfModule.default || html2pdfModule;
        
        if (!html2pdf || typeof html2pdf !== 'function') {
          throw new Error("html2pdf is not a function");
        }
      } catch (importError: any) {
        console.error("Failed to import html2pdf.js:", importError);
        throw new Error(`PDF library failed to load: ${importError.message}`);
      }

      // Convert markdown to HTML using marked
      const htmlContent = await marked(markdown);

      // Create a temporary container with the HTML content
      tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;
      
      // Style the container for PDF generation
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      tempDiv.style.width = "900px";
      tempDiv.style.padding = "40px";
      tempDiv.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      tempDiv.style.lineHeight = "1.6";
      tempDiv.style.color = "#333";
      tempDiv.style.backgroundColor = "#ffffff";
      tempDiv.style.boxSizing = "border-box";

      // Add to DOM (hidden) so html2canvas can render it
      document.body.appendChild(tempDiv);

      // Apply styles to tables
      const tables = tempDiv.querySelectorAll("table");
      tables.forEach((table: HTMLTableElement) => {
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.margin = "15px 0";
        table.style.fontSize = "13px";
        table.style.boxSizing = "border-box";
      });

      // Apply styles to table headers
      const ths = tempDiv.querySelectorAll("th");
      ths.forEach((th: HTMLElement) => {
        th.style.backgroundColor = "#f3f4f6";
        th.style.padding = "10px";
        th.style.textAlign = "left";
        th.style.fontWeight = "600";
        th.style.border = "1px solid #d1d5db";
      });

      // Apply styles to table cells
      const tds = tempDiv.querySelectorAll("td");
      tds.forEach((td: HTMLElement) => {
        td.style.padding = "8px";
        td.style.border = "1px solid #e5e7eb";
      });

      // Apply styles to headers
      const h1Elements = tempDiv.querySelectorAll("h1");
      h1Elements.forEach((h1: HTMLElement) => {
        h1.style.color = "#1e3a8a";
        h1.style.borderBottom = "3px solid #7c3aed";
        h1.style.paddingBottom = "10px";
        h1.style.marginTop = "30px";
        h1.style.marginBottom = "15px";
        h1.style.fontSize = "2rem";
      });

      const h2Elements = tempDiv.querySelectorAll("h2");
      h2Elements.forEach((h2: HTMLElement) => {
        h2.style.color = "#5b21b6";
        h2.style.borderLeft = "4px solid #7c3aed";
        h2.style.paddingLeft = "15px";
        h2.style.marginTop = "25px";
        h2.style.marginBottom = "12px";
        h2.style.fontSize = "1.5rem";
      });

      const h3Elements = tempDiv.querySelectorAll("h3");
      h3Elements.forEach((h3: HTMLElement) => {
        h3.style.color = "#6b7280";
        h3.style.marginTop = "15px";
        h3.style.marginBottom = "8px";
        h3.style.fontSize = "1.25rem";
      });

      // Wait a bit for styles to apply and DOM to settle
      await new Promise(resolve => setTimeout(resolve, 200));

      // Configure html2pdf options
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `orion-report-${reportId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 900,
          windowHeight: tempDiv.scrollHeight
        },
        jsPDF: { 
          unit: "mm", 
          format: "a4", 
          orientation: "portrait" 
        },
        pagebreak: { 
          mode: ["avoid-all", "css", "legacy"], 
          avoid: ["tr", "h2", "h3"] 
        },
      };

      // Generate and download PDF
      const worker = html2pdf().set(opt).from(tempDiv);
      await worker.save();

      // Wait a bit before cleanup to ensure download started
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error: any) {
      console.error("PDF download failed:", error);
      const errorMessage = error?.message || "Unknown error occurred";
      alert(`Failed to download PDF: ${errorMessage}. Please check the browser console for details.`);
    } finally {
      // Clean up
      if (tempDiv && tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
      // Also clean up any orphaned divs
      const tempDivs = document.querySelectorAll("div[style*='-9999px']");
      tempDivs.forEach(div => {
        if (div.parentNode) {
          div.parentNode.removeChild(div);
        }
      });
      setDownloadingPDF(false);
    }
  };

  return (
    <div className="bg-muted/50 border-t border-border px-6 py-4 flex flex-wrap gap-3">
      {/* Copy to Clipboard */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyMarkdown}
        className={copied ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : ""}
      >
        {copied ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            Copy Markdown
          </>
        )}
      </Button>

      {/* Download Markdown */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadMarkdown}
      >
        <FileText className="mr-2 h-4 w-4" />
        Download .md
      </Button>

      {/* Download PDF */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadPDF}
        disabled={downloadingPDF}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {downloadingPDF ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </>
        )}
      </Button>
    </div>
  );
}
