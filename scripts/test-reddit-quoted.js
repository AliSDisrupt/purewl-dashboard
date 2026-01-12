// Test Reddit search with quoted keywords
async function testRedditQuoted() {
  console.log("\n🔍 Testing Reddit Search with Quoted Keywords\n");
  console.log("=".repeat(70));
  
  // Test with quoted multi-word keywords
  console.log("\n📡 Test: Search with quoted keywords");
  try {
    // Reddit search: multi-word terms should be in quotes
    const keywords = ['"white label VPN"', '"VPN reseller"', 'PureVPN', 'PureWL'];
    const query = keywords.join(' OR ');
    const url = `https://www.reddit.com/r/vpn/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=10&restrict_sr=1&t=month`;
    
    console.log(`   Query: ${query}`);
    console.log(`   URL: ${url.substring(0, 200)}...`);
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'PureWL-Dashboard/1.0' },
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Posts found: ${data.data?.children?.length || 0}`);
    
    if (data.data?.children?.length > 0) {
      console.log(`\n   ✅ Found posts:`);
      data.data.children.slice(0, 3).forEach((child, idx) => {
        const post = child.data;
        console.log(`   ${idx + 1}. ${post.title.substring(0, 70)}...`);
        console.log(`      r/${post.subreddit} | Score: ${post.score} | ${new Date(post.created_utc * 1000).toLocaleDateString()}`);
      });
    } else {
      console.log(`   ⚠️  No posts found. Trying 'all' time period...`);
      
      // Try with 'all' time
      const urlAll = `https://www.reddit.com/r/vpn/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=10&restrict_sr=1&t=all`;
      const responseAll = await fetch(urlAll, {
        headers: { 'User-Agent': 'PureWL-Dashboard/1.0' },
      });
      const dataAll = await responseAll.json();
      console.log(`   Posts found (all time): ${dataAll.data?.children?.length || 0}`);
      
      if (dataAll.data?.children?.length > 0) {
        console.log(`\n   ✅ Found posts (all time):`);
        dataAll.data.children.slice(0, 3).forEach((child, idx) => {
          const post = child.data;
          console.log(`   ${idx + 1}. ${post.title.substring(0, 70)}...`);
        });
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test with the old working keywords
  console.log("\n📡 Test: Old keywords that were working");
  try {
    const oldKeywords = ['"WhiteLabel VPN"', 'PureWL', '"PureWL VPN"', 'WhiteLabel'];
    const oldQuery = oldKeywords.join(' OR ');
    const url = `https://www.reddit.com/r/vpn/search.json?q=${encodeURIComponent(oldQuery)}&sort=relevance&limit=10&restrict_sr=1&t=week`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'PureWL-Dashboard/1.0' },
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Posts found: ${data.data?.children?.length || 0}`);
    
    if (data.data?.children?.length > 0) {
      console.log(`   ✅ First post: ${data.data.children[0].data.title.substring(0, 60)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

testRedditQuoted();
