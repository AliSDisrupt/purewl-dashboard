import { promises as fs } from 'fs';
import path from 'path';
import { RedditPost, RedditComment } from '@/lib/mcp/reddit';

const STORAGE_DIR = path.join(process.cwd(), 'data', 'reddit');
const POSTS_FILE = path.join(STORAGE_DIR, 'posts.json');
const COMMENTS_FILE = path.join(STORAGE_DIR, 'comments.json');

interface StoredData {
  posts: Map<string, RedditPost>;
  comments: Map<string, RedditComment>;
  lastUpdated: string;
}

/**
 * Ensure storage directory exists
 */
async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating storage directory:', error);
  }
}

/**
 * Load stored posts from disk
 */
export async function loadStoredPosts(): Promise<Map<string, RedditPost>> {
  try {
    await ensureStorageDir();
    const data = await fs.readFile(POSTS_FILE, 'utf-8');
    const json = JSON.parse(data);
    const postsMap = new Map<string, RedditPost>();
    
    // Convert array to Map
    if (Array.isArray(json.posts)) {
      json.posts.forEach((post: RedditPost) => {
        postsMap.set(post.id, post);
      });
    }
    
    return postsMap;
  } catch (error) {
    // File doesn't exist yet, return empty map
    return new Map();
  }
}

/**
 * Load stored comments from disk
 */
export async function loadStoredComments(): Promise<Map<string, RedditComment>> {
  try {
    await ensureStorageDir();
    const data = await fs.readFile(COMMENTS_FILE, 'utf-8');
    const json = JSON.parse(data);
    const commentsMap = new Map<string, RedditComment>();
    
    // Convert array to Map
    if (Array.isArray(json.comments)) {
      json.comments.forEach((comment: RedditComment) => {
        commentsMap.set(comment.id, comment);
      });
    }
    
    return commentsMap;
  } catch (error) {
    // File doesn't exist yet, return empty map
    return new Map();
  }
}

/**
 * Save posts to disk
 */
export async function savePosts(posts: RedditPost[]): Promise<void> {
  try {
    await ensureStorageDir();
    
    // Load existing posts
    const existingPosts = await loadStoredPosts();
    
    // Merge new posts with existing (new posts override old ones)
    posts.forEach(post => {
      existingPosts.set(post.id, post);
    });
    
    // Convert Map to array and save
    const postsArray = Array.from(existingPosts.values());
    const data = {
      posts: postsArray,
      lastUpdated: new Date().toISOString(),
      count: postsArray.length,
    };
    
    await fs.writeFile(POSTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving posts:', error);
  }
}

/**
 * Save comments to disk
 */
export async function saveComments(comments: RedditComment[]): Promise<void> {
  try {
    await ensureStorageDir();
    
    // Load existing comments
    const existingComments = await loadStoredComments();
    
    // Merge new comments with existing (new comments override old ones)
    comments.forEach(comment => {
      existingComments.set(comment.id, comment);
    });
    
    // Convert Map to array and save
    const commentsArray = Array.from(existingComments.values());
    const data = {
      comments: commentsArray,
      lastUpdated: new Date().toISOString(),
      count: commentsArray.length,
    };
    
    await fs.writeFile(COMMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving comments:', error);
  }
}

/**
 * Merge stored data with newly fetched data
 */
export async function mergeWithStored(
  newPosts: RedditPost[],
  newComments: RedditComment[]
): Promise<{ posts: RedditPost[]; comments: RedditComment[] }> {
  // Load stored data
  const storedPosts = await loadStoredPosts();
  const storedComments = await loadStoredComments();
  
  // Merge new posts (new data takes precedence)
  newPosts.forEach(post => {
    storedPosts.set(post.id, post);
  });
  
  // Merge new comments (new data takes precedence)
  newComments.forEach(comment => {
    storedComments.set(comment.id, comment);
  });
  
  // Convert Maps to arrays and sort by creation date (newest first)
  const allPosts = Array.from(storedPosts.values()).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const allComments = Array.from(storedComments.values()).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return { posts: allPosts, comments: allComments };
}

/**
 * Get storage stats
 */
export async function getStorageStats(): Promise<{ postsCount: number; commentsCount: number; lastUpdated: string | null }> {
  try {
    const posts = await loadStoredPosts();
    const comments = await loadStoredComments();
    
    // Try to get last updated time
    let lastUpdated: string | null = null;
    try {
      const postsData = await fs.readFile(POSTS_FILE, 'utf-8');
      const json = JSON.parse(postsData);
      lastUpdated = json.lastUpdated || null;
    } catch {
      // Ignore
    }
    
    return {
      postsCount: posts.size,
      commentsCount: comments.size,
      lastUpdated,
    };
  } catch (error) {
    return { postsCount: 0, commentsCount: 0, lastUpdated: null };
  }
}
