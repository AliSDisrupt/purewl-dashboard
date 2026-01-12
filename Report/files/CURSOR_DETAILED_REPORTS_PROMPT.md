# Cursor Prompt: Update Orion Reports with Detailed Reports, MD Viewer & PDF Download
## Copy and Paste This Entire Prompt Into Cursor

---

Update the Orion Reports page to generate detailed 14-page reports (like the attached Full Funnel Performance Report) with a professional markdown viewer and PDF download functionality.

## 📋 Requirements

**New Features:**
- Generate comprehensive 14-section reports (not just basic reports)
- Display reports in a professional markdown viewer (not raw markdown)
- Add [Download as PDF] button
- Include all 13 report sections with proper formatting
- Support all data sources (GA4, HubSpot, LinkedIn, Reddit)
- Maintain ultra-low token cost (~$0.013 per report)

**Report Sections (13 total):**
1. Executive Summary
2. Stage 1: Traffic & Acquisition
3. Stage 2: Lead Generation
4. Stage 3: Sales Pipeline
5. Stage 4: Marketing Campaigns
6. Full Funnel Conversion Analysis
7. Revenue & Business Impact
8. Technology & Device Analysis
9. Geographic Deep Dive
10. Time-Based Performance Patterns
11. Competitor Intelligence
12. Critical Issues & Risk Assessment
13. Strategic Recommendations & Next Steps

---

## 🎯 Tech Stack

- Next.js 15+ (App Router)
- React 19+
- Tailwind CSS
- `react-markdown` (markdown rendering)
- `remark-gfm` (GitHub flavored markdown)
- `html2pdf.js` (PDF generation)
- Claude API (Haiku model)
- `lucide-react` (icons)

---

## 📁 Updated Project Structure

```
/app/reports/
  ├── page.jsx
  └── components/
      ├── ReportGenerator.jsx
      ├── DateRangeSelector.jsx
      ├── ConnectorSelector.jsx
      ├── GenerateButton.jsx
      ├── ProgressIndicator.jsx
      ├── ReportPanel.jsx (UPDATED - now uses viewer)
      ├── ReportViewer.jsx (NEW - professional markdown viewer)
      ├── ReportViewerHeader.jsx (NEW)
      ├── ReportViewerContent.jsx (NEW)
      ├── ReportViewerActions.jsx (NEW - with PDF download)
      ├── ChatPanel.jsx
      └── LoadingSpinner.jsx

/app/api/reports/
  ├── generate/route.js (UPDATED - enhanced for detailed reports)
  ├── download-pdf/route.js (NEW - PDF generation endpoint)
  └── chat/route.js

/lib/agents/
  ├── dataAggregator.js (UPDATED)
  ├── insightGenerator.js (UPDATED)
  ├── reportFormatter.js (UPDATED)
  └── orchestrator.js (UPDATED)

/lib/
  ├── knowledgeBase.json (UPDATED - add all 13 sections)
  ├── reportTemplates.js (NEW - report structure)
  ├── apiIntegrations.js
  └── utils.js

/styles/
  └── reportViewer.css (NEW - custom markdown viewer styling)
```

---

## 🔧 Enhanced Components

### 1. Report Viewer (`/app/reports/components/ReportViewer.jsx`)

```jsx
'use client';

import ReportViewerHeader from './ReportViewerHeader';
import ReportViewerContent from './ReportViewerContent';
import ReportViewerActions from './ReportViewerActions';

export default function ReportViewer({ markdown, metadata, reportId }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <ReportViewerHeader metadata={metadata} />

      {/* Report Content - Professional Viewer */}
      <ReportViewerContent markdown={markdown} />

      {/* Action Buttons - Including PDF Download */}
      <ReportViewerActions markdown={markdown} reportId={reportId} />
    </div>
  );
}
```

---

### 2. Report Viewer Header (`/app/reports/components/ReportViewerHeader.jsx`)

```jsx
'use client';

export default function ReportViewerHeader({ metadata }) {
  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-gray-700/50 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Full Funnel Performance Report</h2>
          <p className="text-xs text-gray-400 mt-1">
            Period: {metadata?.period} • Generated: {new Date(metadata?.generatedAt).toLocaleString()} 
            <span className="mx-2">•</span>
            Sources: {metadata?.sources?.join(', ')}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>Tokens: {metadata?.agentTokens}</p>
          <p>Generated in {metadata?.executionTime}s</p>
        </div>
      </div>
    </div>
  );
}
```

---

### 3. Report Viewer Content (`/app/reports/components/ReportViewerContent.jsx`)

```jsx
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../../../styles/reportViewer.css';

export default function ReportViewerContent({ markdown }) {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-900/50">
      <div className="report-viewer max-w-4xl mx-auto px-8 py-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headings
            h1: ({ node, ...props }) => (
              <h1 className="text-4xl font-bold text-white mt-8 mb-4 border-b border-purple-500 pb-4" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-2xl font-bold text-purple-300 mt-6 mb-3 border-l-4 border-purple-500 pl-4" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-semibold text-gray-200 mt-4 mb-2" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-base font-semibold text-gray-300 mt-3 mb-1" {...props} />
            ),

            // Text
            p: ({ node, ...props }) => (
              <p className="text-gray-300 mb-3 leading-relaxed" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="text-white font-semibold" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="text-gray-200 italic" {...props} />
            ),

            // Lists
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4 ml-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-4 ml-2" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-gray-300" {...props} />
            ),

            // Tables
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto mb-6 rounded-lg border border-gray-700/50">
                <table className="w-full text-sm" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-gray-600" {...props} />
            ),
            tbody: ({ node, ...props }) => (
              <tbody className="divide-y divide-gray-700/50" {...props} />
            ),
            tr: ({ node, ...props }) => (
              <tr className="hover:bg-gray-700/20 transition" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="px-4 py-3 text-left font-semibold text-gray-200" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-4 py-2 text-gray-300" {...props} />
            ),

            // Code
            code: ({ node, inline, ...props }) => {
              if (inline) {
                return <code className="bg-gray-700/50 px-2 py-1 rounded text-purple-300 font-mono text-sm" {...props} />;
              }
              return <code className="bg-gray-900 border border-gray-700 rounded p-4 text-gray-200 block font-mono text-sm overflow-x-auto" {...props} />;
            },
            pre: ({ node, ...props }) => (
              <pre className="bg-gray-900 border border-gray-700 rounded p-4 overflow-x-auto mb-4" {...props} />
            ),

            // Blockquotes & Other
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 text-gray-400 italic" {...props} />
            ),
            hr: ({ node, ...props }) => (
              <hr className="my-6 border-gray-700/50" {...props} />
            ),

            // Links
            a: ({ node, ...props }) => (
              <a className="text-purple-400 hover:text-purple-300 underline" target="_blank" rel="noopener noreferrer" {...props} />
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
```

---

### 4. Report Viewer Actions (`/app/reports/components/ReportViewerActions.jsx`)

```jsx
'use client';

import { useState } from 'react';
import { Download, Copy, FileText } from 'lucide-react';

export default function ReportViewerActions({ markdown, reportId }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/markdown;charset=utf-8,' + encodeURIComponent(markdown)
    );
    element.setAttribute('download', `report-${reportId}.md`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/reports/download-pdf/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-gray-700/30 border-t border-gray-700/50 px-6 py-4 flex flex-wrap gap-3">
      {/* Copy to Clipboard */}
      <button
        onClick={handleCopyMarkdown}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
          copied
            ? 'bg-green-600 text-white'
            : 'bg-gray-600 hover:bg-gray-700 text-gray-100'
        }`}
      >
        <Copy className="w-4 h-4" />
        {copied ? 'Copied!' : 'Copy Markdown'}
      </button>

      {/* Download Markdown */}
      <button
        onClick={handleDownloadMarkdown}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
      >
        <FileText className="w-4 h-4" />
        Download .md
      </button>

      {/* Download PDF */}
      <button
        onClick={handleDownloadPDF}
        disabled={downloading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        {downloading ? 'Generating PDF...' : 'Download PDF'}
      </button>
    </div>
  );
}
```

---

## 🔌 Enhanced API Routes

### POST `/api/reports/generate` (UPDATED)

```javascript
// /app/api/reports/generate/route.js
import { Anthropic } from '@anthropic-ai/sdk';
import { orchestrator } from '@/lib/agents/orchestrator';
import { knowledgeBase } from '@/lib/knowledgeBase.json';
import { fullFunnelReportTemplate } from '@/lib/reportTemplates';

export async function POST(request) {
  const { startDate, endDate, connectors, sessionId } = await request.json();

  try {
    const reportId = `report-${Date.now()}`;

    // Run orchestrator with enhanced detailed report generation
    const result = await orchestrator({
      dateRange: { start: startDate, end: endDate },
      connectors,
      sessionId,
      reportTemplate: fullFunnelReportTemplate,
      knowledgeBase,
      reportType: 'detailed' // new flag for detailed reports
    });

    return Response.json({
      reportId,
      markdown: result.markdown,
      metadata: {
        period: `${startDate} to ${endDate}`,
        generatedAt: new Date().toISOString(),
        agentTokens: result.tokensUsed,
        executionTime: Math.round(result.executionTime),
        sources: connectors.map(c => ({
          ga4: 'Google Analytics 4',
          hubspot: 'HubSpot CRM',
          linkedin: 'LinkedIn Ads',
          reddit: 'Reddit'
        }[c])).filter(Boolean),
      },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

### POST `/api/reports/download-pdf/:reportId` (NEW)

```javascript
// /app/api/reports/download-pdf/route.js
import html2pdf from 'html2pdf.js';

export async function POST(request) {
  try {
    const { markdown } = await request.json();

    // Convert markdown to PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Full Funnel Performance Report</title>
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
            }
            h2 {
              color: #5b21b6;
              border-left: 4px solid #7c3aed;
              padding-left: 15px;
              margin-top: 25px;
              margin-bottom: 12px;
            }
            h3 {
              color: #6b7280;
              margin-top: 15px;
              margin-bottom: 8px;
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
            em {
              color: #6b7280;
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
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          ${markdownToHtml(markdown)}
        </body>
      </html>
    `;

    // Generate PDF using html2pdf
    const opt = {
      margin: 10,
      filename: 'report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    const pdf = await html2pdf().set(opt).from(htmlContent).output('blob');

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="report.pdf"'
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function markdownToHtml(markdown) {
  // Simple markdown to HTML converter
  let html = markdown
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');

  return `<p>${html}</p>`;
}
```

---

## 📋 Enhanced Knowledge Base

Update `/lib/knowledgeBase.json` with all 13 sections:

```json
{
  "purewl": {
    "report_config": {
      "type": "detailed",
      "sections": 13,
      "estimated_pages": 14,
      "estimated_tables": 30,
      "data_sources": ["ga4", "hubspot", "linkedin", "reddit"]
    },
    "sections": [
      {
        "id": 1,
        "name": "Executive Summary",
        "fields": ["total_users", "total_contacts", "active_deals", "pipeline_value", "linkedin_spend"]
      },
      {
        "id": 2,
        "name": "Stage 1: Traffic and Acquisition",
        "tables": 4
      },
      {
        "id": 3,
        "name": "Stage 2: Lead Generation",
        "tables": 2
      },
      {
        "id": 4,
        "name": "Stage 3: Sales Pipeline",
        "tables": 3
      },
      {
        "id": 5,
        "name": "Stage 4: Marketing Campaigns",
        "tables": 2
      },
      {
        "id": 6,
        "name": "Full Funnel Conversion Analysis",
        "tables": 3
      },
      {
        "id": 7,
        "name": "Revenue and Business Impact",
        "tables": 4
      },
      {
        "id": 8,
        "name": "Technology and Device Analysis",
        "tables": 3
      },
      {
        "id": 9,
        "name": "Geographic Deep Dive",
        "tables": 4
      },
      {
        "id": 10,
        "name": "Time-Based Performance Patterns",
        "tables": 2
      },
      {
        "id": 11,
        "name": "Competitor Intelligence Update",
        "tables": 2
      },
      {
        "id": 12,
        "name": "Critical Issues and Risk Assessment",
        "tables": 3
      },
      {
        "id": 13,
        "name": "Strategic Recommendations and Next Steps",
        "tables": 0
      }
    ],
    "benchmarks": {
      "visitor_to_contact": 0.03,
      "ctr_linkedin": 0.01,
      "cpl_target": 150,
      "pipeline_coverage": "3-4x",
      "active_deals_target": "15-20"
    },
    "critical_issues": [
      {
        "priority": "critical",
        "description": "Visitor-to-contact conversion 1.3% vs 3% target",
        "impact": "~235 contacts/month lost",
        "deadline": "2026-01-20"
      },
      {
        "priority": "critical",
        "description": "Mobile conversion 0.6% vs desktop 1.8%",
        "impact": "~470 lost leads/year",
        "deadline": "2026-01-31"
      }
    ]
  }
}
```

---

## 🎨 Custom Markdown Viewer Styling

Create `/styles/reportViewer.css`:

```css
.report-viewer {
  font-size: 15px;
  letter-spacing: 0.3px;
}

.report-viewer h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
}

.report-viewer h2 {
  font-size: 1.875rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.report-viewer h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.report-viewer table {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.report-viewer th {
  font-weight: 700;
  letter-spacing: 0.5px;
}

.report-viewer td {
  vertical-align: middle;
}

.report-viewer ul,
.report-viewer ol {
  margin-bottom: 1.5rem;
}

.report-viewer li {
  margin-bottom: 0.5rem;
}

.report-viewer code {
  font-size: 0.875rem;
  font-weight: 500;
}

.report-viewer p {
  margin-bottom: 1rem;
}

/* Page break for printing */
@media print {
  .report-viewer h2 {
    page-break-before: always;
  }
}
```

---

## 🚀 Implementation Checklist

- [ ] Update ReportGenerator.jsx to use ReportViewer instead of ReportPanel
- [ ] Create ReportViewer.jsx and subcomponents
- [ ] Create reportViewer.css with custom styling
- [ ] Update POST /api/reports/generate with detailed report generation
- [ ] Create POST /api/reports/download-pdf endpoint
- [ ] Update /lib/knowledgeBase.json with all 13 sections
- [ ] Update Agent 1 (dataAggregator) to fetch all section data
- [ ] Update Agent 2 (insightGenerator) for detailed insights
- [ ] Update Agent 3 (reportFormatter) to generate all 13 sections
- [ ] Update orchestrator.js for detailed report flow
- [ ] Test report generation
- [ ] Test markdown viewer styling
- [ ] Test PDF download
- [ ] Test chat integration with report context

---

## 📦 Dependencies to Install

```bash
npm install @anthropic-ai/sdk react-markdown remark-gfm html2pdf.js lucide-react
```

---

## ✅ What You Get

✅ **Professional Markdown Viewer** - Clean, styled report display
✅ **14-page Detailed Reports** - All 13 sections with tables
✅ **PDF Download** - One-click PDF generation
✅ **Markdown Download** - Export as .md file
✅ **Copy to Clipboard** - Copy markdown text
✅ **Responsive Design** - Works on all screen sizes
✅ **Ultra-low Cost** - Still ~$0.013 per report
✅ **Fast Execution** - 25-40 seconds per report

---

## 🎯 Report Example Output

When user generates a report, they'll see:
1. Professional markdown viewer with styled tables, headings, lists
2. Header showing report name, date range, sources, stats
3. Buttons: [Copy Markdown] [Download .md] [Download PDF]
4. Chat panel below for follow-up questions
5. PDF downloads with professional formatting

---

**Ready to build. Create all components with full implementation and make it production-ready.**
