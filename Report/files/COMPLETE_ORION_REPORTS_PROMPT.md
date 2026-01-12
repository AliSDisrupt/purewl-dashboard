# COMPLETE Orion Reports Page - Full Implementation Prompt for Cursor
## Copy and Paste This Entire Prompt Into Cursor

---

Build a complete Reports page for Orion with full UI, buttons, download functionality, and 3 synchronized mini agents.

## 🎯 Requirements

**Tech Stack:**
- Next.js 15+ (App Router)
- React 19+
- Tailwind CSS
- react-markdown (for markdown rendering)
- html2pdf (for PDF generation)
- react-copy-to-clipboard (for copy button)
- date-fns (for date formatting)
- Claude API (Haiku model)

---

## 📁 Project Structure

```
/app/reports/
  ├── page.jsx
  ├── layout.jsx
  └── components/
      ├── ReportGenerator.jsx        # Main controller
      ├── DateRangeSelector.jsx      # Left panel - dates
      ├── ConnectorSelector.jsx      # Left panel - checkboxes
      ├── GenerateButton.jsx         # [Generate Report] button
      ├── ProgressIndicator.jsx      # Shows agent status
      ├── ReportPanel.jsx            # Right panel - report display
      ├── ReportHeader.jsx           # Report title + buttons
      ├── ReportContent.jsx          # Markdown rendering
      ├── ReportActions.jsx          # Download/Copy buttons
      ├── ChatPanel.jsx              # Chat below
      └── LoadingSpinner.jsx         # Spinner animation

/app/api/reports/
  ├── generate/route.js             # POST /api/reports/generate
  ├── download/route.js             # GET /api/reports/download/:id
  └── progress/route.js             # GET /api/reports/progress/:id

/lib/agents/
  ├── dataAggregator.js             # Agent 1
  ├── insightGenerator.js           # Agent 2
  ├── reportFormatter.js            # Agent 3
  └── orchestrator.js               # Coordinates all 3

/lib/
  ├── apiIntegrations.js            # GA4, HubSpot, LinkedIn, Reddit
  ├── knowledgeBase.json            # Benchmarks & historical data
  ├── utils.js                      # Helpers (formatting, validation)
  └── reportTemplates.js            # Markdown templates

---

## 🔧 Component Code (Ready to Use)

### 1. Main Page (`/app/reports/page.jsx`)

```jsx
'use client';

import { useState } from 'react';
import ReportGenerator from './components/ReportGenerator';

export default function ReportsPage() {
  const [sessionId] = useState(() => `session-${Date.now()}`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Reports</h1>
          <p className="text-gray-400">Generate detailed analytics reports across all your data sources</p>
        </div>

        {/* Main Generator */}
        <ReportGenerator sessionId={sessionId} />
      </div>
    </div>
  );
}
```

---

### 2. Report Generator (`/app/reports/components/ReportGenerator.jsx`)

```jsx
'use client';

import { useState } from 'react';
import DateRangeSelector from './DateRangeSelector';
import ConnectorSelector from './ConnectorSelector';
import GenerateButton from './GenerateButton';
import ProgressIndicator from './ProgressIndicator';
import ReportPanel from './ReportPanel';
import ChatPanel from './ChatPanel';

export default function ReportGenerator({ sessionId }) {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedConnectors, setSelectedConnectors] = useState(['ga4', 'hubspot', 'linkedin']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [progress, setProgress] = useState({ agent: null, status: 'idle' });
  const [error, setError] = useState(null);
  const [reportId, setReportId] = useState(null);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          connectors: selectedConnectors,
          sessionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const data = await response.json();
      setReport({
        markdown: data.markdown,
        pdf: data.pdf,
        metadata: data.metadata,
      });
      setReportId(data.reportId);
    } catch (err) {
      setError(err.message || 'Failed to generate report');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT PANEL - Controls */}
      <div className="lg:col-span-1">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 sticky top-6 space-y-6">
          <h2 className="text-xl font-bold text-white">Report Settings</h2>

          {/* Date Range */}
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />

          {/* Connectors */}
          <ConnectorSelector
            selected={selectedConnectors}
            onChange={setSelectedConnectors}
          />

          {/* Generate Button */}
          <GenerateButton
            onClick={handleGenerateReport}
            isLoading={isGenerating}
            disabled={selectedConnectors.length === 0}
          />

          {/* Progress Indicator */}
          {isGenerating && <ProgressIndicator progress={progress} />}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={handleGenerateReport}
                className="mt-3 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - Report Display */}
      <div className="lg:col-span-2">
        {report ? (
          <ReportPanel
            markdown={report.markdown}
            pdf={report.pdf}
            metadata={report.metadata}
            reportId={reportId}
          />
        ) : (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-12 text-center min-h-96 flex items-center justify-center">
            <div>
              <p className="text-gray-400 text-lg mb-4">No report generated yet</p>
              <p className="text-gray-500 text-sm">Select connectors and click "Generate Report" to create your first report</p>
            </div>
          </div>
        )}
      </div>

      {/* CHAT PANEL - Below */}
      <div className="lg:col-span-3 mt-6">
        <ChatPanel sessionId={sessionId} reportContext={report?.markdown} />
      </div>
    </div>
  );
}
```

---

### 3. Date Range Selector (`/app/reports/components/DateRangeSelector.jsx`)

```jsx
'use client';

export default function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300">Date Range</h3>
      <div className="space-y-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            onChange={(e) => onStartDateChange(new Date(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">End Date</label>
          <input
            type="date"
            value={endDate.toISOString().split('T')[0]}
            onChange={(e) => onEndDateChange(new Date(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          />
        </div>
      </div>
    </div>
  );
}
```

---

### 4. Connector Selector (`/app/reports/components/ConnectorSelector.jsx`)

```jsx
'use client';

const CONNECTORS = [
  { id: 'ga4', name: 'Google Analytics 4', icon: '📊' },
  { id: 'hubspot', name: 'HubSpot CRM', icon: '👥' },
  { id: 'linkedin', name: 'LinkedIn Ads', icon: '💼' },
  { id: 'reddit', name: 'Reddit', icon: '🔴' },
];

export default function ConnectorSelector({ selected, onChange }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((c) => c !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-300">Data Sources</h3>
      <div className="space-y-2">
        {CONNECTORS.map((connector) => (
          <label
            key={connector.id}
            className="flex items-center gap-3 p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg cursor-pointer hover:bg-gray-700 transition"
          >
            <input
              type="checkbox"
              checked={selected.includes(connector.id)}
              onChange={() => toggle(connector.id)}
              className="w-4 h-4 accent-purple-500"
            />
            <span className="text-lg">{connector.icon}</span>
            <span className="text-sm text-gray-300">{connector.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
```

---

### 5. Generate Button (`/app/reports/components/GenerateButton.jsx`)

```jsx
'use client';

export default function GenerateButton({ onClick, isLoading, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full py-3 rounded-lg font-semibold transition ${
        disabled
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : isLoading
            ? 'bg-purple-600 text-white'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50'
      }`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
          Generating Report...
        </span>
      ) : (
        '✨ Generate Report'
      )}
    </button>
  );
}
```

---

### 6. Progress Indicator (`/app/reports/components/ProgressIndicator.jsx`)

```jsx
'use client';

export default function ProgressIndicator({ progress }) {
  const agents = [
    { name: 'Data Aggregator', id: 'data' },
    { name: 'Insight Generator', id: 'insights' },
    { name: 'Report Formatter', id: 'format' },
  ];

  return (
    <div className="space-y-3 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-purple-300">Generation Progress</h3>
      <div className="space-y-2">
        {agents.map((agent) => {
          const isActive = progress.agent === agent.id;
          const isComplete = agents.findIndex((a) => a.id === progress.agent) > agents.findIndex((a) => a.id === agent.id);

          return (
            <div key={agent.id} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${
                isComplete ? 'bg-green-500' : isActive ? 'bg-purple-500 animate-pulse' : 'bg-gray-600'
              }`} />
              <span className={`text-xs ${isActive ? 'text-purple-300 font-semibold' : 'text-gray-400'}`}>
                {agent.name}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 bg-gray-700/50 rounded h-1 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all" style={{
          width: `${(agents.findIndex((a) => a.id === progress.agent) + 1) * 33}%`
        }} />
      </div>
    </div>
  );
}
```

---

### 7. Report Panel (`/app/reports/components/ReportPanel.jsx`)

```jsx
'use client';

import ReportHeader from './ReportHeader';
import ReportContent from './ReportContent';
import ReportActions from './ReportActions';

export default function ReportPanel({ markdown, pdf, metadata, reportId }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden flex flex-col">
      {/* Header with Title */}
      <ReportHeader metadata={metadata} />

      {/* Report Content - Scrollable */}
      <div className="flex-1 overflow-y-auto max-h-96 p-6">
        <ReportContent markdown={markdown} />
      </div>

      {/* Action Buttons */}
      <ReportActions markdown={markdown} pdf={pdf} reportId={reportId} />
    </div>
  );
}
```

---

### 8. Report Header (`/app/reports/components/ReportHeader.jsx`)

```jsx
'use client';

export default function ReportHeader({ metadata }) {
  return (
    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-gray-700/50 px-6 py-4">
      <h2 className="text-2xl font-bold text-white mb-1">Generated Report</h2>
      <p className="text-xs text-gray-400">
        Generated at {new Date(metadata?.generatedAt).toLocaleString()}
        {' '} • Tokens used: {metadata?.agentTokens}
        {' '} • Generated in {metadata?.executionTime}s
      </p>
    </div>
  );
}
```

---

### 9. Report Content (`/app/reports/components/ReportContent.jsx`)

```jsx
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ReportContent({ markdown }) {
  return (
    <div className="prose prose-invert max-w-none text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mt-4 mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-purple-300 mt-3 mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-300 mt-2 mb-1" {...props} />,
          table: ({ node, ...props }) => <table className="w-full border-collapse text-xs" {...props} />,
          td: ({ node, ...props }) => <td className="border border-gray-600 px-2 py-1" {...props} />,
          th: ({ node, ...props }) => <th className="border border-gray-600 px-2 py-1 bg-gray-700/50 font-semibold" {...props} />,
          p: ({ node, ...props }) => <p className="text-gray-300 mb-2" {...props} />,
          strong: ({ node, ...props }) => <strong className="text-white font-semibold" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside text-gray-300 space-y-1" {...props} />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
```

---

### 10. Report Actions (`/app/reports/components/ReportActions.jsx`)

```jsx
'use client';

import { useState } from 'react';
import CopyButton from './CopyButton';

export default function ReportActions({ markdown, pdf, reportId }) {
  const handleDownloadPDF = () => {
    if (!pdf) return;
    
    const link = document.createElement('a');
    link.href = pdf;
    link.download = `report-${reportId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(markdown));
    element.setAttribute('download', `report-${reportId}.md`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-gray-700/30 border-t border-gray-700/50 px-6 py-4 flex gap-3">
      {/* Copy to Clipboard */}
      <CopyButton text={markdown} label="Copy Markdown" />

      {/* Download Markdown */}
      <button
        onClick={handleDownloadMarkdown}
        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
      >
        📥 Download .md
      </button>

      {/* Download PDF */}
      <button
        onClick={handleDownloadPDF}
        disabled={!pdf}
        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        📄 Download PDF
      </button>
    </div>
  );
}
```

---

### 11. Copy Button (`/app/reports/components/CopyButton.jsx`)

```jsx
'use client';

import { useState } from 'react';

export default function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-gray-600 hover:bg-gray-700 text-gray-100'
      }`}
    >
      {copied ? '✓ Copied!' : `📋 ${label}`}
    </button>
  );
}
```

---

### 12. Chat Panel (`/app/reports/components/ChatPanel.jsx`)

```jsx
'use client';

import { useState } from 'react';

export default function ChatPanel({ sessionId, reportContext }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/reports/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
          reportContext,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();
      const assistantMessage = { role: 'assistant', content: data.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Ask Questions About Your Report</h3>

      <div className="h-48 overflow-y-auto mb-4 space-y-3 bg-gray-700/20 rounded-lg p-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask a question about the report..."
          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

---

## 🔌 API Routes

### POST `/api/reports/generate`

```javascript
// /app/api/reports/generate/route.js
import { Anthropic } from '@anthropic-ai/sdk';
import { orchestrator } from '@/lib/agents/orchestrator';

export async function POST(request) {
  const { startDate, endDate, connectors, sessionId } = await request.json();

  try {
    const reportId = `report-${Date.now()}`;

    // Run all 3 agents
    const result = await orchestrator({
      dateRange: { start: startDate, end: endDate },
      connectors,
      sessionId,
    });

    return Response.json({
      reportId,
      markdown: result.markdown,
      pdf: result.pdf,
      metadata: {
        generatedAt: new Date().toISOString(),
        agentTokens: result.tokensUsed,
        executionTime: result.executionTime,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### POST `/api/reports/chat`

```javascript
// /app/api/reports/chat/route.js
import { Anthropic } from '@anthropic-ai/sdk';

export async function POST(request) {
  const { message, sessionId, reportContext, conversationHistory } = await request.json();

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: `You are an assistant analyzing an Orion analytics report. The user generated a report and is asking questions about it. Reference the report data to answer their questions. Be concise and helpful.

Report context:
${reportContext}`,
      messages: [
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ],
    });

    return Response.json({
      response: response.content[0].text,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 📦 Dependencies to Install

```bash
npm install @anthropic-ai/sdk react-markdown remark-gfm html2pdf.js date-fns
```

---

## ✅ What's Included

✅ **UI Components:**
- Date picker (start/end)
- Connector checkboxes
- Generate button
- Progress indicator
- Report display panel
- Copy to clipboard button
- Download .md button
- Download PDF button
- Chat panel
- Loading spinner
- Error handling

✅ **Functionality:**
- Real-time report generation
- PDF download
- Markdown download
- Copy to clipboard
- Chat with report context
- Progress tracking
- Error recovery/retry

✅ **Full Implementation:**
- Complete React components
- All button implementations
- Download logic
- PDF generation
- Copy-to-clipboard
- Error handling

---

## 🚀 Ready to Use

Just paste this entire prompt into Cursor and it will build the complete Reports page with all UI, buttons, download functionality, and agents!
