/**
 * Add Google Ads credentials to .env.local
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

// Google Ads credentials template
// Note: Replace the placeholder values with your actual credentials
const credentials = `
# Google Ads API Configuration
# Add your actual credentials below:
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
GOOGLE_ADS_CUSTOMER_ID=your_customer_id_here
GOOGLE_ADS_LOGIN_CUSTOMER_ID=your_login_customer_id_here
GOOGLE_ADS_CLIENT_ID=your_client_id_here
GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token_here
`;

try {
  let content = '';
  
  // Read existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf-8');
    
    // Check if Google Ads credentials already exist
    if (content.includes('GOOGLE_ADS_CLIENT_ID')) {
      console.log('⚠️  Google Ads credentials already exist in .env.local');
      console.log('   Skipping addition. If you want to update, please edit manually.');
      process.exit(0);
    }
  }
  
  // Append credentials
  content += credentials;
  
  // Write back to file
  fs.writeFileSync(envPath, content, 'utf-8');
  
  console.log('✅ Google Ads credentials added to .env.local');
  console.log('\nAdded:');
  console.log('  - GOOGLE_ADS_DEVELOPER_TOKEN');
  console.log('  - GOOGLE_ADS_CUSTOMER_ID');
  console.log('  - GOOGLE_ADS_LOGIN_CUSTOMER_ID');
  console.log('  - GOOGLE_ADS_CLIENT_ID');
  console.log('  - GOOGLE_ADS_CLIENT_SECRET');
  console.log('  - GOOGLE_ADS_REFRESH_TOKEN');
  console.log('\n✅ Ready to test!');
  
} catch (error) {
  console.error('❌ Error adding credentials:', error.message);
  process.exit(1);
}
