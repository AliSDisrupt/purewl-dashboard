/**
 * Usage Tracking Module
 * 
 * Tracks API usage across all services
 * In production, this should use Redis or a database
 */

interface UsageStats {
  requests: number;
  tokensUsed: number;
  lastRequest: Date | null;
}

interface ServiceUsage {
  claude: UsageStats & { tokensUsed: number };
  linkedin: UsageStats;
  hubspot: UsageStats;
  ga4: UsageStats;
  reddit: UsageStats;
  googleAds: UsageStats;
  redditAds: UsageStats;
  reports: UsageStats;
}

// In-memory store (resets on server restart)
// In production, use Redis or database
const usageStats: ServiceUsage = {
  claude: {
    requests: 0,
    tokensUsed: 0,
    lastRequest: null,
  },
  linkedin: {
    requests: 0,
    tokensUsed: 0,
    lastRequest: null,
  },
  hubspot: {
    requests: 0,
    tokensUsed: 0,
    lastRequest: null,
  },
  ga4: {
    requests: 0,
    tokensUsed: 0,
    lastRequest: null,
  },
  reddit: {
    requests: 0,
    tokensUsed: 0,
    lastRequest: null,
  },
  googleAds: {
    requests: 0,
    tokensUsed: 0,
    lastRequest: null,
  },
  redditAds: {
    requests: 0,
    tokensUsed: 0,
    lastRequest: null,
  },
  reports: {
    requests: 0,
    tokensUsed: 0,
    lastRequest: null,
  },
};

export type ServiceName = keyof ServiceUsage;

/**
 * Track API request
 */
export function trackRequest(service: ServiceName) {
  if (!usageStats[service]) {
    console.error(`[Usage Tracker] Service '${service}' not found in usageStats`);
    return;
  }
  usageStats[service].requests++;
  usageStats[service].lastRequest = new Date();
}

/**
 * Track Claude API tokens
 */
export function trackClaudeTokens(inputTokens: number, outputTokens: number) {
  usageStats.claude.tokensUsed += inputTokens + outputTokens;
  usageStats.claude.requests++;
  usageStats.claude.lastRequest = new Date();
}

/**
 * Get usage statistics
 * Returns a deep copy with Date objects preserved
 */
export function getUsageStats(): ServiceUsage {
  const copy: ServiceUsage = {
    claude: {
      requests: usageStats.claude.requests,
      tokensUsed: usageStats.claude.tokensUsed,
      lastRequest: usageStats.claude.lastRequest ? new Date(usageStats.claude.lastRequest) : null,
    },
    linkedin: {
      requests: usageStats.linkedin.requests,
      tokensUsed: usageStats.linkedin.tokensUsed,
      lastRequest: usageStats.linkedin.lastRequest ? new Date(usageStats.linkedin.lastRequest) : null,
    },
    hubspot: {
      requests: usageStats.hubspot.requests,
      tokensUsed: usageStats.hubspot.tokensUsed,
      lastRequest: usageStats.hubspot.lastRequest ? new Date(usageStats.hubspot.lastRequest) : null,
    },
    ga4: {
      requests: usageStats.ga4.requests,
      tokensUsed: usageStats.ga4.tokensUsed,
      lastRequest: usageStats.ga4.lastRequest ? new Date(usageStats.ga4.lastRequest) : null,
    },
    reddit: {
      requests: usageStats.reddit.requests,
      tokensUsed: usageStats.reddit.tokensUsed,
      lastRequest: usageStats.reddit.lastRequest ? new Date(usageStats.reddit.lastRequest) : null,
    },
    googleAds: {
      requests: usageStats.googleAds.requests,
      tokensUsed: usageStats.googleAds.tokensUsed,
      lastRequest: usageStats.googleAds.lastRequest ? new Date(usageStats.googleAds.lastRequest) : null,
    },
    redditAds: {
      requests: usageStats.redditAds.requests,
      tokensUsed: usageStats.redditAds.tokensUsed,
      lastRequest: usageStats.redditAds.lastRequest ? new Date(usageStats.redditAds.lastRequest) : null,
    },
    reports: {
      requests: usageStats.reports.requests,
      tokensUsed: usageStats.reports.tokensUsed,
      lastRequest: usageStats.reports.lastRequest ? new Date(usageStats.reports.lastRequest) : null,
    },
  };
  return copy;
}

/**
 * Get usage for a specific service
 */
export function getServiceUsage(service: ServiceName): UsageStats {
  const stats = usageStats[service];
  return {
    requests: stats.requests,
    tokensUsed: stats.tokensUsed,
    lastRequest: stats.lastRequest ? new Date(stats.lastRequest) : null,
  };
}
