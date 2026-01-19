/**
 * Script to check what source values exist in HubSpot contacts and deals
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

loadEnv();

const API_BASE = process.env.HUBSPOT_API_BASE || "https://api.hubapi.com";
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error("❌ HUBSPOT_ACCESS_TOKEN not found in .env.local");
  process.exit(1);
}

async function checkContactSources() {
  try {
    const url = `${API_BASE}/crm/v3/objects/contacts/search`;
    
    const payload = {
      filterGroups: [],
      sorts: ["-createdate"],
      properties: [
        "firstname",
        "lastname",
        "email",
        "hs_analytics_source",
        "hs_analytics_medium",
        "hs_analytics_campaign_name",
      ],
      limit: 100, // Get first 100 contacts
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HubSpot API Error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    const contacts = data.results || [];
    
    // Count sources
    const sourceCounts = {};
    const mediumCounts = {};
    const sampleContacts = {};
    
    contacts.forEach((contact) => {
      const props = contact.properties || {};
      const source = props.hs_analytics_source || 'No Source';
      const medium = props.hs_analytics_medium || 'No Medium';
      
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      mediumCounts[medium] = (mediumCounts[medium] || 0) + 1;
      
      // Store sample contact for each source
      if (!sampleContacts[source]) {
        sampleContacts[source] = {
          name: `${props.firstname || ''} ${props.lastname || ''}`.trim() || 'Unnamed',
          email: props.email || 'No Email',
          source: source,
          medium: medium,
          campaign: props.hs_analytics_campaign_name || '—',
        };
      }
    });
    
    return { sourceCounts, mediumCounts, sampleContacts, totalContacts: contacts.length };
  } catch (error) {
    console.error("Error checking contact sources:", error.message);
    return { sourceCounts: {}, mediumCounts: {}, sampleContacts: {}, totalContacts: 0 };
  }
}

async function checkDealSources() {
  try {
    const url = `${API_BASE}/crm/v3/objects/deals`;
    const params = new URLSearchParams({
      limit: "100",
      properties: "dealname,amount,source,sourceData1,sourceData2",
      sort: "-createdAt",
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error(`HubSpot API Error: ${response.status}`);
    }

    const data = await response.json();
    const deals = data.results || [];
    
    // Count sources
    const sourceCounts = {};
    const sampleDeals = {};
    
    deals.forEach((deal) => {
      const props = deal.properties || {};
      const source = props.source || 'No Source';
      
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      
      // Store sample deal for each source
      if (!sampleDeals[source]) {
        sampleDeals[source] = {
          name: props.dealname || 'Unnamed Deal',
          amount: props.amount || '0',
          source: source,
          sourceData1: props.sourceData1 || '—',
          sourceData2: props.sourceData2 || '—',
        };
      }
    });
    
    return { sourceCounts, sampleDeals, totalDeals: deals.length };
  } catch (error) {
    console.error("Error checking deal sources:", error.message);
    return { sourceCounts: {}, sampleDeals: {}, totalDeals: 0 };
  }
}

async function main() {
  console.log("🔍 Checking HubSpot Source Data...\n");
  console.log("=".repeat(80));

  // Check Contact Sources
  console.log("\n📧 CONTACT SOURCES");
  console.log("-".repeat(80));
  const contactData = await checkContactSources();
  
  if (contactData.totalContacts === 0) {
    console.log("❌ No contacts found");
  } else {
    console.log(`✅ Found ${contactData.totalContacts} contact(s)\n`);
    console.log("Source Distribution:");
    Object.entries(contactData.sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        const isLinkedIn = source.toLowerCase().includes('linkedin');
        console.log(`  ${isLinkedIn ? '🔗' : '  '} ${source}: ${count} contact(s)`);
      });
    
    console.log("\nMedium Distribution:");
    Object.entries(contactData.mediumCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([medium, count]) => {
        console.log(`    ${medium}: ${count} contact(s)`);
      });
    
    console.log("\n📋 Sample Contacts by Source:");
    Object.entries(contactData.sampleContacts).forEach(([source, contact]) => {
      const isLinkedIn = source.toLowerCase().includes('linkedin');
      console.log(`\n  ${isLinkedIn ? '🔗' : '  '} Source: ${source}`);
      console.log(`     Name: ${contact.name}`);
      console.log(`     Email: ${contact.email}`);
      console.log(`     Medium: ${contact.medium}`);
      console.log(`     Campaign: ${contact.campaign}`);
    });
  }

  // Check Deal Sources
  console.log("\n\n💼 DEAL SOURCES");
  console.log("-".repeat(80));
  const dealData = await checkDealSources();
  
  if (dealData.totalDeals === 0) {
    console.log("❌ No deals found");
  } else {
    console.log(`✅ Found ${dealData.totalDeals} deal(s)\n`);
    console.log("Source Distribution:");
    Object.entries(dealData.sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        const isLinkedIn = source.toLowerCase().includes('linkedin');
        console.log(`  ${isLinkedIn ? '🔗' : '  '} ${source}: ${count} deal(s)`);
      });
    
    console.log("\n📋 Sample Deals by Source:");
    Object.entries(dealData.sampleDeals).forEach(([source, deal]) => {
      const isLinkedIn = source.toLowerCase().includes('linkedin');
      console.log(`\n  ${isLinkedIn ? '🔗' : '  '} Source: ${source}`);
      console.log(`     Name: ${deal.name}`);
      console.log(`     Amount: $${deal.amount}`);
      console.log(`     Source Data 1: ${deal.sourceData1}`);
      console.log(`     Source Data 2: ${deal.sourceData2}`);
    });
  }

  // Summary
  console.log("\n\n📊 SUMMARY");
  console.log("=".repeat(80));
  const linkedInContacts = Object.entries(contactData.sourceCounts)
    .filter(([source]) => source.toLowerCase().includes('linkedin'))
    .reduce((sum, [, count]) => sum + count, 0);
  const linkedInDeals = Object.entries(dealData.sourceCounts)
    .filter(([source]) => source.toLowerCase().includes('linkedin'))
    .reduce((sum, [, count]) => sum + count, 0);
  
  console.log(`Total Contacts: ${contactData.totalContacts}`);
  console.log(`LinkedIn Contacts: ${linkedInContacts}`);
  console.log(`Total Deals: ${dealData.totalDeals}`);
  console.log(`LinkedIn Deals: ${linkedInDeals}`);
  
  if (linkedInContacts === 0 && linkedInDeals === 0) {
    console.log("\n⚠️  No LinkedIn data found. Possible reasons:");
    console.log("   1. LinkedIn Ads campaigns are not properly tracking to HubSpot");
    console.log("   2. UTM parameters are not being passed correctly");
    console.log("   3. HubSpot tracking code is not installed on landing pages");
    console.log("   4. Contacts are being created manually without source tracking");
  }

  console.log("\n✅ Done!\n");
}

main().catch(console.error);
