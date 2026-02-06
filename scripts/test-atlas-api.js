// Test Atlas API to see if it's working and fetching data
const fetch = globalThis.fetch || require('node-fetch');

async function testAtlasAPI() {
  console.log("🧪 Testing Atlas API...\n");
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const testMessage = process.argv[2] || "What is the realtime traffic from GA4?";
  
  console.log(`📤 Sending test message: "${testMessage}"`);
  console.log(`🌐 URL: ${baseUrl}/api/claude/chat\n`);
  
  try {
    const response = await fetch(`${baseUrl}/api/claude/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'x-atlas-test': '1',  // Bypass auth in dev for this script
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: testMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      console.log(`Error details: ${error}`);
      return;
    }

    console.log(`✅ Response received (${response.status})\n`);
    console.log("📥 Streaming response:\n");
    console.log("─".repeat(60));
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let hasComplete = false;
    let statusCount = 0;
    let thinkingCount = 0;

    if (!reader) {
      console.log("❌ No response body reader available");
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (!hasComplete) {
          console.log("\n⚠️  Stream ended without 'complete' event");
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === "status") {
              statusCount++;
              console.log(`📊 [STATUS ${statusCount}] ${data.status}`);
              if (data.toolName) {
                console.log(`   Tool: ${data.toolName}`);
              }
            } else if (data.type === "thinking") {
              thinkingCount++;
              const thinking = data.thinking?.substring(0, 100) || '';
              if (thinking) {
                console.log(`💭 [THINKING ${thinkingCount}] ${thinking}...`);
              }
            } else if (data.type === "complete") {
              hasComplete = true;
              console.log("\n✅ [COMPLETE] Response received!");
              console.log(`   Stop reason: ${data.stop_reason}`);
              console.log(`   Tool calls: ${data.toolCalls || 0}`);
              if (data.content && Array.isArray(data.content)) {
                const textContent = data.content
                  .filter(c => c.type === 'text')
                  .map(c => c.text)
                  .join(' ');
                console.log(`   Response preview: ${textContent.substring(0, 150)}...`);
              }
            } else if (data.type === "error") {
              console.log(`\n❌ [ERROR] ${data.error}`);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
    
    console.log("\n" + "─".repeat(60));
    console.log(`\n📈 Summary:`);
    console.log(`   Status updates: ${statusCount}`);
    console.log(`   Thinking updates: ${thinkingCount}`);
    console.log(`   Complete event: ${hasComplete ? '✅ Yes' : '❌ No'}`);
    
    if (hasComplete) {
      console.log(`\n✅ Atlas API is working correctly!`);
    } else {
      console.log(`\n⚠️  Atlas API responded but didn't send complete event`);
    }
    
  } catch (error) {
    console.log(`\n❌ Error testing Atlas API: ${error.message}`);
    console.log(`\nMake sure the dev server is running: npm run dev`);
  }
}

testAtlasAPI()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
