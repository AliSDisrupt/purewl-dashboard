/**
 * Check Google Ads Environment Variables
 * 
 * This script checks if Google Ads credentials are set in .env.local
 */

const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');

console.log('🔍 Checking Google Ads Environment Variables...\n');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  console.log('   Creating .env.local file...\n');
  fs.writeFileSync(envPath, '');
}

// Read .env.local
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (error) {
  console.error('Error reading .env.local:', error.message);
  process.exit(1);
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
      envVars[key] = value;
    }
  }
});

// Check for Google Ads credentials
const requiredVars = [
  'GOOGLE_ADS_CLIENT_ID',
  'GOOGLE_ADS_CLIENT_SECRET',
  'GOOGLE_ADS_REFRESH_TOKEN',
];

const optionalVars = [
  'GOOGLE_ADS_DEVELOPER_TOKEN',
  'GOOGLE_ADS_CUSTOMER_ID',
  'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
  'GOOGLE_ADS_ACCESS_TOKEN',
];

console.log('📋 Required Variables:');
let allRequiredPresent = true;
requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    const displayValue = varName.includes('SECRET') || varName.includes('TOKEN') 
      ? `${value.substring(0, 10)}...` 
      : value;
    console.log(`   ✅ ${varName} = ${displayValue}`);
  } else {
    console.log(`   ❌ ${varName} = NOT SET`);
    allRequiredPresent = false;
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    const displayValue = varName.includes('TOKEN') || varName.includes('SECRET')
      ? `${value.substring(0, 10)}...`
      : value;
    console.log(`   ${value ? '✅' : '⚪'} ${varName} = ${value ? displayValue : 'NOT SET'}`);
  } else {
    console.log(`   ⚪ ${varName} = NOT SET`);
  }
});

console.log('\n' + '='.repeat(60));

if (allRequiredPresent) {
  console.log('\n✅ All required Google Ads credentials are set!');
  console.log('   The API will try to use the direct Google Ads API.');
  console.log('   If it fails, it will automatically fallback to GA4.\n');
} else {
  console.log('\n⚠️  Some required credentials are missing.');
  console.log('   The API will automatically use GA4 fallback.');
  console.log('\n💡 To add credentials:');
  console.log('   1. Open .env.local');
  console.log('   2. Add the following lines:');
  console.log('      GOOGLE_ADS_CLIENT_ID=your_client_id');
  console.log('      GOOGLE_ADS_CLIENT_SECRET=your_client_secret');
  console.log('      GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token');
  console.log('\n   Or run: node scripts/add-google-ads-credentials.js\n');
}

// Show current behavior
console.log('\n📊 Current Behavior:');
if (allRequiredPresent) {
  console.log('   → Will try Google Ads API first');
  console.log('   → Will fallback to GA4 if API fails');
} else {
  console.log('   → Will skip Google Ads API (credentials missing)');
  console.log('   → Will use GA4 fallback directly');
}

console.log('\n');
