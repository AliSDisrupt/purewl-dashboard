// Test Reddit API directly
async function testRedditDirect() {
  console.log("\n🔍 Testing Reddit API Directly\n");
  console.log("=".repeat(70));
  
  // Test 1: Simple search with one keyword
  console.log("\n📡 Test 1: Simple search for 'PureVPN'");
  try {
    const url1 = `https://www.reddit.com/r/vpn/search.json?q=PureVPN&sort=relevance&limit=5&restrict_sr=1&t=week`;
    console.log(`   URL: ${url1}`);
    
    const response1 = await fetch(url1, {
      headers: { 'User-Agent': 'PureWL-Dashboard/1.0' },
    });
    
    const data1 = await response1.json();
    console.log(`   Status: ${response1.status}`);
    console.log(`   Posts found: ${data1.data?.children?.length || 0}`);
    
    if (data1.data?.children?.length > 0) {
      console.log(`   ✅ First post: ${data1.data.children[0].data.title.substring(0, 60)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 2: Search with OR operator
  console.log("\n📡 Test 2: Search with OR operator (PureVPN OR PureWL)");
  try {
    const url2 = `https://www.reddit.com/r/vpn/search.json?q=PureVPN%20OR%20PureWL&sort=relevance&limit=5&restrict_sr=1&t=week`;
    console.log(`   URL: ${url2}`);
    
    const response2 = await fetch(url2, {
      headers: { 'User-Agent': 'PureWL-Dashboard/1.0' },
    });
    
    const data2 = await response2.json();
    console.log(`   Status: ${response2.status}`);
    console.log(`   Posts found: ${data2.data?.children?.length || 0}`);
    
    if (data2.data?.children?.length > 0) {
      console.log(`   ✅ First post: ${data2.data.children[0].data.title.substring(0, 60)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 3: Search with many OR keywords (like we're doing)
  console.log("\n📡 Test 3: Search with many OR keywords");
  try {
    const keywords = ["PureVPN", "PureWL", "white label VPN", "VPN reseller"];
    const query = keywords.join(' OR ');
    const url3 = `https://www.reddit.com/r/vpn/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=5&restrict_sr=1&t=week`;
    console.log(`   URL: ${url3.substring(0, 150)}...`);
    console.log(`   Query length: ${query.length} characters`);
    
    const response3 = await fetch(url3, {
      headers: { 'User-Agent': 'PureWL-Dashboard/1.0' },
    });
    
    const data3 = await response3.json();
    console.log(`   Status: ${response3.status}`);
    console.log(`   Posts found: ${data3.data?.children?.length || 0}`);
    
    if (data3.data?.children?.length > 0) {
      console.log(`   ✅ First post: ${data3.data.children[0].data.title.substring(0, 60)}...`);
    } else if (data3.error) {
      console.log(`   ⚠️  Reddit error: ${JSON.stringify(data3.error)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 4: Check if there are any posts in r/vpn at all
  console.log("\n📡 Test 4: Check recent posts in r/vpn (no search)");
  try {
    const url4 = `https://www.reddit.com/r/vpn/new.json?limit=5`;
    const response4 = await fetch(url4, {
      headers: { 'User-Agent': 'PureWL-Dashboard/1.0' },
    });
    
    const data4 = await response4.json();
    console.log(`   Status: ${response4.status}`);
    console.log(`   Recent posts: ${data4.data?.children?.length || 0}`);
    
    if (data4.data?.children?.length > 0) {
      console.log(`   ✅ Latest post: ${data4.data.children[0].data.title.substring(0, 60)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

testRedditDirect();
