"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MessageSquare, ArrowUp, Clock, User, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  type?: 'post';
  matchedKeywords?: string[];
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
  type?: 'comment';
  matchedKeywords?: string[];
}

interface RedditPostsProps {
  posts: RedditPost[];
  comments?: RedditComment[];
  isLoading?: boolean;
  error?: Error | null;
  keywords?: string[];
  timeFilter?: string;
  onRefresh?: () => void;
}

export function RedditPosts({ posts, comments = [], isLoading, error, keywords, timeFilter, onRefresh }: RedditPostsProps) {
  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <AlertCircle className="h-4 w-4" />
            <p className="font-medium">Error Loading Reddit Posts</p>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || "Failed to fetch Reddit posts"}
          </p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <p className="text-muted-foreground">Loading Reddit posts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">No posts found</p>
            {keywords && keywords.length > 0 && (
              <p className="text-sm text-muted-foreground">
                No posts found matching: {keywords.join(", ")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeFilterLabels: Record<string, string> = {
    hour: 'Last Hour',
    day: 'Last 24 Hours',
    week: 'Last Week',
    month: 'Last Month',
    year: 'Last Year',
    all: 'All Time',
  };

  return (
    <div className="space-y-4">
      {/* Filters and Info */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {keywords && keywords.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">Keywords:</span>
              {keywords.map((keyword, idx) => (
                <Badge key={idx} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </>
          )}
          {timeFilter && (
            <Badge variant="outline" className="text-xs">
              {timeFilterLabels[timeFilter] || timeFilter}
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs for Posts and Comments */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">
            <FileText className="h-4 w-4 mr-2" />
            Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({posts.length + comments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 mt-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">No posts found</p>
                  {keywords && keywords.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      No posts found matching: {keywords.join(", ")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {posts.map((post) => (
                <Card key={post.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <CardTitle className="text-lg leading-tight">
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors flex items-start gap-2"
                          >
                            {post.title}
                            <ExternalLink className="h-4 w-4 mt-1 flex-shrink-0 opacity-50" />
                          </a>
                        </CardTitle>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>u/{post.author}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            r/{post.subreddit}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          {post.matchedKeywords && post.matchedKeywords.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-xs text-muted-foreground">Matched:</span>
                              {post.matchedKeywords.slice(0, 3).map((keyword, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                              {post.matchedKeywords.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{post.matchedKeywords.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1 text-sm">
                          <ArrowUp className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{post.score.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{post.commentCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {post.content && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.content}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4 mt-4">
          {comments.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">No comments found</p>
                  {keywords && keywords.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      No comments found matching: {keywords.join(", ")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {comments.map((comment) => (
                <Card key={comment.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="text-sm text-muted-foreground mb-2">
                          Comment on: <span className="font-medium text-foreground">{comment.postTitle}</span>
                        </div>
                        
                        <div className="p-0">
                          <p className="text-sm leading-relaxed">{comment.body}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap pt-2">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>u/{comment.author}</span>
                          </div>
                            <Badge variant="outline" className="text-xs">
                              r/{comment.subreddit}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            {comment.matchedKeywords && comment.matchedKeywords.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-xs text-muted-foreground">Matched:</span>
                                {comment.matchedKeywords.slice(0, 2).map((keyword, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                                {comment.matchedKeywords.length > 2 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{comment.matchedKeywords.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1 text-sm">
                          <ArrowUp className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{comment.score.toLocaleString()}</span>
                        </div>
                        <a
                          href={comment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-4">
          {/* Combine posts and comments, sort by date */}
          {[...posts, ...comments]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((item) => {
              if ('title' in item) {
                // It's a post
                const post = item as RedditPost;
                return (
                  <Card key={post.id} className="hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Post</Badge>
                            <CardTitle className="text-lg leading-tight">
                              <a
                                href={post.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors flex items-start gap-2"
                              >
                                {post.title}
                                <ExternalLink className="h-4 w-4 mt-1 flex-shrink-0 opacity-50" />
                              </a>
                            </CardTitle>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>u/{post.author}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              r/{post.subreddit}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            {post.matchedKeywords && post.matchedKeywords.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-xs text-muted-foreground">Matched:</span>
                                {post.matchedKeywords.slice(0, 2).map((keyword, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                                {post.matchedKeywords.length > 2 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{post.matchedKeywords.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="flex items-center gap-1 text-sm">
                            <ArrowUp className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{post.score.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{post.commentCount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {post.content && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {post.content}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                );
              } else {
                // It's a comment
                const comment = item as RedditComment;
                return (
                  <Card key={comment.id} className="hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Comment</Badge>
                            <div className="text-sm text-muted-foreground mb-2">
                              On: <span className="font-medium text-foreground">{comment.postTitle}</span>
                            </div>
                          </div>
                          
                          <div className="p-0">
                            <p className="text-sm leading-relaxed">{comment.body}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap pt-2">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>u/{comment.author}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              r/{comment.subreddit}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            {comment.matchedKeywords && comment.matchedKeywords.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-xs text-muted-foreground">Matched:</span>
                                {comment.matchedKeywords.slice(0, 2).map((keyword, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                                {comment.matchedKeywords.length > 2 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{comment.matchedKeywords.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="flex items-center gap-1 text-sm">
                            <ArrowUp className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{comment.score.toLocaleString()}</span>
                          </div>
                          <a
                            href={comment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              }
            })}
        </TabsContent>
      </Tabs>

      <div className="text-center text-sm text-muted-foreground pt-4">
        <p>
          Showing {posts.length} post{posts.length !== 1 ? 's' : ''} 
          {comments.length > 0 && ` and ${comments.length} comment${comments.length !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  );
}
