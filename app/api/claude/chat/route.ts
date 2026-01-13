import { NextResponse } from "next/server";
import Anthropic from '@anthropic-ai/sdk';
import { mcpTools } from '@/lib/mcp/tools';
import { trackClaudeTokens, trackRequest } from '@/lib/usage-tracker';
import fs from 'fs';
import path from 'path';

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 20; // requests per minute
const MAX_MESSAGES = 15; // Limit conversation history

// MCP Bridge route mapping
const mcpBridgeRoutes: Record<string, string> = {
  // LinkedIn
  list_linkedin_accounts: '/api/mcp/linkedin',
  get_linkedin_account_details: '/api/mcp/linkedin',
  get_linkedin_campaigns: '/api/mcp/linkedin',
  get_linkedin_analytics: '/api/mcp/linkedin',
  get_linkedin_campaign_analytics: '/api/mcp/linkedin',
  
  // HubSpot
  get_hubspot_deals: '/api/mcp/hubspot',
  search_hubspot_contacts: '/api/mcp/hubspot',
  get_hubspot_companies: '/api/mcp/hubspot',
  get_hubspot_conversations: '/api/mcp/hubspot',
  get_hubspot_calls: '/api/mcp/hubspot',
  get_hubspot_emails: '/api/mcp/hubspot',
  get_hubspot_meetings: '/api/mcp/hubspot',
  get_hubspot_tasks: '/api/mcp/hubspot',
  get_hubspot_tickets: '/api/mcp/hubspot',
  get_hubspot_products: '/api/mcp/hubspot',
  get_hubspot_line_items: '/api/mcp/hubspot',
  get_hubspot_quotes: '/api/mcp/hubspot',
  get_hubspot_owners: '/api/mcp/hubspot',
  
  // GA4
  get_ga4_overview: '/api/mcp/ga4',
  get_ga4_campaigns: '/api/mcp/ga4',
  get_ga4_ads: '/api/mcp/ga4',
  get_ga4_geography: '/api/mcp/ga4',
  get_ga4_traffic: '/api/mcp/ga4',
  get_ga4_top_pages: '/api/mcp/ga4',
  get_ga4_acquisition: '/api/mcp/ga4',
  get_ga4_content: '/api/mcp/ga4',
  get_ga4_conversion_paths: '/api/mcp/ga4',
  get_ga4_demographics: '/api/mcp/ga4',
  get_ga4_events: '/api/mcp/ga4',
  get_ga4_fluid_fusion: '/api/mcp/ga4',
  get_ga4_realtime: '/api/mcp/ga4',
  get_ga4_retention: '/api/mcp/ga4',
  get_ga4_search_terms: '/api/mcp/ga4',
  get_ga4_source_medium: '/api/mcp/ga4',
  get_ga4_technology: '/api/mcp/ga4',
  get_ga4_time_patterns: '/api/mcp/ga4',
  get_ga4_geography_source_medium: '/api/mcp/ga4',
  
  // Reddit
  get_reddit_posts: '/api/mcp/reddit',
};

async function executeToolCall(
  toolName: string, 
  parameters: any,
  onStatusUpdate?: (status: string, toolName?: string) => void
): Promise<any> {
  const bridgeRoute = mcpBridgeRoutes[toolName];
  if (!bridgeRoute) {
    throw new Error(`Unknown tool: ${toolName}. Available tools: ${Object.keys(mcpBridgeRoutes).join(', ')}`);
  }

  // Determine which MCP server this tool belongs to
  const mcpServer = bridgeRoute.split('/').pop() || 'unknown';
  const formattedToolName = toolName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  
  // Show which MCP server we're connecting to
  onStatusUpdate?.(`🔌 Connecting to ${mcpServer.toUpperCase()} MCP server...`, toolName);
  
  // Show parameters being sent (more detailed)
  if (parameters && Object.keys(parameters).length > 0) {
    const paramSummary = Object.entries(parameters)
      .map(([key, value]) => {
        const val = typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : String(value);
        return `${key}: ${val}`;
      })
      .join(', ');
    onStatusUpdate?.(`📋 Calling ${formattedToolName} with: ${paramSummary}`, toolName);
  } else {
    onStatusUpdate?.(`📋 Calling ${formattedToolName}...`, toolName);
  }

  // Construct URL - optimized for server-side (uses localhost for internal calls)
  // Since we're in server-side code, we can use localhost directly for faster internal calls
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}${bridgeRoute}`;
  
  onStatusUpdate?.(`📡 Fetching data from ${mcpServer.toUpperCase()} MCP server...`, toolName);
  
  try {
    // Add timeout for quick responses (20 seconds - faster than default)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout for faster failure
    
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: toolName,
        parameters: parameters || {},
      }),
      cache: 'no-store', // Ensure fresh requests
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText.substring(0, 200);
        } catch {
          // Keep default errorMessage
        }
      }
      onStatusUpdate?.(`❌ Error from ${mcpServer.toUpperCase()}: ${errorMessage}`, toolName);
      throw new Error(`Tool execution failed (${toolName}): ${errorMessage}`);
    }

    onStatusUpdate?.(`📥 Receiving data from ${mcpServer.toUpperCase()} MCP server...`, toolName);
    
    const data = await response.json();
    
    // Validate response structure - handle both { result: ... } and direct data
    if (!data || typeof data !== 'object') {
      throw new Error(`Invalid response format from ${toolName}`);
    }
    
    // Return result if available, otherwise return the whole data object
    const result = 'result' in data ? data.result : data;
    
    // Log performance for monitoring
    if (duration > 5000) {
      console.warn(`[MCP] Slow response: ${toolName} took ${duration}ms`);
    } else {
      console.log(`[MCP] ${toolName} completed in ${duration}ms`);
    }
    
    onStatusUpdate?.(`✅ Data received from ${formattedToolName} (${duration}ms)`, toolName);
    
    return result;
  } catch (error: any) {
    // Handle timeout specifically
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Tool execution timed out after 20s: ${toolName}`);
      onStatusUpdate?.(`⏱️ Timeout: ${formattedToolName} took too long (>20s)`, toolName);
      throw timeoutError;
    }
    
    // Handle network errors
    if (error.message?.includes('fetch') || error.message?.includes('ECONNREFUSED')) {
      onStatusUpdate?.(`🌐 Network error: Cannot connect to ${mcpServer.toUpperCase()} server`, toolName);
      throw new Error(`Network error connecting to ${toolName}: ${error.message}`);
    }
    
    // Re-throw other errors
    onStatusUpdate?.(`❌ Error executing ${formattedToolName}: ${error.message}`, toolName);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Check API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured. Please add it to .env.local' },
        { status: 500 }
      );
    }

    // Check if client wants streaming
    const acceptHeader = request.headers.get('accept') || '';
    const wantsStreaming = acceptHeader.includes('text/event-stream');

    // Initialize Anthropic client with API key
    const anthropic = new Anthropic({
      apiKey: apiKey.trim(), // Trim whitespace in case of formatting issues
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

    const { messages, conversationId, model } = await request.json();
    
    // Define valid models
    const validModels = [
      "claude-opus-4-5-20251101",
      "claude-sonnet-4-5-20250929",
      "claude-3-haiku-20240307",
    ] as const;
    
    // Use selected model or default to Haiku
    const selectedModel = validModels.includes(model as any) 
      ? model 
      : "claude-3-haiku-20240307";

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

    // If streaming is requested, use ReadableStream
    if (wantsStreaming && sendStatusUpdate) {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
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
              systemPrompt = "You are Atlas, a comprehensive AI assistant with full access to all data sources:\n\n**LinkedIn Ads**: List accounts, get account details, fetch campaigns, analytics, and campaign-level analytics\n**HubSpot CRM**: Access deals, contacts, companies, conversations, calls, emails, meetings, tasks, tickets, products, line items, quotes, and owners\n**Google Analytics (GA4)**: Overview, campaigns, ads, geography, traffic, top pages, acquisition, content, conversion paths, demographics, events, fluid fusion, realtime, retention, search terms, source/medium, technology, time patterns, and geography+source/medium (combines country and traffic sources - use this for questions like 'what sources are bringing traffic from China'). IMPORTANT: For traffic statistics, use get_ga4_overview (PRIMARY tool for traffic data). Use get_ga4_realtime only for real-time active users RIGHT NOW - if it fails, fall back to get_ga4_overview. If get_ga4_geography_source_medium fails, you can use get_ga4_geography and get_ga4_source_medium separately and combine the results.\n**Reddit**: Search and monitor posts from subreddits\n\n**DATE FORMATS**: When using GA4 tools, use date formats like \"2024-01-10\", \"7daysAgo\", \"30daysAgo\", \"yesterday\", or \"today\". Natural language dates like \"January 10, 2026\" are supported but will be converted. If a date error occurs, try using \"XdaysAgo\" format instead (e.g., for January 10, 2026, calculate days ago and use that format). Always ensure dates are in the past - GA4 data is only available for historical dates.\n\nYou have access to ALL endpoints that the dashboard uses. You can use ANY tool you need - there are no restrictions. Use multiple tools if needed to get comprehensive data. If one tool fails, try alternative approaches or use multiple tools to get the same information. Show all progress and thinking in real-time. Be thorough and provide detailed, actionable insights based on the data you fetch.";
            }

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

            // Process streaming response to show thinking in real-time
            try {
              for await (const event of claudeStream) {
                if (event.type === 'message_start' && sendThinkingUpdate) {
                  sendThinkingUpdate(controller, 'Starting to process your request...');
                } else if (event.type === 'content_block_start' && event.content_block.type === 'text' && sendThinkingUpdate) {
                  sendThinkingUpdate(controller, 'Generating response...');
                } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta' && sendThinkingUpdate) {
                  // Show Claude's thinking as it streams
                  thinkingText += event.delta.text;
                  if (thinkingText.length > 0 && !toolCallsDetected) {
                    sendThinkingUpdate(controller, thinkingText.substring(0, 200) + (thinkingText.length > 200 ? '...' : ''));
                  }
                } else if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
                  toolCallsDetected = true;
                  thinkingText = ''; // Reset thinking text when tool use starts
                  const toolName = event.content_block.name;
                  const formattedName = toolName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                  sendStatusUpdate(controller, `🔧 Decided to use: ${formattedName}`, toolName);
                  if (sendThinkingUpdate) {
                    sendThinkingUpdate(controller, `I'll use ${formattedName} to fetch the data you requested.`);
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
              // Track token usage
              if (response.usage) {
                trackClaudeTokens(response.usage.input_tokens || 0, response.usage.output_tokens || 0);
              }
            } catch (finalError: any) {
              console.error('Error getting final message:', finalError);
              throw new Error(`Failed to get response from Claude: ${finalError.message}`);
            }

            // Handle tool calls
            const toolResults: any[] = [];
            const toolCallsInfo: Array<{ name: string; status: string }> = [];
            let finalResponse = response;

            // Process tool calls if any
            if (response && response.stop_reason === 'tool_use' && response.content) {
              const toolUseItems = response.content.filter((item: any) => item.type === 'tool_use');
              
              if (toolUseItems.length > 0) {
                sendStatusUpdate(controller, `Atlas decided to use ${toolUseItems.length} tool${toolUseItems.length > 1 ? 's' : ''} to answer your question`);
              }
              
              for (const content of response.content) {
                if (content.type === 'tool_use') {
                  const toolName = content.name;
                  const formattedName = toolName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                  
                  sendStatusUpdate(controller, `🔧 Using tool: ${formattedName}`, toolName);
                  
                  // Show parameters if any - show full details
                  if (content.input && Object.keys(content.input).length > 0) {
                    const params = Object.entries(content.input)
                      .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
                      .join(', ');
                    sendStatusUpdate(controller, `   📋 Parameters: ${params}`, toolName);
                    if (sendThinkingUpdate) {
                      sendThinkingUpdate(controller, `Calling ${formattedName} with parameters: ${params}`);
                    }
                  } else {
                    if (sendThinkingUpdate) {
                      sendThinkingUpdate(controller, `Calling ${formattedName} without parameters`);
                    }
                  }
                  
                  toolCallsInfo.push({ name: toolName, status: 'executing' });
                  
                  try {
                    // Pass status update function to executeToolCall
                    const toolResult = await executeToolCall(
                      toolName, 
                      content.input,
                      (status, tool) => sendStatusUpdate(controller, status, tool)
                    );
                    
                    sendStatusUpdate(controller, `✅ Successfully fetched data from ${formattedName}`, toolName);
                    sendStatusUpdate(controller, `📊 Processing ${formattedName} results...`, toolName);
                    
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
                    sendStatusUpdate(controller, `❌ Error fetching ${formattedName}: ${error.message}`, toolName);
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

              // If we have tool results, make a follow-up call with streaming
              if (toolResults.length > 0) {
                sendStatusUpdate(controller, '🧠 Analyzing the fetched data and preparing your response...');
                if (sendThinkingUpdate) {
                  sendThinkingUpdate(controller, 'Processing the data I just fetched and formulating a clear answer...');
                }
                
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

                // Stream the final response to show thinking
                const finalStream = anthropic.messages.stream({
                  model: selectedModel as string,
                  max_tokens: 4096, // Increased to allow longer responses
                  messages: followUpMessages.slice(-MAX_MESSAGES),
                  tools: mcpTools.map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    input_schema: tool.input_schema,
                  })),
                  system: "You are Atlas, a comprehensive AI assistant with full access to all data sources:\n\n**LinkedIn Ads**: List accounts, get account details, fetch campaigns, analytics, and campaign-level analytics\n**HubSpot CRM**: Access deals, contacts, companies, conversations, calls, emails, meetings, tasks, tickets, products, line items, quotes, and owners\n**Google Analytics (GA4)**: Overview, campaigns, ads, geography, traffic, top pages, acquisition, content, conversion paths, demographics, events, fluid fusion, realtime, retention, search terms, source/medium, technology, time patterns, and geography+source/medium (combines country and traffic sources - use this for questions like 'what sources are bringing traffic from China'). IMPORTANT: For traffic statistics, use get_ga4_overview (PRIMARY tool for traffic data). Use get_ga4_realtime only for real-time active users RIGHT NOW - if it fails, fall back to get_ga4_overview.\n**Reddit**: Search and monitor posts from subreddits\n\n**DATE FORMATS**: When using GA4 tools, use date formats like \"2024-01-10\", \"7daysAgo\", \"30daysAgo\", \"yesterday\", or \"today\". Natural language dates like \"January 10, 2026\" are supported but will be converted. If a date error occurs, try using \"XdaysAgo\" format instead (e.g., for January 10, 2026, calculate days ago and use that format). Always ensure dates are in the past - GA4 data is only available for historical dates.\n\nYou have access to ALL endpoints that the dashboard uses. You can use ANY tool you need - there are no restrictions. Use multiple tools if needed to get comprehensive data. For questions combining geography and traffic sources (e.g., 'what sources are bringing traffic from China'), use the get_ga4_geography_source_medium tool. Show all progress and thinking in real-time. Be thorough and provide detailed, actionable insights based on the data you fetch.",
                });

                let finalThinkingText = '';
                for await (const event of finalStream) {
                  if (event.type === 'content_block_delta' && event.delta.type === 'text_delta' && sendThinkingUpdate) {
                    finalThinkingText += event.delta.text;
                    // Show thinking as it streams (limit to avoid too much data)
                    if (finalThinkingText.length > 0 && finalThinkingText.length < 500) {
                      sendThinkingUpdate(controller, finalThinkingText);
                    }
                  }
                }

                finalResponse = await finalStream.finalMessage();
              }
            }

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

            // Calculate estimated cost (handle cases where usage might not be available)
            const inputTokens = response?.usage?.input_tokens || finalResponse?.usage?.input_tokens || 0;
            const outputTokens = finalResponse?.usage?.output_tokens || 0;
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
            const resultData = `data: ${JSON.stringify(result)}\n\n`;
            controller.enqueue(encoder.encode(resultData));
            
            // Small delay to ensure data is sent before closing
            await new Promise(resolve => setTimeout(resolve, 50));
            
            controller.close();
          } catch (error: any) {
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
      system: "You are Atlas, a comprehensive AI assistant with full access to all data sources:\n\n**LinkedIn Ads**: List accounts, get account details, fetch campaigns, analytics, and campaign-level analytics\n**HubSpot CRM**: Access deals, contacts, companies, conversations, calls, emails, meetings, tasks, tickets, products, line items, quotes, and owners\n**Google Analytics (GA4)**: Overview, campaigns, ads, geography, traffic, top pages, acquisition, content, conversion paths, demographics, events, fluid fusion, realtime, retention, search terms, source/medium, technology, and time patterns. IMPORTANT: For traffic statistics, use get_ga4_overview (PRIMARY tool for traffic data). Use get_ga4_realtime only for real-time active users RIGHT NOW - if it fails, fall back to get_ga4_overview.\n**Reddit**: Search and monitor posts from subreddits\n\n**DATE FORMATS**: When using GA4 tools, use date formats like \"2024-01-10\", \"7daysAgo\", \"30daysAgo\", \"yesterday\", or \"today\". Natural language dates like \"January 10, 2026\" are supported but will be converted. If a date error occurs, try using \"XdaysAgo\" format instead (e.g., for January 10, 2026, calculate days ago and use that format). Always ensure dates are in the past - GA4 data is only available for historical dates.\n\nYou have access to ALL endpoints that the dashboard uses. You can use ANY tool you need - there are no restrictions. Use multiple tools if needed to get comprehensive data. Show all progress and thinking in real-time. Be thorough and provide detailed, actionable insights based on the data you fetch.",
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
          system: "You are Atlas, a comprehensive AI assistant with full access to all data sources:\n\n**LinkedIn Ads**: List accounts, get account details, fetch campaigns, analytics, and campaign-level analytics\n**HubSpot CRM**: Access deals, contacts, companies, conversations, calls, emails, meetings, tasks, tickets, products, line items, quotes, and owners\n**Google Analytics (GA4)**: Overview, campaigns, ads, geography, traffic, top pages, acquisition, content, conversion paths, demographics, events, fluid fusion, realtime, retention, search terms, source/medium, technology, and time patterns. IMPORTANT: For traffic statistics, use get_ga4_overview (PRIMARY tool for traffic data). Use get_ga4_realtime only for real-time active users RIGHT NOW - if it fails, fall back to get_ga4_overview.\n**Reddit**: Search and monitor posts from subreddits\n\n**DATE FORMATS**: When using GA4 tools, use date formats like \"2024-01-10\", \"7daysAgo\", \"30daysAgo\", \"yesterday\", or \"today\". Natural language dates like \"January 10, 2026\" are supported but will be converted. If a date error occurs, try using \"XdaysAgo\" format instead (e.g., for January 10, 2026, calculate days ago and use that format). Always ensure dates are in the past - GA4 data is only available for historical dates.\n\nYou have access to ALL endpoints that the dashboard uses. You can use ANY tool you need - there are no restrictions. Use multiple tools if needed to get comprehensive data. Show all progress and thinking in real-time. Be thorough and provide detailed, actionable insights based on the data you fetch.",
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
