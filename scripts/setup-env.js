#!/usr/bin/env node

/**
 * Setup script to create .env.local from DATA/claude_desktop_config.json
 * Run with: node scripts/setup-env.js
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../DATA/claude_desktop_config.json');
const envPath = path.join(__dirname, '../.env.local');

try {
  // Read the config file
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Extract credentials
  const linkedinToken = config.mcpServers['linkedin-ads']?.env?.LINKEDIN_ACCESS_TOKEN || '';
  const hubspotToken = config.mcpServers.hubspot?.env?.HUBSPOT_ACCESS_TOKEN || '';
  const ga4Credentials = config.mcpServers['google-analytics']?.env?.GOOGLE_APPLICATION_CREDENTIALS || '';
  const ga4PropertyId = config.mcpServers['google-analytics']?.env?.GA4_PROPERTY_ID || '';

  // Create .env.local content
  const envContent = `# Environment variables extracted from DATA/claude_desktop_config.json
# Generated automatically - do not commit to git

# LinkedIn Ads Configuration
LINKEDIN_ACCESS_TOKEN=${linkedinToken}
LINKEDIN_API_BASE=https://api.linkedin.com/rest

# HubSpot Configuration
HUBSPOT_ACCESS_TOKEN=${hubspotToken}
HUBSPOT_API_BASE=https://api.hubapi.com

# Google Analytics (GA4) Configuration
GOOGLE_APPLICATION_CREDENTIALS=${ga4Credentials}
GA4_PROPERTY_ID=${ga4PropertyId}

# Reddit Configuration
# Note: Reddit uses MCP server which handles authentication internally
# No direct API keys needed

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

  // Write .env.local
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('✅ Successfully created .env.local file!');
  console.log('📝 Credentials extracted from DATA/claude_desktop_config.json');
  console.log('🔒 Make sure .env.local is in your .gitignore');
  
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('❌ Error: DATA/claude_desktop_config.json not found');
    console.log('💡 Make sure you run this from the project root directory');
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(1);
}
