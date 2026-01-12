// Test if matched keywords are being returned
async function testKeywordDisplay() {
  console.log("\n🔍 Testing Keyword Display in Posts\n");
  console.log("=".repeat(70));
  
  try {
    const keywords = ["VPN API", "VPN SDK", "PureVPN"];
    const keywordsParam = keywords.join(',');
    const url = `http://localhost:3000/api/reddit/posts?keywords=${encodeURIComponent(keywordsParam)}&limit=5&time=month&includeComments=false`;
    
    console.log(`\n📡 Calling API with keywords: ${keywords.join(', ')}\n`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`✅ Posts found: ${data.posts?.length || 0}\n`);
    
    if (data.posts && data.posts.length > 0) {
      data.posts.forEach((post, idx) => {
        console.log(`\n📋 Post ${idx + 1}:`);
        console.log(`   Title: ${post.title.substring(0, 70)}...`);
        console.log(`   Matched Keywords: ${post.matchedKeywords ? post.matchedKeywords.join(', ') : 'None'}`);
        if (post.matchedKeywords && post.matchedKeywords.length > 0) {
          console.log(`   ✅ Keywords displayed: ${post.matchedKeywords.length} keyword(s)`);
        } else {
          console.log(`   ⚠️  No keywords tracked`);
        }
      });
    } else {
      console.log(`⚠️  No posts found`);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testKeywordDisplay();
