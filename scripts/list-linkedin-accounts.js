/**
 * Script to list all LinkedIn ad accounts
 */

require('dotenv').config({ path: '.env.local' });

async function listLinkedInAccounts() {
  try {
    const response = await fetch('http://localhost:3000/api/linkedin/accounts-list');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    console.log('\n=== LinkedIn Ad Accounts ===\n');
    console.log(`Total Accounts: ${data.totalAccounts}\n`);
    
    if (data.accounts && data.accounts.length > 0) {
      data.accounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account.name}`);
        console.log(`   ID: ${account.simpleId}`);
        console.log(`   Full ID: ${account.id}`);
        console.log(`   Campaigns API: ${account.endpoints.campaigns}`);
        console.log(`   Analytics API: ${account.endpoints.analytics}`);
        console.log('');
      });
    } else {
      console.log('No accounts found.');
    }
  } catch (error) {
    console.error('Error fetching LinkedIn accounts:', error.message);
    console.log('\nMake sure the Next.js server is running on port 3000.');
    console.log('Or check your LINKEDIN_ACCESS_TOKEN in .env.local');
  }
}

listLinkedInAccounts();
