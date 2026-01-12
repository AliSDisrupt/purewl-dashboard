// Test with all the new keywords
const allKeywords = [
  "PureVPN",
  "PureWL",
  "PureVPN white label",
  "PureVPN reseller",
  "PureVPN SDK",
  "white label VPN",
  "whitelabel VPN",
  "VPN reseller",
  "VPN SDK",
  "VPN API",
  "rebrand VPN",
  "VPN for business",
  "enterprise VPN",
  "VPN for teams",
  "corporate VPN solution",
  "IPTV VPN",
  "IPTV reseller",
  "streaming VPN",
  "unblock streaming",
  "MSP VPN",
  "managed VPN service",
  "IT reseller VPN",
  "VPN for MSP clients",
  "ISP VPN service",
  "VPN for ISP",
  "telecom VPN",
  "antivirus VPN",
  "security suite VPN",
  "parental control VPN",
  "start VPN business",
  "build own VPN brand",
  "add VPN to my app",
  "VPN API for apps",
  "rebrand VPN service",
  "VPN reseller program",
  "white label business",
  "VPN provider",
];

// Format keywords for Reddit search
function formatRedditSearchQuery(keywords) {
  return keywords.map(keyword => {
    if (keyword.includes(' ')) {
      return `"${keyword}"`;
    }
    return keyword;
  }).join(' OR ');
}

async function testAllKeywords() {
  console.log("\n🔍 Testing with All Keywords\n");
  console.log("=".repeat(70));
  
  const query = formatRedditSearchQuery(allKeywords);
  console.log(`\n📋 Total Keywords: ${allKeywords.length}`);
  console.log(`📏 Query Length: ${query.length} characters`);
  console.log(`\n📝 First 200 chars of query:`);
  console.log(`   ${query.substring(0, 200)}...`);
  
  // Test the API
  try {
    const keywordsParam = allKeywords.join(',');
    const url = `http://localhost:3000/api/reddit/posts?keywords=${encodeURIComponent(keywordsParam)}&limit=20&time=month&includeComments=false`;
    
    console.log(`\n📡 Calling API...`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`\n📥 Response Status: ${response.status}`);
    console.log(`✅ Posts found: ${data.posts?.length || 0}`);
    console.log(`✅ Comments found: ${data.comments?.length || 0}`);
    
    if (data.posts && data.posts.length > 0) {
      console.log(`\n📋 Sample Posts:`);
      data.posts.slice(0, 3).forEach((post, idx) => {
        console.log(`\n   ${idx + 1}. ${post.title.substring(0, 70)}...`);
        console.log(`      r/${post.subreddit} | Score: ${post.score} | ${new Date(post.createdAt).toLocaleDateString()}`);
      });
    }
    
    if (data.error) {
      console.log(`\n❌ Error: ${data.error}`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAllKeywords();
