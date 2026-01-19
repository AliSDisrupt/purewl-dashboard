# LinkedIn Ads MCP Server Setup Guide

This guide explains how to set up the LinkedIn Ads MCP Server for use with Claude Desktop and the PureWL Dashboard.

## Overview

The LinkedIn Ads MCP Server provides a standardized way to access LinkedIn Ads data through the Model Context Protocol (MCP). This allows AI assistants like Claude Desktop to interact with your LinkedIn advertising accounts.

## Installation Options

### Option 1: npm Package (Recommended)

The `linkedin-ads-mcp-server` npm package provides a clean, maintained solution.

#### Step 1: Install the Package

```bash
npm install -g linkedin-ads-mcp-server
```

Or install locally in your project:

```bash
npm install linkedin-ads-mcp-server
```

#### Step 2: Get LinkedIn Access Token

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com)
2. Create a new app or use an existing one
3. Request **Marketing API** access
4. Generate an access token with the following scopes:
   - `r_ads_reporting` - Read advertising reports
   - `rw_ads` - Read and write advertising data

#### Step 3: Configure Claude Desktop

Add to your Claude Desktop config file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "linkedin-ads": {
      "command": "npx",
      "args": ["linkedin-ads-mcp-server"],
      "env": {
        "LINKEDIN_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

#### Step 4: Restart Claude Desktop

After updating the config, restart Claude Desktop to load the new MCP server.

### Option 2: Python Script (Legacy - Not Recommended)

⚠️ **Note:** The Python script option is deprecated. Use the npm package instead.

If you need to use the Python script (not recommended), you would need:
- Python MCP server at `C:\linkedin-mcp\linkedin-mcp\server.py`
- Python dependencies (httpx, mcp)
- UV package manager

**Legacy Config (not in use):**
```json
{
  "mcpServers": {
    "linkedin-ads": {
      "command": "uv",
      "args": [
        "run",
        "--with",
        "httpx",
        "--with",
        "mcp",
        "C:\\linkedin-mcp\\linkedin-mcp\\server.py"
      ],
      "env": {
        "LINKEDIN_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

## Usage

Once configured, you can ask Claude Desktop:

- "Show me my LinkedIn campaign performance"
- "Get analytics for last 30 days"
- "List all my ad accounts"
- "What's my LinkedIn ad spend this month?"
- "Show me campaigns with highest CTR"

## Features

The LinkedIn Ads MCP Server provides:

- ✅ **Campaign Analytics** - Performance metrics, CTR, CPC, conversions
- ✅ **Ad Account Management** - List accounts, get account details
- ✅ **Campaign Reporting** - Detailed campaign performance data
- ✅ **Secure Authentication** - Token-based OAuth 2.0
- ✅ **Integration with Claude Desktop** - Native MCP support

## Integration with PureWL Dashboard

The PureWL Dashboard also has a **direct API integration** for LinkedIn Ads:

- **Location:** `lib/mcp/linkedin.ts`
- **API Routes:** `/api/linkedin/*`
- **Status:** ✅ Active

This allows the Next.js dashboard to fetch LinkedIn data directly without going through Claude Desktop.

### Both Integrations Work Together

1. **Claude Desktop MCP Server** - For AI assistant queries
2. **Direct API Integration** - For dashboard UI and automated reports

Both use the same `LINKEDIN_ACCESS_TOKEN` from your environment variables.

## Troubleshooting

### Token Issues

If you get authentication errors:

1. **Check Token Expiry** - LinkedIn tokens expire. Generate a new one if needed.
2. **Verify Scopes** - Ensure your token has `r_ads_reporting` and `rw_ads` scopes.
3. **Check Environment Variable** - Verify `LINKEDIN_ACCESS_TOKEN` is set correctly.

### MCP Server Not Loading

1. **Check npm Installation** - Run `npm list -g linkedin-ads-mcp-server`
2. **Verify Config Path** - Ensure Claude Desktop config file is in the correct location
3. **Restart Claude Desktop** - MCP servers only load on startup
4. **Check Logs** - Look for errors in Claude Desktop console

### API Errors

If you see API errors:

1. **Rate Limits** - LinkedIn API has rate limits. Wait and retry.
2. **Account Access** - Ensure your token has access to the ad accounts you're querying.
3. **API Version** - The server uses LinkedIn API version `202511`. Ensure compatibility.

## Migration from Python to npm

If you want to switch from the Python script to the npm package:

1. Install the npm package globally:
   ```bash
   npm install -g linkedin-ads-mcp-server
   ```

2. Update your Claude Desktop config to use `npx` instead of `uv run`:
   ```json
   {
     "mcpServers": {
       "linkedin-ads": {
         "command": "npx",
         "args": ["linkedin-ads-mcp-server"],
         "env": {
           "LINKEDIN_ACCESS_TOKEN": "your_token_here"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop.

4. Test by asking Claude: "List my LinkedIn ad accounts"

## Additional Resources

- [LinkedIn Marketing API Documentation](https://docs.microsoft.com/en-us/linkedin/marketing/)
- [Model Context Protocol (MCP) Documentation](https://modelcontextprotocol.io/)
- [npm Package: linkedin-ads-mcp-server](https://www.npmjs.com/package/linkedin-ads-mcp-server)

## Current Configuration

✅ **Active:** npm package `linkedin-ads-mcp-server`  
❌ **Deprecated:** Python script (no longer in use)

The npm package is now the primary and recommended implementation because it offers:

- ✅ Easier installation (npm vs Python dependencies)
- ✅ Better maintenance (npm package updates)
- ✅ Cross-platform compatibility
- ✅ Standardized MCP implementation
- ✅ No local file dependencies

---

**Last Updated:** January 2026  
**Status:** ✅ Configured (npm package `linkedin-ads-mcp-server`)
