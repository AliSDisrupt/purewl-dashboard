import { NextResponse } from "next/server";
import Anthropic from '@anthropic-ai/sdk';
import { mcpTools } from '@/lib/mcp/tools';
import { trackClaudeTokens } from '@/lib/usage-tracker';
import { executeToolInProcess } from '@/lib/mcp/execute-tool-inprocess';
import fs from 'fs';
import path from 'path';

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 20; // requests per minute
const MAX_MESSAGES = 15; // Limit conversation history
const MAX_TOOL_ROUNDS = 5; // Recursive tool use: max rounds before forcing answer

/** Execute MCP tools in-process (no HTTP). No network = no network errors. */
async function executeToolCall(
  toolName: string,
  parameters: any,
  options?: { onStatusUpdate?: (status: string, toolName?: string) => void }
): Promise<any> {
  const onStatusUpdate = options?.onStatusUpdate;
  const formattedToolName = toolName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

  onStatusUpdate?.(`🔌 Running ${formattedToolName}...`, toolName);
  if (parameters && Object.keys(parameters).length > 0) {
    const summary = Object.entries(parameters)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v).substring(0, 40) : String(v)}`)
      .join(', ');
    onStatusUpdate?.(`📋 ${formattedToolName} (${summary})`, toolName);
  }

  const start = Date.now();
  try {
    const result = await executeToolInProcess(toolName, parameters ?? {});
    const ms = Date.now() - start;
    onStatusUpdate?.(`✅ ${formattedToolName} (${ms}ms)`, toolName);
    if (ms > 5000) console.warn(`[MCP] Slow: ${toolName} ${ms}ms`);
    return result;
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    onStatusUpdate?.(`❌ ${formattedToolName}: ${msg}`, toolName);
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    // Check API key
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured. Please add it to .env.local' },
        { status: 500 }
      );
    }
    // Validate key format (should start with sk-ant-)
    if (!apiKey.startsWith('sk-ant-')) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY appears invalid. It should start with "sk-ant-". Please check .env.local' },
        { status: 500 }
      );
    }

    // Check if client wants streaming
    const acceptHeader = request.headers.get('accept') || '';
    const wantsStreaming = acceptHeader.includes('text/event-stream');

    // Initialize Anthropic client with API key
    const anthropic = new Anthropic({
      apiKey: apiKey, // Already trimmed above
    });

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const userRequests = rateLimitMap.get(ip) || [];
    const recentRequests = userRequests.filter((time) => now - time < 60000);

    if (recentRequests.length >= RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    recentRequests.push(now);
    rateLimitMap.set(ip, recentRequests);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:postEntry',message:'POST handler entered',data:{accept:request.headers.get('accept')?.slice(0,30)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    const { messages, conversationId, model } = await request.json();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:afterJson',message:'request.json done',data:{messageCount:messages?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    // Define valid models (Sonnet and Haiku only; no Opus)
    const validModels = [
      "claude-sonnet-4-5-20250929",
      "claude-3-haiku-20240307",
    ] as const;
    
    // Use selected model or default to Sonnet
    const selectedModel = validModels.includes(model as any) 
      ? model 
      : "claude-sonnet-4-5-20250929";

    // Limit message history to reduce tokens
    const recentMessages = messages.slice(-MAX_MESSAGES);

    // Helper function to send status updates (for streaming)
    const sendStatusUpdate = wantsStreaming 
      ? (stream: ReadableStreamDefaultController, status: string, toolName?: string, thinking?: string) => {
          const encoder = new TextEncoder();
          const data = JSON.stringify({ type: 'status', status, toolName, thinking });
          stream.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      : null;

    // Helper function to send thinking updates (for streaming)
    const sendThinkingUpdate = wantsStreaming
      ? (stream: ReadableStreamDefaultController, thinking: string) => {
          const encoder = new TextEncoder();
          const data = JSON.stringify({ type: 'thinking', thinking });
          stream.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      : null;

    // Helper to stream final answer text to client (for streaming)
    const sendTextDelta = wantsStreaming
      ? (stream: ReadableStreamDefaultController, text: string) => {
          const encoder = new TextEncoder();
          const data = JSON.stringify({ type: 'text_delta', text });
          stream.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      : null;

    // If streaming is requested, use ReadableStream
    if (wantsStreaming && sendStatusUpdate) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:streamStart',message:'stream branch entered',data:{messageCount:recentMessages.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          // Declare toolResults/toolCallsInfo BEFORE try so they're available in catch
          const toolResults: any[] = [];
          const toolCallsInfo: Array<{ name: string; status: string }> = [];
          
          try {
            sendStatusUpdate(controller, '🧠 Analyzing your question and determining which tools to use...');
            if (sendThinkingUpdate) {
              sendThinkingUpdate(controller, 'Understanding the question: ' + (recentMessages[recentMessages.length - 1]?.content || 'user query'));
            }

            // Load system prompt from Knowledge Base
            let systemPrompt: string;
            try {
              const promptPath = path.join(process.cwd(), 'Knowledge Base', 'ATLAS_SYSTEM_PROMPT.md');
              systemPrompt = fs.readFileSync(promptPath, 'utf-8');
              console.log('✅ Loaded Knowledge Base system prompt');
            } catch (error) {
              console.error('⚠️ Failed to load Knowledge Base, using fallback:', error);
              // Fallback to basic prompt
              systemPrompt = "You are Atlas, a comprehensive AI assistant with full access to all data sources:\n\n**LinkedIn Ads**: List accounts, get account details, fetch campaigns, analytics, and campaign-level analytics\n**HubSpot CRM**: Access deals, contacts, companies, conversations, calls, emails, meetings, tasks, tickets, products, line items, quotes, and owners\n**Google Analytics (GA4)**: Overview, campaigns, ads, geography, traffic, top pages, acquisition, content, conversion paths, demographics, events, fluid fusion, realtime, retention, search terms, source/medium, technology, time patterns, and geography+source/medium (combines country and traffic sources - use this for questions like 'what sources are bringing traffic from China'). IMPORTANT: For traffic statistics, use get_ga4_overview (PRIMARY tool for traffic data). Use get_ga4_realtime only for real-time active users RIGHT NOW - if it fails, fall back to get_ga4_overview. If get_ga4_geography_source_medium fails, you can use get_ga4_geography and get_ga4_source_medium separately and combine the results.\n**Reddit**: Search and monitor posts from subreddits\n**Windsor AI Ads**: Get ads performance data from Windsor AI for Google Ads, Reddit Ads, and LinkedIn Ads. Use get_windsor_ai_google_ads, get_windsor_ai_reddit_ads, get_windsor_ai_linkedin_ads for individual platforms, or get_windsor_ai_all_ads to get all ads data at once. Windsor AI provides impressions, clicks, spend, conversions, CTR, and CPC metrics.\n\n**DATE FORMATS**: When using GA4 tools, use date formats like \"2024-01-10\", \"7daysAgo\", \"30daysAgo\", \"yesterday\", or \"today\". Natural language dates like \"January 10, 2026\" are supported but will be converted. If a date error occurs, try using \"XdaysAgo\" format instead (e.g., for January 10, 2026, calculate days ago and use that format). Always ensure dates are in the past - GA4 data is only available for historical dates. For Windsor AI tools, use YYYY-MM-DD format or relative formats like \"30daysAgo\" and \"yesterday\".\n\nYou have access to ALL endpoints that the dashboard uses. You can use ANY tool you need - there are no restrictions. Use multiple tools if needed to get comprehensive data. If one tool fails, try alternative approaches or use multiple tools to get the same information. Show all progress and thinking in real-time. Be thorough and provide detailed, actionable insights based on the data you fetch.";
            }

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:beforeClaudeStream',message:'calling anthropic.messages.stream',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
            // #endregion
            // Use selected model with streaming to show thinking in real-time
            const claudeStream = anthropic.messages.stream({
              model: selectedModel as string,
              max_tokens: 4096, // Increased to allow longer responses and more tool calls
              messages: recentMessages,
              tools: mcpTools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                input_schema: tool.input_schema,
              })),
              system: systemPrompt,
            });

            let response: any = null;
            let thinkingText = '';
            let toolCallsDetected = false;
            let initialBlockIsText = false;

            // Process streaming response to show thinking and stream text when it's a direct answer
            try {
              for await (const event of claudeStream) {
                if (event.type === 'message_start' && sendThinkingUpdate) {
                  sendThinkingUpdate(controller, 'Starting to process your request...');
                } else if (event.type === 'content_block_start') {
                  const block = (event as any).content_block;
                  if (block?.type === 'text') {
                    initialBlockIsText = true;
                    if (sendThinkingUpdate) sendThinkingUpdate(controller, 'Generating response...');
                  } else if (block?.type === 'tool_use') {
                    initialBlockIsText = false;
                    toolCallsDetected = true;
                    thinkingText = '';
                    const toolName = block.name;
                    const formattedName = toolName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                    sendStatusUpdate(controller, `🔧 Decided to use: ${formattedName}`, toolName);
                    if (sendThinkingUpdate) sendThinkingUpdate(controller, `I'll use ${formattedName} to fetch the data you requested.`);
                  }
                } else if (event.type === 'content_block_delta') {
                  const delta = (event as any).delta;
                  if (delta?.type === 'text_delta' && delta.text) {
                    if (initialBlockIsText && sendTextDelta) {
                      sendTextDelta(controller, delta.text);
                    }
                    thinkingText += delta.text;
                    if (thinkingText.length > 0 && !toolCallsDetected && sendThinkingUpdate) {
                      sendThinkingUpdate(controller, thinkingText.substring(0, 200) + (thinkingText.length > 200 ? '...' : ''));
                    }
                  }
                } else if (event.type === 'message_delta') {
                  // Handle any delta updates
                } else if (event.type === 'message_stop') {
                  // Message complete
                }
              }
            } catch (streamError: any) {
              console.error('Stream processing error:', streamError);
              // Continue to get final message even if stream processing had issues
            }

            // Get the final response - this is critical
            try {
              response = await claudeStream.finalMessage();
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:afterFinalMessage',message:'finalMessage received',data:{stopReason:response?.stop_reason,contentLen:response?.content?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
              // #endregion
              // Track token usage
              if (response.usage) {
                trackClaudeTokens(response.usage.input_tokens || 0, response.usage.output_tokens || 0);
              }
            } catch (finalError: any) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:finalMessageError',message:'finalMessage threw',data:{err:finalError?.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
              // #endregion
              console.error('Error getting final message:', finalError);
              // Check if it's an auth error
              const isAuthError = finalError?.error?.type === 'authentication_error' || finalError?.message?.includes('invalid x-api-key') || finalError?.message?.includes('authentication_error');
              const errorMsg = isAuthError 
                ? 'Invalid Anthropic API key. Please check ANTHROPIC_API_KEY in .env.local'
                : `Failed to get response from Claude: ${finalError.message}`;
              throw new Error(errorMsg);
            }

            // Recursive tool-use loop: handle tool calls (parallel in each round) until end_turn or MAX_TOOL_ROUNDS
            let conversationMessages = recentMessages;
            let currentResponse = response;
            let round = 0;
            let totalInputTokens = response?.usage?.input_tokens || 0;
            let totalOutputTokens = response?.usage?.output_tokens || 0;
            while (currentResponse?.stop_reason === 'tool_use' && currentResponse?.content && round < MAX_TOOL_ROUNDS) {
              const toolUseItems = currentResponse.content.filter((item: any) => item.type === 'tool_use');
              if (toolUseItems.length === 0) break;

              if (round === 0) {
                sendStatusUpdate(controller, `Atlas decided to use ${toolUseItems.length} tool${toolUseItems.length > 1 ? 's' : ''} to answer your question`);
              }

              // Status and params for each tool (before parallel execution)
              for (const content of toolUseItems) {
                const toolName = content.name;
                const formattedName = toolName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                sendStatusUpdate(controller, `🔧 Using tool: ${formattedName}`, toolName);
                if (content.input && Object.keys(content.input).length > 0) {
                  const params = Object.entries(content.input)
                    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
                    .join(', ');
                  sendStatusUpdate(controller, `   📋 Parameters: ${params}`, toolName);
                  if (sendThinkingUpdate) sendThinkingUpdate(controller, `Calling ${formattedName} with parameters: ${params}`);
                } else if (sendThinkingUpdate) {
                  sendThinkingUpdate(controller, `Calling ${formattedName} without parameters`);
                }
                toolCallsInfo.push({ name: toolName, status: 'executing' });
              }

              // Execute all tool calls in parallel (same turn)
              const settled = await Promise.all(
                toolUseItems.map(async (content: any) => {
                  const toolName = content.name;
                  const formattedName = toolName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                  try {
                    const result = await executeToolCall(toolName, content.input, {
                      onStatusUpdate: (status, tool) => sendStatusUpdate(controller, status, tool),
                    });
                    sendStatusUpdate(controller, `✅ Successfully fetched data from ${formattedName}`, toolName);
                    sendStatusUpdate(controller, `📊 Processing ${formattedName} results...`, toolName);
                    return { content, result: JSON.stringify(result), error: null };
                  } catch (error: any) {
                    sendStatusUpdate(controller, `❌ Error fetching ${formattedName}: ${error.message}`, toolName);
                    return { content, result: null, error: error.message };
                  }
                })
              );

              const roundToolResults: any[] = [];
              const execStartIndex = toolCallsInfo.length - toolUseItems.length;
              settled.forEach((s, i) => {
                const { content, result, error } = s;
                toolCallsInfo[execStartIndex + i] = { name: content.name, status: error ? 'error' : 'completed' };
                roundToolResults.push({
                  tool_use_id: content.id,
                  content: [
                    {
                      type: 'tool_result',
                      tool_use_id: content.id,
                      content: error != null ? `Error: ${error}` : result,
                      ...(error != null && { is_error: true }),
                    },
                  ],
                });
              });
              toolResults.push(...roundToolResults);

              const flattenedToolResults = roundToolResults.flatMap((tr) => tr.content || []);
              conversationMessages = [
                ...conversationMessages,
                { role: 'assistant', content: currentResponse.content },
                { role: 'user', content: flattenedToolResults },
              ];

              sendStatusUpdate(controller, '🧠 Analyzing the fetched data and preparing your response...');
              if (sendThinkingUpdate) {
                sendThinkingUpdate(controller, 'Processing the data and formulating a clear answer...');
              }

              const followUpStream = anthropic.messages.stream({
                model: selectedModel as string,
                max_tokens: 4096,
                messages: conversationMessages.slice(-MAX_MESSAGES),
                tools: mcpTools.map((tool) => ({
                  name: tool.name,
                  description: tool.description,
                  input_schema: tool.input_schema,
                })),
                system: systemPrompt,
              });

              let currentBlockIsText = false;
              let finalThinkingText = '';
              for await (const event of followUpStream) {
                if (event.type === 'content_block_start') {
                  currentBlockIsText = (event as any).content_block?.type === 'text';
                } else if (event.type === 'content_block_delta') {
                  const delta = (event as any).delta;
                  if (delta?.type === 'text_delta' && delta.text) {
                    if (currentBlockIsText && sendTextDelta) {
                      sendTextDelta(controller, delta.text);
                    }
                    if (sendThinkingUpdate) {
                      finalThinkingText += delta.text;
                      if (finalThinkingText.length > 0 && finalThinkingText.length < 500) {
                        sendThinkingUpdate(controller, finalThinkingText);
                      }
                    }
                  }
                }
              }

              currentResponse = await followUpStream.finalMessage();
              if (currentResponse?.usage) {
                totalInputTokens += currentResponse.usage.input_tokens || 0;
                totalOutputTokens += currentResponse.usage.output_tokens || 0;
                trackClaudeTokens(currentResponse.usage.input_tokens || 0, currentResponse.usage.output_tokens || 0);
              }
              round++;
            }

            let finalResponse = currentResponse;

            // Ensure we have a valid response - use response if finalResponse is missing
            if (!finalResponse && response) {
              console.warn('No finalResponse, using initial response');
              finalResponse = response;
            }

            if (!finalResponse) {
              console.error('No finalResponse available');
              // Send error as complete event so client doesn't hang
              const errorResult = {
                type: 'complete',
                content: [{ type: 'text', text: 'Sorry, I encountered an error: Failed to get response from Claude' }],
                stop_reason: 'error',
                usage: { input_tokens: 0, output_tokens: 0 },
                estimatedCost: '0.000000',
                toolCalls: toolResults.length,
                toolCallsInfo: toolCallsInfo,
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorResult)}\n\n`));
              controller.close();
              return;
            }

            // Ensure content exists - create default if missing
            if (!finalResponse.content || !Array.isArray(finalResponse.content)) {
              console.warn('Invalid response content, creating default:', finalResponse);
              finalResponse.content = [{ type: 'text', text: 'I received an invalid response format. Please try again.' }];
            }

            // Calculate estimated cost (accumulated across all rounds)
            const inputTokens = totalInputTokens || finalResponse?.usage?.input_tokens || 0;
            const outputTokens = totalOutputTokens || finalResponse?.usage?.output_tokens || 0;
            const estimatedCost =
              (inputTokens / 1_000_000) * 0.25 + (outputTokens / 1_000_000) * 1.25;

            // Send final result - this MUST be sent
            const result = {
              type: 'complete',
              content: finalResponse.content,
              stop_reason: finalResponse.stop_reason || 'end_turn',
              usage: finalResponse.usage || { input_tokens: inputTokens, output_tokens: outputTokens },
              estimatedCost: estimatedCost.toFixed(6),
              toolCalls: toolResults.length,
              toolCallsInfo: toolCallsInfo,
            };
            
            // Ensure we send the complete event before closing
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:beforeEnqueueComplete',message:'about to enqueue complete',data:{contentLen:finalResponse?.content?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
            // #endregion
            const resultData = `data: ${JSON.stringify(result)}\n\n`;
            controller.enqueue(encoder.encode(resultData));
            
            // Small delay to ensure data is sent before closing
            await new Promise(resolve => setTimeout(resolve, 50));
            
            controller.close();
          } catch (error: any) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/85715804-4ac8-40c4-b736-8561e28a782e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:streamCatch',message:'stream catch',data:{err:error?.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
            // #endregion
            console.error('Stream error:', error);
            
            // Handle overloaded/rate limit errors with helpful message
            let errorMessage = error.message || 'Failed to process chat message';
            if (error.error?.type === 'overloaded_error' || error.error?.message === 'Overloaded') {
              errorMessage = 'Claude API is currently overloaded. Please wait a moment and try again.';
            } else if (error.status === 429 || error.message?.includes('rate limit')) {
              errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
            }
            
            // Always send a complete event, even on error, so client doesn't hang
            const errorResult = {
              type: 'complete',
              content: [{ 
                type: 'text', 
                text: `Sorry, I encountered an error: ${errorMessage}` 
              }],
              stop_reason: 'error',
              usage: { input_tokens: 0, output_tokens: 0 },
              estimatedCost: '0.000000',
              toolCalls: toolResults.length || 0,
              toolCallsInfo: toolCallsInfo || [],
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorResult)}\n\n`));
            // Small delay to ensure data is sent
            await new Promise(resolve => setTimeout(resolve, 50));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response (fallback)
    // Use Claude 3.5 Haiku (latest and fastest model)
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Latest and fastest model
      max_tokens: 4096, // Increased for better responses and more tool calls
      messages: recentMessages,
      tools: mcpTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema,
      })),
      system: "You are Atlas, a comprehensive AI assistant with full access to all data sources:\n\n**LinkedIn Ads**: List accounts, get account details, fetch campaigns, analytics, and campaign-level analytics\n**HubSpot CRM**: Access deals, contacts, companies, conversations, calls, emails, meetings, tasks, tickets, products, line items, quotes, and owners\n**Google Analytics (GA4)**: Overview, campaigns, ads, geography, traffic, top pages, acquisition, content, conversion paths, demographics, events, fluid fusion, realtime, retention, search terms, source/medium, technology, and time patterns. IMPORTANT: For traffic statistics, use get_ga4_overview (PRIMARY tool for traffic data). Use get_ga4_realtime only for real-time active users RIGHT NOW - if it fails, fall back to get_ga4_overview.\n**Reddit**: Search and monitor posts from subreddits\n**Windsor AI Ads**: Get ads performance data from Windsor AI for Google Ads, Reddit Ads, and LinkedIn Ads. Use get_windsor_ai_google_ads, get_windsor_ai_reddit_ads, get_windsor_ai_linkedin_ads for individual platforms, or get_windsor_ai_all_ads to get all ads data at once. Windsor AI provides impressions, clicks, spend, conversions, CTR, and CPC metrics.\n\n**DATE FORMATS**: When using GA4 tools, use date formats like \"2024-01-10\", \"7daysAgo\", \"30daysAgo\", \"yesterday\", or \"today\". Natural language dates like \"January 10, 2026\" are supported but will be converted. If a date error occurs, try using \"XdaysAgo\" format instead (e.g., for January 10, 2026, calculate days ago and use that format). Always ensure dates are in the past - GA4 data is only available for historical dates. For Windsor AI tools, use YYYY-MM-DD format or relative formats like \"30daysAgo\" and \"yesterday\".\n\nYou have access to ALL endpoints that the dashboard uses. You can use ANY tool you need - there are no restrictions. Use multiple tools if needed to get comprehensive data. Show all progress and thinking in real-time. Be thorough and provide detailed, actionable insights based on the data you fetch.",
    });
    
    // Track token usage for non-streaming response
    if (response.usage) {
      trackClaudeTokens(response.usage.input_tokens || 0, response.usage.output_tokens || 0);
    }

    // Handle tool calls
    const toolResults: any[] = [];
    const toolCallsInfo: Array<{ name: string; status: string }> = [];
    let finalResponse = response;

    // Process tool calls if any
    if (response.stop_reason === 'tool_use' && response.content) {
      const toolUseItems = response.content.filter((item: any) => item.type === 'tool_use');
      
      if (toolUseItems.length > 0) {
        console.log(`[Atlas] Decided to use ${toolUseItems.length} tool${toolUseItems.length > 1 ? 's' : ''} to answer the question`);
      }
      
      for (const content of response.content) {
        if (content.type === 'tool_use') {
          const toolName = content.name;
          const formattedName = toolName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          
          console.log(`[Atlas] 🔧 Using tool: ${formattedName}`);
          if (content.input && Object.keys(content.input).length > 0) {
            console.log(`[Atlas]    Parameters:`, content.input);
          }
          
          toolCallsInfo.push({ name: toolName, status: 'executing' });
          try {
            const toolResult = await executeToolCall(toolName, content.input);
            console.log(`[Atlas] ✅ Successfully fetched data from ${formattedName}`);
            console.log(`[Atlas] 📊 Processing results...`);
            
            toolResults.push({
              tool_use_id: content.id,
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: content.id,
                  content: JSON.stringify(toolResult),
                },
              ],
            });
            toolCallsInfo[toolCallsInfo.length - 1].status = 'completed';
          } catch (error: any) {
            console.log(`[Atlas] ❌ Error fetching ${formattedName}:`, error.message);
            toolResults.push({
              tool_use_id: content.id,
              content: [
                {
                  type: 'tool_result',
                  tool_use_id: content.id,
                  content: `Error: ${error.message}`,
                  is_error: true,
                },
              ],
            });
            toolCallsInfo[toolCallsInfo.length - 1].status = 'error';
          }
        }
      }

      // If we have tool results, make a follow-up call
      if (toolResults.length > 0) {
        console.log('[Atlas] 🧠 Analyzing the fetched data and preparing response...');
        
        // Flatten tool results - extract content arrays from each tool result
        const flattenedToolResults = toolResults.flatMap(tr => tr.content || []);
        
        const followUpMessages = [
          ...recentMessages,
          {
            role: 'assistant',
            content: response.content,
          },
          {
            role: 'user',
            content: flattenedToolResults,
          },
        ];

        finalResponse = await anthropic.messages.create({
          model: selectedModel as string,
          max_tokens: 4096, // Increased to allow longer responses
          messages: followUpMessages.slice(-MAX_MESSAGES),
          tools: mcpTools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.input_schema,
          })),
          system: "You are Atlas, a comprehensive AI assistant with full access to all data sources:\n\n**LinkedIn Ads**: List accounts, get account details, fetch campaigns, analytics, and campaign-level analytics\n**HubSpot CRM**: Access deals, contacts, companies, conversations, calls, emails, meetings, tasks, tickets, products, line items, quotes, and owners\n**Google Analytics (GA4)**: Overview, campaigns, ads, geography, traffic, top pages, acquisition, content, conversion paths, demographics, events, fluid fusion, realtime, retention, search terms, source/medium, technology, and time patterns. IMPORTANT: For traffic statistics, use get_ga4_overview (PRIMARY tool for traffic data). Use get_ga4_realtime only for real-time active users RIGHT NOW - if it fails, fall back to get_ga4_overview.\n**Reddit**: Search and monitor posts from subreddits\n**Windsor AI Ads**: Get ads performance data from Windsor AI for Google Ads, Reddit Ads, and LinkedIn Ads. Use get_windsor_ai_google_ads, get_windsor_ai_reddit_ads, get_windsor_ai_linkedin_ads for individual platforms, or get_windsor_ai_all_ads to get all ads data at once. Windsor AI provides impressions, clicks, spend, conversions, CTR, and CPC metrics.\n\n**DATE FORMATS**: When using GA4 tools, use date formats like \"2024-01-10\", \"7daysAgo\", \"30daysAgo\", \"yesterday\", or \"today\". Natural language dates like \"January 10, 2026\" are supported but will be converted. If a date error occurs, try using \"XdaysAgo\" format instead (e.g., for January 10, 2026, calculate days ago and use that format). Always ensure dates are in the past - GA4 data is only available for historical dates. For Windsor AI tools, use YYYY-MM-DD format or relative formats like \"30daysAgo\" and \"yesterday\".\n\nYou have access to ALL endpoints that the dashboard uses. You can use ANY tool you need - there are no restrictions. Use multiple tools if needed to get comprehensive data. Show all progress and thinking in real-time. Be thorough and provide detailed, actionable insights based on the data you fetch.",
        });
        
        // Track token usage for follow-up response
        if (finalResponse.usage) {
          trackClaudeTokens(finalResponse.usage.input_tokens || 0, finalResponse.usage.output_tokens || 0);
        }
      }
    }

    // Calculate estimated cost (for tracking)
    const inputTokens = response.usage.input_tokens;
    const outputTokens = finalResponse.usage.output_tokens;
    const estimatedCost =
      (inputTokens / 1_000_000) * 0.25 + (outputTokens / 1_000_000) * 1.25;

    return NextResponse.json({
      content: finalResponse.content,
      stop_reason: finalResponse.stop_reason,
      usage: finalResponse.usage,
      estimatedCost: estimatedCost.toFixed(6),
      toolCalls: toolResults.length,
      toolCallsInfo: toolCallsInfo, // Include tool call information
    });
  } catch (error: any) {
    console.error('Claude API Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to process chat message',
        type: error.type || 'unknown_error',
      },
      { status: 500 }
    );
  }
}
