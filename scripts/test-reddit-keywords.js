// Test Reddit search with the new keywords
const keywords = [
  "PureVPN",
  "PureWL",
  "white label VPN",
  "VPN reseller",
  "VPN SDK",
  "VPN API",
  "enterprise VPN",
  "VPN for business",
];

async function testRedditSearch() {
  console.log("\n🔍 Testing Reddit Search with Keywords\n");
  console.log("=".repeat(70));
  
  try {
    // Test with a few keywords first
    const keywordsParam = keywords.join(',');
    const url = `http://localhost:3000/api/reddit/posts?keywords=${encodeURIComponent(keywordsParam)}&limit=10&time=week&includeComments=false`;
    
    console.log(`\n📡 Calling: ${url.substring(0, 150)}...\n`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`\n📊 Response Data:`);
    console.log(JSON.stringify(data, null, 2));
    
    if (data.posts) {
      console.log(`\n✅ Found ${data.posts.length} posts`);
      if (data.posts.length > 0) {
        console.log(`\n📋 First Post:`);
        console.log(`   Title: ${data.posts[0].title}`);
        console.log(`   Subreddit: r/${data.posts[0].subreddit}`);
        console.log(`   Score: ${data.posts[0].score}`);
        console.log(`   Created: ${data.posts[0].createdAt}`);
      }
    }
    
    if (data.error) {
      console.log(`\n❌ Error: ${data.error}`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  }
}

testRedditSearch();
