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
  type: 'post';
  matchedKeywords?: string[]; // Keywords that matched this post
}

export interface RedditComment {
  id: string;
  body: string;
  author: string;
  subreddit: string;
  score: number;
  postId: string;
  postTitle: string;
  url: string;
  createdAt: string;
  type: 'comment';
  matchedKeywords?: string[]; // Keywords that matched this comment
}

export type RedditItem = RedditPost | RedditComment;

export type TimeFilter = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' | 'custom';

export interface RedditQueryParams {
  subreddit?: string;
  sort?: 'hot' | 'new' | 'top' | 'rising' | 'relevance';
  limit?: number;
  query?: string; // Search query/keywords
  time?: TimeFilter; // Time filter for top/relevance sorting
  startDate?: string | Date; // Custom date range start date
  endDate?: string | Date; // Custom date range end date
}

/**
 * Fetch Reddit posts from Reddit API
 * 
 * Uses Reddit's public JSON API - no authentication required for read-only access
 * Supports both regular listing and keyword search
 */
export async function fetchRedditPosts(params: RedditQueryParams = {}): Promise<RedditPost[]> {
  const { subreddit = 'vpn', sort = 'hot', limit = 10, query, time = 'all', startDate, endDate } = params;

  try {
    let url: string;
    
    // If query is provided, use Reddit's search API
    if (query) {
      // Reddit search API: /r/{subreddit}/search.json?q={query}&sort={sort}&limit={limit}&restrict_sr=1&t={time}
      const searchSort = sort === 'hot' ? 'relevance' : sort; // Search uses 'relevance' instead of 'hot'
      url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=${searchSort}&limit=${limit}&restrict_sr=1&t=${time}`;
    } else {
      // Regular listing API with time filter (only works for 'top' and 'new' sorts)
      const timeParam = (sort === 'top' || sort === 'new') && time !== 'all' ? `&t=${time}` : '';
      url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}${timeParam}`;
    }
    
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
        const postDate = new Date(post.created_utc * 1000);
        
        // Filter by custom date range if provided
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Include entire end date
          
          if (postDate < start || postDate > end) {
            continue; // Skip posts outside date range
          }
        }
        
        // Find which keywords matched this post
        const matchedKeywords: string[] = [];
        if (query) {
          // Extract keywords from query (they're joined with OR)
          const queryKeywords = query.split(' OR ').map(k => k.trim().replace(/^"|"$/g, ''));
          const postText = `${post.title} ${post.selftext || ''}`.toLowerCase();
          
          queryKeywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            if (postText.includes(keywordLower)) {
              matchedKeywords.push(keyword);
            }
          });
        }
        
        posts.push({
          id: post.id,
          title: post.title,
          author: post.author || 'Unknown',
          subreddit: post.subreddit || subreddit,
          score: post.score || 0,
          commentCount: post.num_comments || 0,
          url: `https://reddit.com${post.permalink}`,
          createdAt: postDate.toISOString(),
          content: post.selftext || null,
          type: 'post',
          matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords : undefined,
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
 * Fetch comments from a Reddit post
 */
export async function fetchRedditComments(postId: string, subreddit: string, limit: number = 10): Promise<RedditComment[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=${limit}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PureWL-Dashboard/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const comments: RedditComment[] = [];
    
    // First item is the post, second item contains comments
    const commentsData = data[1]?.data?.children || [];
    const postData = data[0]?.data?.children[0]?.data;

    for (const child of commentsData) {
      const comment = child.data;
      if (comment && comment.body && !comment.body.includes('[deleted]')) {
        comments.push({
          id: comment.id,
          body: comment.body,
          author: comment.author || 'Unknown',
          subreddit: comment.subreddit || subreddit,
          score: comment.score || 0,
          postId: postId,
          postTitle: postData?.title || 'Unknown Post',
          url: `https://reddit.com${comment.permalink}`,
          createdAt: new Date(comment.created_utc * 1000).toISOString(),
          type: 'comment',
        });
      }
    }

    return comments;
  } catch (error: any) {
    console.error("Error fetching Reddit comments:", error);
    throw new Error(`Reddit Comments Error: ${error.message}`);
  }
}

/**
 * Format keywords for Reddit search - quote multi-word keywords
 */
function formatRedditSearchQuery(keywords: string[]): string {
  return keywords.map(keyword => {
    // If keyword contains spaces, wrap it in quotes
    if (keyword.includes(' ')) {
      return `"${keyword}"`;
    }
    return keyword;
  }).join(' OR ');
}

/**
 * Split keywords into batches to avoid Reddit API query length limits
 * Reddit search API has a limit, so we split into smaller batches
 */
function splitKeywordsIntoBatches(keywords: string[], maxBatchSize: number = 10): string[][] {
  const batches: string[][] = [];
  for (let i = 0; i < keywords.length; i += maxBatchSize) {
    batches.push(keywords.slice(i, i + maxBatchSize));
  }
  return batches;
}

/**
 * Search for posts across multiple subreddits with keywords
 * Handles large keyword lists by splitting into batches
 */
export async function searchRedditPosts(keywords: string[], subreddits: string[] = ['vpn', 'privacy', 'networking', 'technology'], limit: number = 20, time: TimeFilter = 'all', startDate?: string, endDate?: string): Promise<RedditPost[]> {
  const allPosts: RedditPost[] = [];
  
  // Split keywords into batches to avoid query length limits
  // Reddit search API works better with smaller queries
  const keywordBatches = splitKeywordsIntoBatches(keywords, 10);
  
  console.log(`Searching with ${keywords.length} keywords split into ${keywordBatches.length} batches`);

  try {
    // Search each batch across all subreddits
    const batchPromises = keywordBatches.map(async (batch) => {
      const searchQuery = formatRedditSearchQuery(batch);
      
      // Search across multiple subreddits for this batch
      const subredditPromises = subreddits.map(async (subreddit) => {
        try {
          const posts = await fetchRedditPosts({
            subreddit,
            query: searchQuery,
            sort: 'relevance',
            limit: Math.ceil(limit / (subreddits.length * keywordBatches.length)), // Distribute limit
            time,
            startDate,
            endDate,
          });
          // Tag posts with which keywords from this batch actually matched
          return posts.map(post => {
            const postText = `${post.title} ${post.content || ''}`.toLowerCase();
            const matchedFromBatch = batch.filter(kw => 
              postText.includes(kw.toLowerCase())
            );
            return {
              ...post,
              matchedKeywords: matchedFromBatch.length > 0 ? matchedFromBatch : (post.matchedKeywords || undefined),
            };
          });
        } catch (error) {
          console.warn(`Failed to search r/${subreddit} with batch:`, error);
          return [];
        }
      });

      const results = await Promise.all(subredditPromises);
      return results.flat();
    });

    const allResults = await Promise.all(batchPromises);
    const flattenedResults = allResults.flat();
    
    // Flatten and deduplicate posts by ID, merging matched keywords from different batches
    const postMap = new Map<string, RedditPost>();
    flattenedResults.forEach(post => {
      const existing = postMap.get(post.id);
      if (existing) {
        // Merge matched keywords from different batches
        const existingKeywords = existing.matchedKeywords || [];
        const newKeywords = post.matchedKeywords || [];
        const allMatched = [...new Set([...existingKeywords, ...newKeywords])];
        existing.matchedKeywords = allMatched.length > 0 ? allMatched : undefined;
      } else {
        // First time seeing this post
        postMap.set(post.id, post);
      }
    });

    // Sort by score (highest first) and limit
    return Array.from(postMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error: any) {
    console.error("Error searching Reddit posts:", error);
    throw new Error(`Reddit Search Error: ${error.message}`);
  }
}

/**
 * Search for posts and fetch their comments, then combine results
 */
export async function searchRedditPostsAndComments(
  keywords: string[], 
  subreddits: string[] = ['vpn', 'privacy', 'networking', 'technology'], 
  limit: number = 20,
  time: TimeFilter = 'all',
  includeComments: boolean = true,
  commentsPerPost: number = 3,
  startDate?: string,
  endDate?: string
): Promise<{ posts: RedditPost[]; comments: RedditComment[] }> {
  // First, get posts (keywords will be properly formatted in searchRedditPosts)
  const posts = await searchRedditPosts(keywords, subreddits, limit, time, startDate, endDate);
  
  let comments: RedditComment[] = [];
  
  if (includeComments) {
    // Fetch comments from top posts
    const topPosts = posts.slice(0, Math.min(10, posts.length)); // Limit to top 10 posts for comments
    
    const commentPromises = topPosts.map(async (post) => {
      try {
        const postComments = await fetchRedditComments(post.id, post.subreddit, commentsPerPost);
        // Filter comments that mention keywords
        return postComments.filter(comment => {
          const commentText = (comment.body || '').toLowerCase();
          return keywords.some(keyword => commentText.includes(keyword.toLowerCase()));
        });
      } catch (error) {
        console.warn(`Failed to fetch comments for post ${post.id}:`, error);
        return [];
      }
    });
    
    const commentResults = await Promise.all(commentPromises);
    comments = commentResults.flat();
    
    // Sort comments by score and limit
    comments = comments
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  return { posts, comments };
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
