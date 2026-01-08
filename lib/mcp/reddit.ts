/**
 * Reddit MCP Client
 * 
 * This client connects to Reddit API directly
 * using public API endpoints (no authentication required for read-only access).
 */

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  commentCount: number;
  url: string;
  createdAt: string;
  content: string | null;
}

export interface RedditQueryParams {
  subreddit?: string;
  sort?: 'hot' | 'new' | 'top' | 'rising';
  limit?: number;
}

/**
 * Fetch Reddit posts from Reddit API
 * 
 * Uses Reddit's public JSON API - no authentication required for read-only access
 */
export async function fetchRedditPosts(params: RedditQueryParams = {}): Promise<RedditPost[]> {
  const { subreddit = 'vpn', sort = 'hot', limit = 10 } = params;

  try {
    // Reddit JSON API endpoint
    const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PureWL-Dashboard/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const posts: RedditPost[] = [];

    for (const child of data.data?.children || []) {
      const post = child.data;
      if (post) {
        posts.push({
          id: post.id,
          title: post.title,
          author: post.author || 'Unknown',
          subreddit: post.subreddit || subreddit,
          score: post.score || 0,
          commentCount: post.num_comments || 0,
          url: `https://reddit.com${post.permalink}`,
          createdAt: new Date(post.created_utc * 1000).toISOString(),
          content: post.selftext || null,
        });
      }
    }

    return posts;
  } catch (error: any) {
    console.error("Error fetching Reddit posts:", error);
    throw new Error(`Reddit API Error: ${error.message}`);
  }
}

/**
 * Analyze sentiment of Reddit posts
 * (Optional feature - placeholder for future implementation)
 */
export async function analyzeRedditSentiment(posts: RedditPost[]): Promise<{
  avgSentiment: number;
  positive: number;
  negative: number;
  neutral: number;
}> {
  // TODO: Implement sentiment analysis
  // This could use an external API or ML model

  return {
    avgSentiment: 0.5,
    positive: 0,
    negative: 0,
    neutral: posts.length,
  };
}
