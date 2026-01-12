"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RedditPosts } from "@/components/reddit/RedditPosts";
import { RefreshCw, Search, Filter, ChevronDown, Calendar, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RedditDateRangePicker } from "@/components/reddit/RedditDateRangePicker";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type TimeFilter = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' | 'custom';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

async function fetchRedditPosts(
  keywords: string[], 
  timeFilter: TimeFilter, 
  includeComments: boolean,
  limit: number = 100,
  dateRange?: DateRange
) {
  const keywordsParam = keywords.join(',');
  const params = new URLSearchParams({
    keywords: keywordsParam,
    limit: limit.toString(),
    time: timeFilter,
    includeComments: includeComments.toString(),
    commentsPerPost: '5',
    mergeWithStored: 'true', // Always merge with stored data
  });
  
  // Add custom date range if provided
  if (timeFilter === 'custom' && dateRange?.from && dateRange?.to) {
    params.append('startDate', dateRange.from.toISOString());
    params.append('endDate', dateRange.to.toISOString());
  }
  
  const res = await fetch(`/api/reddit/posts?${params.toString()}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch Reddit posts");
  }
  return res.json();
}

export default function CommunityPage() {
  // Comprehensive keywords to search for
  const keywords = [
    // Direct Brand Keywords
    "PureVPN",
    "Orion",
    "PureVPN white label",
    "PureVPN reseller",
    "PureVPN SDK",
    
    // White Label VPN Keywords
    "white label VPN",
    "whitelabel VPN",
    "VPN reseller",
    "VPN SDK",
    "VPN API",
    "rebrand VPN",
    
    // B2B VPN Keywords
    "VPN for business",
    "enterprise VPN",
    "VPN for teams",
    "corporate VPN solution",
    
    // IPTV/Streaming Keywords
    "IPTV VPN",
    "IPTV reseller",
    "streaming VPN",
    "unblock streaming",
    
    // MSP/IT Reseller Keywords
    "MSP VPN",
    "managed VPN service",
    "IT reseller VPN",
    "VPN for MSP clients",
    
    // ISP/Telecom Keywords
    "ISP VPN service",
    "VPN for ISP",
    "telecom VPN",
    
    // Security Apps Keywords
    "antivirus VPN",
    "security suite VPN",
    "parental control VPN",
    
    // General Business Keywords
    "start VPN business",
    "build own VPN brand",
    "add VPN to my app",
    "VPN API for apps",
    "rebrand VPN service",
    "VPN reseller program",
    "white label business",
    "VPN provider",
  ];
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [includeComments, setIncludeComments] = useState(true);
  const [limit, setLimit] = useState(100); // Increased default limit
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["reddit-posts", keywords, timeFilter, includeComments, limit, dateRange],
    queryFn: () => fetchRedditPosts(keywords, timeFilter, includeComments, limit, dateRange),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const posts = data?.posts || [];
  const comments = data?.comments || [];
  const storageStats = data?.storageStats;
  const newPostsCount = data?.newPostsCount || 0;
  const newCommentsCount = data?.newCommentsCount || 0;

  const timeFilterLabels: Record<TimeFilter, string> = {
    hour: 'Last Hour',
    day: 'Last 24 Hours',
    week: 'Last Week',
    month: 'Last Month',
    year: 'Last Year',
    all: 'All Time',
    custom: dateRange.from && dateRange.to 
      ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
      : 'Custom Range',
  };

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
    if (filter === 'custom') {
      setShowCustomDateRange(true);
    } else {
      setShowCustomDateRange(false);
      setDateRange({ from: null, to: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground mt-1">
            Reddit posts and comments mentioning PureVPN, white label VPN, reseller programs, and related keywords
          </p>
          {storageStats && (
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                <span>Stored: {storageStats.postsCount} posts, {storageStats.commentsCount} comments</span>
              </div>
              {newPostsCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{newPostsCount} new posts
                </Badge>
              )}
            </div>
          )}
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Reddit Mentions
            </CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-[180px] justify-between">
                      {timeFilterLabels[timeFilter]}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTimeFilterChange('hour')}>
                      Last Hour
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTimeFilterChange('day')}>
                      Last 24 Hours
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTimeFilterChange('week')}>
                      Last Week
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTimeFilterChange('month')}>
                      Last Month
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTimeFilterChange('year')}>
                      Last Year
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTimeFilterChange('all')}>
                      All Time
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleTimeFilterChange('custom')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Custom Range
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {showCustomDateRange && (
                  <div className="ml-2">
                    <RedditDateRangePicker
                      dateRange={dateRange}
                      onDateRangeChange={(range) => {
                        setDateRange(range);
                        if (range.from && range.to) {
                          setTimeFilter('custom');
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Limit:</span>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={limit}
                  onChange={(e) => setLimit(Math.max(10, Math.min(500, parseInt(e.target.value) || 100)))}
                  className="w-20 px-2 py-1 text-sm border rounded"
                />
              </div>
              <Button
                variant={includeComments ? "default" : "outline"}
                size="sm"
                onClick={() => setIncludeComments(!includeComments)}
              >
                {includeComments ? "With Comments" : "Posts Only"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RedditPosts
            posts={posts}
            comments={comments}
            isLoading={isLoading}
            error={error as Error | null}
            keywords={keywords}
            timeFilter={timeFilter}
            onRefresh={() => refetch()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
