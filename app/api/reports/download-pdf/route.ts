import { NextResponse } from "next/server";
import { marked } from "marked";

// Simple HTML to PDF converter using a headless browser approach
// For production, consider using Puppeteer or Playwright
// For now, we'll use a simple markdown-to-HTML converter

export async function POST(request: Request) {
  try {
    const { markdown, reportId } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: "Markdown content is required" },
        { status: 400 }
      );
    }

    // Convert markdown to HTML using marked library
    let html: string;
    try {
      html = await marked(markdown);
    } catch (error: any) {
      console.error("Markdown conversion error:", error);
      // Fallback to simple conversion
      html = markdown
        .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
        .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
        .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\n\n/g, "</p><p>")
        .replace(/^- (.*?)$/gm, "<li>$1</li>");
      html = `<p>${html}</p>`;
    }

    // Create full HTML document
    const htmlDocument = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Full Funnel Performance Report - ${reportId}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
    }
    h1 {
      color: #1e3a8a;
      border-bottom: 3px solid #7c3aed;
      padding-bottom: 10px;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 2rem;
    }
    h2 {
      color: #5b21b6;
      border-left: 4px solid #7c3aed;
      padding-left: 15px;
      margin-top: 25px;
      margin-bottom: 12px;
      font-size: 1.5rem;
    }
    h3 {
      color: #6b7280;
      margin-top: 15px;
      margin-bottom: 8px;
      font-size: 1.25rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 13px;
    }
    th {
      background-color: #f3f4f6;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      border: 1px solid #d1d5db;
    }
    td {
      padding: 8px;
      border: 1px solid #e5e7eb;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    ul, ol {
      margin: 10px 0;
      padding-left: 25px;
    }
    li {
      margin: 5px 0;
    }
    strong {
      color: #111827;
      font-weight: 600;
    }
    code {
      background-color: #f3f4f6;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    blockquote {
      border-left: 4px solid #7c3aed;
      padding-left: 15px;
      margin: 15px 0;
      color: #6b7280;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    // Return HTML that can be printed to PDF by the browser
    // For a true PDF, install Puppeteer: npm install puppeteer
    // For now, we'll return HTML which browsers can save/print as PDF
    return new NextResponse(htmlDocument, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="report-${reportId}.html"`,
      },
    });
  } catch (error: any) {
    console.error("[Reports PDF API] Error generating PDF:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to generate PDF",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
