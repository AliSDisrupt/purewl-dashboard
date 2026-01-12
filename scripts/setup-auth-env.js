#!/usr/bin/env node

/**
 * Setup script to add Google OAuth credentials to .env.local
 * Run with: node scripts/setup-auth-env.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');

// Google OAuth credentials
const authEnvVars = `
# Google OAuth (for dashboard authentication)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=uhFm9YtrMnXRNvxeSRUr4D8SIhS49sLGgVq/3TjnLM4=
`;

try {
  let existingContent = '';
  
  // Read existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    existingContent = fs.readFileSync(envPath, 'utf8');
  }

  // Check if auth vars already exist
  if (existingContent.includes('GOOGLE_CLIENT_ID')) {
    console.log('⚠️  Google OAuth credentials already exist in .env.local');
    console.log('   Skipping addition. If you need to update, edit .env.local manually.');
  } else {
    // Append auth vars to existing content
    const newContent = existingContent + authEnvVars;
    fs.writeFileSync(envPath, newContent, 'utf8');
    console.log('✅ Successfully added Google OAuth credentials to .env.local');
  }
  
  console.log('\n📝 Environment variables configured:');
  console.log('   - GOOGLE_CLIENT_ID');
  console.log('   - GOOGLE_CLIENT_SECRET');
  console.log('   - NEXTAUTH_URL');
  console.log('   - NEXTAUTH_SECRET');
  console.log('\n🔒 Make sure .env.local is in your .gitignore');
  
} catch (error) {
  if (error.code === 'ENOENT') {
    // .env.local doesn't exist, create it
    fs.writeFileSync(envPath, authEnvVars, 'utf8');
    console.log('✅ Created .env.local with Google OAuth credentials');
  } else {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
